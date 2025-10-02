import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-helpers"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const appointment = await sql`
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
      WHERE a.id = ${params.id}
      LIMIT 1
    `

    if (!appointment || appointment.length === 0) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
    }

    return NextResponse.json(appointment[0])
  } catch (error) {
    console.error("[v0] Error fetching appointment:", error)
    return NextResponse.json({ error: "Error al obtener cita" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { status, notes } = body

    if (status !== undefined && notes !== undefined) {
      const appointment = await sql`
        UPDATE appointments
        SET status = ${status}, notes = ${notes}, "updatedAt" = NOW()
        WHERE id = ${params.id}
        RETURNING *
      `
      return NextResponse.json(appointment[0])
    } else if (status !== undefined) {
      const appointment = await sql`
        UPDATE appointments
        SET status = ${status}, "updatedAt" = NOW()
        WHERE id = ${params.id}
        RETURNING *
      `
      return NextResponse.json(appointment[0])
    } else if (notes !== undefined) {
      const appointment = await sql`
        UPDATE appointments
        SET notes = ${notes}, "updatedAt" = NOW()
        WHERE id = ${params.id}
        RETURNING *
      `
      return NextResponse.json(appointment[0])
    }

    return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Error updating appointment:", error)
    return NextResponse.json({ error: "Error al actualizar cita" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await sql`
      DELETE FROM appointments
      WHERE id = ${params.id}
    `

    return NextResponse.json({ message: "Cita eliminada" })
  } catch (error) {
    console.error("[v0] Error deleting appointment:", error)
    return NextResponse.json({ error: "Error al eliminar cita" }, { status: 500 })
  }
}
