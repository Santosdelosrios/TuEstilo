import { type NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/lib/password"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      ownerName,
      ownerEmail,
      ownerPassword,
      ownerPhone,
      salonName,
      salonDescription,
      salonAddress,
      salonPhone,
      salonEmail,
    } = body

    // Validar campos requeridos
    if (!ownerName || !ownerEmail || !ownerPassword || !salonName) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Verificar si el email ya existe
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${ownerEmail}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(ownerPassword)

    // Crear el usuario propietario (sin salonId todavía)
    const owner = await sql`
      INSERT INTO users (id, name, email, password, role, phone, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${ownerName}, ${ownerEmail}, ${hashedPassword}, 'OWNER', ${ownerPhone || null}, NOW(), NOW())
      RETURNING id, name, email, role
    `

    const ownerId = owner[0].id

    // Crear el salón
    const salon = await sql`
      INSERT INTO salons (id, name, description, address, phone, email, "ownerId", active, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${salonName}, ${salonDescription || null}, ${salonAddress || null}, ${salonPhone || null}, ${salonEmail || null}, ${ownerId}, true, NOW(), NOW())
      RETURNING id, name
    `

    const salonId = salon[0].id

    // Actualizar el usuario con el salonId
    await sql`
      UPDATE users
      SET "salonId" = ${salonId}, "updatedAt" = NOW()
      WHERE id = ${ownerId}
    `

    return NextResponse.json(
      {
        message: "Registro exitoso",
        owner: owner[0],
        salon: salon[0],
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error registering owner:", error)
    return NextResponse.json({ error: "Error al registrar. Por favor intenta de nuevo." }, { status: 500 })
  }
}
