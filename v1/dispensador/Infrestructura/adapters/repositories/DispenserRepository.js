import { IDispenserRepository } from '../../../Dominio/ports/IDispenserRepository.js';
import { db } from '../../../../../database/mysql.js';

export class DispenserRepository extends IDispenserRepository {
  async createDispenser(dispenser) {
    // Si el array de productos viene sin 'apartado', lo agregamos si se proporciona en el objeto
    let products = Array.isArray(dispenser.products) ? dispenser.products.map(p => {
      if (!p.apartado && dispenser.apartados && typeof dispenser.apartados === 'object') {
        // Si hay un objeto 'apartados' con la relación id->apartado
        return { ...p, apartado: dispenser.apartados[p.id] ?? undefined };
      }
      return p;
    }) : [];

    const sql = `INSERT INTO dispensador (dispenser_id, location, status, products, last_maintenance, error_count)
      VALUES (?, ?, ?, ?, ?, ?)`;
    
    // Validar y formatear last_maintenance
    let formattedLastMaintenance;
    if (dispenser.last_maintenance) {
      // Si viene con formato ISO, convertir a formato MySQL
      formattedLastMaintenance = dispenser.last_maintenance.replace('T', ' ').replace('Z', '');
    } else {
      // Si no viene, usar fecha actual
      formattedLastMaintenance = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
    
    const params = [
      dispenser.dispenser_id,
      dispenser.location,
      dispenser.status,
      JSON.stringify(products),
      formattedLastMaintenance,
      dispenser.error_count || 0
    ];
    
    console.log('💾 DispenserRepository - SQL:', sql);
    console.log('💾 DispenserRepository - Params:', params);
    try {
      const [result] = await db.query(sql, params);
      console.log('✅ DispenserRepository - Query result:', result);
      
      const createdDispenser = {
        id: result.insertId,
        ...dispenser,
        products
      };
      
      console.log('✅ DispenserRepository - Created dispenser:', createdDispenser);
      
      return createdDispenser;
    } catch (error) {
      console.error('❌ DispenserRepository - Database Error:', error);
      console.error('❌ DispenserRepository - SQL that failed:', sql);
      console.error('❌ DispenserRepository - Params that failed:', params);
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
    // Si vienen datos de rellenado, actualiza el inventario
    if (dispenser.selectedProductBySection && dispenser.quantities) {
      // Obtener el dispensador actual
      const current = await this.getDispenserById(id);
      let products = Array.isArray(current.products) ? current.products : [];
      // Actualizar cantidades por producto
      for (const sectionKey in dispenser.selectedProductBySection) {
        const prodId = dispenser.selectedProductBySection[sectionKey];
        const cantidad = parseInt(dispenser.quantities[prodId], 10);
        if (!prodId || isNaN(cantidad)) continue;
        // Validar inventario disponible en productos
        const sqlCheck = 'SELECT cantidad FROM productos WHERE id = ?';
        let cantidadDisponible = 0;
        try {
          const [rows] = await db.query(sqlCheck, [prodId]);
          cantidadDisponible = rows.length > 0 ? parseInt(rows[0].cantidad, 10) : 0;
        } catch (error) {
          console.error('Error consultando inventario de productos:', error);
          throw new Error('Error consultando inventario de productos');
        }
        if (cantidad > cantidadDisponible) {
          throw new Error(`La cantidad solicitada (${cantidad}) para el producto ${prodId} es mayor al inventario disponible (${cantidadDisponible}).`);
        }
        // Buscar producto en inventario
        let prod = products.find(p => p.id === prodId);
        if (prod) {
          prod.cantidad = (parseInt(prod.cantidad, 10) || 0) + cantidad;
          prod.apartado = sectionKey;
        } else {
          products.push({ id: prodId, cantidad, apartado: sectionKey });
        }
        // Decrementar cantidad en la tabla productos
        const sqlUpdateProducto = 'UPDATE productos SET cantidad = cantidad - ? WHERE id = ?';
        try {
          await db.query(sqlUpdateProducto, [cantidad, prodId]);
        } catch (error) {
          console.error('Error actualizando cantidad en productos:', error);
          throw new Error('Error actualizando cantidad en productos');
        }
      }
      // Actualizar campo products en la BD
      const sql = `UPDATE dispensador SET products = ? WHERE dispenser_id = ?`;
      const params = [JSON.stringify(products), id];
      try {
        const [result] = await db.query(sql, params);
        if (result.affectedRows === 0) throw new Error('Dispenser not found');
        return { dispenser_id: id, products, updated: true };
      } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Error rellenando inventario del dispensador');
      }
    } else {
      // Actualización normal
      // Validar y formatear last_maintenance
      let formattedLastMaintenance;
      if (dispenser.last_maintenance) {
        // Si viene con formato ISO, convertir a formato MySQL
        formattedLastMaintenance = dispenser.last_maintenance.replace('T', ' ').replace('Z', '');
      } else {
        // Si no viene, usar fecha actual
        formattedLastMaintenance = new Date().toISOString().slice(0, 19).replace('T', ' ');
      }
      
      const sql = `UPDATE dispensador SET location = ?, status = ?, products = ?, last_maintenance = ?, error_count = ? WHERE dispenser_id = ?`;
      const params = [
        dispenser.location,
        dispenser.status,
        JSON.stringify(dispenser.products),
        formattedLastMaintenance,
        dispenser.error_count || 0,
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
