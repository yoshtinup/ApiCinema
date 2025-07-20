import { Order } from "../Dominio/models/Order.js";

export class CreateOrderBase {
  constructor(pagoRepository) {
    this.pagoRepository = pagoRepository;
  }

  /**
   * Crea una orden con los items y datos proporcionados
   * @param {Object} orderData - Datos de la orden
   * @returns {Promise<Order>} - La orden creada
   */
  async execute(orderData) {
    console.log('🔥🔥🔥 CREATE ORDER BASE EJECUTADO 🔥🔥🔥');
    console.log('Stack trace:', new Error().stack);
    console.log('orderData:', orderData);
    console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥');
    
    const {
      user_id,
      items = [],
      total = 0,
      status = "pending",
      created_at = new Date().toISOString(),
      dispenser_id = null,
      nfc = null
    } = orderData;

    // Mantener items como array (sin transformar a apartados)
    const order = new Order(
      undefined,
      user_id,
      items, // Array normal
      total,
      status,
      created_at,
      dispenser_id
    );
    
    order.nfc = nfc;

    return await this.pagoRepository.createOrder(order);
  }
}
