"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Building2, User, Mail, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Owner {
  id: string
  name: string
  email: string
  phone: string | null
  createdAt: string
  salonId: string | null
  salonName: string | null
  salonActive: boolean | null
}

export default function SuperAdminDashboard() {
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    salonName: "",
    salonAddress: "",
    salonPhone: "",
    salonEmail: "",
    salonDescription: "",
  })

  useEffect(() => {
    fetchOwners()
  }, [])

  const fetchOwners = async () => {
    try {
      const response = await fetch("/api/owners")
      if (response.ok) {
        const data = await response.json()
        setOwners(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching owners:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los propietarios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/owners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Propietario y salón creados exitosamente",
        })
        setShowForm(false)
        setFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
          salonName: "",
          salonAddress: "",
          salonPhone: "",
          salonEmail: "",
          salonDescription: "",
        })
        fetchOwners()
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al crear propietario",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error creating owner:", error)
      toast({
        title: "Error",
        description: "Error al crear propietario",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Panel de Super Administrador</h1>
          <p className="text-muted-foreground mt-2">Gestiona propietarios y salones de la plataforma</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Nuevo Propietario
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Crear Nuevo Propietario y Salón</CardTitle>
            <CardDescription>Completa la información del propietario y su salón</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Owner Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información del Propietario
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Salon Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Información del Salón
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="salonName">Nombre del salón *</Label>
                    <Input
                      id="salonName"
                      value={formData.salonName}
                      onChange={(e) => setFormData({ ...formData, salonName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salonAddress">Dirección</Label>
                    <Input
                      id="salonAddress"
                      value={formData.salonAddress}
                      onChange={(e) => setFormData({ ...formData, salonAddress: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salonPhone">Teléfono del salón</Label>
                    <Input
                      id="salonPhone"
                      type="tel"
                      value={formData.salonPhone}
                      onChange={(e) => setFormData({ ...formData, salonPhone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salonEmail">Email del salón</Label>
                    <Input
                      id="salonEmail"
                      type="email"
                      value={formData.salonEmail}
                      onChange={(e) => setFormData({ ...formData, salonEmail: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salonDescription">Descripción</Label>
                    <Textarea
                      id="salonDescription"
                      value={formData.salonDescription}
                      onChange={(e) => setFormData({ ...formData, salonDescription: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={submitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creando..." : "Crear Propietario y Salón"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Owners List */}
      <div className="grid gap-4">
        <h2 className="text-2xl font-semibold">Propietarios Registrados</h2>

        {loading ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">Cargando propietarios...</CardContent>
          </Card>
        ) : owners.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No hay propietarios registrados aún
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {owners.map((owner) => (
              <Card key={owner.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {owner.name}
                  </CardTitle>
                  <CardDescription>
                    Registrado el {new Date(owner.createdAt).toLocaleDateString("es-ES")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{owner.email}</span>
                  </div>

                  {owner.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{owner.phone}</span>
                    </div>
                  )}

                  {owner.salonName && (
                    <div className="pt-3 border-t">
                      <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                        <Building2 className="h-4 w-4" />
                        {owner.salonName}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${owner.salonActive ? "bg-green-500" : "bg-gray-400"}`} />
                        <span className="text-xs text-muted-foreground">
                          {owner.salonActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
