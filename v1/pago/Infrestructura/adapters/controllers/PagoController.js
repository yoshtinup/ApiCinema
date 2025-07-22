
import { Create } from '../../../Aplicativo/Create.js';
import { CompletePayment } from '../../../Aplicativo/CompletePayment.js';
import { GetOrdersByUserId } from '../../../Aplicativo/GetOrdersByUserId.js';
import { GetProductosByIds } from '../../../Aplicativo/GetProductosByIds.js';
import { GetOrdersByNFC } from '../../../Aplicativo/GetOrdersByNFC.js';
import { GetPendingOrdersByNFC } from '../../../Aplicativo/GetPendingOrdersByNFC.js';
import { SelectOrderForDispensing } from '../../../Aplicativo/SelectOrderForDispensing.js';
import { GetReadyOrderByNFC } from '../../../Aplicativo/GetReadyOrderByNFC.js';
import { DispenseOrderByNFC } from '../../../Aplicativo/DispenseOrderByNFC.js';
import { UpdateOrderStatusByNFC } from '../../../Aplicativo/UpdateOrderStatusByNFC.js';

export class PagoController {
  constructor(pagoRepository, carritoRepository) {
    this.createUseCase = new Create(pagoRepository);
    this.completePaymentUseCase = new CompletePayment(pagoRepository, carritoRepository);
    this.getOrdersByUserIdUseCase = new GetOrdersByUserId(pagoRepository);
    this.getProductosByIdsUseCase = new GetProductosByIds(pagoRepository);
    this.getOrdersByNFCUseCase = new GetOrdersByNFC(pagoRepository);
    this.getPendingOrdersByNFCUseCase = new GetPendingOrdersByNFC(pagoRepository);
    this.selectOrderForDispensingUseCase = new SelectOrderForDispensing(pagoRepository);
    this.getReadyOrderByNFCUseCase = new GetReadyOrderByNFC(pagoRepository);
    this.dispenseOrderByNFCUseCase = new DispenseOrderByNFC(pagoRepository);
    this.updateOrderStatusByNFCUseCase = new UpdateOrderStatusByNFC(pagoRepository);
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
        dispenser_id: req.body.dispenser_id || null,
        nfc: req.user?.nfc || req.body.nfc || null // Agregar NFC del usuario autenticado
      };
      
      // Log para verificar qué NFC llega
      console.log('=== COMPLETE PAYMENT DEBUG ===');
      console.log('req.user?.nfc:', req.user?.nfc);
      console.log('req.body.nfc:', req.body.nfc);
      console.log('paymentData.nfc final:', paymentData.nfc);
      console.log('paymentData completo:', paymentData);
      console.log('===============================');
      
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

  /**
   * Obtener órdenes por código NFC.
   * @param {Object} req - La solicitud HTTP.
   * @param {Object} res - La respuesta HTTP.
   */
  async getOrdersByNFC(req, res) {
    try {
      const { nfc } = req.params;
      
      // Validar que el NFC esté presente
      if (!nfc) {
        return res.status(400).json({ message: 'NFC parameter is required' });
      }

      // Ejecutar el caso de uso para obtener las órdenes por NFC
      const orders = await this.getOrdersByNFCUseCase.execute(nfc);
      
      // Si no se encuentran órdenes, devolver un array vacío con mensaje informativo
      if (!orders || orders.length === 0) {
        return res.status(200).json({ 
          message: 'No orders found for this NFC', 
          orders: [] 
        });
      }

      // Devolver las órdenes encontradas
      res.status(200).json({
        message: `Found ${orders.length} order(s) for NFC: ${nfc}`,
        orders: orders
      });
    } catch (error) {
      console.error('Error retrieving orders by NFC:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obtener órdenes pendientes de dispensar por código NFC.
   * Solo devuelve órdenes con estado 'paid'.
   * @param {Object} req - La solicitud HTTP.
   * @param {Object} res - La respuesta HTTP.
   */
  async getPendingOrdersByNFC(req, res) {
    try {
      const { nfc } = req.params;
      
      // Validar que el NFC esté presente
      if (!nfc) {
        return res.status(400).json({ message: 'NFC parameter is required' });
      }

      // Ejecutar el caso de uso para obtener las órdenes pendientes por NFC
      const orders = await this.getPendingOrdersByNFCUseCase.execute(nfc);
      
      // Si no se encuentran órdenes pendientes
      if (!orders || orders.length === 0) {
        return res.status(200).json({ 
          message: 'No pending orders found for this NFC', 
          orders: [],
          availableForDispensing: 0
        });
      }

      // Devolver las órdenes pendientes encontradas
      res.status(200).json({
        message: `Found ${orders.length} pending order(s) for NFC: ${nfc}`,
        orders: orders,
        availableForDispensing: orders.length
      });
    } catch (error) {
      console.error('Error retrieving pending orders by NFC:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Seleccionar una orden específica para dispensar.
   * La orden queda "cargada" en el NFC para dispensar automáticamente al escanear.
   * @param {Object} req - La solicitud HTTP.
   * @param {Object} res - La respuesta HTTP.
   */
  async selectOrderForDispensing(req, res) {
    try {
      const { orderId, nfc } = req.params;
      const { dispenserId } = req.body;
      
      // Validar parámetros requeridos
      if (!orderId) {
        return res.status(400).json({ message: 'Order ID parameter is required' });
      }
      
      if (!nfc) {
        return res.status(400).json({ message: 'NFC parameter is required' });
      }

      // Ejecutar el caso de uso para seleccionar la orden
      const selectedOrder = await this.selectOrderForDispensingUseCase.execute(
        orderId, 
        nfc, 
        dispenserId
      );

      res.status(200).json({
        message: 'Order loaded to NFC successfully! Ready for dispensing on next scan.',
        order: selectedOrder,
        instructions: 'The selected order is now loaded to your NFC. Simply scan your NFC at any dispenser to get your order.'
      });
    } catch (error) {
      console.error('Error selecting order for dispensing:', error);
      
      // Manejar errores específicos
      if (error.message.includes('not found') || error.message.includes('does not belong')) {
        return res.status(404).json({ error: error.message });
      }
      
      if (error.message.includes('cannot be dispensed') || error.message.includes('status')) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obtener la orden que está preparada para dispensar en un NFC.
   * Devuelve la orden seleccionada por el usuario o la más antigua por defecto.
   * @param {Object} req - La solicitud HTTP.
   * @param {Object} res - La respuesta HTTP.
   */
  async getReadyOrderByNFC(req, res) {
    try {
      const { nfc } = req.params;
      
      if (!nfc) {
        return res.status(400).json({ message: 'NFC parameter is required' });
      }

      const readyOrder = await this.getReadyOrderByNFCUseCase.execute(nfc);

      res.status(200).json({
        message: readyOrder.selectedByUser ? 
          'User selected order ready for dispensing' : 
          'Default order ready for dispensing',
        order: readyOrder,
        isUserSelected: readyOrder.selectedByUser,
        isDefault: readyOrder.isDefault || false
      });
    } catch (error) {
      console.error('Error getting ready order by NFC:', error);
      
      if (error.message.includes('No orders available')) {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Dispensar la orden cargada en el NFC.
   * Este endpoint se llamaría cuando el usuario escanea su NFC en el dispensador.
   * @param {Object} req - La solicitud HTTP.
   * @param {Object} res - La respuesta HTTP.
   */
  async dispenseOrderByNFC(req, res) {
    try {
      const { nfc } = req.params;
      const { dispenserId } = req.body;
      
      if (!nfc) {
        return res.status(400).json({ message: 'NFC parameter is required' });
      }

      if (!dispenserId) {
        return res.status(400).json({ message: 'Dispenser ID is required' });
      }

      const dispensedOrder = await this.dispenseOrderByNFCUseCase.execute(nfc, dispenserId);

      res.status(200).json({
        message: '🎉 Order dispensed successfully!',
        order: dispensedOrder,
        dispensedAt: dispensedOrder.dispensedAt,
        wasUserSelected: dispensedOrder.wasUserSelected,
        instructions: 'Please collect your items from the dispenser.'
      });
    } catch (error) {
      console.error('Error dispensing order by NFC:', error);
      
      if (error.message.includes('No orders available')) {
        return res.status(404).json({ error: error.message });
      }
      
      if (error.message.includes('cannot be dispensed') || error.message.includes('status')) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Actualiza el status de una orden por NFC
   * @param {Object} req - La solicitud HTTP.
   * @param {Object} res - La respuesta HTTP.
   */
  async updateOrderStatusByNFC(req, res) {
    try {
      const { nfc } = req.params;
      const { status } = req.body;

      if (!nfc) {
        return res.status(400).json({ error: 'NFC es requerido' });
      }

      if (!status) {
        return res.status(400).json({ error: 'Status es requerido en el body' });
      }

      const result = await this.updateOrderStatusByNFCUseCase.execute(nfc, status);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error updating order status by NFC:', error);
      
      if (error.message.includes('No se encontró ninguna orden')) {
        return res.status(404).json({ error: error.message });
      }
      
      if (error.message.includes('Status inválido') || 
          error.message.includes('Transición de estado no válida') ||
          error.message.includes('es requerido')) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ error: error.message });
    }
  }
}