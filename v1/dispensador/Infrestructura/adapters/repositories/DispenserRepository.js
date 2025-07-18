import { IDispenserRepository } from '../../../Dominio/ports/IDispenserRepository.js';
import { db } from '../../../../../database/mysql.js';

export class DispenserRepository extends IDispenserRepository {
  async createDispenser(dispenser) {
    const sql = `INSERT INTO dispensador (dispenser_id, location, status, products, last_maintenance, error_count)
      VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [
      dispenser.dispenser_id,
      dispenser.location,
      dispenser.status,
      JSON.stringify(dispenser.products),
      dispenser.last_maintenance.replace('T', ' ').replace('Z', ''),
      dispenser.error_count
    ];
    try {
      const [result] = await db.query(sql, params);
      return {
        id: result.insertId,
        ...dispenser
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error creating new Dispenser');
    }
  }

  async getAllDispensers() {
    const sql = 'SELECT * FROM dispensador';
    try {
      const [results] = await db.query(sql);
      return results.map(d => ({
        ...d,
        products: typeof d.products === 'string' ? JSON.parse(d.products) : d.products
      }));
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error retrieving dispensers');
    }
  }

  async getDispenserById(id) {
    const sql = 'SELECT * FROM dispensador WHERE dispenser_id = ?';
    try {
      const [results] = await db.query(sql, [id]);
      if (results.length === 0) return null;
      const d = results[0];
      return {
        ...d,
        products: typeof d.products === 'string' ? JSON.parse(d.products) : d.products
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error retrieving dispenser by ID');
    }
  }

  async updateDispenserById(id, dispenser) {
    const sql = `UPDATE dispensador SET location = ?, status = ?, products = ?, last_maintenance = ?, error_count = ? WHERE dispenser_id = ?`;
    const params = [
      dispenser.location,
      dispenser.status,
      JSON.stringify(dispenser.products),
      dispenser.last_maintenance.replace('T', ' ').replace('Z', ''),
      dispenser.error_count,
      id
    ];
    try {
      const [result] = await db.query(sql, params);
      if (result.affectedRows === 0) throw new Error('Dispenser not found');
      return { dispenser_id: id, ...dispenser, updated: true };
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error updating dispenser');
    }
  }

  async deleteDispenserById(id) {
    const sql = 'DELETE FROM dispensador WHERE dispenser_id = ?';
    try {
      const [result] = await db.query(sql, [id]);
      if (result.affectedRows === 0) throw new Error('Dispenser not found');
      return { dispenser_id: id, deleted: true };
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error deleting dispenser');
    }
  }
}
