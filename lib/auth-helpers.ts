import { cookies } from "next/headers"
import { sql } from "./db"

export interface User {
  id: string
  email: string
  name: string
  role: "OWNER" | "STAFF" | "CUSTOMER"
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    console.log("[v0] getCurrentUser: Session cookie exists:", !!sessionCookie)

    if (!sessionCookie) {
      console.log("[v0] getCurrentUser: No session cookie found")
      return null
    }

    console.log("[v0] getCurrentUser: Session cookie value:", sessionCookie.value)
    const sessionData = JSON.parse(sessionCookie.value)
    const userId = sessionData.userId

    console.log("[v0] getCurrentUser: User ID from session:", userId)

    if (!userId) {
      console.log("[v0] getCurrentUser: No userId in session")
      return null
    }

    const result = await sql`
      SELECT id, email, name, role 
      FROM "users" 
      WHERE id = ${userId}
      LIMIT 1
    `

    console.log("[v0] getCurrentUser: Query result count:", result.length)

    if (result.length === 0) {
      console.log("[v0] getCurrentUser: User not found in database")
      return null
    }

    const user = result[0] as User
    console.log("[v0] getCurrentUser: User found:", { id: user.id, email: user.email, role: user.role })
    return user
  } catch (error) {
    console.error("[v0] Error getting current user:", error)
    return null
  }
}

export async function requireAuth(allowedRoles?: Array<"OWNER" | "STAFF" | "CUSTOMER">): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("UNAUTHORIZED")
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN")
  }

  return user
}
