"use server"

import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import { comparePassword } from "@/lib/password"

export async function signIn(email: string, password: string) {
  try {
    console.log("[v0] Sign in attempt for:", email)

    const users = await sql`
      SELECT id, email, name, password, role 
      FROM "users" 
      WHERE email = ${email}
      LIMIT 1
    `

    if (users.length === 0) {
      console.log("[v0] User not found:", email)
      return { success: false, error: "Credenciales inválidas" }
    }

    const user = users[0]
    console.log("[v0] User found:", { id: user.id, email: user.email, role: user.role })

    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      console.log("[v0] Invalid password for:", email)
      return { success: false, error: "Credenciales inválidas" }
    }

    const sessionData = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }

    const cookieStore = await cookies()
    console.log("[v0] Setting session cookie with data:", { userId: user.id, email: user.email, role: user.role })
    cookieStore.set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })
    console.log("[v0] Session cookie set successfully")

    console.log("[v0] Session created for:", user.email, "Role:", user.role)

    let redirectUrl = "/"
    if (user.role === "OWNER") {
      redirectUrl = "/owner"
    } else if (user.role === "STAFF") {
      redirectUrl = "/staff"
    }

    console.log("[v0] Redirecting to:", redirectUrl)
    return { success: true, redirectUrl }
  } catch (error) {
    console.error("[v0] Sign in error:", error)
    return { success: false, error: "Error al iniciar sesión" }
  }
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
  return { success: true }
}
