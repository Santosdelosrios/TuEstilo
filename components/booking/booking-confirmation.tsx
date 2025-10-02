"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Calendar, Clock, User, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface BookingConfirmationProps {
  service: any
  professional: any
  dateTime: string | null
  onConfirm: (appointmentId: string) => void
  onBack: () => void
}

export function BookingConfirmation({ service, professional, dateTime, onConfirm, onBack }: BookingConfirmationProps) {
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        setIsAuthenticated(response.ok)
      } catch {
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [])

  const handleConfirm = async () => {
    if (isAuthenticated === false) {
      if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
        setError("Por favor completa todos los campos de contacto")
        return
      }

      // Validar email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(customerEmail)) {
        setError("Por favor ingresa un email válido")
        return
      }
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          professionalId: professional.id,
          serviceId: service.id,
          startTime: dateTime,
          notes: notes || undefined,
          ...(isAuthenticated === false && {
            customerInfo: {
              name: customerName.trim(),
              email: customerEmail.trim(),
              phone: customerPhone.trim(),
            },
          }),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al crear la cita")
      }

      const appointment = await response.json()
      onConfirm(appointment.id)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4" disabled={isLoading}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <h3 className="mb-4 text-lg font-semibold text-foreground">Confirma tu Reserva</h3>

      <Card className="mb-6 p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profesional</p>
              <p className="font-medium text-foreground">{professional.user.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Servicio</p>
              <p className="font-medium text-foreground">{service.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha y Hora</p>
              <p className="font-medium text-foreground">
                {dateTime &&
                  format(new Date(dateTime), "EEEE, d 'de' MMMM 'a las' HH:mm", {
                    locale: es,
                  })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Precio</p>
              <p className="font-medium text-foreground">${service.price.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </Card>

      {isAuthenticated === false && (
        <Card className="mb-6 p-6">
          <h4 className="mb-4 font-medium text-foreground">Información de Contacto</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerName" className="mb-2 block text-sm font-medium text-foreground">
                Nombre completo *
              </Label>
              <Input
                id="customerName"
                type="text"
                placeholder="Tu nombre completo"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <Label htmlFor="customerEmail" className="mb-2 block text-sm font-medium text-foreground">
                Email *
              </Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="tu@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <Label htmlFor="customerPhone" className="mb-2 block text-sm font-medium text-foreground">
                Teléfono *
              </Label>
              <Input
                id="customerPhone"
                type="tel"
                placeholder="+56 9 1234 5678"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>
        </Card>
      )}

      <div className="mb-6">
        <Label htmlFor="notes" className="mb-2 block text-sm font-medium text-foreground">
          Notas adicionales (opcional)
        </Label>
        <Textarea
          id="notes"
          placeholder="Agrega cualquier comentario o preferencia..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          disabled={isLoading}
        />
      </div>

      {error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <Button onClick={handleConfirm} disabled={isLoading || isAuthenticated === null} className="w-full" size="lg">
        {isLoading ? "Confirmando..." : "Confirmar Reserva"}
      </Button>
    </div>
  )
}
