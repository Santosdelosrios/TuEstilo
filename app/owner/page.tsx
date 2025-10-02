import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-helpers"
import { OwnerDashboard } from "@/components/owner/owner-dashboard"
import { Scissors } from "lucide-react"

export default async function OwnerPage() {
  console.log("[v0] Owner page: Checking authentication...")
  const user = await getCurrentUser()
  console.log("[v0] Owner page: User retrieved:", user ? { id: user.id, email: user.email, role: user.role } : "null")

  if (!user || user.role !== "OWNER") {
    console.log("[v0] Owner page: User not authorized, redirecting to signin")
    redirect("/auth/signin")
  }

  console.log("[v0] Owner page: User authorized, rendering dashboard")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Scissors className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Panel de Administración</h1>
                <p className="text-sm text-muted-foreground">Gestión del negocio</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">Propietario</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <OwnerDashboard />
      </main>
    </div>
  )
}
