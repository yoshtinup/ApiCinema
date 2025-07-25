import brevo from "@getbrevo/brevo";
import { IExteriorService } from "../../../Dominio/ports/IExteriorService.js";
export class CorreoRepository extends IExteriorService {
  constructor() {
    super();
    this.apiInstance = new brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );
  }

  async sendCorreo(to, body, subject = "🎬 Notificación CineSnacks") {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.to = [{ email: to, name: to }];
      
      // Mejorar el contenido HTML para evitar filtros de spam
      sendSmtpEmail.htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${subject}</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
              <h2 style="color: #d32f2f; text-align: center;">🎬 CineSnacks</h2>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px;">${body}</p>
              </div>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #666; text-align: center;">
                Este es un mensaje automático de CineSnacks.<br>
                Si no esperabas este correo, puedes ignorarlo.
              </p>
            </div>
          </body>
        </html>
      `;
      
      // Configurar remitente con mejor reputación
      sendSmtpEmail.sender = {
        name: process.env.SENDER_NAME || "CineSnacks Notificación",
        email: process.env.SENDER_EMAIL || "yoshgutiperez@gmail.com"
      };
      
      // Agregar cabeceras adicionales para mejorar entrega
      sendSmtpEmail.headers = {
        "X-Mailin-custom": "CineSnacks-Notification",
        "X-Priority": "3",
        "Reply-To": process.env.SENDER_EMAIL || "yoshgutiperez@gmail.com"
      };
      
      // Agregar texto plano como fallback
      sendSmtpEmail.textContent = `CineSnacks - ${subject}\n\n${body}\n\n---\nEste es un mensaje automático de CineSnacks.`;

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      
      // Verificar la estructura de la respuesta y extraer el ID correctamente
      let messageId = 'unknown';
      if (result && result.response && result.response.body) {
        messageId = result.response.body.messageId || result.response.body.id || 'sent-successfully';
      } else if (result && result.messageId) {
        messageId = result.messageId;
      } else if (result && result.id) {
        messageId = result.id;
      }
      
      console.log(`✅ Correo enviado a ${to}: ${messageId}`);
      console.log(`📧 Asunto: ${subject}`);
      console.log(`👤 Remitente: ${sendSmtpEmail.sender.name} <${sendSmtpEmail.sender.email}>`);
      
      // Debug: mostrar la estructura completa en caso de desarrollo
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔍 Respuesta completa de Brevo:', JSON.stringify(result, null, 2));
      }
      
      return messageId;
    } catch (error) {
      console.error(`❌ Error enviando correo a ${to}:`, error.message);
      if (error.response) {
        console.error('📋 Detalles del error:', error.response.data);
      }
      throw new Error(`Error al enviar el mensaje: ${error.message}`);
    }
  }
}