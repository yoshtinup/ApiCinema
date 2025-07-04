export class GetProductoById {
    constructor(productoRepository) {
      this.productoRepository = productoRepository; // Inyección del puerto (repositorio)
    }
  
    /**
     * Ejecutar la obtención de un cliente por su ID.
     * @param {number} id- El ID del cliente.
     * @returns {Promise<Object>} - Los datos del cliente encontrado.
     */
    async execute(id) {
      return await this.productoRepository.getProductoById(id);
    }
  }
  