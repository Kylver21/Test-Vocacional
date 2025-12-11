import { createClient } from "./supabase"

export interface Question {
  id: string
  question_text: string
  answer_type: string
  answers: Answer[]
}

export interface Answer {
  id: string
  question_id: string
  answer_text: string
  category: string
  value: number
}

export interface Career {
  id: string
  name: string
  type: string
  description: string
  image_url: string | null
  youtube_link: string | null
  salary_min: number | null
  salary_max: number | null
  categories: string[]
  universities: string[]
  skills: string[]
}

export interface TestResult {
  id: string
  user_id: string
  user_email: string
  scores: Record<string, number>
  top_careers: Array<{ name: string; type: string; score: number }>
  created_at: string
}

function dedupeAnswers(answers: Array<{ text: string; category: string; value: number }>) {
  const seen = new Set<string>()
  const result: Array<{ text: string; category: string; value: number }> = []

  for (const answer of answers) {
    const text = (answer?.text || "").trim()
    if (!text) continue
    const category = (answer?.category || "").trim()
    const value = Number.isFinite(answer?.value) ? Number(answer.value) : 0
    const key = `${text}::${category}::${value}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push({ text, category, value })
  }

  return result
}

// Cargar todas las preguntas con sus respuestas
export async function loadQuestionsFromDB(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  const supabase = createClient()

  const { data: questions, error } = await supabase
    .from("questions")
    .select(
      `
      id,
      question_text,
      answer_type,
      question_answers (
        id,
        question_id,
        answer_text,
        category,
        value
      )
    `,
    )
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error loading questions:", error)
    return { success: false, error: error.message }
  }

  const formattedQuestions =
    questions?.map((q: any) => ({
      question: q.question_text,
      answers: dedupeAnswers(
        (q.question_answers || []).map((a: any) => ({
          text: a.answer_text,
          category: a.category,
          value: a.value,
        })),
      ),
    })) || []

  return { success: true, data: formattedQuestions }
}

// Cargar todas las carreras
export async function loadCareersFromDB(): Promise<Career[]> {
  const supabase = createClient()

  const { data: careers, error } = await supabase
    .from("careers")
    .select(
      `
      id,
      name,
      type,
      description,
      image_url,
      youtube_link,
      salary_min,
      salary_max,
      career_categories (category),
      career_universities (university_name)
    `,
    )
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error loading careers:", error)
    return []
  }

  return (
    careers?.map((c: any) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      description: c.description,
      image_url: c.image_url,
      youtube_link: c.youtube_link,
      salary_min: c.salary_min,
      salary_max: c.salary_max,
      categories: c.career_categories?.map((cc: any) => cc.category) || [],
      universities: c.career_universities?.map((cu: any) => cu.university_name) || [],
      skills: [], // Los skills no están en la DB actualmente
    })) || []
  )
}

// Guardar resultado de test
export async function saveTestResult(
  userId: string,
  userEmail: string,
  scores: Record<string, number>,
  topCareers: Array<{ name: string; type: string; score: number }>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  console.log("saveTestResult llamado con:", { userId, userEmail, scoresCount: Object.keys(scores).length, careersCount: topCareers.length })

  // Validar que tenemos los datos necesarios
  if (!userId || !userEmail) {
    const errorMsg = `Error: userId (${userId}) y userEmail (${userEmail}) son requeridos`
    console.error(errorMsg)
    return { success: false, error: "Usuario no autenticado" }
  }

  const dataToInsert = {
    user_id: userId,
    user_email: userEmail,
    scores: scores,
    top_careers: topCareers,
  }

  console.log("Intentando insertar en Supabase:", dataToInsert)

  const { data, error } = await supabase.from("test_results").insert(dataToInsert).select()

  if (error) {
    console.error("Error detallado de Supabase:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    return { success: false, error: error.message }
  }

  console.log("Resultado guardado exitosamente:", data)
  return { success: true }
}

// Obtener historial de tests de un usuario
export async function getUserTestHistory(userId: string): Promise<TestResult[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("test_results")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error loading test history:", error)
    return []
  }

  return data || []
}

// Obtener estadísticas para admin
export async function getAdminStats() {
  const supabase = createClient()

  // Total de tests completados
  const { count: testsCount } = await supabase.from("test_results").select("*", { count: "exact", head: true })

  // Total de usuarios únicos
  const { data: uniqueUsers } = await supabase.from("test_results").select("user_email")

  const uniqueUserCount = new Set(uniqueUsers?.map((u) => u.user_email)).size

  // Tests por día (últimos 7 días)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: recentTests } = await supabase
    .from("test_results")
    .select("created_at")
    .gte("created_at", sevenDaysAgo.toISOString())

  // Carreras más recomendadas
  const { data: allResults } = await supabase.from("test_results").select("top_careers")

  const careerCounts: Record<string, number> = {}
  allResults?.forEach((result) => {
    const topCareers = result.top_careers as Array<{ name: string; type: string; score: number }>
    topCareers?.forEach((career) => {
      careerCounts[career.name] = (careerCounts[career.name] || 0) + 1
    })
  })

  const topRecommendedCareers = Object.entries(careerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }))

  return {
    totalTests: testsCount || 0,
    uniqueUsers: uniqueUserCount,
    recentTestsCount: recentTests?.length || 0,
    topRecommendedCareers,
  }
}

// CRUD de Preguntas
export async function createQuestion(questionText: string, answers: Omit<Answer, "id" | "question_id">[]) {
  const supabase = createClient()

  // Insertar pregunta
  const { data: question, error: questionError } = await supabase
    .from("questions")
    .insert({ question_text: questionText, answer_type: "multiple_choice" })
    .select()
    .single()

  if (questionError) {
    return { success: false, error: questionError.message }
  }

  // Insertar respuestas
  const answersToInsert = answers.map((a) => ({
    question_id: question.id,
    answer_text: a.answer_text,
    category: a.category,
    value: a.value,
  }))

  const { error: answersError } = await supabase.from("question_answers").insert(answersToInsert)

  if (answersError) {
    return { success: false, error: answersError.message }
  }

  return { success: true, data: question }
}

export async function updateQuestion(
  questionId: string,
  questionText: string,
  answers: Array<{ id?: string; answer_text: string; category: string; value: number }>,
) {
  const supabase = createClient()

  // Actualizar pregunta
  const { error: questionError } = await supabase
    .from("questions")
    .update({ question_text: questionText })
    .eq("id", questionId)

  if (questionError) {
    return { success: false, error: questionError.message }
  }

  // Eliminar respuestas anteriores
  await supabase.from("question_answers").delete().eq("question_id", questionId)

  // Insertar nuevas respuestas
  const answersToInsert = answers.map((a) => ({
    question_id: questionId,
    answer_text: a.answer_text,
    category: a.category,
    value: a.value,
  }))

  const { error: answersError } = await supabase.from("question_answers").insert(answersToInsert)

  if (answersError) {
    return { success: false, error: answersError.message }
  }

  return { success: true }
}

export async function deleteQuestion(questionId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("questions").delete().eq("id", questionId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// CRUD de Carreras
export async function createCareer(career: Omit<Career, "id">) {
  const supabase = createClient()

  // Insertar carrera
  const { data: newCareer, error: careerError } = await supabase
    .from("careers")
    .insert({
      name: career.name,
      type: career.type,
      description: career.description,
      image_url: career.image_url,
      youtube_link: career.youtube_link,
      salary_min: career.salary_min,
      salary_max: career.salary_max,
    })
    .select()
    .single()

  if (careerError) {
    return { success: false, error: careerError.message }
  }

  // Insertar categorías
  if (career.categories.length > 0) {
    const categories = career.categories.map((cat) => ({
      career_id: newCareer.id,
      category: cat,
    }))
    await supabase.from("career_categories").insert(categories)
  }

  // Insertar universidades
  if (career.universities.length > 0) {
    const universities = career.universities.map((uni) => ({
      career_id: newCareer.id,
      university_name: uni,
    }))
    await supabase.from("career_universities").insert(universities)
  }

  return { success: true, data: newCareer }
}

export async function updateCareer(careerId: string, career: Partial<Career>) {
  const supabase = createClient()

  // Actualizar carrera
  const { error: careerError } = await supabase
    .from("careers")
    .update({
      name: career.name,
      type: career.type,
      description: career.description,
      image_url: career.image_url,
      youtube_link: career.youtube_link,
      salary_min: career.salary_min,
      salary_max: career.salary_max,
    })
    .eq("id", careerId)

  if (careerError) {
    return { success: false, error: careerError.message }
  }

  // Actualizar categorías
  if (career.categories) {
    await supabase.from("career_categories").delete().eq("career_id", careerId)
    if (career.categories.length > 0) {
      const categories = career.categories.map((cat) => ({
        career_id: careerId,
        category: cat,
      }))
      await supabase.from("career_categories").insert(categories)
    }
  }

  // Actualizar universidades
  if (career.universities) {
    await supabase.from("career_universities").delete().eq("career_id", careerId)
    if (career.universities.length > 0) {
      const universities = career.universities.map((uni) => ({
        career_id: careerId,
        university_name: uni,
      }))
      await supabase.from("career_universities").insert(universities)
    }
  }

  return { success: true }
}

export async function deleteCareer(careerId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("careers").delete().eq("id", careerId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
