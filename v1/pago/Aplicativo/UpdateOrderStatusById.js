/**
 * Caso de uso para actualizar el estado de una orden por su ID
 */
export class UpdateOrderStatusById {
  constructor(pagoRepository) {
    this.pagoRepository = pagoRepository;
  }

  /**
   * Ejecuta la actualización del estado de una orden por ID
   * @param {string|number} orderId - ID de la orden
   * @param {string} newStatus - Nuevo estado
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async execute(orderId, newStatus) {
    if (!orderId) {
      throw new Error('Order ID es requerido');
    }

    if (!newStatus) {
      throw new Error('Status es requerido');
    }

    // Validar que el estado sea uno de los permitidos
    const validStatuses = ['pending', 'processing', 'completed', 'canceled', 'dispensed'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Status inválido: ${newStatus}. Los estados válidos son: ${validStatuses.join(', ')}`);
    }

    // Buscar la orden por ID
    const order = await this.pagoRepository.findOrderById(orderId);
    if (!order) {
      throw new Error(`No se encontró una orden con ID: ${orderId}`);
    }

    // Verificar si el estado actual es igual al nuevo estado
    if (order.status === newStatus) {
      return {
        message: `La orden ya tiene el estado '${newStatus}'`,
        order: order
      };
    }

    // Actualizar el estado
    const updatedOrder = await this.pagoRepository.updateOrderStatus(orderId, newStatus);

    return {
      message: `Estado de la orden actualizado a: ${newStatus}`,
      order: updatedOrder
    };
  }
}
