"use client"

import useSWR from "swr"
import { Card } from "@/components/ui/card"
import { Clock, DollarSign } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ServiceSelectionProps {
  onSelect: (service: any) => void
}

export function ServiceSelection({ onSelect }: ServiceSelectionProps) {
  const { data: services, error, isLoading } = useSWR("/api/services?active=true", fetcher)

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">Error al cargar los servicios</div>
    )
  }

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-foreground">Selecciona un Servicio</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {services?.map((service: any) => (
          <Card
            key={service.id}
            className="cursor-pointer border-2 border-border p-4 transition-all hover:border-primary hover:shadow-md"
            onClick={() => onSelect(service)}
          >
            <h4 className="mb-2 font-semibold text-foreground">{service.name}</h4>
            {service.description && <p className="mb-3 text-sm text-muted-foreground">{service.description}</p>}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{service.durationMinutes} min</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>${service.price.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
