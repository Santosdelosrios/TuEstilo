"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Phone, Mail, Loader2 } from "lucide-react"

interface Salon {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  description: string | null
}

export function SalonInfo() {
  const [salon, setSalon] = useState<Salon | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSalonInfo = async () => {
      try {
        const response = await fetch("/api/salon")
        if (response.ok) {
          const data = await response.json()
          setSalon(data)
        }
      } catch (error) {
        console.error("[v0] Error fetching salon info:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSalonInfo()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!salon) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {salon.name}
            </CardTitle>
            <CardDescription>Información de tu salón</CardDescription>
          </div>
          <Badge>Activo</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {salon.description && <p className="text-sm text-muted-foreground">{salon.description}</p>}
        <div className="space-y-2 text-sm">
          {salon.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{salon.address}</span>
            </div>
          )}
          {salon.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{salon.phone}</span>
            </div>
          )}
          {salon.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{salon.email}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
