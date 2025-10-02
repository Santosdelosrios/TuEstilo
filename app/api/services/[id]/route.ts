import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-helpers"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const service = await sql`
      SELECT 
        s.*,
        json_build_object(
          'id', p.id,
          'userId', p."userId",
          'specialty', p.specialty,
          'available', p.available,
          'user', json_build_object(
            'name', u.name,
            'image', u.image
          )
        ) as professional
      FROM services s
      JOIN professionals p ON s."professionalId" = p.id
      JOIN users u ON p."userId" = u.id
      WHERE s.id = ${params.id}
      LIMIT 1
    `

    if (!service || service.length === 0) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
    }

    return NextResponse.json(service[0])
  } catch (error) {
    console.error("[v0] Error fetching service:", error)
    return NextResponse.json({ error: "Error al obtener servicio" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || (user.role !== "OWNER" && user.role !== "STAFF")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, durationMinutes, price, active } = body

    if (
      name !== undefined &&
      description !== undefined &&
      durationMinutes !== undefined &&
      price !== undefined &&
      active !== undefined
    ) {
      const service = await sql`
        UPDATE services
        SET name = ${name}, description = ${description}, "durationMinutes" = ${Number.parseInt(durationMinutes)}, 
            price = ${Number.parseFloat(price)}, active = ${active}, "updatedAt" = NOW()
        WHERE id = ${params.id}
        RETURNING *
      `
      return NextResponse.json(service[0])
    } else if (name !== undefined) {
      const service = await sql`
        UPDATE services
        SET name = ${name}, "updatedAt" = NOW()
        WHERE id = ${params.id}
        RETURNING *
      `
      return NextResponse.json(service[0])
    } else if (description !== undefined) {
      const service = await sql`
        UPDATE services
        SET description = ${description}, "updatedAt" = NOW()
        WHERE id = ${params.id}
        RETURNING *
      `
      return NextResponse.json(service[0])
    } else if (durationMinutes !== undefined) {
      const service = await sql`
        UPDATE services
        SET "durationMinutes" = ${Number.parseInt(durationMinutes)}, "updatedAt" = NOW()
        WHERE id = ${params.id}
        RETURNING *
      `
      return NextResponse.json(service[0])
    } else if (price !== undefined) {
      const service = await sql`
        UPDATE services
        SET price = ${Number.parseFloat(price)}, "updatedAt" = NOW()
        WHERE id = ${params.id}
        RETURNING *
      `
      return NextResponse.json(service[0])
    } else if (active !== undefined) {
      const service = await sql`
        UPDATE services
        SET active = ${active}, "updatedAt" = NOW()
        WHERE id = ${params.id}
        RETURNING *
      `
      return NextResponse.json(service[0])
    }

    return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Error updating service:", error)
    return NextResponse.json({ error: "Error al actualizar servicio" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await sql`
      DELETE FROM services
      WHERE id = ${params.id}
    `

    return NextResponse.json({ message: "Servicio eliminado" })
  } catch (error) {
    console.error("[v0] Error deleting service:", error)
    return NextResponse.json({ error: "Error al eliminar servicio" }, { status: 500 })
  }
}
