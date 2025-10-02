import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { hashPassword } from "@/lib/password"
import { randomUUID } from "crypto"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Check if user is SUPER_ADMIN
    const [user] = await sql`
      SELECT role FROM users WHERE id = ${session.user.id}
    `

    if (user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Get all owners with their salons
    const owners = await sql`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u."createdAt",
        s.id as "salonId",
        s.name as "salonName",
        s.active as "salonActive"
      FROM users u
      LEFT JOIN salons s ON s."ownerId" = u.id
      WHERE u.role = 'OWNER'
      ORDER BY u."createdAt" DESC
    `

    return NextResponse.json(owners)
  } catch (error) {
    console.error("[v0] Error fetching owners:", error)
    return NextResponse.json({ error: "Error al obtener propietarios" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Check if user is SUPER_ADMIN
    const [user] = await sql`
      SELECT role FROM users WHERE id = ${session.user.id}
    `

    if (user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, password, phone, salonName, salonAddress, salonPhone, salonEmail, salonDescription } = body

    // Validate required fields
    if (!name || !email || !password || !salonName) {
      return NextResponse.json(
        { error: "Nombre, email, contraseña y nombre del salón son requeridos" },
        { status: 400 },
      )
    }

    // Check if email already exists
    const [existingUser] = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    const userId = randomUUID()
    const salonId = randomUUID()

    // Create owner user
    await sql`
      INSERT INTO users (id, name, email, password, phone, role, "createdAt", "updatedAt")
      VALUES (
        ${userId},
        ${name},
        ${email},
        ${hashedPassword},
        ${phone || null},
        'OWNER',
        NOW(),
        NOW()
      )
    `

    // Create salon
    await sql`
      INSERT INTO salons (id, name, "ownerId", address, phone, email, description, active, "createdAt", "updatedAt")
      VALUES (
        ${salonId},
        ${salonName},
        ${userId},
        ${salonAddress || null},
        ${salonPhone || null},
        ${salonEmail || null},
        ${salonDescription || null},
        true,
        NOW(),
        NOW()
      )
    `

    return NextResponse.json({
      message: "Propietario y salón creados exitosamente",
      owner: {
        id: userId,
        name,
        email,
        phone,
        salonId,
        salonName,
      },
    })
  } catch (error) {
    console.error("[v0] Error creating owner:", error)
    return NextResponse.json({ error: "Error al crear propietario" }, { status: 500 })
  }
}
