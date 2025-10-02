import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const professionalId = searchParams.get("professionalId")
    const serviceId = searchParams.get("serviceId")
    const date = searchParams.get("date")

    if (!professionalId || !serviceId || !date) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 })
    }

    const service = await sql`
      SELECT * FROM services WHERE id = ${serviceId} LIMIT 1
    `

    if (!service || service.length === 0) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
    }

    // Get existing appointments for the day
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const appointments = await sql`
      SELECT * FROM appointments
      WHERE "professionalId" = ${professionalId}
        AND status IN ('PENDING', 'CONFIRMED')
        AND "startTime" >= ${startOfDay.toISOString()}
        AND "startTime" <= ${endOfDay.toISOString()}
      ORDER BY "startTime" ASC
    `

    // Generate available slots (9 AM to 7 PM, every 30 minutes)
    const slots: string[] = []
    const workStart = new Date(date)
    workStart.setHours(9, 0, 0, 0)
    const workEnd = new Date(date)
    workEnd.setHours(19, 0, 0, 0)

    let currentSlot = new Date(workStart)

    while (currentSlot < workEnd) {
      const slotEnd = new Date(currentSlot.getTime() + service[0].durationMinutes * 60000)

      // Check if slot conflicts with any appointment
      const hasConflict = appointments.some((apt: any) => {
        const aptStart = new Date(apt.startTime)
        const aptEnd = new Date(apt.endTime)

        return (
          (currentSlot >= aptStart && currentSlot < aptEnd) ||
          (slotEnd > aptStart && slotEnd <= aptEnd) ||
          (currentSlot <= aptStart && slotEnd >= aptEnd)
        )
      })

      if (!hasConflict && slotEnd <= workEnd) {
        slots.push(currentSlot.toISOString())
      }

      currentSlot = new Date(currentSlot.getTime() + 30 * 60000) // 30 minutes
    }

    return NextResponse.json({ slots })
  } catch (error) {
    console.error("[v0] Error fetching available slots:", error)
    return NextResponse.json({ error: "Error al obtener horarios disponibles" }, { status: 500 })
  }
}
