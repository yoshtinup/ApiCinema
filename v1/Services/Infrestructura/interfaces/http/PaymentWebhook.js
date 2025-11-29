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
    
    // Validar la firma del webhook (clave secreta)
    const xSignature = req.headers['x-signature'];
    const xRequestId = req.headers['x-request-id'];
    
    console.log('🔐 Validando firma del webhook...');
    console.log('   x-signature:', xSignature);
    console.log('   x-request-id:', xRequestId);
    
    if (!xSignature || !xRequestId) {
      console.error('❌ Webhook sin firma - Rechazado');
      return res.status(401).send('Unauthorized');
    }
    
    // TODO: Validar la firma con la clave secreta de MercadoPago
    // Por ahora solo verificamos que exista
    
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
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ [WEBHOOK] Manejando pago aprobado');
    console.log('📋 Payment ID:', paymentInfo.id);
    console.log('📋 External Reference:', paymentInfo.external_reference);
    console.log('📋 Amount:', paymentInfo.transaction_amount);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Verificar si ya existe una orden con este external_reference
    const [existingOrders] = await db.query(
      'SELECT * FROM orders WHERE external_reference = ? LIMIT 1',
      [paymentInfo.external_reference]
    );

    if (existingOrders && existingOrders.length > 0) {
      // La orden ya existe, solo actualizar el estado
      console.log('📦 Orden ya existe, actualizando estado...');
      await db.query(`
        UPDATE orders 
        SET status = 'paid', 
            payment_id = ?, 
            payment_status = 'approved',
            updated_at = NOW()
        WHERE external_reference = ?
      `, [paymentInfo.id.toString(), paymentInfo.external_reference]);
      
      console.log('✅ Orden actualizada como pagada:', paymentInfo.external_reference);
    } else {
      // La orden NO existe, necesitamos crearla
      console.log('⚠️ Orden NO existe, creando nueva orden...');
      
      // Extraer user_id del external_reference (formato: USER_5_1764400994187)
      const externalRef = paymentInfo.external_reference;
      const userIdMatch = externalRef.match(/USER_(\d+)_/);
      
      if (!userIdMatch) {
        console.error('❌ No se pudo extraer user_id del external_reference:', externalRef);
        throw new Error('Invalid external_reference format');
      }
      
      const userId = userIdMatch[1];
      console.log('👤 User ID extraído:', userId);
      
      // Obtener items del carrito del usuario
      const [cartItems] = await db.query(`
        SELECT c.id, c.iduser, c.idproducto, c.cantidad, 
               p.nombre, p.descripcion, p.precio, p.peso, p.categoria, p.imagen
        FROM carrito c 
        INNER JOIN productos p ON c.idproducto = p.id 
        WHERE c.iduser = ?
      `, [userId]);
      
      if (!cartItems || cartItems.length === 0) {
        console.error('❌ No hay items en el carrito para user_id:', userId);
        throw new Error('Cart is empty');
      }
      
      console.log('🛒 Items del carrito:', cartItems.length, 'productos');
      
      // Convertir items a formato de orden
      const orderItems = cartItems.map(item => ({
        product_id: item.idproducto,
        name: item.nombre,
        quantity: item.cantidad,
        price: parseFloat(item.precio),
        subtotal: parseFloat(item.precio) * parseInt(item.cantidad)
      }));
      
      // Crear la orden
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
      
      console.log('💰 Total calculado:', total);
      console.log('📋 Order ID:', orderId);
      
      await db.query(`
        INSERT INTO orders (
          order_id, user_id, items, total, status, created_at, 
          payment_id, payment_status, payment_method, external_reference
        ) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)
      `, [
        orderId,
        userId,
        JSON.stringify(orderItems),
        total.toFixed(2),
        'paid',
        paymentInfo.id.toString(),
        'approved',
        paymentInfo.payment_method_id || 'mercadopago',
        paymentInfo.external_reference
      ]);
      
      console.log('✅ Orden creada exitosamente:', orderId);
      
      // Vaciar el carrito
      await db.query('DELETE FROM carrito WHERE iduser = ?', [userId]);
      console.log('🗑️ Carrito vaciado para user_id:', userId);
      
      // Descontar stock de productos
      for (const item of orderItems) {
        await db.query(
          'UPDATE productos SET cantidad = cantidad - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
      console.log('📦 Stock actualizado para', orderItems.length, 'productos');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Error manejando pago aprobado:', error);
    console.error('Stack trace:', error.stack);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
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
