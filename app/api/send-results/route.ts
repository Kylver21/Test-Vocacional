import { Resend } from "resend"
import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

// Inicializar Resend solo si hay API key
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function POST(request: NextRequest) {
  try {
    const { email, name, topCareers, scores, userId } = await request.json()

    // Validaciones mejoradas
    if (!email || !email.includes("@") || email.length < 5) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }

    if (!topCareers || !Array.isArray(topCareers) || topCareers.length === 0) {
      return NextResponse.json({ error: "No hay carreras para enviar" }, { status: 400 })
    }

    if (!scores || typeof scores !== "object") {
      return NextResponse.json({ error: "Datos de puntuación inválidos" }, { status: 400 })
    }

    // Guardar en Supabase (opcional - no bloquea el envío del email)
    try {
      const supabase = await createServerSupabaseClient()
      await supabase.from("test_results").insert({
        user_id: userId || null,
        user_email: email,
        scores,
        top_careers: topCareers,
      })
      console.log("[API] Resultados guardados en Supabase")
    } catch (dbError) {
      console.error("[API] Error guardando en Supabase:", dbError)
      // No retornamos error, continuamos con el envío del email
    }

    // Verificar si Resend está configurado
    if (!resend) {
      console.warn("[API] RESEND_API_KEY no configurada. Email no enviado.")
      return NextResponse.json({ 
        success: true, 
        message: "Resultados guardados. Configura RESEND_API_KEY para habilitar el envío de emails.",
        emailSent: false
      }, { status: 200 })
    }

    // Genera HTML del email con los resultados mejorado
    const careersHtml = topCareers
      .map(
        (career: any, index: number) => {
          const bgColor = index === 0 ? '#dcfce7' : index === 1 ? '#fef9c3' : '#f5f5f5'
          const borderColor = index === 0 ? '#22c55e' : index === 1 ? '#eab308' : '#3b82f6'
          const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📌'
          
          return `
          <div style="margin: 15px 0; padding: 16px; background-color: ${bgColor}; border-left: 5px solid ${borderColor}; border-radius: 8px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px;">
              ${emoji} ${index + 1}. ${career.name}
            </h3>
            <p style="margin: 4px 0; color: #4b5563; font-size: 14px;">
              <strong>Tipo:</strong> ${career.type}
            </p>
            <p style="margin: 4px 0; color: #059669; font-size: 16px; font-weight: bold;">
              Compatibilidad: ${career.score}%
            </p>
          </div>
        `
        }
      )
      .join("")

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Resultados de tu Test Vocacional</title>
        </head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6); color: white; padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎯 Test Vocacional</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">¡Tus resultados están listos!</p>
            </div>

            <!-- Content -->
            <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <p style="font-size: 16px;">Hola <strong>${name || 'Estudiante'}</strong>,</p>

              <p style="font-size: 15px; color: #4b5563;">
                Basado en tus respuestas, hemos analizado tu perfil vocacional. Estas son las <strong>carreras que mejor se alinean</strong> con tus intereses y habilidades:
              </p>

              <!-- Carreras -->
              <div style="margin: 30px 0;">
                ${careersHtml}
              </div>

              <!-- CTA -->
              <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 14px; color: #6b7280; margin-bottom: 15px;">
                  ¿Quieres explorar más opciones?
                </p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" 
                   style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px;">
                  Realizar otro Test
                </a>
              </div>

              <!-- Tips -->
              <div style="background-color: #f0fdf4; border: 2px solid #86efac; padding: 20px; border-radius: 12px; margin: 25px 0;">
                <h3 style="margin: 0 0 12px 0; color: #15803d; font-size: 16px;">💡 Próximos pasos recomendados:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #166534; font-size: 14px;">
                  <li style="margin: 8px 0;">Investiga cada carrera en universidades de tu zona</li>
                  <li style="margin: 8px 0;">Habla con profesionales que trabajan en estos campos</li>
                  <li style="margin: 8px 0;">Considera tus fortalezas personales y oportunidades del mercado</li>
                  <li style="margin: 8px 0;">Realiza el test nuevamente en el futuro para ver cómo evolucionan tus intereses</li>
                </ul>
              </div>

              <!-- Footer -->
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                  Este email fue generado automáticamente por Test Vocacional.
                </p>
                <p style="font-size: 12px; color: #9ca3af; margin: 5px 0 0 0;">
                  Fecha: ${new Date().toLocaleDateString("es-PE", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Envía el email con Resend
    try {
      // Email verificado del administrador (para plan gratuito de Resend)
      const adminEmail = "kilverpaucar1@gmail.com"
      
      // Determinar destinatario: si es el admin, enviar directo; si no, enviar copia al admin
      const isAdminEmail = email.toLowerCase() === adminEmail.toLowerCase()
      
      const result = await resend.emails.send({
        from: "Test Vocacional <onboarding@resend.dev>",
        to: isAdminEmail ? email : adminEmail,
        subject: isAdminEmail 
          ? "🎯 Resultados de tu Test Vocacional - Descubre tu Carrera Ideal"
          : `🎯 [COPIA] Resultados del Test Vocacional de ${email}`,
        html: emailHtml,
      })

      if (result.error) {
        console.error("[API] Error de Resend:", result.error)
        return NextResponse.json({ 
          success: false, 
          error: `Error al enviar email: ${result.error.message}` 
        }, { status: 500 })
      }

      console.log("[API] Email enviado exitosamente:", result.data?.id)
      
      // Mensaje personalizado según el destinatario
      const successMessage = isAdminEmail
        ? "Email enviado correctamente"
        : "Resultados guardados. Se envió una copia al administrador."
      
      return NextResponse.json({ 
        success: true, 
        messageId: result.data?.id,
        emailSent: true,
        message: successMessage
      }, { status: 200 })

    } catch (emailError: any) {
      console.error("[API] Error enviando email:", emailError)
      return NextResponse.json({ 
        success: false, 
        error: `Error de conexión con servicio de email: ${emailError.message}` 
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error("[API] Error general en send-results:", error)
    return NextResponse.json({ 
      success: false, 
      error: `Error interno: ${error.message}` 
    }, { status: 500 })
  }
}
