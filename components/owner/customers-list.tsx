"use client"

import useSWR from "swr"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Mail, Phone, Calendar } from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function CustomersList() {
  const [search, setSearch] = useState("")
  const { data: customers, error, isLoading } = useSWR(`/api/customers?search=${search}`, fetcher)

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Lista de Clientes</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">Error al cargar clientes</div>
      )}

      {!isLoading && !error && customers?.length === 0 && (
        <div className="rounded-lg bg-muted p-8 text-center">
          <p className="text-muted-foreground">No se encontraron clientes</p>
        </div>
      )}

      {!isLoading && !error && customers?.length > 0 && (
        <div className="space-y-4">
          {customers.map((customer: any) => (
            <div key={customer.id} className="flex items-center gap-4 rounded-lg border border-border p-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {customer.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-foreground">{customer.name}</p>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {customer.email}
                  </span>
                  {customer.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {customer.appointment_count || 0} citas
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Cliente desde</p>
                <p className="text-sm font-medium text-foreground">
                  {format(new Date(customer.createdAt), "MMM yyyy", { locale: es })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
