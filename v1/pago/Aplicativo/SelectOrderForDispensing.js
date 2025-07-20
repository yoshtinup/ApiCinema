export class SelectOrderForDispensing {
  constructor(pagoRepository) {
    this.pagoRepository = pagoRepository;
  }

  /**
   * Seleccionar una orden específica para dispensar y asignarla al NFC del usuario.
   * Esta orden quedará "cargada" en el NFC para ser dispensada automáticamente al escanear.
   * @param {string} orderId - ID de la orden a dispensar.
   * @param {string} nfc - Código NFC del usuario.
   * @param {string} dispenserId - ID del dispensador (opcional).
   * @returns {Promise<Object>} - La orden seleccionada con su información completa.
   */
  async execute(orderId, nfc, dispenserId = null) {
    // Validar que la orden existe y pertenece al usuario
    const order = await this.pagoRepository.getOrderByIdAndNFC(orderId, nfc);
    
    if (!order) {
      throw new Error('Order not found or does not belong to this user');
    }

    // Validar que la orden esté en estado correcto para dispensar
    if (order.status !== 'paid') {
      throw new Error(`Order cannot be dispensed. Current status: ${order.status}. Only 'paid' orders can be dispensed.`);
    }

    // Primero limpiar cualquier orden previamente seleccionada para este NFC
    await this.pagoRepository.clearPreviousSelectedOrder(nfc);

    // Marcar esta orden como seleccionada/preparada para dispensar en este NFC
    const updatedOrder = await this.pagoRepository.markOrderAsSelectedForNFC(orderId, nfc, dispenserId);
    
    return {
      ...updatedOrder,
      message: 'Order loaded to NFC successfully. Ready for dispensing on next scan.',
      nfc: nfc,
      readyForDispensing: true
    };
  }
}
