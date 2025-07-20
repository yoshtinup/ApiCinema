export class GetPendingOrdersByNFC {
  constructor(pagoRepository) {
    this.pagoRepository = pagoRepository;
  }

  /**
   * Ejecutar la obtención de órdenes pendientes de dispensar por NFC.
   * Solo devuelve órdenes con estado 'paid' (pagadas pero no dispensadas).
   * @param {string} nfc - El código NFC del usuario.
   * @returns {Promise<Array>} - Lista de órdenes pendientes de dispensar.
   */
  async execute(nfc) {
    return await this.pagoRepository.getPendingOrdersByNFC(nfc);
  }
}
