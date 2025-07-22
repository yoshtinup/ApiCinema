
import express from 'express';
import { PagoController } from '../../../adapters/controllers/PagoController.js';
import { PagoRepository } from '../../../adapters/repositories/PagoRepository.js';
import { CarritoRepository } from '../../../../../Carrito/Infrestructura/adapters/repositories/CarritoRepository.js';
import { authMiddleware } from '../../../../../../middleware/authMiddleware.js';
export const PagoRouter = express.Router();

// Initialize repositories
const pagoRepository = new PagoRepository();
const carritoRepository = new CarritoRepository();

// Initialize controller with both repositories
const pagoController = new PagoController(pagoRepository, carritoRepository);

// Standard CRUD routes
PagoRouter.get('/pago', (req, res) => pagoController.getAllProducto(req, res));
PagoRouter.get("/pago/:id", (req, res) => pagoController.getProductoById(req, res));
PagoRouter.get("/pago/user/:iduser", (req, res) => pagoController.getOrdersByUserId(req, res))
PagoRouter.get("/pago/nfc/:nfc", (req, res) => pagoController.getOrdersByNFC(req, res))
PagoRouter.get("/pago/nfc/:nfc/pending", (req, res) => pagoController.getPendingOrdersByNFC(req, res))
PagoRouter.post("/pago", (req, res) => pagoController.createPago(req, res));
PagoRouter.put("/pago/:id", (req, res) => pagoController.updateProductoById(req, res));
PagoRouter.delete("/pago/:id", (req, res) => pagoController.deleteProductoById(req, res));

// Endpoint para seleccionar orden específica para dispensar (cargar al NFC)
PagoRouter.post("/pago/select/:orderId/nfc/:nfc", (req, res) => pagoController.selectOrderForDispensing(req, res));

// Endpoint para obtener la orden preparada/cargada en un NFC
PagoRouter.get("/pago/nfc/:nfc/ready", (req, res) => pagoController.getReadyOrderByNFC(req, res));

// Endpoint para dispensar la orden cargada en el NFC (cuando se escanea)
PagoRouter.post("/pago/nfc/:nfc/dispense", (req, res) => pagoController.dispenseOrderByNFC(req, res));

// New endpoint for completing payment and transferring cart data to orders - requiere autenticación
PagoRouter.post("/pago/complete", authMiddleware, (req, res) => pagoController.completePayment(req, res));

// Endpoint para obtener productos por arreglo de IDs
PagoRouter.post("/pago/productos/by-ids", (req, res) => pagoController.getProductosByIdsController(req, res));
