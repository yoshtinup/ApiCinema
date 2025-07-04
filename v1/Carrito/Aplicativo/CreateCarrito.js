
import { CarritosUser } from "../Dominio/models/CarritosUser.js";

export class CreateCarrito {
  constructor(productoRepository) {
    this.productoRepository = productoRepository; // Inyección del puerto (repositorio)
  }

  /**
   * Método para ejecutar la creación de un nuevo producto.
   * @param {Object} productoData - Datos del producto.
   * @returns {Promise<CarritosUser>} - El producto creado.
   */
  async execute(productoData) {
    // Extraer los campos de los datos proporcionados
    const { id, iduser, idproducto, fecha, hora } = productoData;

    // Crear una instancia de la entidad Boleto con los datos (aplica validaciones si es necesario)
    const producto = new CarritosUser(id, iduser, idproducto, fecha, hora);

    // Guardar el producto en el repositorio
    return await this.productoRepository.createNewProducto(producto);
  }
}
