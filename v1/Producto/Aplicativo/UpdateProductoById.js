export class UpdateProductoById {
    constructor(productoRepository) {
      this.productoRepository = productoRepository; // Inyección del puerto (repositorio)
    }
  
    /**
     * Ejecutar la actualización de un cliente por su ID.
     * @param {number} id - El ID del cliente.
     * @param {Object} productoData - Los datos del cliente para actualizar.
     * @returns {Promise<Object>} - Los datos del cliente actualizado.
     */
    async execute(id, productoData) {
      return await this.productoRepository.updateProductoById(id, productoData);
    }
  }
  