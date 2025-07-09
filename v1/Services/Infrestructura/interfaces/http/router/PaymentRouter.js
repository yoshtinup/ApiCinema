
import express from 'express';

import { PaymentRepository } from '../../../adapters/Services/PaymentRepository.js';
import { PaymentController } from '../../../adapters/Controllers/PaymentController.js';
export const PaymentRouter = express.Router();

const servicesRepository = new PaymentRepository();
const servicesController = new PaymentController(servicesRepository);

// Definir la ruta POST /clients
PaymentRouter.post('/payment', (req, res) => servicesController.createPayment(req , res));



