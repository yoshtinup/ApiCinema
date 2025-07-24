
export class CreatePaymentUseCase {
    constructor(servicesRepository) {
      this.servicesRepository = servicesRepository; // Inyección del puerto (repositorio)
    }
  
    /**
     * Ejecutar la creación de una preferencia de pago.
     * @param {Object} item - Los detalles del producto para crear la preferencia de pago.
     * @param {string} orderId - ID de la orden (opcional).
     * @returns {Promise<Object>} - Los enlaces de pago generados.
     */
    async execute(item, orderId = null) {
      // Validar entrada
      if (!item || !item.title || !item.unit_price) {
        throw new Error('Datos del item inválidos: se requiere title y unit_price');
      }
      
      // Llamar al repositorio para crear la preferencia de pago
      return await this.servicesRepository.createPayment(item, orderId);
    }
  }

  