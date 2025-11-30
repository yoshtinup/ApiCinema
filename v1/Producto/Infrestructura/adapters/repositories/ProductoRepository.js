
import { IProductoRepository } from '../../../Dominio/ports/IProductoRepository.js';
import { db } from '../../../../../database/mysql.js';

export class ProductoRepository extends IProductoRepository {
  // Método para crear un nuevo cliente en la base de datos
  async deleteProductoById(id) {
    const sql = 'DELETE FROM productos WHERE id = ?';
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
    const sql = "UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, peso = ?, cantidad = ?, categoria = ?, ingreso = ?, imagen = ?, no_apartado = ? WHERE id = ?";
    const params = [
      producto.nombre ?? null,
      producto.descripcion ?? null,
      producto.precio ?? null,
      producto.peso ?? null,
      producto.cantidad ?? null,
      producto.categoria ?? null,
      producto.ingreso ?? null,
      producto.imagen ?? null,
      producto.no_apartado ?? null,
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
    const sql = "INSERT INTO productos (nombre, descripcion, precio, peso, cantidad, categoria, ingreso, imagen, no_apartado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    // Convertir valores undefined a null y obtener valores de la instancia `boleto`
    const params = [
      producto.nombre ?? null,
      producto.descripcion ?? null,
      producto.precio ?? null,
      producto.peso ?? null,
      producto.cantidad ?? null,
      producto.categoria ?? null,
      producto.ingreso ?? null,
      producto.imagen ?? null,
      producto.no_apartado ?? null
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
        imagen: producto.imagen,
        no_apartado: producto.no_apartado
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error creating new Producto');
    }
  }

  /**
   * Actualiza solo el campo no_apartado de un producto
   * @param {number} id - ID del producto
   * @param {number} no_apartado - Nuevo valor de apartado
   * @returns {Promise<Object>} - Producto actualizado
   */
  async updateApartadoById(id, no_apartado) {
    const sql = "UPDATE productos SET no_apartado = ? WHERE id = ?";
    const params = [no_apartado, id];
    
    try {
      const [result] = await db.query(sql, params);
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      // Devolver el producto actualizado
      const producto = await this.getProductoById(id);
      if (!producto) return null;
      
      return {
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        no_apartado: producto.no_apartado
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error updating apartado');
    }
  }

  /**
   * 🔒 CONTROL DE CONCURRENCIA: Descuenta stock de forma atómica
   * Previene sobreventa verificando stock disponible en la misma transacción
   * @param {number} productId - ID del producto
   * @param {number} quantity - Cantidad a descontar
   * @returns {Promise<boolean>} - true si se descontó exitosamente
   */
  async decrementStock(productId, quantity) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // 🔒 FOR UPDATE bloquea la fila hasta que termine la transacción
      const [rows] = await connection.query(
        'SELECT cantidad FROM productos WHERE id = ? FOR UPDATE',
        [productId]
      );
      
      if (rows.length === 0) {
        throw new Error(`Producto ${productId} no encontrado`);
      }
      
      const stockActual = rows[0].cantidad;
      
      if (stockActual < quantity) {
        throw new Error(`Stock insuficiente. Disponible: ${stockActual}, Solicitado: ${quantity}`);
      }
      
      // Descontar stock de forma atómica
      const [result] = await connection.query(
        'UPDATE productos SET cantidad = cantidad - ? WHERE id = ? AND cantidad >= ?',
        [quantity, productId, quantity]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('No se pudo actualizar el stock (condición de carrera detectada)');
      }
      
      await connection.commit();
      return true;
      
    } catch (error) {
      await connection.rollback();
      console.error('❌ Error descontando stock:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 🔒 CONTROL DE CONCURRENCIA: Incrementa stock de forma atómica
   * Usado para cancelaciones o devoluciones
   * @param {number} productId - ID del producto
   * @param {number} quantity - Cantidad a incrementar
   * @returns {Promise<boolean>} - true si se incrementó exitosamente
   */
  async incrementStock(productId, quantity) {
    const sql = 'UPDATE productos SET cantidad = cantidad + ? WHERE id = ?';
    const params = [quantity, productId];
    
    try {
      const [result] = await db.query(sql, params);
      
      if (result.affectedRows === 0) {
        throw new Error(`Producto ${productId} no encontrado`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error incrementando stock:', error);
      throw error;
    }
  }

}


