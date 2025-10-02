import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-helpers"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("[v0] Error getting current user:", error)
    return NextResponse.json({ error: "Error al obtener usuario" }, { status: 500 })
  }
}
