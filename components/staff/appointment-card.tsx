"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Clock, Phone, Mail, DollarSign, CheckCircle, XCircle, FileText } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface AppointmentCardProps {
  appointment: any
  onUpdate: () => void
}

export function AppointmentCard({ appointment, onUpdate }: AppointmentCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const statusConfig = {
    PENDING: { label: "Pendiente", color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
    CONFIRMED: { label: "Confirmada", color: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
    CANCELLED: { label: "Cancelada", color: "bg-red-500/10 text-red-700 border-red-500/20" },
    COMPLETED: { label: "Completada", color: "bg-green-500/10 text-green-700 border-green-500/20" },
  }

  const currentStatus = statusConfig[appointment.status as keyof typeof statusConfig]

  const handleStatusUpdate = async (newStatus: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar la cita")
      }

      onUpdate()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("[v0] Error updating appointment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="p-4 transition-all hover:shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-3">
            {/* Time and Status */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {format(new Date(appointment.startTime), "HH:mm")} - {format(new Date(appointment.endTime), "HH:mm")}
              </div>
              <Badge className={currentStatus.color}>{currentStatus.label}</Badge>
            </div>

            {/* Customer info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg" alt={appointment.customer.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {appointment.customer.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{appointment.customer.name}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {appointment.customer.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {appointment.customer.phone}
                    </span>
                  )}
                  {appointment.customer.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {appointment.customer.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Service info */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{appointment.service.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">${appointment.service.price.toLocaleString()}</span>
              </div>
            </div>

            {/* Notes */}
            {appointment.notes && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Notas:</span> {appointment.notes}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:flex-col">
            {appointment.status === "PENDING" && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate("CONFIRMED")}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusUpdate("CANCELLED")}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </>
            )}
            {appointment.status === "CONFIRMED" && (
              <Button
                size="sm"
                onClick={() => handleStatusUpdate("COMPLETED")}
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Completar
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setIsDialogOpen(true)} className="flex-1 sm:flex-none">
              Ver Detalles
            </Button>
          </div>
        </div>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la Cita</DialogTitle>
            <DialogDescription>Información completa de la reserva</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cliente</p>
              <p className="text-foreground">{appointment.customer.name}</p>
              <p className="text-sm text-muted-foreground">{appointment.customer.email}</p>
              {appointment.customer.phone && (
                <p className="text-sm text-muted-foreground">{appointment.customer.phone}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Servicio</p>
              <p className="text-foreground">{appointment.service.name}</p>
              <p className="text-sm text-muted-foreground">{appointment.service.durationMinutes} minutos</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha y Hora</p>
              <p className="text-foreground">
                {format(new Date(appointment.startTime), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(appointment.startTime), "HH:mm")} - {format(new Date(appointment.endTime), "HH:mm")}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Estado</p>
              <Badge className={currentStatus.color}>{currentStatus.label}</Badge>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Precio</p>
              <p className="text-lg font-semibold text-foreground">${appointment.service.price.toLocaleString()}</p>
            </div>

            {appointment.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notas</p>
                <p className="text-sm text-foreground">{appointment.notes}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
