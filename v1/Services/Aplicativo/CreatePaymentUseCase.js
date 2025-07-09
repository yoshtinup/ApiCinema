
export class CreatePaymentUseCase {
    constructor(servicesRepository) {
      this.servicesRepository = servicesRepository; // Inyección del puerto (repositorio)
    }
  
    /**
     * Ejecutar la creación de una preferencia de pago.
     * @param {Object} item - Los detalles del producto para crear la preferencia de pago.
     * @returns {Promise<Object>} - Los enlaces de pago generados.
     */
    async execute(item) {
      // Llamar al repositorio para crear la preferencia de pago
      return await this.servicesRepository.createPayment(item);
    }
  }

  