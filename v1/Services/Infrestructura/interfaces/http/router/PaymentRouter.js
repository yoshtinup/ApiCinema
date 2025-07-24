
import express from 'express';
import { PaymentRepository } from '../../../adapters/Services/PaymentRepository.js';
import { PaymentController } from '../../../adapters/Controllers/PaymentController.js';
import PaymentWebhook from '../PaymentWebhook.js';

export const PaymentRouter = express.Router();

const servicesRepository = new PaymentRepository();
const servicesController = new PaymentController(servicesRepository);

// Rutas de pagos
PaymentRouter.post('/payment', (req, res) => servicesController.createPayment(req , res));

// Incluir las rutas del webhook
PaymentRouter.use('/', PaymentWebhook);



