"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Store, User } from "lucide-react"

export function RegisterOwnerForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      // Datos del propietario
      ownerName: formData.get("ownerName"),
      ownerEmail: formData.get("ownerEmail"),
      ownerPassword: formData.get("ownerPassword"),
      ownerPhone: formData.get("ownerPhone"),
      // Datos del salón
      salonName: formData.get("salonName"),
      salonDescription: formData.get("salonDescription"),
      salonAddress: formData.get("salonAddress"),
      salonPhone: formData.get("salonPhone"),
      salonEmail: formData.get("salonEmail"),
    }

    try {
      const response = await fetch("/api/auth/register-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al registrar")
      }

      // Redirigir al login después del registro exitoso
      router.push("/auth/signin?registered=true")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de Registro</CardTitle>
        <CardDescription>Completa los datos de tu cuenta y de tu salón</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección del propietario */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Datos del Propietario</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Nombre completo *</Label>
                <Input id="ownerName" name="ownerName" placeholder="Juan Pérez" required disabled={isLoading} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerEmail">Email *</Label>
                <Input
                  id="ownerEmail"
                  name="ownerEmail"
                  type="email"
                  placeholder="juan@ejemplo.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerPassword">Contraseña *</Label>
                <Input
                  id="ownerPassword"
                  name="ownerPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerPhone">Teléfono</Label>
                <Input
                  id="ownerPhone"
                  name="ownerPhone"
                  type="tel"
                  placeholder="+34 600 000 000"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Sección del salón */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Datos del Salón</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="salonName">Nombre del salón *</Label>
                <Input
                  id="salonName"
                  name="salonName"
                  placeholder="Salón de Belleza Elegancia"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salonDescription">Descripción</Label>
                <Textarea
                  id="salonDescription"
                  name="salonDescription"
                  placeholder="Describe tu salón y los servicios que ofreces..."
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="salonAddress">Dirección</Label>
                  <Input id="salonAddress" name="salonAddress" placeholder="Calle Principal 123" disabled={isLoading} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salonPhone">Teléfono del salón</Label>
                  <Input
                    id="salonPhone"
                    name="salonPhone"
                    type="tel"
                    placeholder="+34 900 000 000"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salonEmail">Email del salón</Label>
                <Input
                  id="salonEmail"
                  name="salonEmail"
                  type="email"
                  placeholder="contacto@salon.com"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              "Crear Cuenta y Salón"
            )}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <a href="/auth/signin" className="text-primary hover:underline">
              Inicia sesión
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
