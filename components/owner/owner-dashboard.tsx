"use client"

import { useState } from "react"
import useSWR from "swr"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatsOverview } from "@/components/owner/stats-overview"
import { RevenueChart } from "@/components/owner/revenue-chart"
import { TopServices } from "@/components/owner/top-services"
import { CustomersList } from "@/components/owner/customers-list"
import { ServiceManagement } from "@/components/owner/service-management"
import { StaffManagement } from "@/components/owner/staff-management"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function OwnerDashboard() {
  const [period, setPeriod] = useState("month")
  const { data: stats, error, isLoading } = useSWR(`/api/stats?period=${period}`, fetcher)

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Hoy</SelectItem>
            <SelectItem value="week">Última semana</SelectItem>
            <SelectItem value="month">Último mes</SelectItem>
            <SelectItem value="year">Último año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview */}
      <StatsOverview stats={stats} isLoading={isLoading} error={error} />

      {/* Charts and insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={stats?.appointmentsPerDay} isLoading={isLoading} />
        <TopServices services={stats?.topServices} isLoading={isLoading} />
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="staff">Personal</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="mt-6">
          <CustomersList />
        </TabsContent>

        <TabsContent value="staff" className="mt-6">
          <StaffManagement />
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <ServiceManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
