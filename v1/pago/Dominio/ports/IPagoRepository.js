export class IPagoRepository {
  async createNewProducto(producto) {
    throw new Error('Method not implemented');
  }

  async createOrder(order) {
    throw new Error('Method not implemented');
  }

  async updateOrderStatus(orderId, status) {
    throw new Error('Method not implemented');
  }

  async getOrderById(orderId) {
    throw new Error('Method not implemented');
  }

  async getOrdersByUserId(userId) {
    throw new Error('Method not implemented');
  }

  async getOrdersByNFC(nfc) {
    throw new Error('Method not implemented');
  }

  async getPendingOrdersByNFC(nfc) {
    throw new Error('Method not implemented');
  }

  async getOrderByIdAndNFC(orderId, nfc) {
    throw new Error('Method not implemented');
  }

  async markOrderForDispensing(orderId, dispenserId) {
    throw new Error('Method not implemented');
  }

  async clearPreviousSelectedOrder(nfc) {
    throw new Error('Method not implemented');
  }

  async markOrderAsSelectedForNFC(orderId, nfc, dispenserId) {
    throw new Error('Method not implemented');
  }

  async getSelectedOrderByNFC(nfc) {
    throw new Error('Method not implemented');
  }

  async markOrderAsDispensed(orderId, dispenserId) {
    throw new Error('Method not implemented');
  }

  async clearSelectedOrderFromNFC(nfc) {
    throw new Error('Method not implemented');
  }
}