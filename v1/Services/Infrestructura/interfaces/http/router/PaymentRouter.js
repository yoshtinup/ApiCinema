import express from 'express';
import { PaymentService } from '../../../adapters/Services/PaymentService.js';
import { PaymentController } from '../../../adapters/Controllers/PaymentController.js';
import { PagoRepository } from '../../../../../pago/Infrestructura/adapters/repositories/PagoRepository.js';
import { CarritoRepository } from '../../../../../Carrito/Infrestructura/adapters/repositories/CarritoRepository.js';
import { authMiddleware } from '../../../../../../middleware/authMiddleware.js';
import PaymentWebhook from '../PaymentWebhook.js';
export const PaymentRouter = express.Router();

// Inicializar servicios y repositorios
const paymentService = new PaymentService();
const pagoRepository = new PagoRepository();
const carritoRepository = new CarritoRepository();

// Controlador principal con la nueva implementación
const paymentController = new PaymentController(
  paymentService,
  pagoRepository,
  carritoRepository
);

// ========================================
// RUTAS NUEVAS - Sistema mejorado
// ========================================

// 1. Crear preferencia de pago con items del carrito
PaymentRouter.post('/payment/create-preference', authMiddleware, 
  (req, res) => paymentController.createPreference(req, res)
);

// 2. Completar pago después de aprobación de MercadoPago
PaymentRouter.post('/payment/complete', authMiddleware,
  (req, res) => paymentController.completePayment(req, res)
);

// 3. Verificar estado de pago por external_reference
PaymentRouter.get('/payment/status', authMiddleware,
  (req, res) => paymentController.checkPaymentStatus(req, res)
);

// ========================================
// WEBHOOK - Notificaciones de MercadoPago
// ========================================

// Incluir las rutas del webhook (ya existente)
PaymentRouter.use('/', PaymentWebhook);

console.log('💳 Rutas de pago configuradas:');
console.log('   POST /payment/create-preference (requiere auth)');
console.log('   POST /payment/complete (requiere auth)');
console.log('   GET  /payment/status?external_reference=XXX (requiere auth)');
console.log('   POST /webhooks/mercadopago (webhook)');
