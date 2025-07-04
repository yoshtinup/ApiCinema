export class DeleteProductoById {
    constructor(ProductoRepository) {
      this.ProductoRepository = ProductoRepository; // Inyección del puerto (repositorio)
    }
  
    /**
     * Ejecutar la eliminación de un cliente por su ID.
     * @param {number} id - El ID del cliente.
     * @returns {Promise<boolean>} - `true` si el cliente fue eliminado, `false` si no se encontró.
     */
    async execute(id) {
      return await this.ProductoRepository.deleteProductoById(id);
    }
  }
  