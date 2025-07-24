import express from 'express';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { db } from '../../../../../database/mysql.js';

const router = express.Router();

// Inicializar cliente de MercadoPago
const accessToken = process.env.NODE_ENV === 'production' 
  ? process.env.MP_ACCESS_TOKEN_PROD 
  : process.env.MP_ACCESS_TOKEN;

const client = new MercadoPagoConfig({ 
  accessToken: accessToken 
});

// Endpoint para recibir notificaciones de MercadoPago
router.post('/payments/webhook', async (req, res) => {
  console.log('🔔 Webhook recibido de MercadoPago:', req.body);
  
  try {
    const { type, data } = req.body;
    
    if (type === 'payment') {
      const paymentId = data.id;
      console.log(`💳 Pago recibido - ID: ${paymentId}`);
      
      // Procesar la notificación de pago
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
  try {
    console.log(`🔄 Procesando notificación de pago: ${paymentId}`);
    
    // 1. Obtener detalles del pago desde MercadoPago API
    const payment = new Payment(client);
    const paymentDetails = await payment.get({ id: paymentId });
    
    console.log(`📋 Detalles del pago:`, {
      id: paymentDetails.id,
      status: paymentDetails.status,
      status_detail: paymentDetails.status_detail,
      transaction_amount: paymentDetails.transaction_amount,
      external_reference: paymentDetails.external_reference
    });
    
    // 2. Procesar según el estado del pago
    switch (paymentDetails.status) {
      case 'approved':
        await handleApprovedPayment(paymentDetails);
        break;
      case 'rejected':
        await handleRejectedPayment(paymentDetails);
        break;
      case 'pending':
        await handlePendingPayment(paymentDetails);
        break;
      case 'cancelled':
        await handleCancelledPayment(paymentDetails);
        break;
      default:
        console.log(`⚠️ Estado de pago no manejado: ${paymentDetails.status}`);
    }
    
  } catch (error) {
    console.error(`❌ Error procesando pago ${paymentId}:`, error);
    throw error;
  }
}

async function handleApprovedPayment(paymentDetails) {
  try {
    console.log(`✅ Pago aprobado: ${paymentDetails.id}`);
    
    // Buscar la orden relacionada con este pago
    const orderId = paymentDetails.external_reference;
    
    if (orderId) {
      // Actualizar el estado de la orden a 'paid'
      const updateOrderQuery = `
        UPDATE orders 
        SET status = 'paid', 
            payment_id = ?, 
            payment_status = 'approved',
            updated_at = NOW()
        WHERE id = ?
      `;
      
      await db.query(updateOrderQuery, [paymentDetails.id, orderId]);
      console.log(`📦 Orden ${orderId} actualizada a estado 'paid'`);
      
      // Opcional: Aquí podrías enviar una notificación al usuario
      // await sendPaymentConfirmationToUser(orderId, paymentDetails);
      
    } else {
      console.log('⚠️ No se encontró external_reference en el pago');
    }
    
  } catch (error) {
    console.error('❌ Error manejando pago aprobado:', error);
    throw error;
  }
}

async function handleRejectedPayment(paymentDetails) {
  console.log(`❌ Pago rechazado: ${paymentDetails.id} - ${paymentDetails.status_detail}`);
  
  const orderId = paymentDetails.external_reference;
  if (orderId) {
    const updateOrderQuery = `
      UPDATE orders 
      SET payment_status = 'rejected',
          payment_id = ?,
          updated_at = NOW()
      WHERE id = ?
    `;
    
    await db.query(updateOrderQuery, [paymentDetails.id, orderId]);
    console.log(`📦 Orden ${orderId} marcada como pago rechazado`);
  }
}

async function handlePendingPayment(paymentDetails) {
  console.log(`⏳ Pago pendiente: ${paymentDetails.id}`);
  
  const orderId = paymentDetails.external_reference;
  if (orderId) {
    const updateOrderQuery = `
      UPDATE orders 
      SET payment_status = 'pending',
          payment_id = ?,
          updated_at = NOW()
      WHERE id = ?
    `;
    
    await db.query(updateOrderQuery, [paymentDetails.id, orderId]);
    console.log(`📦 Orden ${orderId} marcada como pago pendiente`);
  }
}

async function handleCancelledPayment(paymentDetails) {
  console.log(`� Pago cancelado: ${paymentDetails.id}`);
  
  const orderId = paymentDetails.external_reference;
  if (orderId) {
    const updateOrderQuery = `
      UPDATE orders 
      SET payment_status = 'cancelled',
          payment_id = ?,
          updated_at = NOW()
      WHERE id = ?
    `;
    
    await db.query(updateOrderQuery, [paymentDetails.id, orderId]);
    console.log(`📦 Orden ${orderId} marcada como pago cancelado`);
  }
}

export default router;
