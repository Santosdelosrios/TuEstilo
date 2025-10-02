import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-helpers"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const professionalId = searchParams.get("professionalId")
    const customerId = searchParams.get("customerId")
    const date = searchParams.get("date")
    const salonId = searchParams.get("salonId")

    const baseQuery = sql`
      SELECT 
        a.*,
        json_build_object(
          'name', c.name,
          'email', c.email,
          'phone', c.phone
        ) as customer,
        json_build_object(
          'id', p.id,
          'specialty', p.specialty,
          'user', json_build_object(
            'name', u.name,
            'image', u.image
          )
        ) as professional,
        row_to_json(s.*) as service,
        row_to_json(pay.*) as payment
      FROM appointments a
      JOIN users c ON a."customerId" = c.id
      JOIN professionals p ON a."professionalId" = p.id
      JOIN users u ON p."userId" = u.id
      JOIN services s ON a."serviceId" = s.id
      LEFT JOIN payments pay ON pay."appointmentId" = a.id
      WHERE 1=1
    `

    // Build conditions dynamically
    const conditions = []

    if (salonId) {
      conditions.push(sql` AND a."salonId" = ${salonId}`)
    }

    if (status) {
      conditions.push(sql` AND a.status = ${status}`)
    }

    if (professionalId) {
      conditions.push(sql` AND a."professionalId" = ${professionalId}`)
    }

    if (customerId) {
      conditions.push(sql` AND a."customerId" = ${customerId}`)
    }

    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      conditions.push(
        sql` AND a."startTime" >= ${startOfDay.toISOString()} AND a."startTime" <= ${endOfDay.toISOString()}`,
      )
    }

    // Filter by user role
    if (user) {
      if (user.role === "CUSTOMER") {
        conditions.push(sql` AND a."customerId" = ${user.id}`)
      } else if (user.role === "STAFF") {
        const professional = await sql`
          SELECT id FROM professionals WHERE "userId" = ${user.id} LIMIT 1
        `
        if (professional && professional.length > 0) {
          conditions.push(sql` AND a."professionalId" = ${professional[0].id}`)
        }
      }
    }

    // Combine all conditions
    let finalQuery = baseQuery
    for (const condition of conditions) {
      finalQuery = sql`${finalQuery}${condition}`
    }
    finalQuery = sql`${finalQuery} ORDER BY a."startTime" ASC`

    const appointments = await finalQuery

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("[v0] Error fetching appointments:", error)
    return NextResponse.json({ error: "Error al obtener citas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const body = await request.json()
    const { professionalId, serviceId, startTime, notes, customerInfo } = body

    if (!professionalId || !serviceId || !startTime) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    let customerId: string

    if (user) {
      // Usuario autenticado
      customerId = user.id
    } else if (customerInfo) {
      const { name, email, phone } = customerInfo

      if (!name || !email || !phone) {
        return NextResponse.json({ error: "Información del cliente incompleta" }, { status: 400 })
      }

      // Buscar cliente existente por email
      const existingCustomer = await sql`
        SELECT id FROM users WHERE email = ${email} AND role = 'CUSTOMER' LIMIT 1
      `

      if (existingCustomer.length > 0) {
        customerId = existingCustomer[0].id

        // Actualizar información si es necesario
        await sql`
          UPDATE users 
          SET name = ${name}, phone = ${phone}, "updatedAt" = NOW()
          WHERE id = ${customerId}
        `
      } else {
        // Crear nuevo cliente
        const newCustomer = await sql`
          INSERT INTO users (id, email, name, phone, role, "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${email}, ${name}, ${phone}, 'CUSTOMER', NOW(), NOW())
          RETURNING id
        `
        customerId = newCustomer[0].id
      }
    } else {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const service = await sql`
      SELECT * FROM "services" WHERE id = ${serviceId} LIMIT 1
    `

    if (!service || service.length === 0) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
    }

    const salonId = service[0].salonId

    const start = new Date(startTime)
    const end = new Date(start.getTime() + service[0].durationMinutes * 60000)

    // Check for conflicts
    const conflicts = await sql`
      SELECT * FROM "appointments"
      WHERE "professionalId" = ${professionalId}
        AND status IN ('PENDING', 'CONFIRMED')
        AND (
          ("startTime" <= ${start.toISOString()} AND "endTime" > ${start.toISOString()})
          OR ("startTime" < ${end.toISOString()} AND "endTime" >= ${end.toISOString()})
          OR ("startTime" >= ${start.toISOString()} AND "endTime" <= ${end.toISOString()})
        )
    `

    if (conflicts.length > 0) {
      return NextResponse.json({ error: "El horario no está disponible" }, { status: 409 })
    }

    const appointment = await sql`
      INSERT INTO "appointments" (id, "customerId", "professionalId", "serviceId", "startTime", "endTime", notes, status, "salonId", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${customerId}, ${professionalId}, ${serviceId}, ${start.toISOString()}, ${end.toISOString()}, ${notes || null}, 'PENDING', ${salonId}, NOW(), NOW())
      RETURNING *
    `

    // Create payment record
    await sql`
      INSERT INTO "payments" (id, "appointmentId", amount, status, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${appointment[0].id}, ${service[0].price}, 'PENDING', NOW(), NOW())
    `

    return NextResponse.json(appointment[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating appointment:", error)
    return NextResponse.json({ error: "Error al crear cita" }, { status: 500 })
  }
}
