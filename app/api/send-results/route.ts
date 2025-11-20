import { Resend } from "resend"
import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, name, topCareers, scores, userId } = await request.json()

    if (!email || !topCareers || !scores) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    try {
      await supabase.from("test_results").insert({
        user_id: userId,
        user_email: email,
        scores,
        top_careers: topCareers,
      })
    } catch (dbError) {
      console.error("[v0] Error saving to Supabase:", dbError)
    }

    // Calcula el total de puntos para normalización
    const totalScore = Object.values(scores as Record<string, number>).reduce((a: number, b: number) => a + b, 0)

    // Genera HTML del email con los resultados
    const careersHtml = topCareers
      .map(
        (career: any, index: number) => `
        <div style="margin: 15px 0; padding: 12px; background-color: #f5f5f5; border-left: 4px solid #3b82f6; border-radius: 4px;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">
            ${index + 1}. ${career.name} (${career.type})
          </h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Compatibilidad: <strong>${career.score}%</strong>
          </p>
        </div>
      `,
      )
      .join("")

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Resultados de tu Test Vocacional</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(to right, #2563eb, #4f46e5); color: white; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px;">Resultados de tu Test Vocacional</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Descubre tu carrera ideal</p>
            </div>

            <p>Hola <strong>${name}</strong>,</p>

            <p>Te enviamos los resultados de tu test vocacional. Basado en tus respuestas, estas son las carreras que mejor se alinean con tu perfil:</p>

            <div style="margin: 30px 0;">
              ${careersHtml}
            </div>

            <div style="background-color: #f0fdf4; border: 1px solid #86efac; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #15803d;">Próximos pasos:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #166534;">
                <li>Investiga cada carrera con mayor detalle</li>
                <li>Habla con profesionales en estos campos</li>
                <li>Considera tus intereses y habilidades personales</li>
                <li>Realiza el test nuevamente en el futuro para comparar</li>
              </ul>
            </div>

            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #999;">
              Este email fue generado automáticamente. No respondas este correo.
              <br>
              Fecha: ${new Date().toLocaleDateString("es-PE")}
            </p>
          </div>
        </body>
      </html>
    `

    // Envía el email con Resend
    const result = await resend.emails.send({
      from: "test-vocacional@resend.dev",
      to: email,
      subject: "Resultados de tu Test Vocacional - Descubre tu Carrera Ideal",
      html: emailHtml,
    })

    if (result.error) {
      console.error("[v0] Error enviando email:", result.error)
      return NextResponse.json({ error: "Error al enviar el correo" }, { status: 500 })
    }

    return NextResponse.json({ success: true, messageId: result.data?.id }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error en API send-results:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
