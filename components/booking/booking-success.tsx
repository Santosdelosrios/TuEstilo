"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

interface BookingSuccessProps {
  appointmentId: string | null
  onReset: () => void
}

export function BookingSuccess({ appointmentId, onReset }: BookingSuccessProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle className="h-12 w-12 text-primary" />
      </div>

      <h3 className="mb-2 text-2xl font-bold text-foreground">¡Reserva Confirmada!</h3>
      <p className="mb-6 text-muted-foreground">
        Tu cita ha sido agendada exitosamente. Recibirás un correo de confirmación.
      </p>

      <Card className="mb-6 w-full max-w-md bg-muted p-4">
        <p className="text-sm text-muted-foreground">Número de reserva</p>
        <p className="font-mono text-lg font-semibold text-foreground">{appointmentId}</p>
      </Card>

      <div className="flex gap-3">
        <Button onClick={onReset} size="lg">
          Hacer otra Reserva
        </Button>
      </div>
    </div>
  )
}
