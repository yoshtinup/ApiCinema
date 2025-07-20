export class DispenseOrderByNFC {
  constructor(pagoRepository) {
    this.pagoRepository = pagoRepository;
  }

  /**
   * Dispensar la orden cargada en el NFC o la orden por defecto.
   * Cambia el estado de la orden a 'dispensed'.
   * @param {string} nfc - Código NFC del usuario.
   * @param {string} dispenserId - ID del dispensador que está dispensando.
   * @returns {Promise<Object>} - Información de la orden dispensada.
   */
  async execute(nfc, dispenserId) {
    // Obtener la orden preparada para este NFC
    const readyOrder = await this.pagoRepository.getSelectedOrderByNFC(nfc) || 
                      await this._getDefaultOrder(nfc);
    
    if (!readyOrder) {
      throw new Error('No orders available for dispensing for this NFC');
    }

    // Validar que la orden esté en estado correcto
    if (readyOrder.status !== 'paid') {
      throw new Error(`Order cannot be dispensed. Current status: ${readyOrder.status}`);
    }

    // Marcar orden como dispensada
    const dispensedOrder = await this.pagoRepository.markOrderAsDispensed(
      readyOrder.order_id, 
      dispenserId
    );

    // Limpiar la selección del NFC ya que la orden fue dispensada
    await this.pagoRepository.clearSelectedOrderFromNFC(nfc);

    return {
      ...dispensedOrder,
      dispensedAt: new Date().toISOString(),
      dispenserId: dispenserId,
      message: 'Order dispensed successfully',
      wasUserSelected: readyOrder.selectedByUser || false
    };
  }

  /**
   * Obtener la orden por defecto (más antigua) si no hay una seleccionada
   * @param {string} nfc - Código NFC del usuario
   * @returns {Promise<Object|null>} - La orden por defecto o null
   */
  async _getDefaultOrder(nfc) {
    const pendingOrders = await this.pagoRepository.getPendingOrdersByNFC(nfc);
    
    if (!pendingOrders || pendingOrders.length === 0) {
      return null;
    }

    return {
      ...pendingOrders[0],
      selectedByUser: false,
      isDefault: true
    };
  }
}
