"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CAREERS_DATABASE, CATEGORY_WEIGHTS } from "@/lib/vocational-data"
import { saveTestResult, loadQuestionsFromDB } from "@/lib/supabase-queries"

interface VocationalTestProps {
  onComplete: (results: any) => void
  userId: string
  userEmail: string
}

interface Answer {
  text: string
  category: string
  value: number
}

interface Question {
  question: string
  answers: Answer[]
}

// Imágenes de profesionales técnicos para mostrar en el test
const QUESTION_IMAGES = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=350&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=350&fit=crop&q=80",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500&h=350&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&h=350&fit=crop&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=350&fit=crop&q=80",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=500&h=350&fit=crop&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=350&fit=crop&q=80",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&h=350&fit=crop&q=80",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500&h=350&fit=crop&q=80",
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=500&h=350&fit=crop&q=80",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&h=350&fit=crop&q=80",
  "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=500&h=350&fit=crop&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=350&fit=crop&q=80",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&h=350&fit=crop&q=80",
  "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&h=350&fit=crop&q=80",
]

// Colores de gradiente para cada pregunta
const GRADIENT_COLORS = [
  "from-violet-600 via-purple-600 to-indigo-600",
  "from-blue-600 via-cyan-600 to-teal-600",
  "from-emerald-600 via-green-600 to-teal-600",
  "from-orange-500 via-amber-500 to-yellow-500",
  "from-pink-600 via-rose-600 to-red-600",
  "from-indigo-600 via-blue-600 to-cyan-600",
  "from-fuchsia-600 via-pink-600 to-rose-600",
  "from-teal-600 via-emerald-600 to-green-600",
  "from-amber-500 via-orange-500 to-red-500",
  "from-cyan-600 via-blue-600 to-indigo-600",
  "from-rose-600 via-pink-600 to-fuchsia-600",
  "from-green-600 via-emerald-600 to-teal-600",
  "from-purple-600 via-violet-600 to-indigo-600",
  "from-red-500 via-orange-500 to-amber-500",
  "from-blue-600 via-indigo-600 to-violet-600",
]

export function VocationalTest({ onComplete, userId, userEmail }: VocationalTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [progress, setProgress] = useState(0)
  const [saving, setSaving] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true)
      setError(null)

      const result = await loadQuestionsFromDB()

      if (result.success && result.data) {
        const limitedQuestions = result.data.slice(0, 15)
        setQuestions(limitedQuestions)
      } else {
        setError(result.error || "Error al cargar las preguntas")
        console.error("Error cargando preguntas:", result.error)
      }

      setLoading(false)
    }

    fetchQuestions()
  }, [])

  const handleAnswer = (category: string, value: number, index: number) => {
    setSelectedAnswer(index)
    
    setTimeout(() => {
      const newScores = { ...scores, [category]: (scores[category] || 0) + value }
      setScores(newScores)

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setProgress(((currentQuestion + 1) / questions.length) * 100)
        setSelectedAnswer(null)
      } else {
        calculateResults(newScores)
      }
    }, 400)
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setProgress((currentQuestion / questions.length) * 100)
      setSelectedAnswer(null)
    }
  }

  const calculateResults = async (finalScores: Record<string, number>) => {
    setSaving(true)

    const careerScores = CAREERS_DATABASE.map((career) => {
      let score = 0
      career.categories.forEach((cat) => {
        const categoryScore = finalScores[cat] || 0
        const weight = CATEGORY_WEIGHTS[cat] || 1.0
        score += categoryScore * weight
      })
      return { ...career, score }
    })

    const topCareers = careerScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((c) => ({
        name: c.name,
        type: c.type,
        score: c.score,
      }))

    const maxScore = Math.max(...topCareers.map((c) => c.score))
    const normalizedTopCareers = topCareers.map((c) => ({
      name: c.name,
      type: c.type,
      score: maxScore > 0 ? Math.round((c.score / maxScore) * 100) : 0,
    }))

    const saveResult = await saveTestResult(userId, userEmail, finalScores, normalizedTopCareers)

    if (!saveResult.success) {
      console.error("Error al guardar resultados:", saveResult.error)
      alert("Advertencia: Los resultados no se pudieron guardar en la base de datos. Pero puedes continuar.")
    }

    setSaving(false)

    const result = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      scores: finalScores,
      topCareers: normalizedTopCareers,
    }

    onComplete(result)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <Card className="shadow-2xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-8">
            <div className="flex flex-col items-center gap-6 text-white">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Preparando tu Test Vocacional</h3>
                <p className="text-white/80">Cargando preguntas personalizadas...</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (error || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4">
        <Card className="shadow-xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-center text-white">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold mb-2">Error al cargar el test</h3>
            <p className="text-white/80 mb-6">
              {error || "No se encontraron preguntas en la base de datos."}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-white text-red-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-full"
            >
              🔄 Reintentar
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const currentImage = QUESTION_IMAGES[currentQuestion % QUESTION_IMAGES.length]
  const currentGradient = GRADIENT_COLORS[currentQuestion % GRADIENT_COLORS.length]

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Barra de progreso mejorada */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full">
              {currentQuestion + 1}/{questions.length}
            </span>
            <span className="text-gray-600 font-medium">Pregunta</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium">{Math.round(progress)}%</span>
            <span className="text-2xl">{progress < 50 ? "🚀" : progress < 80 ? "⭐" : "🎯"}</span>
          </div>
        </div>
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${currentGradient} transition-all duration-500 ease-out rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card className="shadow-2xl border-0 overflow-hidden transform transition-all duration-300">
        {/* Header con imagen y pregunta */}
        <div className={`bg-gradient-to-r ${currentGradient} p-0`}>
          <div className="flex flex-col md:flex-row">
            {/* Imagen */}
            <div className="md:w-2/5 relative h-48 md:h-auto overflow-hidden">
              <img
                src={currentImage}
                alt="Contexto de la pregunta"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 md:hidden">
                <span className="bg-white/90 backdrop-blur text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                  Pregunta {currentQuestion + 1}
                </span>
              </div>
            </div>

            {/* Pregunta */}
            <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
              <div className="hidden md:block mb-3">
                <span className="bg-white/20 backdrop-blur text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                  ✨ Test Vocacional
                </span>
              </div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">
                {question.question}
              </h2>
            </div>
          </div>
        </div>

        {/* Opciones de respuesta */}
        <CardContent className="p-6 md:p-8 bg-gradient-to-b from-gray-50 to-white">
          <p className="text-gray-500 text-sm mb-4 font-medium">Selecciona la opción que más te identifique:</p>
          
          <div className="space-y-3">
            {question.answers.map((answer, index) => {
              const isSelected = selectedAnswer === index
              const optionColors = [
                { bg: "hover:bg-violet-50", border: "hover:border-violet-400", selected: "bg-violet-600 border-violet-600" },
                { bg: "hover:bg-blue-50", border: "hover:border-blue-400", selected: "bg-blue-600 border-blue-600" },
                { bg: "hover:bg-emerald-50", border: "hover:border-emerald-400", selected: "bg-emerald-600 border-emerald-600" },
                { bg: "hover:bg-amber-50", border: "hover:border-amber-400", selected: "bg-amber-600 border-amber-600" },
                { bg: "hover:bg-rose-50", border: "hover:border-rose-400", selected: "bg-rose-600 border-rose-600" },
              ]
              const color = optionColors[index % optionColors.length]

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(answer.category, answer.value, index)}
                  disabled={saving || selectedAnswer !== null}
                  className={`
                    w-full p-4 md:p-5 text-left rounded-xl transition-all duration-300
                    border-2 font-medium group
                    ${isSelected 
                      ? `${color.selected} text-white shadow-lg transform scale-[1.02]` 
                      : `bg-white ${color.bg} text-gray-700 border-gray-200 ${color.border} hover:shadow-md`
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all
                        ${isSelected 
                          ? "bg-white/25 text-white" 
                          : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                        }
                      `}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1 text-left text-sm md:text-base">{answer.text}</span>
                    {isSelected && (
                      <div className="flex items-center gap-2">
                        <span className="text-xl animate-bounce">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Navegación */}
          <div className="flex gap-4 mt-8">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0 || saving || selectedAnswer !== null}
              variant="outline"
              className="flex-1 py-6 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 font-semibold text-gray-600 rounded-xl"
            >
              ← Anterior
            </Button>
            
            {saving ? (
              <div className={`flex-1 flex items-center justify-center gap-3 bg-gradient-to-r ${currentGradient} text-white rounded-xl py-6`}>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                <span className="font-semibold">Calculando resultados...</span>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center py-6 bg-gray-100 text-gray-400 rounded-xl font-medium">
                Selecciona una opción →
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Indicadores de progreso por categoría */}
      <div className="mt-6 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
        <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Tu perfil vocacional</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(scores).map(([category, score]) => (
            <span 
              key={category} 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full text-xs font-medium text-gray-700 border border-gray-200"
            >
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"></span>
              {category}: {score}
            </span>
          ))}
          {Object.keys(scores).length === 0 && (
            <span className="text-xs text-gray-400 italic">Responde preguntas para ver tu perfil</span>
          )}
        </div>
      </div>
    </div>
  )
}
