"use client"

import { Card } from "@/components/ui/card"
import { Calendar, DollarSign, Users, TrendingUp } from "lucide-react"

interface StatsOverviewProps {
  stats: any
  isLoading: boolean
  error: any
}

export function StatsOverview({ stats, isLoading, error }: StatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">Error al cargar estadísticas</div>
    )
  }

  const statCards = [
    {
      title: "Total Citas",
      value: stats?.totalAppointments || 0,
      icon: Calendar,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Ingresos",
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-500/10 text-green-600",
    },
    {
      title: "Nuevos Clientes",
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      title: "Tasa Confirmación",
      value: stats?.totalAppointments
        ? `${Math.round(
            ((stats.appointmentsByStatus?.find((s: any) => s.status === "CONFIRMED")?._count || 0) /
              stats.totalAppointments) *
              100,
          )}%`
        : "0%",
      icon: TrendingUp,
      color: "bg-orange-500/10 text-orange-600",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
