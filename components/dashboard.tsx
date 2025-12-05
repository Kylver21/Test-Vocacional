"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VocationalTest } from "./vocational-test"
import { TestResults } from "./test-results"
import { createClient } from "@/lib/supabase"

interface DashboardProps {
  user: { id: string; email: string }
  onLogout: () => void
  onAccessAdmin: () => void
}

interface TestResult {
  id: string
  date: string
  scores: Record<string, number>
  topCareers: Array<{ name: string; type: string; score: number }>
}

export function Dashboard({ user, onLogout, onAccessAdmin }: DashboardProps) {
  const [view, setView] = useState<"menu" | "test" | "results">("menu")
  const [results, setResults] = useState<TestResult | null>(null)
  const [history, setHistory] = useState<TestResult[]>([])

  useEffect(() => {
    const userResults = JSON.parse(localStorage.getItem(`vocational_results_${user.id}`) || "[]")
    setHistory(userResults)
  }, [user.id])

  const handleTestComplete = async (testResults: TestResult) => {
    const supabase = createClient()

    setResults(testResults)
    const userResults = JSON.parse(localStorage.getItem(`vocational_results_${user.id}`) || "[]")
    userResults.unshift(testResults)
    localStorage.setItem(`vocational_results_${user.id}`, JSON.stringify(userResults))

    try {
      await supabase.from("test_results").insert({
        user_id: user.id,
        user_email: user.email,
        scores: testResults.scores,
        top_careers: testResults.topCareers,
      })
    } catch (error) {
      console.error("[v0] Error saving to Supabase:", error)
      // Continúa aunque falle Supabase
    }

    setHistory(userResults)
    setView("results")
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Test Vocacional
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              Bienvenido, {user.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onAccessAdmin}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50 text-sm"
            >
              Panel Admin
            </Button>
            <Button 
              onClick={onLogout} 
              variant="outline" 
              className="border-gray-300 hover:bg-gray-50 text-sm"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Main Content */}
        {view === "menu" && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className="shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
              onClick={() => setView("test")}
            >
              <div className="bg-blue-600 p-5 text-white">
                <CardTitle className="text-xl font-semibold text-white mb-1">Nuevo Test</CardTitle>
                <CardDescription className="text-blue-100 text-sm">
                  Descubre tu carrera ideal
                </CardDescription>
              </div>
              <CardContent className="pt-5 pb-5 px-5">
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  Responde preguntas sobre tus intereses, habilidades y preferencias para obtener recomendaciones
                  personalizadas de carreras universitarias, técnicas y profesiones.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2">
                  Comenzar Test
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-md border border-gray-200">
              <div className="bg-indigo-600 p-5 text-white">
                <CardTitle className="text-xl font-semibold text-white mb-1">Historial</CardTitle>
                <CardDescription className="text-indigo-100 text-sm">
                  Tus tests anteriores
                </CardDescription>
              </div>
              <CardContent className="pt-5 pb-5 px-5">
                {history.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">No hay tests completados aún</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.slice(0, 5).map((result, index) => (
                      <div
                        key={result.id}
                        className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                        onClick={() => {
                          setResults(result)
                          setView("results")
                        }}
                      >
                        <p className="font-medium text-gray-900 text-sm">
                          {new Date(result.date).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-gray-600">
                          {result.topCareers[0]?.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {view === "test" && <VocationalTest onComplete={handleTestComplete} userId={user.id} userEmail={user.email} />}

        {view === "results" && results && (
          <TestResults
            results={results}
            onBackToMenu={() => {
              setView("menu")
              setResults(null)
            }}
            userEmail={user.email}
            userId={user.id}
          />
        )}
      </div>
    </div>
  )
}
