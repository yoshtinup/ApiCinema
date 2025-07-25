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
      
      // Mejorar el contenido HTML con diseño al estilo Fiverr en blanco y negro
      sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafafa; color: #000000;">
            
            <!-- Main Container -->
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
              
              <!-- Header Section -->
              <div style="background: linear-gradient(135deg, #000000 0%, #2c2c2c 100%); padding: 40px 32px; text-align: center; position: relative; overflow: hidden;">
                <!-- Background Pattern -->
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.05; background-image: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"60\" height=\"60\" viewBox=\"0 0 60 60\"><g fill=\"%23ffffff\"><circle cx=\"30\" cy=\"30\" r=\"2\"/></g></svg>'); background-repeat: repeat;"></div>
                
                <!-- Logo and Title -->
                <div style="position: relative; z-index: 1;">
                  <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background-color: #ffffff; border-radius: 20px; margin-bottom: 24px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);">
                    <span style="font-size: 32px; filter: grayscale(0);">🎬</span>
                  </div>
                  <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1.2;">
                    CineSnacks
                  </h1>
                  <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 400; color: #e0e0e0; opacity: 0.9;">
                    Tu experiencia cinematográfica premium
                  </p>
                </div>
              </div>

              <!-- Main Content -->
              <div style="padding: 48px 32px;">
                
                <!-- Status Badge (if needed) -->
                <div style="text-align: center; margin-bottom: 32px;">
                  <span style="display: inline-block; padding: 8px 20px; background-color: #f5f5f5; color: #000000; font-size: 14px; font-weight: 600; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #e0e0e0;">
                    Notificación
                  </span>
                </div>

                <!-- Main Message -->
                <div style="background-color: #fafafa; border-radius: 16px; padding: 32px; margin-bottom: 32px; border-left: 4px solid #000000; position: relative;">
                  <div style="font-size: 18px; font-weight: 500; color: #000000; line-height: 1.6; margin: 0;">
                    ${body}
                  </div>
                </div>

                <!-- Divider -->
                <div style="height: 1px; background: linear-gradient(90deg, transparent, #e0e0e0, transparent); margin: 40px 0;"></div>

                <!-- Features Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 24px; margin: 32px 0;">
                  <div style="text-align: center; padding: 20px; background-color: #fafafa; border-radius: 12px; border: 1px solid #f0f0f0;">
                    <div style="margin-bottom: 12px;">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #000000;">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                      </svg>
                    </div>
                    <div style="font-size: 14px; font-weight: 600; color: #000000; margin-bottom: 4px;">Rápido</div>
                    <div style="font-size: 12px; color: #666666; font-weight: 400;">Entrega inmediata</div>
                  </div>
                  <div style="text-align: center; padding: 20px; background-color: #fafafa; border-radius: 12px; border: 1px solid #f0f0f0;">
                    <div style="margin-bottom: 12px;">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #000000;">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                        <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <div style="font-size: 14px; font-weight: 600; color: #000000; margin-bottom: 4px;">Seguro</div>
                    <div style="font-size: 12px; color: #666666; font-weight: 400;">Pago protegido</div>
                  </div>
                  <div style="text-align: center; padding: 20px; background-color: #fafafa; border-radius: 12px; border: 1px solid #f0f0f0;">
                    <div style="margin-bottom: 12px;">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #000000;">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="m9 12 2 2 4-4"/>
                      </svg>
                    </div>
                    <div style="font-size: 14px; font-weight: 600; color: #000000; margin-bottom: 4px;">Preciso</div>
                    <div style="font-size: 12px; color: #666666; font-weight: 400;">Tu pedido exacto</div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #fafafa; border-top: 1px solid #f0f0f0; padding: 32px; text-align: center;">
                <div style="margin-bottom: 20px;">
                  <div style="font-size: 18px; font-weight: 700; color: #000000; margin-bottom: 8px;">
                    ¿Necesitas ayuda?
                  </div>
                  <div style="font-size: 14px; color: #666666; line-height: 1.5;">
                    Nuestro equipo está disponible 24/7 para asistirte<br>
                    con cualquier consulta sobre tu pedido.
                  </div>
                </div>
                
                <div style="display: inline-flex; gap: 16px; margin-bottom: 24px;">
                  <div style="padding: 12px 24px; background-color: #ffffff; border: 2px solid #f0f0f0; border-radius: 8px; font-size: 14px; font-weight: 600; color: #000000; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    Contactar soporte
                  </div>
                  <div style="padding: 12px 24px; background-color: #ffffff; border: 2px solid #f0f0f0; border-radius: 8px; font-size: 14px; font-weight: 600; color: #000000; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>
                    </svg>
                    Chat en vivo
                  </div>
                </div>

                <!-- Legal Text -->
                <div style="border-top: 1px solid #f0f0f0; padding-top: 24px; margin-top: 24px;">
                  <p style="margin: 0; font-size: 12px; color: #999999; line-height: 1.5; font-weight: 400;">
                    Este es un mensaje automático de <strong>CineSnacks</strong>.<br>
                    Si no esperabas este correo, puedes ignorarlo de forma segura.<br>
                    <span style="color: #666666;">© ${new Date().getFullYear()} CineSnacks. Todos los derechos reservados.</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Mobile Responsive Styles -->
            <style>
              @media only screen and (max-width: 600px) {
                .container { padding: 20px !important; }
                .header { padding: 32px 20px !important; }
                .content { padding: 32px 20px !important; }
                .grid { grid-template-columns: 1fr !important; }
                .button { padding: 14px 24px !important; font-size: 14px !important; }
              }
              
              @media (prefers-color-scheme: dark) {
                .light-mode { display: none !important; }
              }
            </style>
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
      
      // Agregar texto plano como fallback con diseño limpio
      sendSmtpEmail.textContent = `
🎬 CINESNACKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${subject}

${body}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ CARACTERÍSTICAS:
• ⚡ Entrega rápida e inmediata
• 🔒 Pagos seguros y protegidos  
• ✓ Pedidos precisos y confirmados

📞 ¿NECESITAS AYUDA?
Nuestro equipo está disponible 24/7 para asistirte.
• Contactar soporte
• Chat en vivo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Este es un mensaje automático de CineSnacks.
Si no esperabas este correo, puedes ignorarlo.

© ${new Date().getFullYear()} CineSnacks. Todos los derechos reservados.
      `;

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