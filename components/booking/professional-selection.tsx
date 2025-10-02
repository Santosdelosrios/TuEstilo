"use client"

import useSWR from "swr"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ProfessionalSelectionProps {
  serviceId: string
  onSelect: (professional: any) => void
  onBack: () => void
}

export function ProfessionalSelection({ serviceId, onSelect, onBack }: ProfessionalSelectionProps) {
  const { data: professionals, error, isLoading } = useSWR("/api/professionals?available=true", fetcher)

  // Filter professionals who offer this service
  const availableProfessionals = professionals?.filter((prof: any) =>
    prof.services.some((s: any) => s.id === serviceId),
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
        Error al cargar los profesionales
      </div>
    )
  }

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <h3 className="mb-4 text-lg font-semibold text-foreground">Selecciona un Profesional</h3>
      <div className="space-y-4">
        {availableProfessionals?.map((professional: any) => (
          <Card
            key={professional.id}
            className="cursor-pointer border-2 border-border p-4 transition-all hover:border-primary hover:shadow-md"
            onClick={() => onSelect(professional)}
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={professional.user.image || "/placeholder.svg"} alt={professional.user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {professional.user.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{professional.user.name}</h4>
                {professional.bio && <p className="mt-1 text-sm text-muted-foreground">{professional.bio}</p>}
                {professional.specialties && professional.specialties.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {professional.specialties.map((specialty: string) => (
                      <span
                        key={specialty}
                        className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
