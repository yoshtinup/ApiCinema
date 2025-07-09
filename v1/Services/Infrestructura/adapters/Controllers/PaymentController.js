
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
      // Obtener los detalles del producto del cuerpo de la solicitud
      const item = {
        title: req.body.title,
        unit_price: Number(req.body.price),
        quantity: Number(req.body.quantity) || 1,
      };
      // Ejecutar el caso de uso para crear la preferencia de pago
      const paymentLink = await this.createPaymentUseCase.execute(item);
      // Enviar el enlace de pago en la respuesta
      res.status(200).json(paymentLink);
    } catch (error) {
      // Manejar errores y enviar una respuesta con el código de error correspondiente
      res.status(500).json({ error: error.message });
    }
  }
}
