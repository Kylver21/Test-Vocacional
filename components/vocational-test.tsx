"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { VOCATIONAL_QUESTIONS, CAREERS_DATABASE, CATEGORY_WEIGHTS } from "@/lib/vocational-data"

interface VocationalTestProps {
  onComplete: (results: any) => void
  userId: string
}

export function VocationalTest({ onComplete, userId }: VocationalTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [progress, setProgress] = useState(0)

  const handleAnswer = (category: string, value: number) => {
    const newScores = { ...scores, [category]: (scores[category] || 0) + value }
    setScores(newScores)

    if (currentQuestion < VOCATIONAL_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setProgress(((currentQuestion + 1) / VOCATIONAL_QUESTIONS.length) * 100)
    } else {
      calculateResults(newScores)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setProgress((currentQuestion / VOCATIONAL_QUESTIONS.length) * 100)
    }
  }

  const calculateResults = (finalScores: Record<string, number>) => {
    const careerScores = CAREERS_DATABASE.map((career) => {
      let score = 0
      career.categories.forEach((cat) => {
        const categoryScore = finalScores[cat] || 0
        const weight = CATEGORY_WEIGHTS[cat] || 1.0
        score += categoryScore * weight
      })
      return { ...career, score }
    })

    // Ordena por puntuación y toma los top 5
    const topCareers = careerScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((c) => ({
        name: c.name,
        type: c.type,
        score: c.score,
      }))

    // Normaliza los porcentajes para que sumen 100%
    const maxScore = Math.max(...topCareers.map((c) => c.score))
    const normalizedTopCareers = topCareers.map((c) => ({
      name: c.name,
      type: c.type,
      score: maxScore > 0 ? Math.round((c.score / maxScore) * 100) : 0,
    }))

    const result = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      scores: finalScores,
      topCareers: normalizedTopCareers,
    }

    onComplete(result)
  }

  const question = VOCATIONAL_QUESTIONS[currentQuestion]

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle>Test Vocacional</CardTitle>
          <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
            <div className="bg-white h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm text-blue-100 mt-2">
            Pregunta {currentQuestion + 1} de {VOCATIONAL_QUESTIONS.length}
          </p>
        </CardHeader>
        <CardContent className="pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{question.question}</h2>
          <div className="space-y-3">
            {question.answers.map((answer, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(answer.category, answer.value)}
                className="w-full p-4 text-left bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 rounded-lg transition-all duration-200 font-medium text-gray-700 hover:text-blue-700"
              >
                {answer.text}
              </button>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outline"
              className="flex-1 bg-transparent"
            >
              ← Anterior
            </Button>
            <Button disabled className="flex-1 bg-gray-300 text-gray-600 cursor-not-allowed">
              Siguiente →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
