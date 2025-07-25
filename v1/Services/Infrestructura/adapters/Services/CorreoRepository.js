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

  async sendCorreo(to, body, subject = "Nuevo Mensaje") {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.to = [{ email: to, name: to }];
      sendSmtpEmail.htmlContent = `<html><body><p>${body}</p></body></html>`;
      sendSmtpEmail.sender = {
        name: process.env.SENDER_NAME,
        email: process.env.SENDER_EMAIL
      };

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
      
      console.log(`Correo enviado a ${to}: ${messageId}`);
      
      // Debug: mostrar la estructura completa en caso de desarrollo
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔍 Respuesta completa de Brevo:', JSON.stringify(result, null, 2));
      }
      
      return messageId;
    } catch (error) {
      console.error(`❌ Error enviando correo a ${to}:`, error.message);
      throw new Error(`Error al enviar el mensaje: ${error.message}`);
    }
  }
}