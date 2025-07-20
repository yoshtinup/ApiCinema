export class UpdateApartadoById {
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  /**
   * Actualiza el campo no_apartado de un producto específico
   * @param {number} id - ID del producto
   * @param {number} no_apartado - Nuevo valor de apartado
   * @returns {Promise<Object>} - Producto actualizado
   */
  async execute(id, no_apartado) {
    if (no_apartado < 0) {
      throw new Error('El número de apartado no puede ser negativo');
    }
    
    return await this.productoRepository.updateApartadoById(id, no_apartado);
  }
}
