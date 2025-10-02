import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { neon } from "@neondatabase/serverless"
import SuperAdminDashboard from "@/components/super-admin/super-admin-dashboard"

const sql = neon(process.env.DATABASE_URL!)

export default async function SuperAdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Check if user is SUPER_ADMIN
  const [user] = await sql`
    SELECT role FROM users WHERE id = ${session.user.id}
  `

  if (user.role !== "SUPER_ADMIN") {
    redirect("/")
  }

  return <SuperAdminDashboard />
}
