import { CreatePaymentPreference } from '../../../Aplicativo/CreatePaymentPreference.js';
import { CompletePayment } from '../../../Aplicativo/CompletePayment.js';

export class PaymentController {
  constructor(paymentService, pagoRepository, carritoRepository) {
    this.paymentService = paymentService;
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
      const { payment_id, user_id, nfc } = req.body;

      if (!payment_id) {
        return res.status(400).json({
          success: false,
          error: 'payment_id es requerido'
        });
      }

      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: 'user_id es requerido'
        });
      }

      const result = await this.completePaymentUseCase.execute({
        payment_id,
        user_id,
        nfc
      });

      res.status(result.duplicate ? 200 : 201).json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error completando pago:', error);

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
   * Webhook para notificaciones de MercadoPago
   * POST /api/v1/webhooks/mercadopago
   */
  async handleWebhook(req, res) {
    try {
      const { type, data } = req.body;

      console.log('📨 Webhook recibido:', { type, data });

      // Responder rápidamente a MercadoPago
      res.status(200).json({ received: true });

      // Procesar el webhook de forma asíncrona
      if (type === 'payment') {
        const paymentId = data.id;
        // Aquí podrías agregar lógica adicional si es necesario
        console.log(`✅ Pago procesado vía webhook: ${paymentId}`);
      }

    } catch (error) {
      console.error('Error procesando webhook:', error);
      res.status(500).json({ error: 'Error procesando webhook' });
    }
  }
}
