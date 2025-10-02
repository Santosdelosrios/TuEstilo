"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { ChevronLeft, CalendarIcon } from "lucide-react"
import { format, addDays } from "date-fns"
import { es } from "date-fns/locale"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface DateTimeSelectionProps {
  professionalId: string
  serviceId: string
  onSelect: (dateTime: string) => void
  onBack: () => void
}

export function DateTimeSelection({ professionalId, serviceId, onSelect, onBack }: DateTimeSelectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const { data, error, isLoading } = useSWR(
    selectedDate
      ? `/api/appointments/available-slots?professionalId=${professionalId}&serviceId=${serviceId}&date=${selectedDate.toISOString()}`
      : null,
    fetcher,
  )

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i))

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <h3 className="mb-4 text-lg font-semibold text-foreground">Selecciona Fecha y Hora</h3>

      {/* Date selector */}
      <div className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {dates.map((date) => {
            const isSelected = format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`flex min-w-[80px] flex-col items-center rounded-lg border-2 p-3 transition-all ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary"
                }`}
              >
                <span className="text-xs font-medium">{format(date, "EEE", { locale: es })}</span>
                <span className="text-2xl font-bold">{format(date, "d")}</span>
                <span className="text-xs">{format(date, "MMM", { locale: es })}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots */}
      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
          Horarios disponibles
        </h4>

        {isLoading && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-center text-sm text-destructive">
            Error al cargar horarios
          </div>
        )}

        {data && data.slots.length === 0 && (
          <div className="rounded-lg bg-muted p-8 text-center">
            <p className="text-muted-foreground">No hay horarios disponibles para esta fecha</p>
          </div>
        )}

        {data && data.slots.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {data.slots.map((slot: string) => (
              <Button
                key={slot}
                variant="outline"
                onClick={() => onSelect(slot)}
                className="h-12 border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                {format(new Date(slot), "HH:mm")}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
