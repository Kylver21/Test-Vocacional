"use client"

import type React from "react"
import { createClient } from "@/lib/supabase"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface LoginFormProps {
  onLoginSuccess: (user: { id: string; email: string }) => void
  onAccessAdmin: () => void
}

export function LoginForm({ onLoginSuccess, onAccessAdmin }: LoginFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const supabase = createClient()

      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setError(error.message)
          setLoading(false)
          return
        }

        if (data.user) {
          localStorage.setItem(
            "vocational_user",
            JSON.stringify({
              id: data.user.id,
              email: data.user.email,
            }),
          )
          onLoginSuccess({ id: data.user.id, email: data.user.email || email })
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) {
          setError(error.message)
          setLoading(false)
          return
        }

        if (data.user) {
          localStorage.setItem(
            "vocational_user",
            JSON.stringify({
              id: data.user.id,
              email: data.user.email,
            }),
          )
          onLoginSuccess({ id: data.user.id, email: data.user.email || email })
        }
      }
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl">{isLogin ? "Iniciar Sesión" : "Registrarse"}</CardTitle>
          <CardDescription className="text-blue-100">
            {isLogin ? "Accede a tu test vocacional" : "Crea tu cuenta para comenzar"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
            {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Cargando..." : isLogin ? "Iniciar Sesión" : "Registrarse"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onAccessAdmin}
              className="w-full text-xs text-gray-500 hover:text-gray-700 py-2 px-3 rounded bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              ¿Eres administrador?
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
