
import { CreatePaymentUseCase } from '../../../Aplicativo/CreatePaymentUseCase.js';
export class PaymentController {
  constructor(servicesRepository) {
    this.createPaymentUseCase = new CreatePaymentUseCase(servicesRepository); 
   
  }

  /**
   * Crear una preferencia de pago y manejar la solicitud HTTP.
   * @param {Object} req - La solicitud HTTP.
   * @param {Object} res - La respuesta HTTP.
   */
  async createPayment(req, res) {
    try {
      console.log('💳 Iniciando creación de pago:', req.body);
      
      // Validar datos de entrada
      if (!req.body.title || !req.body.price) {
        return res.status(400).json({ 
          error: 'Faltan datos requeridos: title y price son obligatorios' 
        });
      }

      // Obtener los detalles del producto del cuerpo de la solicitud
      const item = {
        title: req.body.title,
        unit_price: Number(req.body.price),
        quantity: Number(req.body.quantity) || 1,
      };
      
      // Validar que el precio sea un número válido
      if (isNaN(item.unit_price) || item.unit_price <= 0) {
        return res.status(400).json({ 
          error: 'El precio debe ser un número válido mayor a 0' 
        });
      }
      
      // Ejecutar el caso de uso para crear la preferencia de pago
      const orderId = req.body.orderId; // Si viene del frontend
      const paymentLink = await this.createPaymentUseCase.execute(item, orderId);
      
      console.log('✅ Pago creado exitosamente:', paymentLink);
      
      // Enviar el enlace de pago en la respuesta
      res.status(200).json({
        success: true,
        data: paymentLink,
        message: 'Preferencia de pago creada exitosamente'
      });
    } catch (error) {
      console.error('❌ Error creando pago:', error);
      
      // Manejar errores específicos de MercadoPago
      if (error.message.includes('MercadoPago')) {
        res.status(503).json({ 
          error: 'Servicio de pagos temporalmente no disponible. Intenta de nuevo.' 
        });
      } else {
        res.status(500).json({ 
          error: 'Error interno del servidor',
          details: error.message 
        });
      }
    }
  }
}
