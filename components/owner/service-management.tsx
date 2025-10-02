"use client"

import useSWR from "swr"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, Edit, Trash2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ServiceManagement() {
  const { data: services, error, isLoading, mutate } = useSWR("/api/services", fetcher)

  const handleToggleActive = async (serviceId: string, currentActive: boolean) => {
    try {
      await fetch(`/api/services/${serviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      })
      mutate()
    } catch (error) {
      console.error("[v0] Error toggling service:", error)
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Gestión de Servicios</h3>
        <Button>Agregar Servicio</Button>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">Error al cargar servicios</div>
      )}

      {!isLoading && !error && services?.length === 0 && (
        <div className="rounded-lg bg-muted p-8 text-center">
          <p className="text-muted-foreground">No hay servicios registrados</p>
        </div>
      )}

      {!isLoading && !error && services?.length > 0 && (
        <div className="space-y-4">
          {services.map((service: any) => (
            <div key={service.id} className="flex items-center gap-4 rounded-lg border border-border p-4">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">{service.name}</h4>
                  <Badge variant={service.active ? "default" : "secondary"}>
                    {service.active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                {service.description && <p className="mb-2 text-sm text-muted-foreground">{service.description}</p>}
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {service.durationMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />${service.price.toLocaleString()}
                  </span>
                  <span>Por: {service.professional?.user?.name}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleToggleActive(service.id, service.active)}>
                  {service.active ? "Desactivar" : "Activar"}
                </Button>
                <Button size="sm" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
