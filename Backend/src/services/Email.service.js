import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Remitente: usar correo de dominio verificado en Resend (ej. noreply@cledsoluciones.com)
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@cledsoluciones.com';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Cled Soluciones';

/**
 * Envía un correo de notificación de cierre de caso con las evidencias adjuntas
 * @param {Object} options
 * @param {string} options.to - Correo destinatario
 * @param {Object} options.caseData - Datos del caso (aviso, texto_breve, estado, etc.)
 * @param {Array<{ filename: string, content: Buffer }>} options.attachments - Archivos a adjuntar
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
export async function sendCierreNotification({ to, caseData, attachments = [] }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY no está configurada');
  }

  const aviso = caseData.aviso || caseData.id || 'N/A';
  const subject = `Notificación de cierre - Caso #${aviso}`;

  const html = `
    <p><strong>Cordial saludo,</strong></p>
    <p>Adjunto a este correo el acta correspondiente a la actividad finalizada para su revisión y archivo.</p>
    <p>Quedo atenta a cualquier comentario.</p>
    <p>Cordialmente,</p>
    <p><strong>Lina Marcela Muñoz<br/>
    Gerente Comercial</strong></p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
      attachments:
        attachments.length > 0
          ? attachments.map(({ filename, content }) => ({
              filename,
              content,
            }))
          : undefined,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    return {
      success: false,
      error: err?.message || 'Error al enviar el correo',
    };
  }
}
