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
  let subtotal = 0;
  
  // Manejar tanto arrays como objetos con apartados
  if (Array.isArray(order.items)) {
    // Si es array (formato anterior)
    subtotal = order.items.reduce((sum, item) => {
      const itemSubtotal = parseFloat(item.price) * parseInt(item.quantity);
      return sum + itemSubtotal;
    }, 0);
  } else if (typeof order.items === 'object' && order.items !== null) {
    // Si es objeto con apartados (formato nuevo)
    for (const key in order.items) {
      if (order.items.hasOwnProperty(key)) {
        const item = order.items[key];
        const itemSubtotal = parseFloat(item.price) * parseInt(item.quantity);
        subtotal += itemSubtotal;
      }
    }
  }

  // Calculate IVA (16% in Mexico)
  const iva = subtotal * 0.16;
  const totalWithIva = subtotal + iva;

  const sql = "INSERT INTO orders (order_id, user_id, items, total, status, created_at, dispenser_id, nfc) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  const params = [
    order.order_id,
    order.user_id,
    JSON.stringify(order.items),
    totalWithIva.toFixed(2),
    order.status,
    formattedDate,
    order.dispenser_id,
    order.nfc ?? null
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

  async getOrdersByNFC(nfc) {
    const sql = `
      SELECT o.* 
      FROM orders o 
      INNER JOIN usuario u ON o.user_id = u.id 
      WHERE u.nfc = ? 
      ORDER BY o.created_at DESC
    `;
    const params = [nfc];
    
    try {
      const [result] = await db.query(sql, params);
      
      // Parse items JSON for each order
      return result.map(order => {
        try {
          order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
          return order;
        } catch (parseError) {
          console.error('Error parsing items JSON for order:', order.order_id, parseError);
          order.items = [];
          return order;
        }
      });
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error retrieving orders by NFC');
    }
  }

  async getPendingOrdersByNFC(nfc) {
    const sql = `
      SELECT o.* 
      FROM orders o 
      INNER JOIN usuario u ON o.user_id = u.id 
      WHERE u.nfc = ? AND o.status = 'paid'
      ORDER BY o.created_at ASC
    `;
    const params = [nfc];
    
    try {
      const [result] = await db.query(sql, params);
      
      // Parse items JSON for each order
      return result.map(order => {
        try {
          order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
          return order;
        } catch (parseError) {
          console.error('Error parsing items JSON for order:', order.order_id, parseError);
          order.items = [];
          return order;
        }
      });
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error retrieving pending orders by NFC');
    }
  }

  async getOrderByIdAndNFC(orderId, nfc) {
    const sql = `
      SELECT o.* 
      FROM orders o 
      INNER JOIN usuario u ON o.user_id = u.id 
      WHERE o.order_id = ? AND u.nfc = ?
    `;
    const params = [orderId, nfc];
    
    try {
      const [result] = await db.query(sql, params);
      
      if (result.length === 0) {
        return null;
      }

      const order = result[0];
      try {
        order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      } catch (parseError) {
        console.error('Error parsing items JSON for order:', order.order_id, parseError);
        order.items = [];
      }
      
      return order;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error retrieving order by ID and NFC');
    }
  }

  async markOrderForDispensing(orderId, dispenserId = null) {
    const sql = `
      UPDATE orders 
      SET dispenser_id = ?
      WHERE order_id = ? AND status = 'paid'
    `;
    const params = [dispenserId, orderId];
    
    try {
      const [result] = await db.query(sql, params);
      
      if (result.affectedRows === 0) {
        throw new Error('Order not found or not in correct status for dispensing');
      }

      // Obtener la orden actualizada
      const selectSql = 'SELECT * FROM orders WHERE order_id = ?';
      const [orderResult] = await db.query(selectSql, [orderId]);
      
      if (orderResult.length === 0) {
        throw new Error('Order not found after update');
      }

      const order = orderResult[0];
      try {
        order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      } catch (parseError) {
        console.error('Error parsing items JSON for order:', order.order_id, parseError);
        order.items = [];
      }
      
      return order;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error marking order for dispensing');
    }
  }

  async clearPreviousSelectedOrder(nfc) {
    const sql = 'DELETE FROM nfc_selected_orders WHERE nfc = ?';
    const params = [nfc];
    
    try {
      await db.query(sql, params);
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error clearing previous selected order');
    }
  }

  async markOrderAsSelectedForNFC(orderId, nfc, dispenserId = null) {
    const sql = `
      INSERT INTO nfc_selected_orders (nfc, order_id, dispenser_id) 
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        order_id = VALUES(order_id),
        dispenser_id = VALUES(dispenser_id),
        selected_at = CURRENT_TIMESTAMP
    `;
    const params = [nfc, orderId, dispenserId];
    
    try {
      await db.query(sql, params);
      
      // Obtener la orden que fue seleccionada
      const orderSql = `
        SELECT o.* 
        FROM orders o 
        WHERE o.order_id = ?
      `;
      const [orderResult] = await db.query(orderSql, [orderId]);
      
      if (orderResult.length === 0) {
        throw new Error('Order not found after selection');
      }

      const order = orderResult[0];
      try {
        order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      } catch (parseError) {
        console.error('Error parsing items JSON for order:', order.order_id, parseError);
        order.items = [];
      }
      
      return order;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error marking order as selected for NFC');
    }
  }

  async getSelectedOrderByNFC(nfc) {
    const sql = `
      SELECT o.*, nso.selected_at, nso.dispenser_id as selected_dispenser_id
      FROM nfc_selected_orders nso
      INNER JOIN orders o ON nso.order_id = o.order_id
      INNER JOIN usuario u ON o.user_id = u.id
      WHERE nso.nfc = ? AND u.nfc = ? AND o.status = 'paid'
    `;
    const params = [nfc, nfc];
    
    try {
      const [result] = await db.query(sql, params);
      
      if (result.length === 0) {
        return null;
      }

      const order = result[0];
      try {
        order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      } catch (parseError) {
        console.error('Error parsing items JSON for order:', order.order_id, parseError);
        order.items = [];
      }
      
      return order;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error getting selected order by NFC');
    }
  }

  async markOrderAsDispensed(orderId, dispenserId) {
    const sql = `
      UPDATE orders 
      SET status = 'dispensed', dispenser_id = ?
      WHERE order_id = ? AND status = 'paid'
    `;
    const params = [dispenserId, orderId];
    
    try {
      const [result] = await db.query(sql, params);
      
      if (result.affectedRows === 0) {
        throw new Error('Order not found or not in correct status for dispensing');
      }

      // Obtener la orden actualizada
      const selectSql = 'SELECT * FROM orders WHERE order_id = ?';
      const [orderResult] = await db.query(selectSql, [orderId]);
      
      if (orderResult.length === 0) {
        throw new Error('Order not found after dispensing');
      }

      const order = orderResult[0];
      try {
        order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      } catch (parseError) {
        console.error('Error parsing items JSON for order:', order.order_id, parseError);
        order.items = [];
      }
      
      return order;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error marking order as dispensed');
    }
  }

  async clearSelectedOrderFromNFC(nfc) {
    const sql = 'DELETE FROM nfc_selected_orders WHERE nfc = ?';
    const params = [nfc];
    
    try {
      await db.query(sql, params);
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error clearing selected order from NFC');
    }
  }

  /**
   * Busca una orden por NFC del usuario
   * @param {string} nfc - El código NFC del usuario
   * @returns {Promise<Object|null>} - La primera orden encontrada para ese NFC o null
   */
  async findOrderByNFC(nfc) {
    try {
      const sql = `
        SELECT o.*, u.nfc 
        FROM orders o 
        JOIN usuario u ON o.user_id = u.id 
        WHERE u.nfc = ? 
        ORDER BY o.created_at DESC 
        LIMIT 1
      `;
      const params = [nfc];

      console.log('🔍 Executing SQL:', sql);
      console.log('🔍 With params:', params);

      const [result] = await db.query(sql, params);
      
      if (result && result.length > 0) {
        const order = result[0];
        // Parse items JSON if it's a string
        try {
          order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        } catch (parseError) {
          console.error('Error parsing items JSON for order:', order.order_id, parseError);
          order.items = [];
        }
        return order;
      }
      
      return null;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error finding order by NFC');
    }
  }
}