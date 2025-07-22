import express from 'express';

const router = express.Router();

// Endpoint para recibir notificaciones de MercadoPago
router.post('/payments/webhook', async (req, res) => {
  console.log('🔔 Webhook recibido de MercadoPago:', req.body);
  
  try {
    const { type, data } = req.body;
    
    if (type === 'payment') {
      const paymentId = data.id;
      console.log(`💳 Pago recibido - ID: ${paymentId}`);
      
      // Aquí deberías:
      // 1. Consultar el estado del pago en MercadoPago
      // 2. Actualizar el estado de la orden en tu base de datos
      // 3. Enviar confirmación al usuario
      
      // TODO: Implementar lógica de procesamiento de pago
      await processPaymentNotification(paymentId);
    }
    
    // IMPORTANTE: Siempre responder 200 OK
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    res.status(200).send('OK'); // Aún así responder OK para evitar reenvíos
  }
});

async function processPaymentNotification(paymentId) {
  // Aquí implementar la lógica para:
  // 1. Obtener detalles del pago desde MercadoPago API
  // 2. Actualizar orden en base de datos
  // 3. Notificar al usuario
  console.log(`🔄 Procesando notificación de pago: ${paymentId}`);
}

export default router;
