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
  };

// Crear el pool de conexiones
const pool = mysql.createPool(config);

export const db = {
  query : async (sql, params) => {
    try {
      const conn = await pool.getConnection();
      signale.success("Conexión exitosa a la BD");
      const result = await conn.execute(sql, params);
      conn.release();
      return result;
    } catch (error) {
      signale.error(error);
      return null;
    }
  }
}
