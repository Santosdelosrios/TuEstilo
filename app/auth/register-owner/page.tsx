import type { Metadata } from "next"
import { RegisterOwnerForm } from "@/components/auth/register-owner-form"

export const metadata: Metadata = {
  title: "Registrar Salón",
  description: "Crea tu cuenta y registra tu salón de belleza",
}

export default function RegisterOwnerPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Registra tu Salón</h1>
          <p className="text-muted-foreground">Comienza a gestionar tu negocio de belleza hoy mismo</p>
        </div>
        <RegisterOwnerForm />
      </div>
    </div>
  )
}
