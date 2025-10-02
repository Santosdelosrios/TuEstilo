"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface TopServicesProps {
  services: any[]
  isLoading: boolean
}

export function TopServices({ services, isLoading }: TopServicesProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="h-80 animate-pulse rounded-lg bg-muted" />
      </Card>
    )
  }

  const maxCount = Math.max(...(services?.map((s) => s.count) || [1]))

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Servicios Más Populares</h3>
      <div className="space-y-4">
        {services?.map((item, index) => (
          <div key={item.service?.id || index}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{item.service?.name || "Sin nombre"}</span>
              <span className="text-sm text-muted-foreground">{item.count} citas</span>
            </div>
            <Progress value={(item.count / maxCount) * 100} className="h-2" />
          </div>
        ))}
        {(!services || services.length === 0) && (
          <p className="text-center text-sm text-muted-foreground">No hay datos disponibles</p>
        )}
      </div>
    </Card>
  )
}
