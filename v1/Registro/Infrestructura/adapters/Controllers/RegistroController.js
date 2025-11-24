

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

      // Validar campos requeridos
      if (!gmail || !codigo) {
        return res.status(400).json({ 
          success: false,
          error: 'MISSING_REQUIRED_FIELDS',
          message: 'El correo electrónico y la contraseña son requeridos',
          fields: {
            gmail: !gmail ? 'El correo electrónico es requerido' : null,
            codigo: !codigo ? 'La contraseña es requerida' : null
          }
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(gmail)) {
        return res.status(400).json({ 
          success: false,
          error: 'INVALID_EMAIL_FORMAT',
          message: 'El formato del correo electrónico no es válido',
          field: 'gmail',
          example: 'ejemplo@correo.com'
        });
      }

      // Validar longitud de contraseña
      if (codigo.length < 4) {
        return res.status(400).json({ 
          success: false,
          error: 'PASSWORD_TOO_SHORT',
          message: 'La contraseña debe tener al menos 4 caracteres',
          field: 'codigo'
        });
      }

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
        success: true,
        message: '¡Cuenta creada exitosamente!',
        data: {
          ...newClient,
          nfc: newClient.nfc ?? null,
          usuario: newClient.usuario ?? null,
          token
        }
      });

    } catch (error) {
      console.error('Error creating client:', error);
      
      // Manejar error de email duplicado
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.sqlMessage && error.sqlMessage.includes('unique_gmail')) {
          return res.status(409).json({ 
            success: false,
            error: 'EMAIL_ALREADY_EXISTS',
            message: 'Este correo electrónico ya está registrado',
            suggestion: '¿Ya tienes una cuenta? Intenta iniciar sesión',
            action: 'login',
            field: 'gmail'
          });
        }
        
        // Otro tipo de duplicado (usuario, teléfono, etc.)
        return res.status(409).json({ 
          success: false,
          error: 'DUPLICATE_ENTRY',
          message: 'Ya existe un registro con estos datos',
          details: error.sqlMessage
        });
      }
      
      // Error de base de datos
      if (error.code && error.code.startsWith('ER_')) {
        return res.status(500).json({ 
          success: false,
          error: 'DATABASE_ERROR',
          message: 'Error al crear la cuenta. Por favor intenta de nuevo.'
        });
      }
      
      // Error genérico
      res.status(500).json({ 
        success: false,
        error: 'SERVER_ERROR',
        message: error.message || 'Error al crear la cuenta. Por favor intenta de nuevo.'
      });
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
      
      // Validaciones detalladas de campos requeridos
      if (!gmail && !password) {
        return res.status(400).json({ 
          success: false,
          error: 'MISSING_CREDENTIALS',
          message: 'Por favor ingresa tu correo electrónico y contraseña',
          details: {
            gmail: 'El correo electrónico es requerido',
            password: 'La contraseña es requerida'
          }
        });
      }
      
      if (!gmail) {
        return res.status(400).json({ 
          success: false,
          error: 'MISSING_EMAIL',
          message: 'Por favor ingresa tu correo electrónico',
          field: 'gmail'
        });
      }
      
      if (!password) {
        return res.status(400).json({ 
          success: false,
          error: 'MISSING_PASSWORD',
          message: 'Por favor ingresa tu contraseña',
          field: 'password'
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(gmail)) {
        return res.status(400).json({ 
          success: false,
          error: 'INVALID_EMAIL_FORMAT',
          message: 'El formato del correo electrónico no es válido',
          field: 'gmail',
          example: 'ejemplo@correo.com'
        });
      }

      // Validar longitud de contraseña
      if (password.length < 4) {
        return res.status(400).json({ 
          success: false,
          error: 'PASSWORD_TOO_SHORT',
          message: 'La contraseña debe tener al menos 4 caracteres',
          field: 'password'
        });
      }

      // Intentar login
      const verifiedUser = await this.verifyLoginUseCase.execute(gmail, password);
      
      if (!verifiedUser) {
        return res.status(401).json({ 
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Credenciales inválidas. Por favor verifica tus datos.'
        });
      }

      // Generar token
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
        success: true,
        message: '¡Inicio de sesión exitoso!',
        data: {
          userId: verifiedUser.id,
          nombre: verifiedUser.nombre,
          gmail: verifiedUser.gmail,
          token,
          nfc: verifiedUser.nfc ?? null,
          usuario: verifiedUser.usuario ?? null,
          id_role_fk: verifiedUser.id_role_fk
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      
      // Manejar errores específicos del use case
      if (error.code === 'USER_NOT_FOUND') {
        return res.status(404).json({ 
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'No existe una cuenta con este correo electrónico',
          suggestion: '¿Quieres crear una cuenta nueva?',
          action: 'register'
        });
      }
      
      if (error.code === 'INVALID_PASSWORD') {
        return res.status(401).json({ 
          success: false,
          error: 'INVALID_PASSWORD',
          message: 'La contraseña es incorrecta',
          suggestion: 'Verifica tu contraseña e intenta de nuevo',
          field: 'password'
        });
      }
      
      if (error.code === 'INVALID_CREDENTIALS') {
        return res.status(401).json({ 
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Las credenciales son inválidas',
          suggestion: 'Verifica tu correo y contraseña'
        });
      }
      
      // Error genérico
      res.status(500).json({ 
        success: false,
        error: 'SERVER_ERROR',
        message: 'Ocurrió un error al iniciar sesión. Por favor intenta de nuevo.',
        details: error.message
      });
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

