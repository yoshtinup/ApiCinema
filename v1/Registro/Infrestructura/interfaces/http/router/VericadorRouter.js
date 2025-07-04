import express from 'express';
import rateLimit from 'express-rate-limit';

import { VerificRepository } from '../../../adapters/Repositories/VerificRepository.js';
import { VerificController } from '../../../adapters/Controllers/VerificController.js';

export const clientVerific = express.Router();

const clientRepository = new VerificRepository();
const clientController = new VerificController(clientRepository);


// Aplicar el rate limiter y auditLogger a las rutas específicas de clientVerific
clientVerific.post('/verific', (req, res) => clientController.createNewVerific(req, res));
clientVerific.get('/verific', (req, res) => clientController.getAllVerific(req, res));
