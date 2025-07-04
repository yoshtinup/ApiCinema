
import { IProductoRepository } from '../../../Dominio/ports/IProductoRepository.js';
import { db } from '../../../../../database/mysql.js';

export class ProductoRepository extends IProductoRepository {
  // Método para crear un nuevo cliente en la base de datos
  async deleteProductoById(id) {
    const sql = 'DELETE FROM producto WHERE id = ?';
    const params = [id];
    try {
      const [result] = await db.query(sql, params);
      return result.affectedRows > 0; // Devuelve `true` si se eliminó un registro, `false` si no
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error deleting client');
    }
  }
  
  async updateProductoById(id, producto) {
    const sql = "UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, peso = ?, cantidad = ?, categoria = ?, ingreso = ?, imagen = ? WHERE id = ?";
    const params = [
      producto.nombre ?? null,
      producto.descripcion ?? null,
      producto.precio ?? null,
      producto.peso ?? null,
      producto.cantidad ?? null,
      producto.categoria ?? null,
      producto.ingreso ?? null,
      producto.imagen ?? null,
      id
    ];
  
    try {
      const [result] = await db.query(sql, params);
      
      // Verificar si se actualizó algún registro
      if (result.affectedRows === 0) {
        throw new Error('Producto not found');
      }
      
      return result;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error updating producto');
    }
  }  
  
  async getAllProducto() {
    const sql = "SELECT * FROM productos";
    try {
      const [data] = await db.query(sql);
      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error retrieving clients');
    }
  }
  async getProductoById(id) {
    const sql = "SELECT * FROM productos WHERE id=?";
    const params = [id];
    try {
      const [result] = await db.query(sql, params);
      return result[0]; // Devolvemos el primer resultado ya que la búsqueda es por ID
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error retrieving History by ID');
    }
  }
  
  async createNewProducto(producto) {
    // Cambié la tabla y los campos para reflejar un sistema de boletos
    const sql = "INSERT INTO productos (nombre, descripcion, precio, peso, cantidad, categoria, ingreso, imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    // Convertir valores undefined a null y obtener valores de la instancia `boleto`
    const params = [
      producto.nombre ?? null,
      producto.descripcion ?? null,
      producto.precio ?? null,
      producto.peso ?? null,
      producto.cantidad ?? null,
      producto.categoria ?? null,
      producto.ingreso ?? null,
      producto.imagen ?? null
    ];
  
    try {
      // Ejecutar la consulta SQL con los parámetros
      const [resultado] = await db.query(sql, params);
  
      // Devolver los datos del boleto creado, incluyendo el ID generado
      return {
        id: resultado.insertId,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        peso: producto.peso,
        cantidad: producto.cantidad,
        categoria: producto.categoria,
        ingreso: producto.ingreso,
        imagen: producto.imagen
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error creating new Producto');
    }
  }

}


