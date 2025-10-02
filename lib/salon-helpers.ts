import { sql } from "@/lib/db"

export async function getUserSalonId(userId: string): Promise<string | null> {
  try {
    const result = await sql`
      SELECT "salonId" FROM users WHERE id = ${userId}
    `
    return result[0]?.salonId || null
  } catch (error) {
    console.error("[v0] Error getting user salon:", error)
    return null
  }
}

export async function getSalonByOwnerId(ownerId: string) {
  try {
    const salon = await sql`
      SELECT * FROM salons WHERE "ownerId" = ${ownerId} LIMIT 1
    `
    return salon[0] || null
  } catch (error) {
    console.error("[v0] Error getting salon:", error)
    return null
  }
}
