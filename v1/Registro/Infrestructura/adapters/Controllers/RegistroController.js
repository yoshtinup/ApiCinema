

import jwt from "jsonwebtoken";
import { CreateClient }  from "../../../application/CreateClient.js";
import { GetAllClients } from "../../../application/GetAllClients.js";
import { GetClientById } from "../../../application/GetClientById.js";
import { UpdatClientById } from "../../../application/UpdatClientById.js";
import { DeleteClientById } from "../../../application/DeleteClientById.js";
import { VerifyLogin } from "../../../application/VerifyLogin.js";
import { UpdateNFCById } from "../../../application/UpdateNFCById.js";
export class RegistroController {
  constructor(clientRepository) {
    this.createClientUseCase = new CreateClient(clientRepository);
    this.getAllClientsUseCase = new GetAllClients(clientRepository);
    this.verifyLoginUseCase = new VerifyLogin(clientRepository);
    this.getclientByIdUseCase = new GetClientById(clientRepository);
    this.updateClientByIdUseCase = new UpdatClientById(clientRepository);
    this.deleteClientByIdUseCase = new DeleteClientById(clientRepository);
    this.updateNFCByIdUseCase = new UpdateNFCById(clientRepository);

  }
  // Método para manejar la solicitud HTTP POST /clients
  async createClient(req, res) {
    try {
      const { nombre, apellido, telefono, gmail, codigo, usuario, id_role_fk, nfc } = req.body;

      // Crear los datos del cliente y ejecutar el caso de uso para crear al cliente
      const clientData = {
        nombre: nombre ?? '',
        apellido: apellido ?? '',
        telefono: telefono ?? '',
        gmail: gmail ?? '',
        codigo: codigo ?? '',
        usuario: usuario ?? '',
        id_role_fk: id_role_fk ?? 1, // Por defecto role 1 (usuario normal)
        nfc: nfc ?? null
      };

      const newClient = await this.createClientUseCase.execute(clientData);

      // Generar token incluyendo nfc y usuario
      const token = jwt.sign(
        {
          id: newClient.id,
          nombre: newClient.nombre,
          id_role_fk: newClient.id_role_fk,
          nfc: newClient.nfc ?? null,
          usuario: newClient.usuario ?? null
        },
        process.env.JWT_SECRET || 'tu_secreto_super_secreto',
        { expiresIn: '1h' }
      );

      res.status(201).json({
        ...newClient,
        nfc: newClient.nfc ?? null,
        usuario: newClient.usuario ?? null,
        token
      });


    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }


  async getAllClients(req, res) {
    try {
      const clients = await this.getAllClientsUseCase.execute();
      res.status(200).json(clients);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async verifyLogin(req, res) {
    try {
      const { gmail, password } = req.body;
      // Validar que ambos campos estén presentes
      if (!gmail || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const verifiedUser = await this.verifyLoginUseCase.execute(gmail, password);
      if (!verifiedUser) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

    const token = jwt.sign(
      {
        id: verifiedUser.id,
        tipo: verifiedUser.tipo,
        nombre: verifiedUser.nombre,
        id_role_fk: verifiedUser.id_role_fk,
        nfc: verifiedUser.nfc ?? null,
        usuario: verifiedUser.usuario ?? null,
        email: verifiedUser.email ?? null
      },
      process.env.JWT_SECRET || 'tu_secreto_super_secreto',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',

      userId: verifiedUser.id,

      token,
      nfc: verifiedUser.nfc ?? null,
      usuario: verifiedUser.usuario ?? null
    });
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }
  
  async getClientById(req, res) {
    try {
      const { id } = req.params;
      const client = await this.getclientByIdUseCase.execute(id);
      if (client) {
        res.status(200).json(client);
      } else {
        res.status(404).json({ message: 'Client not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async updateClientById(req, res) {
    try {
      const { id } = req.params;
      const clientData = req.body;
  
      // Verificar si al menos un campo está presente para actualizar
      if (!clientData.nombre && !clientData.apellido && !clientData.telefono && !clientData.gmail && !clientData.codigo && !clientData.usuario && !clientData.nfc) {
        return res.status(400).json({ message: 'At least one field is required to update' });
      }

      // Ejecutar el caso de uso para actualizar el cliente
      const updatedClient = await this.updateClientByIdUseCase.execute(id, clientData);

      // Verificar si el cliente fue encontrado y actualizado
      if (!updatedClient) {
        return res.status(404).json({ message: 'Client not found' });
      }

      res.status(200).json({ message: 'Client updated successfully', updatedClient });
    } catch (error) {
      // Manejo de errores
      res.status(500).json({ message: error.message });
    }
  }
  async deleteClientById(req, res) {
    try {
      const { id } = req.params;
      const deleted = await this.deleteClientByIdUseCase.execute(id);
      if (deleted) {
        res.status(200).json({ message: 'Client deleted successfully' });
      } else {
        res.status(404).json({ message: 'Client not found for now' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  

  // Endpoint para actualizar solo el campo NFC
  async updateNFC(req, res) {
    try {
      const { id } = req.params;
      const { nfc } = req.body;
      if (!nfc) {
        return res.status(400).json({ message: 'El campo nfc es requerido' });
      }
      // Solo actualiza el campo nfc usando el caso de uso
      const updatedClient = await this.updateNFCByIdUseCase.execute(id, nfc);
      if (!updatedClient) {
        return res.status(404).json({ message: 'Client not found' });
      }
      res.status(200).json({ message: 'NFC actualizado correctamente', updatedClient });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

