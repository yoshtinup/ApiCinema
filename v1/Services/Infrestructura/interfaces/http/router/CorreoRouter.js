
import express from 'express';

import { CorreoRepository } from '../../../adapters/Services/CorreoRepository.js';
import { CorreoController } from '../../../adapters/Controllers/CorreoController.js';


export const CorreoRouter = express.Router();

const servicesRepository = new CorreoRepository();
const servicesController = new CorreoController(servicesRepository);

// Definir la ruta POST /clients
CorreoRouter.post('/correos', (req, res) => servicesController.sendCorreo(req, res));

// Endpoint de prueba para diagnosticar problemas de entrega
CorreoRouter.post('/correos/test', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email es requerido' 
      });
    }
    
    const testMessage = `
      ¡Hola! 👋
      
      Este es un mensaje de prueba del sistema CineSnacks.
      
      Detalles de la prueba:
      • Fecha: ${new Date().toLocaleString('es-ES')}
      • Destinatario: ${email}
      • Sistema: Brevo API v3
      • Estado: Funcionando correctamente ✅
      
      Si recibes este mensaje, el sistema de notificaciones está trabajando perfectamente.
      
      ¡Gracias por usar CineSnacks! 🎬🍿
    `;
    
    const messageId = await servicesRepository.sendCorreo(
      email, 
      testMessage, 
      "🧪 Prueba del Sistema CineSnacks - Test de Entrega"
    );
    
    res.status(200).json({
      success: true,
      message: 'Email de prueba enviado exitosamente',
      messageId: messageId,
      recipient: email,
      timestamp: new Date().toISOString(),
      instructions: [
        "1. Revisa tu bandeja de entrada",
        "2. Si no lo ves, revisa la carpeta de SPAM/Promociones",
        "3. Si usas Gmail, revisa las pestañas 'Promociones' o 'Social'",
        "4. Puede tardar hasta 5 minutos en llegar"
      ]
    });
    
  } catch (error) {
    console.error('❌ Error en prueba de correo:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error enviando email de prueba',
      details: error.message
    });
  }
});


