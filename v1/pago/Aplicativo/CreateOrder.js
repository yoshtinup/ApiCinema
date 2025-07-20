import { CreateOrderBase } from "./CreateOrderBase.js";

export class CreateOrder {
  constructor(pagoRepository) {
    this.createOrderBase = new CreateOrderBase(pagoRepository);
  }

  /**
   * Crea una nueva orden directamente con items específicos.
   * @param {Object} orderData - Datos de la orden.
   * @returns {Promise<Order>} - La orden creada.
   */
  async execute(orderData) {
    return await this.createOrderBase.execute(orderData);
  }
}
