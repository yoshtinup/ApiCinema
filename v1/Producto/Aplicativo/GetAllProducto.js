export class GetAllProducto {
    constructor(productoRepository) {
      this.productoRepository = productoRepository; // Inyección del puerto (repositorio)
    }
  
    /**
     * Ejecutar la obtención de todos los clientes.
     * @returns {Promise<Array>} - Lista de todos los clientes registrados.
     */
    async execute() {
      return await this.productoRepository.getAllProducto();
    }
  }
  