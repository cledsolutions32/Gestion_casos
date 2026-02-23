import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Sistema de Casos';

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

  const evidenciasList =
    attachments.length > 0
      ? attachments.map((a) => `• ${a.filename}`).join('\n')
      : 'No hay evidencias adjuntas.';

  const html = `
    <h2>Notificación de cierre de caso</h2>
    <p>Se notifica el cierre del siguiente caso:</p>
    <ul>
      <li><strong>Aviso:</strong> ${aviso}</li>
      <li><strong>Descripción:</strong> ${caseData.texto_breve || '—'}</li>
      <li><strong>Estado:</strong> ${caseData.estado || '—'}</li>
      <li><strong>Zona:</strong> ${caseData.zona || '—'}</li>
      <li><strong>Tipología:</strong> ${caseData.tipologia || '—'}</li>
    </ul>
    <h3>Evidencias adjuntas (${attachments.length})</h3>
    <pre>${evidenciasList}</pre>
    <p><em>Este correo fue generado automáticamente por el sistema.</em></p>
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
