"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { VOCATIONAL_QUESTIONS, CAREERS_DATABASE } from "@/lib/vocational-data"

interface AdminPanelProps {
  onLogout: () => void
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"questions" | "careers">("questions")
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null)
  const [editingCareerIdx, setEditingCareerIdx] = useState<number | null>(null)

  // Questions state
  const [questions, setQuestions] = useState(VOCATIONAL_QUESTIONS)
  const [newQuestionText, setNewQuestionText] = useState("")
  const [newAnswers, setNewAnswers] = useState([
    { text: "", category: "technical", value: 3 },
    { text: "", category: "creative", value: 3 },
    { text: "", category: "analytical", value: 3 },
    { text: "", category: "social", value: 3 },
  ])

  // Edit question state
  const [editQuestionText, setEditQuestionText] = useState("")
  const [editAnswers, setEditAnswers] = useState([{ text: "", category: "technical", value: 3 }])

  // Careers state
  const [careers, setCareers] = useState(CAREERS_DATABASE)
  const [newCareerName, setNewCareerName] = useState("")
  const [newCareerType, setNewCareerType] = useState("Universitaria")
  const [newCareerDescription, setNewCareerDescription] = useState("")
  const [newCareerSalary, setNewCareerSalary] = useState("")
  const [newCareerImage, setNewCareerImage] = useState("")
  const [newCareerUniversities, setNewCareerUniversities] = useState("")
  const [newCareerYoutube, setNewCareerYoutube] = useState("")

  // Edit career state
  const [editCareerName, setEditCareerName] = useState("")
  const [editCareerType, setEditCareerType] = useState("")
  const [editCareerDescription, setEditCareerDescription] = useState("")
  const [editCareerSalary, setEditCareerSalary] = useState("")
  const [editCareerImage, setEditCareerImage] = useState("")
  const [editCareerUniversities, setEditCareerUniversities] = useState("")
  const [editCareerYoutube, setEditCareerYoutube] = useState("")

  const handleAddQuestion = () => {
    if (newQuestionText && newAnswers.every((a) => a.text)) {
      const newQuestion = {
        question: newQuestionText,
        answers: newAnswers,
      }
      setQuestions([...questions, newQuestion])
      setNewQuestionText("")
      setNewAnswers([
        { text: "", category: "technical", value: 3 },
        { text: "", category: "creative", value: 3 },
        { text: "", category: "analytical", value: 3 },
        { text: "", category: "social", value: 3 },
      ])
      alert("Pregunta agregada exitosamente")
    }
  }

  const handleEditQuestion = (idx: number) => {
    const question = questions[idx]
    setEditQuestionText(question.question)
    setEditAnswers(question.answers)
    setEditingQuestionId(idx)
  }

  const handleSaveEditQuestion = () => {
    if (editingQuestionId !== null && editQuestionText && editAnswers.every((a) => a.text)) {
      const updated = [...questions]
      updated[editingQuestionId] = {
        question: editQuestionText,
        answers: editAnswers,
      }
      setQuestions(updated)
      setEditingQuestionId(null)
      setEditQuestionText("")
      setEditAnswers([{ text: "", category: "technical", value: 3 }])
      alert("Pregunta editada exitosamente")
    }
  }

  const handleDeleteQuestion = (idx: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta pregunta?")) {
      setQuestions(questions.filter((_, i) => i !== idx))
      alert("Pregunta eliminada exitosamente")
    }
  }

  const handleAddCareer = () => {
    if (newCareerName && newCareerDescription && newCareerSalary) {
      const newCareer = {
        name: newCareerName,
        type: newCareerType,
        description: newCareerDescription,
        salary: newCareerSalary,
        image: newCareerImage || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
        universities: newCareerUniversities ? newCareerUniversities.split(",").map((u) => u.trim()) : ["Universidad"],
        youtubeLink: newCareerYoutube,
        categories: [],
        skills: [],
      }
      setCareers([...careers, newCareer])
      setNewCareerName("")
      setNewCareerDescription("")
      setNewCareerSalary("")
      setNewCareerImage("")
      setNewCareerUniversities("")
      setNewCareerYoutube("")
      alert("Carrera agregada exitosamente")
    }
  }

  const handleEditCareer = (idx: number) => {
    const career = careers[idx]
    setEditCareerName(career.name)
    setEditCareerType(career.type)
    setEditCareerDescription(career.description)
    setEditCareerSalary(career.salary)
    setEditCareerImage(career.image || "")
    setEditCareerUniversities(career.universities?.join(", ") || "")
    setEditCareerYoutube(career.youtubeLink || "")
    setEditingCareerIdx(idx)
  }

  const handleSaveEditCareer = () => {
    if (editingCareerIdx !== null && editCareerName && editCareerDescription && editCareerSalary) {
      const updated = [...careers]
      updated[editingCareerIdx] = {
        ...updated[editingCareerIdx],
        name: editCareerName,
        type: editCareerType,
        description: editCareerDescription,
        salary: editCareerSalary,
        image: editCareerImage || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
        universities: editCareerUniversities ? editCareerUniversities.split(",").map((u) => u.trim()) : ["Universidad"],
        youtubeLink: editCareerYoutube,
      }
      setCareers(updated)
      setEditingCareerIdx(null)
      alert("Carrera editada exitosamente")
    }
  }

  const handleDeleteCareer = (idx: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta carrera?")) {
      setCareers(careers.filter((_, i) => i !== idx))
      alert("Carrera eliminada exitosamente")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administrador</h1>
            <p className="text-gray-600 mt-2">Gestiona preguntas y carreras del test vocacional</p>
          </div>
          <Button onClick={onLogout} variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100">
            Cerrar Sesión Admin
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab("questions")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "questions"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-600"
            }`}
          >
            Gestionar Preguntas
          </Button>
          <Button
            onClick={() => setActiveTab("careers")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "careers"
                ? "bg-green-600 text-white shadow-lg"
                : "bg-white text-gray-700 border-2 border-gray-200 hover:border-green-600"
            }`}
          >
            Gestionar Carreras
          </Button>
        </div>

        {activeTab === "questions" && (
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle>{editingQuestionId !== null ? "Editar Pregunta" : "Agregar Nueva Pregunta"}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Texto de la Pregunta</label>
                  <Textarea
                    value={editingQuestionId !== null ? editQuestionText : newQuestionText}
                    onChange={(e) =>
                      editingQuestionId !== null
                        ? setEditQuestionText(e.target.value)
                        : setNewQuestionText(e.target.value)
                    }
                    placeholder="Ingresa el texto de la pregunta"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Opciones de Respuesta</label>
                  <div className="space-y-3">
                    {(editingQuestionId !== null ? editAnswers : newAnswers).map((answer, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={answer.text}
                          onChange={(e) => {
                            if (editingQuestionId !== null) {
                              const updated = [...editAnswers]
                              updated[idx].text = e.target.value
                              setEditAnswers(updated)
                            } else {
                              const updated = [...newAnswers]
                              updated[idx].text = e.target.value
                              setNewAnswers(updated)
                            }
                          }}
                          placeholder={`Opción ${idx + 1}`}
                          className="flex-1"
                        />
                        <select
                          value={answer.category}
                          onChange={(e) => {
                            if (editingQuestionId !== null) {
                              const updated = [...editAnswers]
                              updated[idx].category = e.target.value
                              setEditAnswers(updated)
                            } else {
                              const updated = [...newAnswers]
                              updated[idx].category = e.target.value
                              setNewAnswers(updated)
                            }
                          }}
                          className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                        >
                          <option value="technical">Técnica</option>
                          <option value="creative">Creativa</option>
                          <option value="analytical">Analítica</option>
                          <option value="social">Social</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={editingQuestionId !== null ? handleSaveEditQuestion : handleAddQuestion}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2"
                  >
                    {editingQuestionId !== null ? "Guardar Cambios" : "Agregar Pregunta"}
                  </Button>
                  {editingQuestionId !== null && (
                    <Button onClick={() => setEditingQuestionId(null)} variant="outline" className="flex-1">
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle>Preguntas Actuales ({questions.length})</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={idx} className="border-2 border-gray-200 p-4 rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-gray-900 flex-1">
                          {idx + 1}. {q.question}
                        </h4>
                        <div className="flex gap-2">
                          <Button onClick={() => handleEditQuestion(idx)} variant="outline" className="text-sm">
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleDeleteQuestion(idx)}
                            variant="outline"
                            className="text-sm bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-700">
                        {q.answers.map((ans, ansIdx) => (
                          <p key={ansIdx}>
                            <span className="font-medium">{String.fromCharCode(97 + ansIdx)})</span> {ans.text}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "careers" && (
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                <CardTitle>{editingCareerIdx !== null ? "Editar Carrera" : "Agregar Nueva Carrera"}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Nombre de la Carrera</label>
                    <Input
                      value={editingCareerIdx !== null ? editCareerName : newCareerName}
                      onChange={(e) =>
                        editingCareerIdx !== null ? setEditCareerName(e.target.value) : setNewCareerName(e.target.value)
                      }
                      placeholder="Ej: Ingeniería en Software"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Tipo</label>
                    <select
                      value={editingCareerIdx !== null ? editCareerType : newCareerType}
                      onChange={(e) =>
                        editingCareerIdx !== null ? setEditCareerType(e.target.value) : setNewCareerType(e.target.value)
                      }
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg"
                    >
                      <option value="Universitaria">Universitaria</option>
                      <option value="Técnica">Técnica</option>
                      <option value="Profesional">Profesional</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Descripción</label>
                  <Textarea
                    value={editingCareerIdx !== null ? editCareerDescription : newCareerDescription}
                    onChange={(e) =>
                      editingCareerIdx !== null
                        ? setEditCareerDescription(e.target.value)
                        : setNewCareerDescription(e.target.value)
                    }
                    placeholder="Describe en qué consiste esta carrera"
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Salario Promedio</label>
                    <Input
                      value={editingCareerIdx !== null ? editCareerSalary : newCareerSalary}
                      onChange={(e) =>
                        editingCareerIdx !== null
                          ? setEditCareerSalary(e.target.value)
                          : setNewCareerSalary(e.target.value)
                      }
                      placeholder="Ej: $3,000 - $6,000 USD/mes"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">URL Imagen</label>
                    <Input
                      value={editingCareerIdx !== null ? editCareerImage : newCareerImage}
                      onChange={(e) =>
                        editingCareerIdx !== null
                          ? setEditCareerImage(e.target.value)
                          : setNewCareerImage(e.target.value)
                      }
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Universidades (separadas por coma)
                  </label>
                  <Textarea
                    value={editingCareerIdx !== null ? editCareerUniversities : newCareerUniversities}
                    onChange={(e) =>
                      editingCareerIdx !== null
                        ? setEditCareerUniversities(e.target.value)
                        : setNewCareerUniversities(e.target.value)
                    }
                    placeholder="Ej: Universidad Nacional, Instituto Tecnológico, Universidad Privada"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    ID de Video YouTube (ej: dQw4w9WgXcQ)
                  </label>
                  <Input
                    value={editingCareerIdx !== null ? editCareerYoutube : newCareerYoutube}
                    onChange={(e) =>
                      editingCareerIdx !== null
                        ? setEditCareerYoutube(e.target.value)
                        : setNewCareerYoutube(e.target.value)
                    }
                    placeholder="Pega el ID del video de YouTube"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Encuentra el ID en la URL de YouTube: youtube.com/watch?v=<strong>AQUI_VA_EL_ID</strong>
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={editingCareerIdx !== null ? handleSaveEditCareer : handleAddCareer}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2"
                  >
                    {editingCareerIdx !== null ? "Guardar Cambios" : "Agregar Carrera"}
                  </Button>
                  {editingCareerIdx !== null && (
                    <Button onClick={() => setEditingCareerIdx(null)} variant="outline" className="flex-1">
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
                <CardTitle>Carreras Actuales ({careers.length})</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {careers.map((career, idx) => (
                    <div key={idx} className="border-2 border-gray-200 p-4 rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{career.name}</h4>
                          <span className="inline-block mt-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            {career.type}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button onClick={() => handleEditCareer(idx)} variant="outline" className="text-sm">
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleDeleteCareer(idx)}
                            variant="outline"
                            className="text-sm bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                      {career.image && (
                        <img
                          src={career.image || "/placeholder.svg"}
                          alt={career.name}
                          className="w-full h-40 object-cover rounded mb-2"
                        />
                      )}
                      <p className="text-sm text-gray-700 mb-2">{career.description}</p>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Salario:</span> {career.salary}
                      </p>
                      {career.universities && career.universities.length > 0 && (
                        <div className="text-sm bg-blue-50 p-2 rounded">
                          <span className="font-medium text-blue-900">Universidades:</span>
                          <ul className="text-blue-800 ml-4 mt-1">
                            {career.universities.map((uni, uIdx) => (
                              <li key={uIdx} className="list-disc">
                                {uni}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {career.youtubeLink && (
                        <div className="text-sm bg-yellow-50 p-2 rounded mt-2">
                          <span className="font-medium text-yellow-900">Video YouTube:</span>
                          <a
                            href={`https://www.youtube.com/watch?v=${career.youtubeLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline ml-2"
                          >
                            Ver Video
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
