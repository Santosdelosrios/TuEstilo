"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Scissors, MapPin, Phone, Mail, Users, Briefcase, Loader2 } from "lucide-react"
import Link from "next/link"

interface Salon {
  id: string
  name: string
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
  logo: string | null
  active: boolean
  owner_name: string | null
  professional_count: number
  service_count: number
}

export function SalonsList() {
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSalons() {
      try {
        const response = await fetch("/api/salons")
        if (!response.ok) {
          throw new Error("Error al cargar los salones")
        }
        const data = await response.json()
        setSalons(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchSalons()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (salons.length === 0) {
    return (
      <div className="text-center py-12">
        <Scissors className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No hay salones disponibles</h3>
        <p className="text-muted-foreground">Vuelve pronto para ver nuevos salones</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {salons.map((salon) => (
        <Card key={salon.id} className="group transition-all hover:shadow-xl border-2 hover:border-primary/50">
          <CardHeader>
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Scissors className="h-7 w-7 text-primary" />
              </div>
              {salon.active && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                >
                  Activo
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl text-balance">{salon.name}</CardTitle>
            {salon.description && (
              <CardDescription className="text-base line-clamp-2 text-pretty">{salon.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              {salon.address && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{salon.address}</span>
                </div>
              )}
              {salon.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{salon.phone}</span>
                </div>
              )}
              {salon.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{salon.email}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 pt-2 border-t">
              <div className="flex items-center gap-1.5 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium">{salon.professional_count}</span>
                <span className="text-muted-foreground">profesionales</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="font-medium">{salon.service_count}</span>
                <span className="text-muted-foreground">servicios</span>
              </div>
            </div>

            <Link href={`/booking?salonId=${salon.id}`} className="block">
              <Button className="w-full" size="lg">
                Reservar Cita
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
