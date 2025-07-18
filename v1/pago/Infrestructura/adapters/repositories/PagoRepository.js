import { IPagoRepository } from '../../../Dominio/ports/IPagoRepository.js';
import { db } from '../../../../../database/mysql.js';

export class PagoRepository extends IPagoRepository {
  /**
   * Devuelve los productos actualizados desde la BD por arreglo de IDs
   * @param {Array<string|number>} ids
   * @returns {Promise<Array<Object>>}
   */
  async getProductosByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const sql = `SELECT * FROM productos WHERE id IN (${placeholders})`;
    try {
      const [result] = await db.query(sql, ids);
      return result;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error retrieving products by ids');
    }
  }
  async createNewProducto(producto) {
    const sql = "INSERT INTO pagos (iduser, idproducto, cantidad, codigo) VALUES (?, ?, ?, ?)";
    
    const params = [
      producto.iduser ?? null,
      producto.idproducto ?? null,
      producto.cantidad ?? null,
      producto.codigo ?? null
    ];
  
    try {
      const [resultado] = await db.query(sql, params);
  
      return {
        id: resultado.insertId,
        iduser: producto.iduser,
        idproducto: producto.idproducto,
        cantidad: producto.cantidad,
        codigo: producto.codigo
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error creating new Pago');
    }
  }

async createOrder(order) {
  // Format the date to MySQL compatible format (YYYY-MM-DD HH:MM:SS)
  const formattedDate = new Date(order.created_at)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');

  // Calculate the correct total from items
  const subtotal = order.items.reduce((sum, item) => {
    const itemSubtotal = parseFloat(item.price) * parseInt(item.quantity);
    return sum + itemSubtotal;
  }, 0);

  // Calculate IVA (16% in Mexico)
  const iva = subtotal * 0.16;
  const totalWithIva = subtotal + iva;

  const sql = "INSERT INTO orders (order_id, user_id, items, total, status, created_at, dispenser_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
  const params = [
    order.order_id,
    order.user_id,
    JSON.stringify(order.items),
    totalWithIva.toFixed(2),
    order.status,
    formattedDate,
    order.dispenser_id
  ];

  try {
    const result = await db.query(sql, params);
    // Descontar la cantidad de cada producto comprado
    for (const item of order.items) {
      const productId = item.product_id || item.id;
      const cantidad = item.quantity || item.cantidad;
      const updateSql = "UPDATE productos SET cantidad = cantidad - ? WHERE id = ?";
      await db.query(updateSql, [cantidad, productId]);
    }
    const resultado = Array.isArray(result) ? result[0] : result;
    if (!resultado) {
      throw new Error('Failed to insert order into database');
    }
    return {
      id: resultado.insertId || 0,
      ...order,
      total: totalWithIva.toFixed(2),
      subtotal: subtotal.toFixed(2),
      iva: iva.toFixed(2),
      created_at: formattedDate
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Error creating new Order: ${error.message}`);
  }
}
  async updateOrderStatus(orderId, status) {
    const sql = "UPDATE orders SET status = ? WHERE order_id = ?";
    const params = [status, orderId];
  
    try {
      const [result] = await db.query(sql, params);
      
      if (result.affectedRows === 0) {
        throw new Error('Order not found');
      }
      
      return { orderId, status, updated: true };
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error updating order status');
    }
  }

  async getOrderById(orderId) {
    const sql = "SELECT * FROM orders WHERE order_id = ?";
    const params = [orderId];
    try {
      const [result] = await db.query(sql, params);
      if (result.length === 0) return null;
      
      const order = result[0];
      // Parse the items JSON string back to an array
      order.items = JSON.parse(order.items);
      return order;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error retrieving order by ID');
    }
  }

  async getOrdersByUserId(userId) {
    const sql = "SELECT * FROM orders WHERE user_id = ?";
    const params = [userId];
    try {
      const [results] = await db.query(sql, params);
      
      // Parse the items JSON string back to an array for each order
      return results.map(order => {
        try {
          // Check if items is a string before parsing
          if (typeof order.items === 'string' && order.items.trim() !== '') {
            order.items = JSON.parse(order.items);
          } else if (order.items === null || order.items === undefined) {
            order.items = []; // Default to empty array if null/undefined
          }
          // If it's already an object/array, leave it as is
          return order;
        } catch (parseError) {
          console.error('Error parsing items JSON for order:', order.order_id, parseError);
          // Set items to empty array if parsing fails
          order.items = [];
          return order;
        }
      });
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error retrieving orders by user ID');
    }
  }
}