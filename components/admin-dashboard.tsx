"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminStats } from "@/lib/supabase-queries"

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTests: 0,
    uniqueUsers: 0,
    recentTestsCount: 0,
    topRecommendedCareers: [] as Array<{ name: string; count: number }>,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await getAdminStats()
      setStats(data)
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard de Estadísticas</h2>
        <p className="text-gray-600">Resumen de la actividad del sistema</p>
      </div>

      {/* Cards de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-l-4 border-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalTests}</div>
            <p className="text-xs text-gray-500 mt-1">Tests completados</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Usuarios Únicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.uniqueUsers}</div>
            <p className="text-xs text-gray-500 mt-1">Personas diferentes</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Tests Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.recentTestsCount}</div>
            <p className="text-xs text-gray-500 mt-1">Últimos 7 días</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Carreras Recomendadas */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle>Carreras Más Recomendadas</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {stats.topRecommendedCareers.length > 0 ? (
            <div className="space-y-3">
              {stats.topRecommendedCareers.map((career, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{career.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{career.count} veces</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(career.count / Math.max(...stats.topRecommendedCareers.map((c) => c.count))) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No hay datos suficientes aún</p>
              <p className="text-sm">Los tests completados aparecerán aquí</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card className="shadow-lg border-2 border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">💡</span>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">Información del Sistema</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Las estadísticas se actualizan en tiempo real</li>
                <li>• Los datos se almacenan de forma segura en Supabase</li>
                <li>• Puedes exportar los resultados desde la base de datos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
