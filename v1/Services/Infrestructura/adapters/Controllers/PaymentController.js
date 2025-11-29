import { CreatePaymentPreference } from '../../../Aplicativo/CreatePaymentPreference.js';
import { CompletePayment } from '../../../Aplicativo/CompletePayment.js';

export class PaymentController {
  constructor(paymentService, pagoRepository, carritoRepository) {
    this.paymentService = paymentService;
    this.pagoRepository = pagoRepository; // ✅ AGREGAR ESTA LÍNEA
    this.carritoRepository = carritoRepository; // ✅ AGREGAR ESTA LÍNEA
    this.createPreferenceUseCase = new CreatePaymentPreference(
      paymentService, 
      carritoRepository
    );
    this.completePaymentUseCase = new CompletePayment(
      pagoRepository, 
      carritoRepository, 
      paymentService
    );
  }

  /**
   * Crea una preferencia de pago con los items del carrito
   * POST /api/v1/payment/create-preference
   */
  async createPreference(req, res) {
    try {
      const { user_id, nfc } = req.body;

      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: 'user_id es requerido'
        });
      }

      const preference = await this.createPreferenceUseCase.execute(user_id, nfc);

      res.status(200).json({
        success: true,
        data: preference
      });

    } catch (error) {
      console.error('Error creando preferencia:', error);

      if (error.message.includes('carrito está vacío') || 
          error.message.includes('Stock insuficiente')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error al crear preferencia de pago',
        details: error.message
      });
    }
  }

  /**
   * Completa un pago después de validación
   * POST /api/v1/payment/complete
   */
  async completePayment(req, res) {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('💳 [COMPLETE PAYMENT] Iniciando completación de pago');
      console.log('🕐 Timestamp:', new Date().toISOString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const { payment_id, user_id, nfc } = req.body;
      
      console.log('📋 Body recibido:', JSON.stringify(req.body, null, 2));
      console.log('📋 payment_id:', payment_id);
      console.log('📋 user_id:', user_id);
      console.log('📋 nfc:', nfc);

      if (!payment_id) {
        console.log('❌ Falta payment_id');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return res.status(400).json({
          success: false,
          error: 'payment_id es requerido'
        });
      }

      if (!user_id) {
        console.log('❌ Falta user_id');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return res.status(400).json({
          success: false,
          error: 'user_id es requerido'
        });
      }

      console.log('✅ Parámetros válidos, ejecutando use case...');

      const result = await this.completePaymentUseCase.execute({
        payment_id,
        user_id,
        nfc
      });

      console.log('✅ Pago completado exitosamente');
      console.log('📦 Resultado:', {
        order_id: result.order?.order_id,
        status: result.order?.status,
        duplicate: result.duplicate
      });
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      res.status(result.duplicate ? 200 : 201).json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ [COMPLETE PAYMENT] Error:', error);
      console.error('Stack trace:', error.stack);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Errores de validación
      if (error.message.includes('payment_id') ||
          error.message.includes('user_id') ||
          error.message.includes('carrito está vacío') ||
          error.message.includes('no está aprobado') ||
          error.message.includes('no coincide')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error al completar el pago',
        details: error.message
      });
    }
  }

  /**
   * Verifica el estado de un pago por external_reference
   * GET /api/v1/payment/status?external_reference=XXX
   */
  async checkPaymentStatus(req, res) {
    try {
      const { external_reference, user_id } = req.query;

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔍 [CHECK PAYMENT STATUS] Iniciando verificación');
      console.log('📋 Query params:', { external_reference, user_id });
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      if (!external_reference || !user_id) {
        console.log('❌ Faltan parámetros requeridos');
        return res.status(400).json({
          success: false,
          error: 'external_reference y user_id son requeridos'
        });
      }

      console.log(`🔍 Buscando orden con external_reference: ${external_reference}`);

      // Buscar orden por external_reference
      const order = await this.pagoRepository.findOrderByExternalReference(external_reference);

      console.log('📊 Resultado de búsqueda:', order ? 'Orden encontrada ✅' : 'Orden NO encontrada ⚠️');
      
      if (order) {
        console.log('📦 Detalles de la orden:', {
          order_id: order.order_id,
          user_id: order.user_id,
          status: order.status,
          payment_status: order.payment_status,
          total: order.total,
          created_at: order.created_at
        });
      }

      if (!order) {
        console.log('⏳ Pago aún pendiente (orden no creada en BD)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return res.status(200).json({
          success: true,
          data: {
            status: 'pending',
            message: 'Pago en proceso, por favor espera unos segundos',
            order: null
          }
        });
      }

      console.log('✅ Respondiendo con orden encontrada');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      res.status(200).json({
        success: true,
        data: {
          status: order.payment_status || order.status,
          message: order.payment_status === 'approved' ? 'Pago completado' : 'Pago en proceso',
          order: order
        }
      });

    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ [CHECK PAYMENT STATUS] Error:', error);
      console.error('Stack trace:', error.stack);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      res.status(500).json({
        success: false,
        error: 'Error al verificar estado del pago',
        details: error.message
      });
    }
  }

  /**
   * Webhook para notificaciones de MercadoPago
   * POST /api/v1/webhooks/mercadopago
   */
  async handleWebhook(req, res) {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📨 [WEBHOOK] Notificación recibida de MercadoPago');
      console.log('🕐 Timestamp:', new Date().toISOString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const { type, data } = req.body;
      
      console.log('📦 Body completo:', JSON.stringify(req.body, null, 2));
      console.log('📋 Type:', type);
      console.log('📋 Data:', JSON.stringify(data, null, 2));
      console.log('🔍 Query params:', req.query);
      console.log('🔍 Headers:', {
        'content-type': req.headers['content-type'],
        'x-signature': req.headers['x-signature'],
        'x-request-id': req.headers['x-request-id']
      });

      // Responder rápidamente a MercadoPago
      console.log('✅ Enviando respuesta 200 a MercadoPago');
      res.status(200).json({ received: true });

      // Procesar el webhook de forma asíncrona
      if (type === 'payment') {
        const paymentId = data.id;
        console.log(`💳 Procesando pago vía webhook: ${paymentId}`);
        console.log('ℹ️ Nota: El pago se procesará mediante el endpoint /complete');
      } else {
        console.log(`⚠️ Tipo de webhook no manejado: ${type}`);
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ [WEBHOOK] Error procesando webhook:', error);
      console.error('Stack trace:', error.stack);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      res.status(500).json({ error: 'Error procesando webhook' });
    }
  }
}
