import express from 'express';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { db } from '../../../../../database/mysql.js';

const webhookRouter = express.Router();

// Configurar MercadoPago con el token de producción
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN_PROD,
  options: { timeout: 5000 }
});

const payment = new Payment(client);

// Middleware para procesar webhooks de MercadoPago
webhookRouter.post('/webhook', async (req, res) => {
  try {
    console.log('🔔 Webhook recibido de MercadoPago:', req.body);
    
    // Responder inmediatamente a MercadoPago
    res.status(200).send('OK');
    
    // Procesar la notificación de forma asíncrona
    if (req.body.type === 'payment' || req.body.topic === 'payment') {
      const paymentId = req.body.data?.id || req.body.resource;
      
      if (paymentId) {
        console.log('💳 Pago recibido - ID:', paymentId);
        await processPaymentNotification(paymentId);
      }
    }
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    // Ya enviamos respuesta OK, no enviamos error para evitar reintentos
  }
});

async function processPaymentNotification(paymentId) {
  try {
    console.log('🔄 Procesando notificación de pago:', paymentId);
    
    // Obtener detalles del pago desde MercadoPago API
    const paymentInfo = await payment.get({ id: paymentId });
    
    console.log('📋 Detalles del pago:', {
      id: paymentInfo.id,
      status: paymentInfo.status,
      status_detail: paymentInfo.status_detail,
      transaction_amount: paymentInfo.transaction_amount,
      external_reference: paymentInfo.external_reference
    });

    // Procesar según el estado del pago
    switch (paymentInfo.status) {
      case 'approved':
        console.log('✅ Pago aprobado:', paymentId);
        await handleApprovedPayment(paymentInfo);
        break;
      case 'pending':
        console.log('⏳ Pago pendiente:', paymentId);
        await handlePendingPayment(paymentInfo);
        break;
      case 'rejected':
        console.log('❌ Pago rechazado:', paymentId);
        await handleRejectedPayment(paymentInfo);
        break;
      case 'cancelled':
        console.log('🚫 Pago cancelado:', paymentId);
        await handleCancelledPayment(paymentInfo);
        break;
      default:
        console.log('⚠️ Estado de pago no manejado:', paymentInfo.status);
        break;
    }
  } catch (error) {
    console.error('❌ Error procesando pago ' + paymentId + ':', error);
  }
}

async function handleApprovedPayment(paymentInfo) {
  try {
    // Actualizar el estado de la orden en la base de datos
    await db.query(`
        UPDATE orders 
        SET status = 'paid', 
            payment_id = ?, 
            payment_status = 'approved',
            updated_at = NOW()
        WHERE external_reference = ?
      `, [paymentInfo.id.toString(), paymentInfo.external_reference]);

    console.log('✅ Orden actualizada como pagada:', paymentInfo.external_reference);
  } catch (error) {
    console.error('❌ Error manejando pago aprobado:', error);
    throw error;
  }
}

async function handlePendingPayment(paymentInfo) {
  try {
    await db.query(`
        UPDATE orders 
        SET payment_id = ?, 
            payment_status = 'pending',
            updated_at = NOW()
        WHERE external_reference = ?
      `, [paymentInfo.id.toString(), paymentInfo.external_reference]);

    console.log('⏳ Orden marcada como pago pendiente:', paymentInfo.external_reference);
  } catch (error) {
    console.error('❌ Error manejando pago pendiente:', error);
  }
}

async function handleRejectedPayment(paymentInfo) {
  try {
    await db.query(`
        UPDATE orders 
        SET payment_id = ?, 
            payment_status = 'rejected',
            status = 'cancelled',
            updated_at = NOW()
        WHERE external_reference = ?
      `, [paymentInfo.id.toString(), paymentInfo.external_reference]);

    console.log('❌ Orden marcada como pago rechazado:', paymentInfo.external_reference);
  } catch (error) {
    console.error('❌ Error manejando pago rechazado:', error);
  }
}

async function handleCancelledPayment(paymentInfo) {
  try {
    await db.query(`
        UPDATE orders 
        SET payment_id = ?, 
            payment_status = 'cancelled',
            status = 'cancelled',
            updated_at = NOW()
        WHERE external_reference = ?
      `, [paymentInfo.id.toString(), paymentInfo.external_reference]);

    console.log('🚫 Orden marcada como cancelada:', paymentInfo.external_reference);
  } catch (error) {
    console.error('❌ Error manejando pago cancelado:', error);
  }
}

export default webhookRouter;
