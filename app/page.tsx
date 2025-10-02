import { Scissors, UserCog, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SalonsList } from "@/components/salons-list"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
                <Scissors className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Sistema de Reservas</h1>
                <p className="text-sm text-muted-foreground">Encuentra tu salón ideal</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/staff">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Personal</span>
                </Button>
              </Link>
              <Link href="/owner">
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserCog className="h-4 w-4" />
                  <span className="hidden sm:inline">Propietario</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-5xl font-bold text-balance text-foreground">Salones Disponibles</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Explora nuestra selección de salones de belleza y elige el que mejor se adapte a tus necesidades
          </p>
        </div>

        <SalonsList />
      </main>

      <footer className="mt-16 border-t border-border bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Sistema de Reservas. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
