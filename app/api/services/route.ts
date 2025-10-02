import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-helpers"
import { getUserSalonId } from "@/lib/salon-helpers"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const professionalId = searchParams.get("professionalId")
    const active = searchParams.get("active")
    const salonId = searchParams.get("salonId")

    let services

    if (professionalId && active !== null) {
      const activeValue = active === "true"
      services = await sql`
        SELECT 
          s.*,
          json_build_object(
            'id', p.id,
            'userId', p."userId",
            'specialties', p.specialties,
            'available', p.available,
            'user', json_build_object(
              'name', u.name,
              'image', u.image
            )
          ) as professional
        FROM "services" s
        JOIN "professionals" p ON s."professionalId" = p.id
        JOIN "users" u ON p."userId" = u.id
        WHERE s."professionalId" = ${professionalId}
          AND s.active = ${activeValue}
          ${salonId ? sql`AND s."salonId" = ${salonId}` : sql``}
        ORDER BY s.name ASC
      `
    } else if (professionalId) {
      services = await sql`
        SELECT 
          s.*,
          json_build_object(
            'id', p.id,
            'userId', p."userId",
            'specialties', p.specialties,
            'available', p.available,
            'user', json_build_object(
              'name', u.name,
              'image', u.image
            )
          ) as professional
        FROM "services" s
        JOIN "professionals" p ON s."professionalId" = p.id
        JOIN "users" u ON p."userId" = u.id
        WHERE s."professionalId" = ${professionalId}
          ${salonId ? sql`AND s."salonId" = ${salonId}` : sql``}
        ORDER BY s.name ASC
      `
    } else if (active !== null) {
      const activeValue = active === "true"
      services = await sql`
        SELECT 
          s.*,
          json_build_object(
            'id', p.id,
            'userId', p."userId",
            'specialties', p.specialties,
            'available', p.available,
            'user', json_build_object(
              'name', u.name,
              'image', u.image
            )
          ) as professional
        FROM "services" s
        JOIN "professionals" p ON s."professionalId" = p.id
        JOIN "users" u ON p."userId" = u.id
        WHERE s.active = ${activeValue}
          ${salonId ? sql`AND s."salonId" = ${salonId}` : sql``}
        ORDER BY s.name ASC
      `
    } else {
      services = await sql`
        SELECT 
          s.*,
          json_build_object(
            'id', p.id,
            'userId', p."userId",
            'specialties', p.specialties,
            'available', p.available,
            'user', json_build_object(
              'name', u.name,
              'image', u.image
            )
          ) as professional
        FROM "services" s
        JOIN "professionals" p ON s."professionalId" = p.id
        JOIN "users" u ON p."userId" = u.id
        ${salonId ? sql`WHERE s."salonId" = ${salonId}` : sql``}
        ORDER BY s.name ASC
      `
    }

    return NextResponse.json(services)
  } catch (error) {
    console.error("[v0] Error fetching services:", error)
    return NextResponse.json({ error: "Error al obtener servicios" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || (user.role !== "OWNER" && user.role !== "STAFF")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const salonId = await getUserSalonId(user.id)

    if (!salonId) {
      return NextResponse.json({ error: "No se encontró el salón asociado" }, { status: 400 })
    }

    const body = await request.json()
    const { name, description, durationMinutes, price, professionalId } = body

    if (!name || !durationMinutes || !price || !professionalId) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const service = await sql`
      INSERT INTO "services" (id, name, description, "durationMinutes", price, "professionalId", "salonId", active, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${name}, ${description}, ${Number.parseInt(durationMinutes)}, ${Number.parseFloat(price)}, ${professionalId}, ${salonId}, true, NOW(), NOW())
      RETURNING *
    `

    return NextResponse.json(service[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating service:", error)
    return NextResponse.json({ error: "Error al crear servicio" }, { status: 500 })
  }
}
