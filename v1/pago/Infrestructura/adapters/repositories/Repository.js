
import { IProductoRepository } from '../../../Dominio/ports/IProductoRepository.js';
import { db } from '../../../../../database/mysql.js';

export class Repository extends IProductoRepository {
  async getAllProducto() {
    const sql = "SELECT * FROM pago"; // Cambié la tabla a pago para reflejar un sistema de boletos
    try {
      const [data] = await db.query(sql);
      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error retrieving clients');
    }
  }
  async getProductoById(id) {
    const sql = "SELECT * FROM pago WHERE id=?";
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
    const sql = 'DELETE FROM pago WHERE id = ?';
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
    const sql = "UPDATE pago SET iduser = ?, idproducto = ?, cantidad = ?, codigo = ? WHERE id = ?";
    const params = [
      producto.iduser ?? null,
      producto.idproducto ?? null,
      producto.cantidad ?? null,
      producto.codigo ?? null,
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
    const sql = "INSERT INTO pago (iduser, idproducto, cantidad, codigo) VALUES ( ?, ?, ?, ?)";

    // Convertir valores undefined a null y obtener valores de la instancia `boleto`
    const params = [
      producto.iduser ?? null,
      producto.idproducto ?? null,
      producto.cantidad ?? null,
      producto.codigo ?? null
    ];
  
    try {
      // Ejecutar la consulta SQL con los parámetros
      const [resultado] = await db.query(sql, params);
  
      // Devolver los datos del boleto creado, incluyendo el ID generado
      return {
        id: resultado.insertId,
        iduser: producto.iduser,
        idproducto: producto.idproducto,
        cantidad: producto.cantidad,
        codigo: producto.codigo
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error creating new Producto');
    }
  }

}


