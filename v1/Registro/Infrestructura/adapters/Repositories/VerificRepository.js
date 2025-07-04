

import { IRegistroRepository } from '../../../domain/ports/IRegistroRepository.js';
import { db } from '../../../../../database/mysql.js';

export class VerificRepository extends IRegistroRepository {
  // Método para crear un nuevo cliente en la base de datos
  async getAllVerific() {
    const sql = "SELECT * FROM token";
    try {
      const [data] = await db.query(sql);
      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error retrieving clients');
    }
  }

  async createNewVerific(client) {
    const sql = "INSERT INTO token(codigo) VALUES (?)";
   
    // Convertir valores undefined a null
    const params = [
      client.codigo ?? null
    ];
  
    try {
      const [resultado] = await db.query(sql, params);
      return {
        id: resultado.insertId,
        codigo: client.codigo
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error creating new client');
    }
  }
}
