import { Resend } from "resend"

// Inicializar Resend con la API key
const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailTestResultsParams {
  to: string
  name: string
  topCareers: Array<{ name: string; type: string; score: number }>
  scores: Record<string, number>
}

export async function sendTestResultsEmail({ to, name, topCareers, scores }: EmailTestResultsParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Test Vocacional <noreply@testvocacional.com>", // Cambia esto a tu dominio verificado
      to: [to],
      subject: "Tus Resultados del Test Vocacional",
      html: generateEmailHTML(name, topCareers, scores),
    })

    if (error) {
      console.error("Error sending email:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error sending email:", error)
    return { success: false, error: error.message }
  }
}

function generateEmailHTML(
  name: string,
  topCareers: Array<{ name: string; type: string; score: number }>,
  scores: Record<string, number>,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resultados Test Vocacional</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .career-item {
            background: white;
            padding: 20px;
            margin: 15px 0;
            border-left: 4px solid #667eea;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .career-name {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
          }
          .career-type {
            display: inline-block;
            background: #dbeafe;
            color: #1e40af;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            margin-bottom: 10px;
          }
          .career-score {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎓 Test Vocacional</h1>
          <p>Resultados de tu Evaluación</p>
        </div>
        
        <div class="content">
          <p>Hola <strong>${name}</strong>,</p>
          <p>¡Felicidades por completar el test vocacional! Aquí están tus resultados:</p>
          
          <h2 style="color: #1f2937; margin-top: 30px;">Tus Carreras Recomendadas</h2>
          
          ${topCareers
            .map(
              (career, index) => `
            <div class="career-item">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <div class="career-name">${index + 1}. ${career.name}</div>
                  <span class="career-type">${career.type}</span>
                </div>
                <div class="career-score">${career.score}%</div>
              </div>
            </div>
          `,
            )
            .join("")}
          
          <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 5px;">
            <h3 style="color: #92400e; margin-top: 0;">💡 Próximos Pasos</h3>
            <ul style="color: #78350f;">
              <li>Investiga más sobre estas carreras</li>
              <li>Habla con profesionales del área</li>
              <li>Visita universidades e institutos</li>
              <li>Considera tus intereses personales</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" class="button">
              Volver a realizar el Test
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Este es un email automático del sistema de Test Vocacional</p>
          <p style="font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()} Test Vocacional. Todos los derechos reservados.
          </p>
        </div>
      </body>
    </html>
  `
}
