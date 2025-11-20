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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Test Vocacional</h1>
            <p className="text-gray-600 mt-1">Bienvenido, {user.email}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onAccessAdmin}
              variant="outline"
              className="bg-purple-50 text-purple-700 hover:bg-purple-100"
            >
              Panel Admin
            </Button>
            <Button onClick={onLogout} variant="outline" className="bg-white">
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Main Content */}
        {view === "menu" && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setView("test")}
            >
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                <CardTitle>Nuevo Test</CardTitle>
                <CardDescription className="text-blue-100">Descubre tu carrera ideal</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  Responde preguntas sobre tus intereses, habilidades y preferencias para obtener recomendaciones
                  personalizadas de carreras universitarias, técnicas y profesiones.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Comenzar Test</Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-t-lg">
                <CardTitle>Historial</CardTitle>
                <CardDescription className="text-indigo-100">Tus tests anteriores</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {history.length === 0 ? (
                  <p className="text-gray-500">No hay tests completados aún</p>
                ) : (
                  <div className="space-y-3">
                    {history.slice(0, 5).map((result) => (
                      <div
                        key={result.id}
                        className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setResults(result)
                          setView("results")
                        }}
                      >
                        <p className="font-medium text-gray-900">{new Date(result.date).toLocaleDateString("es-ES")}</p>
                        <p className="text-sm text-gray-600">{result.topCareers[0]?.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {view === "test" && <VocationalTest onComplete={handleTestComplete} userId={user.id} />}

        {view === "results" && results && (
          <TestResults
            results={results}
            onBackToMenu={() => {
              setView("menu")
              setResults(null)
            }}
            userEmail={user.email}
          />
        )}
      </div>
    </div>
  )
}
