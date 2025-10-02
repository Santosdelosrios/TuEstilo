"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppointmentCard } from "@/components/staff/appointment-card"
import { Calendar, Clock, CheckCircle } from "lucide-react"
import { format, addDays, startOfDay } from "date-fns"
import { es } from "date-fns/locale"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function StaffAgenda() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState<string>("all")

  const dateParam = format(selectedDate, "yyyy-MM-dd")
  const { data: appointments, error, isLoading, mutate } = useSWR(`/api/appointments?date=${dateParam}`, fetcher)

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i))

  // Filter appointments by status
  const filteredAppointments = appointments?.filter((apt: any) => {
    if (activeTab === "all") return true
    if (activeTab === "pending") return apt.status === "PENDING"
    if (activeTab === "confirmed") return apt.status === "CONFIRMED"
    if (activeTab === "completed") return apt.status === "COMPLETED"
    return true
  })

  const stats = {
    total: appointments?.length || 0,
    pending: appointments?.filter((a: any) => a.status === "PENDING").length || 0,
    confirmed: appointments?.filter((a: any) => a.status === "CONFIRMED").length || 0,
    completed: appointments?.filter((a: any) => a.status === "COMPLETED").length || 0,
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Citas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.confirmed}</p>
              <p className="text-sm text-muted-foreground">Confirmadas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Completadas</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Date selector */}
      <Card className="p-4">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Selecciona una fecha</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map((date) => {
            const isSelected = format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
            const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")

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
                {isToday && !isSelected && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Appointments list */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Citas del {format(selectedDate, "d 'de' MMMM", { locale: es })}
        </h3>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmadas</TabsTrigger>
            <TabsTrigger value="completed">Completadas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
                Error al cargar las citas
              </div>
            )}

            {!isLoading && !error && filteredAppointments?.length === 0 && (
              <div className="rounded-lg bg-muted p-8 text-center">
                <p className="text-muted-foreground">No hay citas para esta fecha</p>
              </div>
            )}

            {!isLoading && !error && filteredAppointments?.length > 0 && (
              <div className="space-y-4">
                {filteredAppointments.map((appointment: any) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} onUpdate={mutate} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
