import express from 'express';
import rateLimit from 'express-rate-limit';

import { RegistroRepository } from '../../../adapters/Repositories/RegistroRepository.js';
import { RegistroController } from '../../../adapters/Controllers/RegistroController.js';
import { VerifyToken } from '../middlewares/VerifyToken.js';
import { auditLogger } from '../middlewares/auditLogger.js';

export const clientRouter = express.Router();

const clientRepository = new RegistroRepository();
const clientController = new RegistroController(clientRepository);

// Configuración del rate limiting específico para clientRouter
const clientRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de tiempo de 15 minutos
  max: 3, // Máximo de 3 peticiones por IP en esa ventana
  message: "Límite de solicitudes excedido. Intente de nuevo más tarde.",
  handler: (req, res, next) => {
    console.warn(`Límite de peticiones excedido para la IP: ${req.ip}`);
    res.status(429).json({ error: "Límite de solicitudes excedido. Intente de nuevo más tarde." });
  }
});

// Aplicar el rate limiter y auditLogger a las rutas específicas de clientRouter
clientRouter.post('/user', auditLogger('Registro de Cliente'), (req, res) => clientController.createClient(req, res));
clientRouter.get('/user',auditLogger('Consulta de Clientes'), (req, res) => clientController.getAllClients(req, res));
clientRouter.post('/loginUser', auditLogger('Inicio de Sesión'), (req, res) => clientController.verifyLogin(req, res));
clientRouter.get('/user/:id', VerifyToken, auditLogger('Consulta de Cliente por ID'), (req, res) => clientController.getClientById(req, res));
clientRouter.put('/user/:id', VerifyToken, auditLogger('Actualización de Cliente'), (req, res) => clientController.updateClientById(req, res));
clientRouter.put('/user/:id/nfc', VerifyToken, auditLogger('Actualización de NFC'), (req, res) => clientController.updateNFC(req, res));
clientRouter.delete('/user/:id', VerifyToken, auditLogger('Eliminación de Cliente'), (req, res) => clientController.deleteClientById(req, res));

//Aplicar ruta de token de entrada 

