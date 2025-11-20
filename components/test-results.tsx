"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CAREERS_DATABASE } from "@/lib/vocational-data"

interface TestResultsProps {
  results: {
    id: string
    date: string
    scores: Record<string, number>
    topCareers: Array<{ name: string; type: string; score: number }>
  }
  onBackToMenu: () => void
  userEmail?: string
}

export function TestResults({ results, onBackToMenu, userEmail }: TestResultsProps) {
  const [emailForResults, setEmailForResults] = useState(userEmail || "")
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState<"idle" | "success" | "error">("idle")
  const [emailMessage, setEmailMessage] = useState("")

  const normalizeScores = () => {
    const total = results.topCareers.reduce((sum, c) => sum + c.score, 0)
    if (total === 0) return results.topCareers

    const normalized = results.topCareers.map((c) => ({
      ...c,
      score: Math.round((c.score / total) * 100),
    }))

    // Ajusta cualquier diferencia de redondeo
    const totalAdjusted = normalized.reduce((sum, c) => sum + c.score, 0)
    if (totalAdjusted !== 100) {
      const diff = 100 - totalAdjusted
      if (normalized.length > 0) {
        normalized[0].score += diff
      }
    }

    return normalized
  }

  const normalizedCareers = normalizeScores()

  const getCareerDetails = (careerName: string) => {
    return CAREERS_DATABASE.find((c) => c.name === careerName)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Universitaria":
        return "bg-blue-100 text-blue-800"
      case "Técnica":
        return "bg-green-100 text-green-800"
      case "Profesional":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSendResults = async () => {
    if (!emailForResults || !emailForResults.includes("@")) {
      setEmailStatus("error")
      setEmailMessage("Por favor ingresa un email válido")
      return
    }

    setSendingEmail(true)
    setEmailStatus("idle")

    try {
      const response = await fetch("/api/send-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailForResults,
          name: emailForResults.split("@")[0],
          topCareers: normalizedCareers,
          scores: results.scores,
        }),
      })

      if (response.ok) {
        setEmailStatus("success")
        setEmailMessage("Resultados enviados correctamente a tu email")
        setTimeout(() => setEmailStatus("idle"), 3000)
      } else {
        setEmailStatus("error")
        setEmailMessage("Error al enviar los resultados. Intenta de nuevo.")
      }
    } catch (error) {
      console.error("[v0] Error sending results:", error)
      setEmailStatus("error")
      setEmailMessage("Error de conexión. Intenta de nuevo.")
    } finally {
      setSendingEmail(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button onClick={onBackToMenu} variant="outline" className="bg-white">
          ← Volver al Menú
        </Button>
      </div>

      <Card className="shadow-lg mb-6">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl">Tus Resultados</CardTitle>
          <p className="text-green-100 mt-2">{new Date(results.date).toLocaleDateString("es-ES")}</p>
        </CardHeader>
        <CardContent className="pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Carreras Recomendadas para Ti</h3>
          <div className="space-y-4">
            {normalizedCareers.map((career, index) => {
              const details = getCareerDetails(career.name)
              return (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {index + 1}. {career.name}
                      </h4>
                      <span
                        className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(career.type)}`}
                      >
                        {career.type}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{career.score}%</div>
                      <div className="text-xs text-gray-500">Compatibilidad</div>
                    </div>
                  </div>
                  {details && (
                    <>
                      {details.image && (
                        <img
                          src={details.image || "/placeholder.svg"}
                          alt={details.name}
                          className="w-full h-48 object-cover rounded-lg mb-3"
                        />
                      )}

                      <p className="text-gray-700 text-sm mt-3">{details.description}</p>
                      <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">Habilidades Clave:</p>
                          <p className="text-gray-600">{details.skills.join(", ")}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Salario Promedio:</p>
                          <p className="text-gray-600">{details.salary}</p>
                        </div>
                      </div>

                      {details.universities && details.universities.length > 0 && (
                        <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                          <p className="font-medium text-blue-900 text-sm mb-2">
                            Universidades que ofrecen esta carrera:
                          </p>
                          <ul className="text-sm text-blue-800 space-y-1">
                            {details.universities.map((uni, uIdx) => (
                              <li key={uIdx} className="flex items-center">
                                <span className="text-blue-600 mr-2">•</span>
                                {uni}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {details.youtubeLink && (
                        <div className="mt-3">
                          <p className="font-medium text-gray-900 text-sm mb-2">Video Informativo:</p>
                          <iframe
                            width="100%"
                            height="200"
                            src={`https://www.youtube.com/embed/${details.youtubeLink}`}
                            title={`Video sobre ${details.name}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="rounded-lg"
                          ></iframe>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recibe tus Resultados por Email</h3>
            <div className="flex gap-2 mb-2">
              <Input
                type="email"
                placeholder="tu@email.com"
                value={emailForResults}
                onChange={(e) => setEmailForResults(e.target.value)}
                disabled={sendingEmail}
                className="flex-1"
              />
              <Button
                onClick={handleSendResults}
                disabled={sendingEmail || !emailForResults}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {sendingEmail ? "Enviando..." : "Enviar"}
              </Button>
            </div>
            {emailStatus === "success" && (
              <p className="text-green-600 text-sm bg-green-50 p-2 rounded">{emailMessage}</p>
            )}
            {emailStatus === "error" && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{emailMessage}</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-lg">
          <CardTitle>Próximos Pasos</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-3">1.</span>
              <span>Investiga más sobre las carreras recomendadas en universidades e institutos técnicos</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-3">2.</span>
              <span>Habla con profesionales que trabajan en estos campos</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-3">3.</span>
              <span>Realiza el test nuevamente en el futuro para ver cómo evolucionan tus intereses</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-3">4.</span>
              <span>Considera tus fortalezas personales y oportunidades del mercado laboral</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
