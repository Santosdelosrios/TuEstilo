import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-helpers"
import { getUserSalonId } from "@/lib/salon-helpers"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const salonId = await getUserSalonId(user.id)

    if (!salonId) {
      return NextResponse.json({ error: "No se encontró el salón asociado" }, { status: 404 })
    }

    const salon = await sql`
      SELECT * FROM salons WHERE id = ${salonId} LIMIT 1
    `

    if (!salon || salon.length === 0) {
      return NextResponse.json({ error: "Salón no encontrado" }, { status: 404 })
    }

    return NextResponse.json(salon[0])
  } catch (error) {
    console.error("[v0] Error fetching salon:", error)
    return NextResponse.json({ error: "Error al obtener información del salón" }, { status: 500 })
  }
}
