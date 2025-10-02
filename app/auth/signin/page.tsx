"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "@/app/actions/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Scissors } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    console.log("[v0] Submitting login form for:", email)

    try {
      const result = await signIn(email, password)

      if (result.success && result.redirectUrl) {
        console.log("[v0] Login successful, redirecting to:", result.redirectUrl)
        router.refresh()
        // Small delay to ensure refresh completes
        await new Promise((resolve) => setTimeout(resolve, 100))
        console.log("[v0] Router refreshed, now pushing to:", result.redirectUrl)
        router.push(result.redirectUrl)
      } else if (!result.success) {
        console.log("[v0] Login failed:", result.error)
        setError(result.error || "Credenciales inválidas")
      }
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary">
            <Scissors className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Iniciar Sesión</h1>
          <p className="text-sm text-muted-foreground">Accede a tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Eres propietario de un salón?{" "}
            <Link href="/auth/register-owner" className="font-medium text-primary hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>

        <div className="mt-6 rounded-lg bg-muted p-4 text-sm">
          <p className="mb-2 font-medium text-foreground">Cuentas de prueba:</p>
          <p className="text-muted-foreground">Staff: maria@salon.com / password123</p>
          <p className="text-muted-foreground">Owner: owner@salon.com / password123</p>
        </div>
      </Card>
    </div>
  )
}
