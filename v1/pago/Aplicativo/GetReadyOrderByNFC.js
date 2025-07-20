export class GetReadyOrderByNFC {
  constructor(pagoRepository) {
    this.pagoRepository = pagoRepository;
  }

  /**
   * Obtener la orden que está preparada/cargada para dispensar en un NFC específico.
   * Si no hay orden seleccionada, devuelve la más antigua por defecto.
   * @param {string} nfc - Código NFC del usuario.
   * @returns {Promise<Object>} - La orden preparada para dispensar.
   */
  async execute(nfc) {
    // Primero buscar si hay una orden específicamente seleccionada para este NFC
    let readyOrder = await this.pagoRepository.getSelectedOrderByNFC(nfc);
    
    if (readyOrder) {
      return {
        ...readyOrder,
        selectedByUser: true,
        message: 'User selected order ready for dispensing'
      };
    }

    // Si no hay orden seleccionada, obtener la más antigua por defecto
    const pendingOrders = await this.pagoRepository.getPendingOrdersByNFC(nfc);
    
    if (!pendingOrders || pendingOrders.length === 0) {
      throw new Error('No orders available for dispensing for this NFC');
    }

    // Tomar la primera (más antigua) como orden por defecto
    const defaultOrder = pendingOrders[0];
    
    return {
      ...defaultOrder,
      selectedByUser: false,
      message: 'Default order (oldest) ready for dispensing',
      isDefault: true
    };
  }
}
