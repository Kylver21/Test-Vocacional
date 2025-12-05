"use client"

import { useEffect, useState } from "react"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"
import { AdminPanel } from "@/components/admin-panel"
import { AdminLogin } from "@/components/admin-login"

export default function Home() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [adminMode, setAdminMode] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("vocational_user")
    const adminSession = localStorage.getItem("admin_session")

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    if (adminSession === "true") {
      setAdminMode(true)
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("vocational_user")
    setUser(null)
  }

  const handleAdminLogout = () => {
    localStorage.removeItem("admin_session")
    setAdminMode(false)
    setShowAdminLogin(false)
  }

  const handleAccessAdmin = () => {
    setShowAdminLogin(true)
  }

  const handleAdminLoginSuccess = () => {
    setAdminMode(true)
    setShowAdminLogin(false)
  }

  const handleCancelAdmin = () => {
    setShowAdminLogin(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  if (showAdminLogin) {
    return <AdminLogin onAdminLogin={handleAdminLoginSuccess} onCancel={handleCancelAdmin} />
  }

  if (adminMode) {
    return <AdminPanel onLogout={handleAdminLogout} />
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {!user ? (
        <LoginForm onLoginSuccess={setUser} onAccessAdmin={handleAccessAdmin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} onAccessAdmin={handleAccessAdmin} />
      )}
    </main>
  )
}
