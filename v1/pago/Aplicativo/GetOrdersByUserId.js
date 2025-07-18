export class GetOrdersByUserId {
  constructor(pagoRepository) {
    this.pagoRepository = pagoRepository;
  }
     /**
     * Ejecutar la obtención de todos los clientes.
     * @param {number} id - El ID del cliente a buscar.
     * //retornara una lista de ordenes
     * @returns {Promise<Array>} - El cliente encontrado.
     * 
     */
     async execute(id) {
        return await this.pagoRepository.getOrdersByUserId(id);
      }
}