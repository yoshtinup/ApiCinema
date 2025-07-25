import { IPagoRepository } from '../../../Dominio/ports/IPagoRepository.js';
import { db } from '../../../../../database/mysql.js';

export class PagoRepository extends IPagoRepository {
  /**
   * Devuelve la instancia de la base de datos
   * @returns {Object} - Instancia de la base de datos
   */
  getDb() {
    return db;
  }
  
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
  /**
   * Busca una orden por su ID
   * @param {string|number} orderId - ID de la orden
   * @returns {Promise<Object|null>} - Orden encontrada o null
   */
  async findOrderById(orderId) {
    if (!orderId) throw new Error('Order ID es requerido');
    
    try {
      // Buscar la orden directamente en la tabla orders
      const sql = "SELECT * FROM orders WHERE order_id = ? LIMIT 1";
      const [orders] = await db.query(sql, [orderId]);
      
      if (orders.length > 0) {
        return orders[0];
      }
      
      return null;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error(`Error buscando orden por ID: ${error.message}`);
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
    try {
      // Obtenemos las órdenes de nfc_selected_orders
      const sqlNfcSelected = `
        SELECT o.*, nso.selected_at, nso.dispenser_id as selected_dispenser_id
        FROM nfc_selected_orders nso
        INNER JOIN orders o ON nso.order_id = o.order_id
        WHERE nso.nfc = ?
      `;
      const paramsNfcSelected = [nfc];
      
      console.log('🔍 Executing SQL (getOrdersByNFC - nfc_selected_orders):', sqlNfcSelected);
      console.log('🔍 With params:', paramsNfcSelected);
      
      const [resultNfcSelected] = await db.query(sqlNfcSelected, paramsNfcSelected);
      
      // Obtenemos las órdenes regulares
      const sql = `
        SELECT o.* 
        FROM orders o 
        INNER JOIN usuario u ON o.user_id = u.id 
        WHERE u.nfc = ? OR o.nfc = ?
        ORDER BY o.created_at DESC
      `;
      const params = [nfc, nfc];
      
      console.log('🔍 Executing SQL (getOrdersByNFC - orders):', sql);
      console.log('🔍 With params:', params);
      
      const [result] = await db.query(sql, params);
      
      // Combinar resultados (eliminar duplicados)
      const combinedResults = [...resultNfcSelected];
      const existingIds = new Set(resultNfcSelected.map(order => order.order_id));
      
      result.forEach(order => {
        if (!existingIds.has(order.order_id)) {
          combinedResults.push(order);
        }
      });
      
      // Ordenar por fecha de creación
      combinedResults.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      // Parse items JSON for each order
      return combinedResults.map(order => {
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

  /**
   * Verifica si existe una orden activa para un NFC específico
   * @param {string} nfc - NFC a verificar
   * @returns {Promise<boolean>} - true si existe una orden activa, false en caso contrario
   */
  async hasActiveOrderByNFC(nfc) {
    try {
      // Verificar en nfc_selected_orders
      const sqlNfcSelected = `
        SELECT COUNT(*) as count
        FROM nfc_selected_orders nso
        INNER JOIN orders o ON nso.order_id = o.order_id
        WHERE nso.nfc = ? AND o.status IN ('pending', 'paid')
      `;
      const paramsNfcSelected = [nfc];

      console.log('🔍 Executing SQL (hasActiveOrderByNFC - nfc_selected_orders):', sqlNfcSelected);
      console.log('🔍 With params:', paramsNfcSelected);

      const [resultNfcSelected] = await db.query(sqlNfcSelected, paramsNfcSelected);
      
      if (resultNfcSelected[0].count > 0) {
        return true;
      }

      // Verificar en orders regulares
      const sql = `
        SELECT COUNT(*) as count
        FROM orders o
        INNER JOIN usuario u ON o.user_id = u.id
        WHERE (u.nfc = ? OR o.nfc = ?) AND o.status IN ('pending', 'paid')
      `;
      const params = [nfc, nfc];

      console.log('🔍 Executing SQL (hasActiveOrderByNFC - orders):', sql);
      console.log('🔍 With params:', params);

      const [result] = await db.query(sql, params);
      
      return result[0].count > 0;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error checking for active orders by NFC');
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
      // Primero intentamos encontrar una orden en la tabla nfc_selected_orders
      const sqlNfcSelected = `
        SELECT o.*, nso.selected_at, nso.dispenser_id as selected_dispenser_id  
        FROM nfc_selected_orders nso 
        INNER JOIN orders o ON nso.order_id = o.order_id 
        WHERE nso.nfc = ?
      `;
      const paramsNfcSelected = [nfc];

      console.log('🔍 Executing SQL (nfc_selected_orders):', sqlNfcSelected);
      console.log('🔍 With params:', paramsNfcSelected);

      const [resultNfcSelected] = await db.query(sqlNfcSelected, paramsNfcSelected);

      // Si encontramos una orden en nfc_selected_orders, la devolvemos
      if (resultNfcSelected && resultNfcSelected.length > 0) {
        console.log('✅ Orden encontrada en nfc_selected_orders');
        const order = resultNfcSelected[0];
        try {
          order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        } catch (parseError) {
          console.error('Error parsing items JSON for order:', order.order_id, parseError);
          order.items = [];
        }
        return order;
      }

      // Si no encontramos en nfc_selected_orders, buscamos en orders por NFC directo
      const sql = `
        SELECT o.*, u.nfc 
        FROM orders o 
        JOIN usuario u ON o.user_id = u.id 
        WHERE u.nfc = ? OR o.nfc = ?
        ORDER BY o.created_at DESC 
        LIMIT 1
      `;
      const params = [nfc, nfc];

      console.log('🔍 Executing SQL (orders fallback):', sql);
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

  /**
   * Encuentra una orden específica por su ID y NFC
   * @param {string} orderId - ID de la orden a buscar
   * @param {string} nfc - NFC del usuario
   * @returns {Promise<Object|null>} - La orden encontrada o null
   */
  async findOrderByIdAndNFC(orderId, nfc) {
    try {
      // Primero intentamos encontrar la orden específica en nfc_selected_orders
      const sqlNfcSelected = `
        SELECT o.*, nso.selected_at, nso.dispenser_id as selected_dispenser_id  
        FROM nfc_selected_orders nso 
        INNER JOIN orders o ON nso.order_id = o.order_id 
        WHERE nso.order_id = ? AND nso.nfc = ?
      `;
      const paramsNfcSelected = [orderId, nfc];

      console.log('🔍 Executing SQL (nfc_selected_orders):', sqlNfcSelected);
      console.log('🔍 With params:', paramsNfcSelected);

      const [resultNfcSelected] = await db.query(sqlNfcSelected, paramsNfcSelected);

      // Si encontramos una orden en nfc_selected_orders, la devolvemos
      if (resultNfcSelected && resultNfcSelected.length > 0) {
        console.log('✅ Orden específica encontrada en nfc_selected_orders');
        const order = resultNfcSelected[0];
        try {
          order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        } catch (parseError) {
          console.error('Error parsing items JSON for order:', order.order_id, parseError);
          order.items = [];
        }
        return order;
      }

      // Si no encontramos en nfc_selected_orders, buscamos en orders
      const sql = `
        SELECT o.*, u.nfc 
        FROM orders o 
        JOIN usuario u ON o.user_id = u.id 
        WHERE o.order_id = ? AND (u.nfc = ? OR o.nfc = ?)
      `;
      const params = [orderId, nfc, nfc];

      console.log('🔍 Executing SQL (orders fallback):', sql);
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
      throw new Error('Error finding order by ID and NFC');
    }
  }

  /**
   * Obtiene los productos más vendidos analizando el campo JSON 'items' de las órdenes
   * @param {number} limit - Número máximo de productos a retornar
   * @param {string} period - Período de tiempo: 'week', 'month', 'year', 'all'
   * @returns {Promise<Array>} Lista de productos más vendidos
   */
  async getBestSellingProducts(limit = 10, period = 'all') {
    try {
      // Construir condición WHERE completa según el período
      let whereCondition = '';
      switch (period) {
        case 'week':
          whereCondition = 'WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK) AND o.status IN (\'paid\', \'dispensed\')';
          break;
        case 'month':
          whereCondition = 'WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH) AND o.status IN (\'paid\', \'dispensed\')';
          break;
        case 'year':
          whereCondition = 'WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR) AND o.status IN (\'paid\', \'dispensed\')';
          break;
        default:
          whereCondition = 'WHERE o.status IN (\'paid\', \'dispensed\')'; // Solo filtro de status para 'all'
      }

      // Consulta SQL que extrae y analiza los productos del campo JSON
      const sql = `
        WITH product_sales AS (
          SELECT 
            JSON_EXTRACT(item.value, '$.product_id') as product_id,
            JSON_UNQUOTE(JSON_EXTRACT(item.value, '$.name')) as product_name,
            CAST(JSON_EXTRACT(item.value, '$.price') AS DECIMAL(10,2)) as price,
            CAST(JSON_EXTRACT(item.value, '$.quantity') AS UNSIGNED) as quantity,
            CAST(JSON_EXTRACT(item.value, '$.subtotal') AS DECIMAL(10,2)) as subtotal,
            o.created_at,
            o.status
          FROM orders o
          JOIN JSON_TABLE(o.items, '$[*]' COLUMNS (
            rowid FOR ORDINALITY,
            value JSON PATH '$'
          )) as item
          ${whereCondition}
        )
        SELECT 
          product_id,
          product_name,
          COUNT(*) as order_count,
          SUM(quantity) as total_quantity,
          SUM(subtotal) as total_revenue,
          AVG(price) as average_price,
          MIN(created_at) as first_sale,
          MAX(created_at) as last_sale
        FROM product_sales
        WHERE product_id IS NOT NULL
        GROUP BY product_id, product_name
        ORDER BY total_quantity DESC, total_revenue DESC
        LIMIT ?
      `;

      const [results] = await db.query(sql, [parseInt(limit)]);
      
      // Formatear los resultados
      return results.map(product => ({
        product_id: parseInt(product.product_id),
        product_name: product.product_name,
        order_count: product.order_count,
        total_quantity: product.total_quantity,
        total_revenue: parseFloat(product.total_revenue),
        average_price: parseFloat(product.average_price),
        first_sale: product.first_sale,
        last_sale: product.last_sale,
        revenue_percentage: 0, // Se calculará en el use case
        quantity_percentage: 0 // Se calculará en el use case
      }));
    } catch (error) {
      console.error('Database Error getting best selling products:', error);
      throw new Error('Error retrieving best selling products');
    }
  }
}