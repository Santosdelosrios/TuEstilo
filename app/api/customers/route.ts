import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-helpers"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || (user.role !== "OWNER" && user.role !== "STAFF")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")

    if (search) {
      const searchPattern = `%${search}%`
      const customers = await sql`
        SELECT 
          u.id,
          u.name,
          u.email,
          u.phone,
          u."createdAt",
          COUNT(a.id) as appointment_count
        FROM users u
        LEFT JOIN appointments a ON a."customerId" = u.id
        WHERE u.role = 'CUSTOMER'
          AND (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern} OR u.phone ILIKE ${searchPattern})
        GROUP BY u.id, u.name, u.email, u.phone, u."createdAt"
        ORDER BY u."createdAt" DESC
      `
      return NextResponse.json(customers)
    } else {
      const customers = await sql`
        SELECT 
          u.id,
          u.name,
          u.email,
          u.phone,
          u."createdAt",
          COUNT(a.id) as appointment_count
        FROM users u
        LEFT JOIN appointments a ON a."customerId" = u.id
        WHERE u.role = 'CUSTOMER'
        GROUP BY u.id, u.name, u.email, u.phone, u."createdAt"
        ORDER BY u."createdAt" DESC
      `
      return NextResponse.json(customers)
    }
  } catch (error) {
    console.error("[v0] Error fetching customers:", error)
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 })
  }
}
