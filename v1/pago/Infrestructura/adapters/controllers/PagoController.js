
import { Create } from '../../../Aplicativo/Create.js';
import { CompletePayment } from '../../../Aplicativo/CompletePayment.js';
import { GetOrdersByUserId } from '../../../Aplicativo/GetOrdersByUserId.js';
import { GetProductosByIds } from '../../../Aplicativo/GetProductosByIds.js';

export class PagoController {
  constructor(pagoRepository, carritoRepository) {
    this.createUseCase = new Create(pagoRepository);
    this.completePaymentUseCase = new CompletePayment(pagoRepository, carritoRepository);
    this.getOrdersByUserIdUseCase = new GetOrdersByUserId(pagoRepository);
    this.getProductosByIdsUseCase = new GetProductosByIds(pagoRepository);
  /**
   * Devuelve productos actualizados desde la BD por arreglo de IDs
   * @param {Object} req - La solicitud HTTP.
   * @param {Object} res - La respuesta HTTP.
   */
  }

  /**
   * Crear un nuevo registro de pago.
   * @param {Object} req - La solicitud HTTP.
   * @param {Object} res - La respuesta HTTP.
   */
  async createPago(req, res) {
    try {
      const pagoData = req.body;
      const result = await this.createUseCase.execute(pagoData);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating pago:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Completar un pago y crear una orden.
   * @param {Object} req - La solicitud HTTP.
   * @param {Object} res - La respuesta HTTP.
   */
  async completePayment(req, res) {
    try {
      const paymentData = {
        user_id: req.body.user_id,
        dispenser_id: req.body.dispenser_id || null
      };
      
      const order = await this.completePaymentUseCase.execute(paymentData);
      res.status(201).json(order);
    } catch (error) {
      console.error('Error completing payment:', error);
      res.status(500).json({ error: error.message });
    }
  }
  async getOrdersByUserId(req, res) {
    try {
      const userId = req.params.iduser;
      const orders = await this.getOrdersByUserIdUseCase.execute(userId);
      res.status(200).json(orders);
    } catch (error) {
      console.error('Error retrieving orders:', error);
      res.status(500).json({ error: error.message });
    }
  }
    async getProductosByIdsController(req, res) {
    try {
      const { ids } = req.body;
      const productos = await this.createUseCase.pagoRepository.getProductosByIds(ids);
      res.status(200).json(productos);
    } catch (error) {
      console.error('Error retrieving products by ids:', error);
      res.status(500).json({ error: error.message });
    }
  }

    async getProductosByIdsController(req, res) {
    try {
      const { ids } = req.body;
      const productos = await this.getProductosByIdsUseCase.execute(ids);
      res.status(200).json(productos);
    } catch (error) {
      console.error('Error retrieving products by ids:', error);
      res.status(500).json({ error: error.message });
    }
  }
}