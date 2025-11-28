import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import signale from 'signale';

dotenv.config()

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

// Crear el pool de conexiones
const pool = mysql.createPool(config);

export const db = {
  query : async (sql, params) => {
    let connection;
    try {
      // Validate parameters
      if (!sql || typeof sql !== 'string') {
        throw new Error('SQL query must be a non-empty string');
      }
      
      // Ensure params is an array
      const queryParams = Array.isArray(params) ? params : (params ? [params] : []);
      
      // Debug: Count placeholders and parameters
      const placeholderCount = (sql.match(/\?/g) || []).length;
      const paramCount = queryParams.length;
      
      if (placeholderCount !== paramCount) {
        signale.error(`❌ Query parameter mismatch!`);
        signale.error(`📊 SQL: ${sql.replace(/\s+/g, ' ').trim()}`);
        signale.error(`🔢 Placeholders (?): ${placeholderCount}`);
        signale.error(`📋 Parameters: ${paramCount} - [${queryParams.map(p => `"${p}"`).join(', ')}]`);
        signale.error(`📋 Parameter types: [${queryParams.map(p => typeof p).join(', ')}]`);
        throw new Error(`Parameter count mismatch: expected ${placeholderCount}, got ${paramCount}`);
      }
      
      // Get connection from pool
      connection = await pool.getConnection();
      signale.success("Conexión exitosa a la BD");
      
      // Debug: Log query details right before execution
      signale.info(`🔍 Executing SQL: ${sql.replace(/\s+/g, ' ').trim()}`);
      signale.info(`🔍 With params: [${queryParams.map(p => `"${p}"`).join(', ')}]`);
      
      // Execute query
      const result = await connection.execute(sql, queryParams);
      
      return result;
    } catch (error) {
      signale.error("Error en query DB:", error.message);
      throw error;
    } finally {
      // Always release connection back to pool
      if (connection) {
        connection.release();
      }
    }
  },
  
  // Alternative method for complex transactions
  getConnection: async () => {
    try {
      const connection = await pool.getConnection();
      return connection;
    } catch (error) {
      signale.error("Error obteniendo conexión:", error.message);
      throw error;
    }
  }
}
