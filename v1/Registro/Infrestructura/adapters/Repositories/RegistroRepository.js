

import { IRegistroRepository } from '../../../domain/ports/IRegistroRepository.js';
import { db } from '../../../../../database/mysql.js';
import bcrypt from 'bcryptjs';

export class RegistroRepository extends IRegistroRepository {
  // Método para crear un nuevo cliente en la base de datos
  async getAllClients() {
    const sql = "SELECT * FROM usuarios";
    try {
      const [data] = await db.query(sql);
      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error retrieving clients');
    }
  }

  async createNewClient(client) {
    // Encriptar la contraseña antes de guardar
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(client.codigo, salt);
    const sql = "INSERT INTO usuario(nombre, apellido, telefono, gmail, codigo, usuario, id_role_fk, nfc) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    // Convertir valores undefined a null, excepto id_role_fk que debe ser 1 por defecto
    const params = [
      client.nombre ?? null,
      client.apellido ?? null,
      client.telefono ?? null,
      client.gmail ?? null,
      hashedPassword,
      client.usuario ?? null,
      client.id_role_fk ?? 1, // Por defecto role 1 (usuario normal)
      client.nfc ?? null
    ];
    try {
      const [resultado] = await db.query(sql, params);
      return {
        id: resultado.insertId,
        nombre: client.nombre,
        apellido: client.apellido,
        telefono: client.telefono,
        gmail: client.gmail,
        codigo: undefined, // No devolver el hash
        usuario: client.usuario,
        id_role_fk: client.id_role_fk ?? 1, // Asegurar que retorne 1 por defecto
        nfc: client.nfc ?? null
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error creating new client');
    }
  }
  async findLoginByCredentials(gmail, password) {
    // Buscar solo por gmail
    const sql = "SELECT * FROM usuario WHERE gmail = ?";
    const params = [gmail];
    try {
      const [result] = await db.query(sql, params);
      if (result.length === 0) {
        return null; // Usuario no encontrado
      }
      const user = result[0];
      // Comparar la contraseña encriptada
      const isMatch = await bcrypt.compare(password, user.codigo);
      if (!isMatch) {
        return null; // Contraseña incorrecta
      }
      // No devolver el hash
      user.codigo = undefined;
      return user;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error finding login information');
    }
  }
  
  async getClientById(id) {
    const sql = "SELECT * FROM usuario WHERE id=?";
    const params = [id];
    try {
      const [result] = await db.query(sql, params);
      return result[0]; // Devolvemos el primer resultado ya que la búsqueda es por ID
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error retrieving History by ID');
    }
  }
  async updateClientById(id, client) {
    const sql = "UPDATE usuario SET nombre = ?, apellido = ?, telefono = ?, gmail = ?, usuario = ?, nfc = ? WHERE id = ?";
    const params = [
      client.nombre ?? null,
      client.apellido ?? null,
      client.telefono ?? null,
      client.gmail ?? null,
      client.usuario ?? null,
      client.nfc ?? null,
      id
    ];

    try {
      const [result] = await db.query(sql, params);

      // Verificar si se actualizó algún registro
      if (result.affectedRows === 0) {
        throw new Error('Client not found');
      }

      return result;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error updating client');
    }
  }

  async updateNFCById(id, nfc) {
    const sql = "UPDATE usuario SET nfc = ? WHERE id = ?";
    const params = [nfc, id];
    try {
      const [result] = await db.query(sql, params);
      if (result.affectedRows === 0) {
        return null;
      }
      // Devuelve solo los campos públicos relevantes
      const user = await this.getClientById(id);
      if (!user) return null;
      return {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        id_role_fk: user.id_role_fk,
        nfc: user.nfc,
        usuario: user.usuario ?? null
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error updating NFC');
    }
  }

  async deleteClientById(id) {
    const sql = 'DELETE FROM usuario WHERE id = ?';
    const params = [id];
    try {
      const [result] = await db.query(sql, params);
      return result.affectedRows > 0; // Devuelve `true` si se eliminó un registro, `false` si no
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Error deleting client');
    }
  }
  
}
