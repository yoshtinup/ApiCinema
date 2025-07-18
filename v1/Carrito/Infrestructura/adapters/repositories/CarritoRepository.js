
import { IProductoRepository } from '../../../Dominio/ports/IProductoRepository.js';
import { db } from '../../../../../database/mysql.js';

export class CarritoRepository extends IProductoRepository {
  async getAllProducto() {
    const sql = "SELECT * FROM carrito"; // Cambié la tabla a carrito para reflejar un sistema de boletos
    try {
      const [data] = await db.query(sql);
      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error retrieving clients');
    }
  }
  async getProductoById(id) {
    const sql = "SELECT * FROM carrito WHERE id=?";
    const params = [id];
    try {
      const [result] = await db.query(sql, params);
      return result[0]; // Devolvemos el primer resultado ya que la búsqueda es por ID
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error retrieving History by ID');
    }
  }
  
  // Método para crear un nuevo cliente en la base de datos
  async deleteProductoById(id) {
    const sql = 'DELETE FROM carrito WHERE id = ?';
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
    const sql = "UPDATE carrito SET iduser = ?, idproducto = ?, fecha = ?, hora = ? WHERE id = ?";
    const params = [
      producto.iduser ?? null,
      producto.idproducto ?? null,
      producto.fecha ?? null,
      producto.hora ?? null,
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
  
  async createNewProducto(producto) {
    // Cambié la tabla y los campos para reflejar un sistema de boletos
    const sql = "INSERT INTO carrito (iduser, idproducto, fecha, hora) VALUES ( ?, ?, ?, ?)";

    // Convertir valores undefined a null y obtener valores de la instancia `boleto`
    const params = [
      producto.iduser ?? null,
      producto.idproducto ?? null,
      producto.fecha ?? null,
      producto.hora ?? null
    ];
  
    try {
      // Ejecutar la consulta SQL con los parámetros
      const [resultado] = await db.query(sql, params);
  
      // Devolver los datos del boleto creado, incluyendo el ID generado
      return {
        id: resultado.insertId,
        iduser: producto.iduser,
        idproducto: producto.idproducto,
        fecha: producto.fecha,
        hora: producto.hora
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error creating new Producto');
    }
  }

  // Nuevo método para obtener los elementos del carrito por ID de usuario
  async getCartItemsByUserId(userId) {
    const sql = "SELECT * FROM carrito WHERE iduser = ?";
    const params = [userId];
    try {
      const [results] = await db.query(sql, params);
      return results;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error retrieving cart items by user ID');
    }
  }

  // Nuevo método para obtener detalles del producto
  async getProductDetails(productId) {
    const sql = "SELECT * FROM productos WHERE id = ?";
    const params = [productId];
    try {
      const [results] = await db.query(sql, params);
      return results[0];
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error retrieving product details');
    }
  }

  // Método opcional para limpiar el carrito del usuario después del pago
  async clearUserCart(userId) {
    const sql = "DELETE FROM carrito WHERE iduser = ?";
    const params = [userId];
    try {
      const [result] = await db.query(sql, params);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error clearing user cart');
    }
  }
}


