
import express from 'express';

import { CorreoRepository } from '../../../adapters/Services/CorreoRepository.js';
import { CorreoController } from '../../../adapters/Controllers/CorreoController.js';


export const CorreoRouter = express.Router();

const servicesRepository = new CorreoRepository();
const servicesController = new CorreoController(servicesRepository);

// Definir la ruta POST /clients
CorreoRouter.post('/correos', (req, res) => servicesController.sendCorreo(req, res));


