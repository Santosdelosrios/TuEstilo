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
      return NextResponse.json({ error: "No se encontró el salón asociado" }, { status: 400 })
    }

    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get("period") || "month"

    // Calculate date range
    const now = new Date()
    const startDate = new Date()

    switch (period) {
      case "day":
        startDate.setHours(0, 0, 0, 0)
        break
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Total appointments
    const totalAppointmentsResult = await sql`
      SELECT COUNT(*) as count
      FROM appointments
      WHERE "createdAt" >= ${startDate.toISOString()}
        AND "salonId" = ${salonId}
    `
    const totalAppointments = Number.parseInt(totalAppointmentsResult[0].count)

    // Appointments by status
    const appointmentsByStatus = await sql`
      SELECT status, COUNT(*) as count
      FROM appointments
      WHERE "createdAt" >= ${startDate.toISOString()}
        AND "salonId" = ${salonId}
      GROUP BY status
    `

    // Total revenue
    const revenueResult = await sql`
      SELECT COALESCE(SUM(p.amount), 0) as total
      FROM payments p
      JOIN appointments a ON p."appointmentId" = a.id
      WHERE p.status = 'PAID'
        AND p."createdAt" >= ${startDate.toISOString()}
        AND a."salonId" = ${salonId}
    `
    const totalRevenue = Number.parseFloat(revenueResult[0].total)

    // Total customers (unique customers who made appointments in this salon)
    const totalCustomersResult = await sql`
      SELECT COUNT(DISTINCT "customerId") as count
      FROM appointments
      WHERE "createdAt" >= ${startDate.toISOString()}
        AND "salonId" = ${salonId}
    `
    const totalCustomers = Number.parseInt(totalCustomersResult[0].count)

    // Top services
    const topServices = await sql`
      SELECT 
        s.*,
        COUNT(a.id) as count
      FROM appointments a
      JOIN services s ON a."serviceId" = s.id
      WHERE a."createdAt" >= ${startDate.toISOString()}
        AND a."salonId" = ${salonId}
      GROUP BY s.id
      ORDER BY count DESC
      LIMIT 5
    `

    const topServicesWithDetails = topServices.map((item: any) => ({
      service: {
        id: item.id,
        name: item.name,
        description: item.description,
        durationMinutes: item.durationMinutes,
        price: item.price,
      },
      count: Number.parseInt(item.count),
    }))

    // Appointments per day (last 7 days)
    const appointmentsPerDay = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const countResult = await sql`
        SELECT COUNT(*) as count
        FROM appointments
        WHERE "createdAt" >= ${date.toISOString()}
          AND "createdAt" < ${nextDate.toISOString()}
          AND "salonId" = ${salonId}
      `

      appointmentsPerDay.push({
        date: date.toISOString().split("T")[0],
        count: Number.parseInt(countResult[0].count),
      })
    }

    return NextResponse.json({
      totalAppointments,
      appointmentsByStatus,
      totalRevenue,
      totalCustomers,
      topServices: topServicesWithDetails,
      appointmentsPerDay,
    })
  } catch (error) {
    console.error("[v0] Error fetching stats:", error)
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
  }
}
