export class CreatePaymentPreference {
  constructor(paymentService, carritoRepository) {
    this.paymentService = paymentService;
    this.carritoRepository = carritoRepository;
  }

  /**
   * Crea una preferencia de pago con los items del carrito del usuario
   * @param {string} userId - ID del usuario
   * @param {string} nfc - Código NFC (opcional)
   * @returns {Promise<Object>} Preferencia de pago creada
   */
  async execute(userId, nfc = null) {
    try {
      console.log(`🛒 Obteniendo carrito del usuario ${userId}`);

      // 1. Obtener items del carrito
      const cartItems = await this.carritoRepository.getCartItemsByUserId(userId);

      if (!cartItems || cartItems.length === 0) {
        throw new Error('El carrito está vacío');
      }

      console.log(`📦 Items en carrito: ${cartItems.length}`);

      // 2. Validar stock disponible
      await this.validateStock(cartItems);

      // 3. Crear preferencia de MercadoPago
      const preference = await this.paymentService.createPreference({
        user_id: userId,
        items: cartItems,
        nfc: nfc
      });

      console.log('✅ Preferencia de pago creada exitosamente');

      return {
        preference_id: preference.preference_id,
        init_point: preference.init_point,
        items: preference.items,
        total: preference.total,
        message: 'Preferencia de pago creada. Redirige al usuario a init_point para completar el pago.'
      };

    } catch (error) {
      console.error('❌ Error en CreatePaymentPreference:', error);
      throw error;
    }
  }

  /**
   * Valida que haya stock suficiente para todos los items
   */
  async validateStock(cartItems) {
    for (const item of cartItems) {
      if (item.stock_disponible < item.cantidad) {
        throw new Error(
          `Stock insuficiente para ${item.nombre}. ` +
          `Disponible: ${item.stock_disponible}, Solicitado: ${item.cantidad}`
        );
      }
    }
  }
}