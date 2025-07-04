
import { ProductoUser } from "../Dominio/models/ProductoUser.js";

export class CreateProducto {
  constructor(productoRepository) {
    this.productoRepository = productoRepository; // Inyección del puerto (repositorio)
  }

  /**
   * Método para ejecutar la creación de un nuevo producto.
   * @param {Object} productoData - Datos del producto.
   * @returns {Promise<ProductoUser>} - El producto creado.
   */
  async execute(productoData) {
    // Extraer los campos de los datos proporcionados
    const { id, nombre, descripcion, precio, peso, cantidad, categoria, ingreso, imagen } = productoData;

    // Crear una instancia de la entidad Boleto con los datos (aplica validaciones si es necesario)
    const producto = new ProductoUser(id, nombre, descripcion, precio, peso, cantidad, categoria, ingreso, imagen);

    // Guardar el producto en el repositorio
    return await this.productoRepository.createNewProducto(producto);
  }
}
