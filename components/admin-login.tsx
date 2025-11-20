"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface AdminLoginProps {
  onAdminLogin: () => void
  onCancel: () => void
}

export function AdminLogin({ onAdminLogin, onCancel }: AdminLoginProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const ADMIN_PASSWORD = "admin123"

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("admin_session", "true")
      onAdminLogin()
    } else {
      setError("Contraseña incorrecta")
      setPassword("")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl">Acceso de Administrador</CardTitle>
        </CardHeader>
        <CardContent className="pt-8 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Contraseña de Admin</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError("")
              }}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Ingresa la contraseña"
              className="w-full"
            />
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleLogin} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2">
              Acceder
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex-1 bg-transparent">
              Cancelar
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">Por defecto: admin123 (cambiar en la aplicación)</p>
        </CardContent>
      </Card>
    </div>
  )
}
