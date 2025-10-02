import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-helpers"
import { StaffAgenda } from "@/components/staff/staff-agenda"
import { Scissors } from "lucide-react"

export default async function StaffPage() {
  const user = await getCurrentUser()

  if (!user || (user.role !== "STAFF" && user.role !== "OWNER")) {
    redirect("/auth/signin")
  }

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
                <h1 className="text-xl font-bold text-foreground">Agenda del Personal</h1>
                <p className="text-sm text-muted-foreground">Gestiona tus citas</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <StaffAgenda />
      </main>
    </div>
  )
}
