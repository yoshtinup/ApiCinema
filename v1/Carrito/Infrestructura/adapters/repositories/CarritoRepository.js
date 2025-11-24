
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
    // Verificar si el producto ya existe en el carrito del usuario
    const checkSql = "SELECT id, cantidad FROM carrito WHERE iduser = ? AND idproducto = ?";
    const checkParams = [producto.iduser, producto.idproducto];
    
    try {
      const [existing] = await db.query(checkSql, checkParams);
      
      // Si ya existe, incrementar la cantidad
      if (existing.length > 0) {
        const newQuantity = existing[0].cantidad + (producto.cantidad || 1);
        const updateSql = "UPDATE carrito SET cantidad = ?, fecha = ?, hora = ? WHERE id = ?";
        const updateParams = [
          newQuantity,
          producto.fecha ?? new Date().toISOString().split('T')[0],
          producto.hora ?? new Date().toTimeString().split(' ')[0],
          existing[0].id
        ];
        
        await db.query(updateSql, updateParams);
        
        return {
          id: existing[0].id,
          iduser: producto.iduser,
          idproducto: producto.idproducto,
          cantidad: newQuantity,
          fecha: producto.fecha,
          hora: producto.hora,
          action: 'updated'
        };
      }
      
      // Si no existe, crear nuevo registro
      const insertSql = "INSERT INTO carrito (iduser, idproducto, cantidad, fecha, hora) VALUES (?, ?, ?, ?, ?)";
      const insertParams = [
        producto.iduser ?? null,
        producto.idproducto ?? null,
        producto.cantidad ?? 1,
        producto.fecha ?? new Date().toISOString().split('T')[0],
        producto.hora ?? new Date().toTimeString().split(' ')[0]
      ];
      
      const [resultado] = await db.query(insertSql, insertParams);
      
      return {
        id: resultado.insertId,
        iduser: producto.iduser,
        idproducto: producto.idproducto,
        cantidad: producto.cantidad ?? 1,
        fecha: producto.fecha,
        hora: producto.hora,
        action: 'created'
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw error;
    }
  }

  // Nuevo método para obtener los elementos del carrito por ID de usuario
  async getCartItemsByUserId(userId) {
    const sql = `
      SELECT 
        c.id,
        c.iduser,
        c.idproducto,
        c.cantidad,
        c.fecha,
        c.hora,
        p.nombre,
        p.descripcion,
        p.precio,
        p.peso,
        p.categoria,
        p.imagen,
        p.cantidad as stock_disponible,
        (c.cantidad * p.precio) as subtotal
      FROM carrito c
      INNER JOIN productos p ON c.idproducto = p.id
      WHERE c.iduser = ?
      ORDER BY c.fecha DESC, c.hora DESC
    `;
    const params = [userId];
    try {
      const [results] = await db.query(sql, params);
      return results;
    } catch (error) {
      console.error('Database Error:', error);
      throw error;
    }
  }

  // Método para incrementar cantidad de un producto en el carrito
  async incrementQuantity(userId, productId) {
    const sql = "UPDATE carrito SET cantidad = cantidad + 1 WHERE iduser = ? AND idproducto = ?";
    const params = [userId, productId];
    try {
      const [result] = await db.query(sql, params);
      if (result.affectedRows === 0) {
        throw new Error('Cart item not found');
      }
      
      // Obtener la cantidad actualizada
      const [updated] = await db.query(
        "SELECT cantidad FROM carrito WHERE iduser = ? AND idproducto = ?",
        [userId, productId]
      );
      
      return {
        success: true,
        message: 'Cantidad incrementada',
        cantidad: updated[0].cantidad
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw error;
    }
  }

  // Método para decrementar cantidad de un producto en el carrito
  async decrementQuantity(userId, productId) {
    // Primero verificar la cantidad actual
    const checkSql = "SELECT cantidad FROM carrito WHERE iduser = ? AND idproducto = ?";
    const checkParams = [userId, productId];
    
    try {
      const [current] = await db.query(checkSql, checkParams);
      
      if (current.length === 0) {
        throw new Error('Cart item not found');
      }
      
      // Si la cantidad es 1, eliminar el item
      if (current[0].cantidad <= 1) {
        const deleteSql = "DELETE FROM carrito WHERE iduser = ? AND idproducto = ?";
        await db.query(deleteSql, [userId, productId]);
        
        return {
          success: true,
          message: 'Producto eliminado del carrito',
          cantidad: 0,
          removed: true
        };
      }
      
      // Si es mayor a 1, decrementar
      const updateSql = "UPDATE carrito SET cantidad = cantidad - 1 WHERE iduser = ? AND idproducto = ?";
      await db.query(updateSql, [userId, productId]);
      
      // Obtener la cantidad actualizada
      const [updated] = await db.query(checkSql, checkParams);
      
      return {
        success: true,
        message: 'Cantidad decrementada',
        cantidad: updated[0].cantidad,
        removed: false
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw error;
    }
  }

  // Método para actualizar cantidad directamente
  async updateQuantity(userId, productId, quantity) {
    if (quantity < 1) {
      // Si la cantidad es menor a 1, eliminar el item
      const deleteSql = "DELETE FROM carrito WHERE iduser = ? AND idproducto = ?";
      await db.query(deleteSql, [userId, productId]);
      
      return {
        success: true,
        message: 'Producto eliminado del carrito',
        cantidad: 0,
        removed: true
      };
    }
    
    const sql = "UPDATE carrito SET cantidad = ? WHERE iduser = ? AND idproducto = ?";
    const params = [quantity, userId, productId];
    
    try {
      const [result] = await db.query(sql, params);
      
      if (result.affectedRows === 0) {
        throw new Error('Cart item not found');
      }
      
      return {
        success: true,
        message: 'Cantidad actualizada',
        cantidad: quantity,
        removed: false
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw error;
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


