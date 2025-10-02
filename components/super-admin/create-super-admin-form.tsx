"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Copy, Check } from "lucide-react"

export default function CreateSuperAdminForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [sqlScript, setSqlScript] = useState("")
  const [copied, setCopied] = useState(false)

  const generateScript = async () => {
    if (!email || !password) {
      return
    }

    // In a real implementation, you would hash the password on the server
    // For now, we'll generate a script that needs to be run manually
    const script = `
-- Script para crear Super Administrador
-- Ejecuta este script en tu base de datos Neon

DO $$
DECLARE
    admin_id TEXT := gen_random_uuid()::TEXT;
BEGIN
    INSERT INTO users (id, name, email, password, role, "createdAt", "updatedAt")
    VALUES (
        admin_id,
        'Super Administrador',
        '${email}',
        crypt('${password}', gen_salt('bf')), -- Requiere extensión pgcrypto
        'SUPER_ADMIN',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Super admin creado exitosamente con email: ${email}';
END $$;
    `.trim()

    setSqlScript(script)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Crear Super Administrador
          </CardTitle>
          <CardDescription>Genera un script SQL para crear tu primer usuario super administrador</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              Este formulario genera un script SQL que debes ejecutar manualmente en tu base de datos Neon. Solo
              necesitas hacer esto una vez para crear el primer super administrador.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email del Super Admin</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tudominio.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña segura"
              />
            </div>

            <Button onClick={generateScript} className="w-full">
              Generar Script SQL
            </Button>
          </div>

          {sqlScript && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Script SQL Generado</Label>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">{sqlScript}</pre>
              <Alert>
                <AlertDescription>
                  <strong>Instrucciones:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Copia el script SQL de arriba</li>
                    <li>Ve a tu dashboard de Neon</li>
                    <li>Abre el SQL Editor</li>
                    <li>Pega y ejecuta el script</li>
                    <li>Inicia sesión con el email y contraseña que configuraste</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
