import { db } from '../../../../../database/mysql.js';

/**
 * Recibe un arreglo de ids y devuelve los productos actualizados desde la BD
 * @param {Array<string|number>} ids
 * @returns {Promise<Array<Object>>}
 */
export async function getProductosByIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  // Construir los placeholders (?, ?, ...) para el IN
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
