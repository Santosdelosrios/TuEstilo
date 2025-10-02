import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const salons = await sql`
      SELECT 
        s.id,
        s.name,
        s.description,
        s.address,
        s.phone,
        s.email,
        s.logo,
        s.active,
        u.name as owner_name,
        COUNT(DISTINCT p.id) as professional_count,
        COUNT(DISTINCT sv.id) as service_count
      FROM salons s
      LEFT JOIN users u ON s."ownerId" = u.id
      LEFT JOIN professionals p ON p."salonId" = s.id AND p.available = true
      LEFT JOIN services sv ON sv."salonId" = s.id AND sv.active = true
      WHERE s.active = true
      GROUP BY s.id, s.name, s.description, s.address, s.phone, s.email, s.logo, s.active, u.name
      ORDER BY s.name ASC
    `

    return NextResponse.json(salons)
  } catch (error) {
    console.error("[v0] Error fetching salons:", error)
    return NextResponse.json({ error: "Error al obtener los salones" }, { status: 500 })
  }
}
