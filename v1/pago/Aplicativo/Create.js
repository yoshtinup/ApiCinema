
import { User } from "../Dominio/models/User.js";

export class Create {
  constructor(productoRepository) {
    this.productoRepository = productoRepository; // Inyección del puerto (repositorio)
  }

  /**
   * Método para ejecutar la creación de un nuevo producto.
   * @param {Object} productoData - Datos del producto.
   * @returns {Promise<User>} - El producto creado.
   */
  async execute(productoData) {
    // Extraer los campos de los datos proporcionados
    const { id, iduser, idproducto, cantidad, codigo } = productoData;

    // Crear una instancia de la entidad Boleto con los datos (aplica validaciones si es necesario)
    const producto = new User(id, iduser, idproducto, cantidad, codigo);

    // Guardar el producto en el repositorio
    return await this.productoRepository.createNewProducto(producto);
  }
}
