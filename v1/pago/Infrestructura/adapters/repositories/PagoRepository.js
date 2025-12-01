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
  const formattedDate = order.created_at 
    ? new Date(order.created_at).toISOString().slice(0, 19).replace('T', ' ')
    : new Date().toISOString().slice(0, 19).replace('T', ' ');

  // Generate order_id if not provided
  const orderId = order.order_id || `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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

  // Use the provided total or calculate with IVA
  const finalTotal = order.total || subtotal;
  const iva = subtotal * 0.16;

  const sql = "INSERT INTO orders (order_id, user_id, items, total, status, created_at, dispenser_id, nfc, payment_id, payment_status, payment_method, external_reference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const params = [
    orderId,
    order.user_id,
    JSON.stringify(order.items),
    finalTotal.toFixed(2),
    order.status || 'pending',
    formattedDate,
    order.dispenser_id || null,
    order.nfc || null,
    order.payment_id || null,
    order.payment_status || null,
    order.payment_method || null,
    order.external_reference || null
  ];

  try {
    const result = await db.query(sql, params);
    
    // Descontar la cantidad de cada producto comprado solo si el estado es 'paid'
    if (order.status === 'paid' && Array.isArray(order.items)) {
      for (const item of order.items) {
        const productId = item.product_id || item.id;
        const cantidad = item.quantity || item.cantidad;
        if (productId && cantidad) {
          const updateSql = "UPDATE productos SET cantidad = cantidad - ? WHERE id = ?";
          await db.query(updateSql, [cantidad, productId]);
        }
      }
    }
    
    const resultado = Array.isArray(result) ? result[0] : result;
    if (!resultado) {
      throw new Error('Failed to insert order into database');
    }
    
    return {
      id: resultado.insertId || 0,
      order_id: orderId,
      ...order,
      total: finalTotal.toFixed(2),
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
      // Parse the items JSON string back to an array if necessary
      try {
        if (typeof order.items === 'string' && order.items.trim() !== '') {
          order.items = JSON.parse(order.items);
        } else if (order.items === null || order.items === undefined) {
          order.items = [];
        } // otherwise assume it's already an object/array
      } catch (parseError) {
        console.error('Error parsing items JSON for order:', order.order_id, parseError);
        // Fallback: set to empty array to avoid crashing callers
        order.items = [];
      }

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
      // Consulta SQL simplificada que funciona con versiones más antiguas de MySQL
      let sql = `
        SELECT 
          JSON_UNQUOTE(JSON_EXTRACT(items, CONCAT('$[', numbers.n, '].product_id'))) as product_id,
          JSON_UNQUOTE(JSON_EXTRACT(items, CONCAT('$[', numbers.n, '].name'))) as product_name,
          CAST(JSON_UNQUOTE(JSON_EXTRACT(items, CONCAT('$[', numbers.n, '].price'))) AS DECIMAL(10,2)) as price,
          CAST(JSON_UNQUOTE(JSON_EXTRACT(items, CONCAT('$[', numbers.n, '].quantity'))) AS UNSIGNED) as quantity,
          CAST(JSON_UNQUOTE(JSON_EXTRACT(items, CONCAT('$[', numbers.n, '].subtotal'))) AS DECIMAL(10,2)) as subtotal,
          created_at,
          status,
          id as order_id
        FROM orders o
        CROSS JOIN (
          SELECT 0 as n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
          UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
        ) numbers
        WHERE JSON_EXTRACT(items, CONCAT('$[', numbers.n, ']')) IS NOT NULL
          AND status IN ('paid', 'dispensed')
      `;

      // Agregar condición de fecha según el período
      switch (period) {
        case 'week':
          sql += ' AND created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
          break;
        case 'month':
          sql += ' AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
          break;
        case 'year':
          sql += ' AND created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
          break;
      }

      sql += ' HAVING product_id IS NOT NULL';

      console.log('🔍 Executing SQL:', sql);
      const [rawResults] = await db.query(sql, []);
      
      // Procesar resultados para obtener estadísticas agrupadas
      const productStats = {};
      
      rawResults.forEach(row => {
        const productId = row.product_id;
        if (!productStats[productId]) {
          productStats[productId] = {
            product_id: parseInt(productId),
            product_name: row.product_name,
            order_count: new Set(),
            total_quantity: 0,
            total_revenue: 0,
            prices: [],
            dates: []
          };
        }
        
        productStats[productId].order_count.add(row.order_id);
        productStats[productId].total_quantity += parseInt(row.quantity) || 0;
        productStats[productId].total_revenue += parseFloat(row.subtotal) || 0;
        productStats[productId].prices.push(parseFloat(row.price) || 0);
        productStats[productId].dates.push(row.created_at);
      });
      
      // Convertir a array y calcular promedios
      const results = Object.values(productStats).map(product => {
        const totalRevenue = parseFloat(product.total_revenue) || 0;
        const averagePrice = product.prices.length > 0 
          ? parseFloat((product.prices.reduce((a, b) => a + b, 0) / product.prices.length)) || 0 
          : 0;
        
        return {
          product_id: product.product_id,
          product_name: product.product_name,
          order_count: product.order_count.size,
          total_quantity: parseInt(product.total_quantity) || 0,
          total_revenue: parseFloat(totalRevenue.toFixed(2)),
          average_price: parseFloat(averagePrice.toFixed(2)),
          first_sale: product.dates.length > 0 ? new Date(Math.min(...product.dates.map(d => new Date(d)))) : null,
          last_sale: product.dates.length > 0 ? new Date(Math.max(...product.dates.map(d => new Date(d)))) : null,
          revenue_percentage: 0,
          quantity_percentage: 0
        };
      });
      
      // Ordenar por cantidad total vendida
      results.sort((a, b) => b.total_quantity - a.total_quantity || b.total_revenue - a.total_revenue);
      
      return results.slice(0, parseInt(limit));
    } catch (error) {
      console.error('Database Error getting best selling products:', error);
      throw new Error('Error retrieving best selling products');
    }
  }

  /**
   * Obtiene los valores totales de las órdenes para análisis de distribución gaussiana
   * @param {string} period - Período de tiempo (week, month, quarter, year, all)
   * @returns {Array<number>} Array de valores de órdenes
   */
  async getOrderValuesForDistribution(period = 'month') {
    try {
      console.log(`📊 Obteniendo valores de órdenes para distribución (período: ${period})`);

      let sql = `
        SELECT 
          total,
          created_at
        FROM orders 
        WHERE status IN ('paid', 'dispensed')
          AND total > 0
      `;

      // Agregar filtro de período
      switch (period.toLowerCase()) {
        case 'week':
          sql += ' AND created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
          break;
        case 'month':
          sql += ' AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
          break;
        case 'quarter':
          sql += ' AND created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)';
          break;
        case 'year':
          sql += ' AND created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
          break;
        case 'all':
          // Sin filtro adicional
          break;
      }

      sql += ' ORDER BY created_at DESC';

      console.log('🔍 Executing SQL:', sql);
      const [results] = await db.query(sql, []);
      
      // Extraer solo los valores numéricos
      const values = results.map(row => parseFloat(row.total)).filter(value => !isNaN(value) && value > 0);
      
      console.log(`✅ Obtenidos ${values.length} valores de órdenes para análisis`);
      return values;

    } catch (error) {
      console.error('Database Error getting order values for distribution:', error);
      throw new Error('Error retrieving order values for distribution analysis');
    }
  }

  /**
   * Obtiene la cantidad de productos por orden para análisis de distribución
   * @param {string} period - Período de tiempo
   * @returns {Array<number>} Array de cantidades de productos por orden
   */
  async getProductQuantitiesPerOrder(period = 'month') {
    try {
      console.log(`📊 Obteniendo cantidades de productos por orden (período: ${period})`);

      let sql = `
        SELECT 
          JSON_LENGTH(items) as product_count,
          created_at
        FROM orders 
        WHERE status IN ('paid', 'dispensed')
          AND items IS NOT NULL
          AND JSON_LENGTH(items) > 0
      `;

      // Agregar filtro de período
      switch (period.toLowerCase()) {
        case 'week':
          sql += ' AND created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
          break;
        case 'month':
          sql += ' AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
          break;
        case 'quarter':
          sql += ' AND created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)';
          break;
        case 'year':
          sql += ' AND created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
          break;
      }

      sql += ' ORDER BY created_at DESC';

      const [results] = await db.query(sql, []);
      
      // Extraer solo las cantidades
      const quantities = results.map(row => parseInt(row.product_count)).filter(qty => !isNaN(qty) && qty > 0);
      
      console.log(`✅ Obtenidas ${quantities.length} cantidades de productos para análisis`);
      return quantities;

    } catch (error) {
      console.error('Database Error getting product quantities per order:', error);
      throw new Error('Error retrieving product quantities per order');
    }
  }

  /**
   * Busca una orden por payment_id para evitar duplicados
   * @param {string} paymentId - ID del pago en MercadoPago
   * @returns {Promise<Object|null>} Orden encontrada o null
   */
  async findOrderByPaymentId(paymentId) {
    const sql = "SELECT * FROM orders WHERE payment_id = ? LIMIT 1";
    try {
      const [result] = await db.query(sql, [paymentId]);
      
      if (result.length === 0) {
        return null;
      }

      const order = result[0];
      try {
        order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      } catch (parseError) {
        console.error('Error parsing items:', parseError);
        order.items = [];
      }

      return order;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error finding order by payment_id');
    }
  }

  /**
   * Buscar orden por external_reference de MercadoPago
   * @param {string} externalReference - External reference de la preferencia
   * @returns {Promise<Object|null>} Orden encontrada o null
   */
  async findOrderByExternalReference(externalReference) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 [REPOSITORY] Buscando orden por external_reference');
    console.log('📋 external_reference:', externalReference);
    
    const sql = "SELECT * FROM orders WHERE external_reference = ? LIMIT 1";
    console.log('📝 SQL Query:', sql);
    console.log('📊 Ejecutando consulta en BD...');
    
    try {
      const [result] = await db.query(sql, [externalReference]);
      
      console.log('📊 Resultados obtenidos:', result.length, 'filas');
      
      if (result.length === 0) {
        console.log('⚠️ No se encontró ninguna orden con ese external_reference');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return null;
      }

      const order = result[0];
      console.log('✅ Orden encontrada:', {
        order_id: order.order_id,
        user_id: order.user_id,
        external_reference: order.external_reference,
        payment_status: order.payment_status,
        status: order.status,
        total: order.total,
        created_at: order.created_at
      });
      
      try {
        order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        console.log('✅ Items parseados correctamente:', order.items.length, 'productos');
      } catch (parseError) {
        console.error('❌ Error parsing items:', parseError);
        order.items = [];
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return order;
    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ [REPOSITORY] Database Error:', error);
      console.error('Stack trace:', error.stack);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      throw new Error('Error finding order by external_reference');
    }
  }
}