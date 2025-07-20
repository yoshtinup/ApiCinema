export class GetOrdersByNFC {
  constructor(ordenRepository) {
    this.ordenRepository = ordenRepository;
  }

  /**
   * Ejecutar la obtención de órdenes por NFC.
   * @param {string} nfc - El código NFC del usuario.
   * @returns {Promise<Array>} - Lista de órdenes del usuario.
   */
  async execute(nfc) {
    return await this.ordenRepository.getOrdersByNFC(nfc);
  }
}
