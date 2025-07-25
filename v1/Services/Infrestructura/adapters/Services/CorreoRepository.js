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
      console.log(`Correo enviado a ${to}: ${result.messageId}`);
      return result.messageId;
    } catch (error) {
      throw new Error(`Error al enviar el mensaje: ${error.message}`);
    }
  }
}