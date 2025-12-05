"use client"

import { useState, useMemo } from "react"
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
  userId?: string
}

// Tipos de carrera disponibles para filtrar
const CAREER_TYPES = ["Todas", "Universitaria", "Técnica", "Profesional"] as const
type CareerType = typeof CAREER_TYPES[number]

// Rangos de salario para filtrar (en Soles peruanos)
const SALARY_RANGES = [
  { label: "Todos", min: 0, max: Infinity },
  { label: "Hasta S/ 7,000", min: 0, max: 7000 },
  { label: "S/ 7,000 - S/ 12,000", min: 7000, max: 12000 },
  { label: "S/ 12,000 - S/ 18,000", min: 12000, max: 18000 },
  { label: "Más de S/ 18,000", min: 18000, max: Infinity },
] as const

export function TestResults({ results, onBackToMenu, userEmail, userId }: TestResultsProps) {
  const [emailForResults, setEmailForResults] = useState(userEmail || "")
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState<"idle" | "success" | "error">("idle")
  const [emailMessage, setEmailMessage] = useState("")
  
  // Estados para filtros
  const [selectedType, setSelectedType] = useState<CareerType>("Todas")
  const [selectedSalaryRange, setSelectedSalaryRange] = useState(0)

  const normalizeScores = () => {
    const total = results.topCareers.reduce((sum, c) => sum + c.score, 0)
    if (total === 0) return results.topCareers

    const normalized = results.topCareers.map((c) => ({
      ...c,
      score: Math.round((c.score / total) * 100),
    }))

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

  // Función para extraer el valor numérico del salario (formato: S/ X,XXX - S/ Y,YYY/mes)
  const extractSalaryValue = (salaryString: string): number => {
    // Busca el primer valor numérico después de "S/" 
    const match = salaryString.match(/S\/\s*([\d,]+)/)
    if (match) {
      return parseInt(match[1].replace(/,/g, ""))
    }
    return 0
  }

  // Filtrar carreras basado en los filtros seleccionados
  const filteredCareers = useMemo(() => {
    return normalizedCareers.filter((career) => {
      const details = CAREERS_DATABASE.find((c) => c.name === career.name)
      
      // Filtro por tipo
      if (selectedType !== "Todas" && career.type !== selectedType) {
        return false
      }
      
      // Filtro por salario
      if (details && selectedSalaryRange > 0) {
        const salary = extractSalaryValue(details.salary)
        const range = SALARY_RANGES[selectedSalaryRange]
        if (salary < range.min || salary > range.max) {
          return false
        }
      }
      
      return true
    })
  }, [normalizedCareers, selectedType, selectedSalaryRange])

  const getCareerDetails = (careerName: string) => {
    return CAREERS_DATABASE.find((c) => c.name === careerName)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Universitaria":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Técnica":
        return "bg-green-100 text-green-800 border-green-200"
      case "Profesional":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Sistema de semáforo para indicar nivel de compatibilidad
  const getTrafficLightColor = (score: number, index: number) => {
    // Basado en el score y la posición
    if (score >= 22 || index === 0) {
      return {
        bg: "bg-gradient-to-r from-emerald-500 to-green-500",
        border: "border-emerald-400",
        text: "text-emerald-700",
        lightBg: "bg-emerald-50",
        label: "Altamente Recomendada",
        emoji: "🟢",
        glow: "shadow-emerald-200"
      }
    } else if (score >= 18 || index <= 2) {
      return {
        bg: "bg-gradient-to-r from-amber-400 to-yellow-400",
        border: "border-amber-400",
        text: "text-amber-700",
        lightBg: "bg-amber-50",
        label: "Buena Opción",
        emoji: "🟡",
        glow: "shadow-amber-200"
      }
    } else {
      return {
        bg: "bg-gradient-to-r from-orange-400 to-red-400",
        border: "border-orange-400",
        text: "text-orange-700",
        lightBg: "bg-orange-50",
        label: "Considerar",
        emoji: "🟠",
        glow: "shadow-orange-200"
      }
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
    setEmailMessage("")

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
          userId: userId || null,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setEmailStatus("success")
        if (data.emailSent) {
          setEmailMessage("✅ ¡Resultados enviados! Revisa tu bandeja de entrada y spam.")
        } else {
          setEmailMessage("✅ Resultados guardados correctamente.")
        }
        setTimeout(() => setEmailStatus("idle"), 5000)
      } else {
        setEmailStatus("error")
        setEmailMessage(data.error || "Error al enviar los resultados. Intenta de nuevo.")
      }
    } catch (error: any) {
      console.error("[TestResults] Error sending results:", error)
      setEmailStatus("error")
      setEmailMessage("Error de conexión. Verifica tu internet e intenta de nuevo.")
    } finally {
      setSendingEmail(false)
    }
  }

  // Imágenes de profesionales para las carreras
  const CAREER_IMAGES = [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop&q=80",
  ]

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Botón volver */}
      <div className="mb-6">
        <Button 
          onClick={onBackToMenu} 
          variant="outline" 
          className="border-gray-300 hover:bg-gray-100 text-gray-700 font-medium px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
        >
          ← Volver al Menú
        </Button>
      </div>

      {/* Header de resultados */}
      <Card className="shadow-2xl border-0 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-5xl">🎯</span>
                <div>
                  <CardTitle className="text-3xl font-bold text-white">
                    ¡Tus Resultados están Listos!
                  </CardTitle>
                  <p className="text-emerald-100 text-base mt-1">
                    {new Date(results.date).toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Leyenda del semáforo */}
            <div className="bg-white/15 backdrop-blur rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100 mb-2">Sistema de Compatibilidad</p>
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🟢</span>
                  <span className="text-white/90">Altamente Recomendada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🟡</span>
                  <span className="text-white/90">Buena Opción</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🟠</span>
                  <span className="text-white/90">Considerar</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6 md:p-8 bg-gradient-to-b from-gray-50 to-white">
          {/* Filtros */}
          <div className="mb-8 p-5 bg-white rounded-2xl shadow-md border border-gray-100">
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <span>🔍</span> Filtrar Carreras
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Filtro por tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Tipo de Carrera</label>
                <div className="flex flex-wrap gap-2">
                  {CAREER_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedType === type
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro por salario */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Rango Salarial</label>
                <div className="flex flex-wrap gap-2">
                  {SALARY_RANGES.map((range, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSalaryRange(index)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedSalaryRange === index
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Título de carreras */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg">
                📚
              </span>
              Carreras Recomendadas
            </h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
              {filteredCareers.length} resultados
            </span>
          </div>

          {/* Lista de carreras */}
          <div className="space-y-6">
            {filteredCareers.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <span className="text-5xl mb-4 block">🔎</span>
                <p className="text-gray-600 font-medium">No hay carreras que coincidan con los filtros seleccionados</p>
                <Button 
                  onClick={() => { setSelectedType("Todas"); setSelectedSalaryRange(0); }}
                  className="mt-4 bg-violet-600 hover:bg-violet-700 text-white"
                >
                  Limpiar Filtros
                </Button>
              </div>
            ) : (
              filteredCareers.map((career, index) => {
                const details = getCareerDetails(career.name)
                const careerImage = details?.image || CAREER_IMAGES[index % CAREER_IMAGES.length]
                const trafficLight = getTrafficLightColor(career.score, index)
                
                return (
                  <div
                    key={index}
                    className={`bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 ${trafficLight.border} hover:scale-[1.01] transform`}
                  >
                    {/* Header con imagen destacada */}
                    <div className="relative h-64 md:h-72 overflow-hidden">
                      <img
                        src={careerImage}
                        alt={career.name}
                        className="w-full h-full object-cover object-center"
                        loading="lazy"
                      />
                      {/* Overlay con gradiente */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      
                      {/* Indicador de posición - esquina superior izquierda */}
                      <div className="absolute top-4 left-4">
                        <div className={`${trafficLight.bg} backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2 shadow-xl`}>
                          <span className="text-2xl">{trafficLight.emoji}</span>
                          <span className="font-black text-white text-lg">#{index + 1}</span>
                        </div>
                      </div>

                      {/* Badge de compatibilidad - esquina superior derecha */}
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-xl">
                          <span className={`text-3xl font-black ${trafficLight.text}`}>{career.score}%</span>
                        </div>
                      </div>

                      {/* Título sobre la imagen - parte inferior */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold border-2 ${getTypeColor(career.type)} bg-white/90 backdrop-blur-sm`}>
                            {career.type}
                          </span>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${trafficLight.bg} text-white`}>
                            {trafficLight.label}
                          </span>
                        </div>
                        <h4 className="font-black text-white text-2xl md:text-3xl drop-shadow-lg">
                          {career.name}
                        </h4>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-6 md:p-8">
                      {details && (
                        <>
                          <p className="text-gray-600 text-base leading-relaxed mb-6">
                            {details.description}
                          </p>

                          {/* Grid de información */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* Habilidades */}
                            <div className={`${trafficLight.lightBg} p-5 rounded-2xl border-2 ${trafficLight.border}`}>
                              <p className={`font-bold ${trafficLight.text} mb-3 text-sm flex items-center gap-2`}>
                                <span className="text-xl">💼</span> Habilidades Clave
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {details.skills.map((skill, idx) => (
                                  <span 
                                    key={idx} 
                                    className="bg-white px-3 py-1.5 rounded-full text-sm text-gray-700 border-2 border-gray-200 font-medium shadow-sm"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Salario */}
                            <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-5 rounded-2xl border-2 border-emerald-200">
                              <p className="font-bold text-emerald-700 mb-2 text-sm flex items-center gap-2">
                                <span className="text-xl">💰</span> Salario Promedio
                              </p>
                              <p className="text-emerald-800 text-xl md:text-2xl font-black">{details.salary}</p>
                            </div>
                          </div>

                          {/* Universidades */}
                          {details.universities && details.universities.length > 0 && (
                            <div className="mb-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 p-5 rounded-2xl border-2 border-blue-200">
                              <p className="font-bold text-blue-800 mb-4 text-sm flex items-center gap-2">
                                <span className="text-xl">🎓</span> Dónde estudiar esta carrera
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {details.universities.map((uni, uIdx) => (
                                  <span 
                                    key={uIdx} 
                                    className="bg-white px-4 py-2 rounded-xl text-sm text-blue-700 border-2 border-blue-200 shadow-sm font-medium hover:bg-blue-50 transition-colors cursor-pointer"
                                  >
                                    🏛️ {uni}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Video de YouTube */}
                          {details.youtubeLink && (
                            <div className="mt-6">
                              <p className="font-bold text-gray-900 mb-4 text-sm flex items-center gap-2">
                                <span className="text-xl">🎬</span> Conoce más sobre esta carrera
                              </p>
                              <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200">
                                <div className="relative pb-[56.25%] h-0">
                                  <iframe
                                    className="absolute top-0 left-0 w-full h-full"
                                    src={`https://www.youtube.com/embed/${details.youtubeLink}`}
                                    title={`Video sobre ${details.name}`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  ></iframe>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Sección de envío por email */}
          <div className="mt-10 pt-8 border-t-2 border-gray-100">
            <div className="bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 p-6 rounded-2xl border border-violet-200 shadow-lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg">
                  ✉️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Recibe tus Resultados por Email
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Te enviaremos un resumen completo con todas tus carreras recomendadas
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={emailForResults}
                  onChange={(e) => setEmailForResults(e.target.value)}
                  disabled={sendingEmail}
                  className="flex-1 border-2 border-gray-200 focus:border-violet-500 rounded-xl px-4 py-3 text-base bg-white"
                />
                <Button
                  onClick={handleSendResults}
                  disabled={sendingEmail || !emailForResults}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl disabled:opacity-50 shadow-lg font-semibold"
                >
                  {sendingEmail ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                      <span>Enviando...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>📨</span> Enviar Resultados
                    </span>
                  )}
                </Button>
              </div>
              {emailStatus === "success" && (
                <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-green-700 p-4 rounded-xl flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <span className="font-medium">{emailMessage}</span>
                </div>
              )}
              {emailStatus === "error" && (
                <div className="mt-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 text-red-700 p-4 rounded-xl flex items-center gap-3">
                  <span className="text-xl">❌</span>
                  <span className="font-medium">{emailMessage}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Próximos pasos */}
      <Card className="shadow-2xl border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🚀</span> Próximos Pasos
          </CardTitle>
        </div>
        <CardContent className="p-6 md:p-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Investiga tus opciones</h4>
                <p className="text-gray-600 text-sm">
                  Explora las carreras recomendadas en universidades e institutos técnicos de tu zona
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Habla con profesionales</h4>
                <p className="text-gray-600 text-sm">
                  Conecta con personas que trabajan en estos campos para conocer su experiencia real
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Evalúa el mercado laboral</h4>
                <p className="text-gray-600 text-sm">
                  Considera las oportunidades de empleo y crecimiento en cada área profesional
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Repite el test periódicamente</h4>
                <p className="text-gray-600 text-sm">
                  Tus intereses pueden evolucionar, repite el test para descubrir nuevas opciones
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
