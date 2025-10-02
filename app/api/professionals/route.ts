import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-helpers"
import { getUserSalonId } from "@/lib/salon-helpers"
import { hashPassword } from "@/lib/password"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const available = searchParams.get("available")
    const salonId = searchParams.get("salonId")

    if (available !== null) {
      const isAvailable = available === "true"
      let professionals

      if (salonId) {
        professionals = await sql`
          SELECT 
            p.*,
            json_build_object(
              'name', u.name,
              'email', u.email,
              'image', u.image
            ) as user,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', s.id,
                  'name', s.name,
                  'description', s.description,
                  'durationMinutes', s."durationMinutes",
                  'price', s.price,
                  'active', s.active
                )
              ) FILTER (WHERE s.id IS NOT NULL AND s.active = true),
              '[]'
            ) as services
          FROM professionals p
          JOIN users u ON p."userId" = u.id
          LEFT JOIN services s ON s."professionalId" = p.id AND s.active = true
          WHERE p.available = ${isAvailable} AND p."salonId" = ${salonId}
          GROUP BY p.id, u.name, u.email, u.image
          ORDER BY p."createdAt" ASC
        `
      } else {
        professionals = await sql`
          SELECT 
            p.*,
            json_build_object(
              'name', u.name,
              'email', u.email,
              'image', u.image
            ) as user,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', s.id,
                  'name', s.name,
                  'description', s.description,
                  'durationMinutes', s."durationMinutes",
                  'price', s.price,
                  'active', s.active
                )
              ) FILTER (WHERE s.id IS NOT NULL AND s.active = true),
              '[]'
            ) as services
          FROM professionals p
          JOIN users u ON p."userId" = u.id
          LEFT JOIN services s ON s."professionalId" = p.id AND s.active = true
          WHERE p.available = ${isAvailable}
          GROUP BY p.id, u.name, u.email, u.image
          ORDER BY p."createdAt" ASC
        `
      }
      return NextResponse.json(professionals)
    } else {
      let professionals

      if (salonId) {
        professionals = await sql`
          SELECT 
            p.*,
            json_build_object(
              'name', u.name,
              'email', u.email,
              'image', u.image
            ) as user,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', s.id,
                  'name', s.name,
                  'description', s.description,
                  'durationMinutes', s."durationMinutes",
                  'price', s.price,
                  'active', s.active
                )
              ) FILTER (WHERE s.id IS NOT NULL AND s.active = true),
              '[]'
            ) as services
          FROM professionals p
          JOIN users u ON p."userId" = u.id
          LEFT JOIN services s ON s."professionalId" = p.id AND s.active = true
          WHERE p."salonId" = ${salonId}
          GROUP BY p.id, u.name, u.email, u.image
          ORDER BY p."createdAt" ASC
        `
      } else {
        professionals = await sql`
          SELECT 
            p.*,
            json_build_object(
              'name', u.name,
              'email', u.email,
              'image', u.image
            ) as user,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', s.id,
                  'name', s.name,
                  'description', s.description,
                  'durationMinutes', s."durationMinutes",
                  'price', s.price,
                  'active', s.active
                )
              ) FILTER (WHERE s.id IS NOT NULL AND s.active = true),
              '[]'
            ) as services
          FROM professionals p
          JOIN users u ON p."userId" = u.id
          LEFT JOIN services s ON s."professionalId" = p.id AND s.active = true
          GROUP BY p.id, u.name, u.email, u.image
          ORDER BY p."createdAt" ASC
        `
      }
      return NextResponse.json(professionals)
    }
  } catch (error) {
    console.error("[v0] Error fetching professionals:", error)
    return NextResponse.json({ error: "Error al obtener profesionales" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const salonId = await getUserSalonId(user.id)

    if (!salonId) {
      return NextResponse.json({ error: "No se encontró el salón asociado" }, { status: 400 })
    }

    const body = await request.json()
    const { name, email, password, phone, bio, specialties } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nombre, email y contraseña son requeridos" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Ya existe un usuario con este email" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const newUser = await sql`
      INSERT INTO users (id, name, email, password, phone, role, "salonId", "updatedAt")
      VALUES (
        gen_random_uuid()::text,
        ${name},
        ${email},
        ${hashedPassword},
        ${phone || null},
        'STAFF',
        ${salonId},
        NOW()
      )
      RETURNING *
    `

    const newProfessional = await sql`
      INSERT INTO professionals (id, "userId", bio, specialties, available, "salonId", "updatedAt")
      VALUES (
        gen_random_uuid()::text,
        ${newUser[0].id},
        ${bio || null},
        ${specialties || []},
        true,
        ${salonId},
        NOW()
      )
      RETURNING *
    `

    // Return the complete professional with user data
    const professional = await sql`
      SELECT 
        p.*,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email,
          'phone', u.phone,
          'image', u.image
        ) as user
      FROM professionals p
      JOIN users u ON p."userId" = u.id
      WHERE p.id = ${newProfessional[0].id}
    `

    return NextResponse.json(professional[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating professional:", error)
    return NextResponse.json({ error: "Error al crear el profesional" }, { status: 500 })
  }
}
