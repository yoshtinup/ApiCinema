
import express from 'express';
import { PagoController } from '../../../adapters/Controllers/PagoController.js';
import { PagoRepository } from '../../../adapters/repositories/PagoRepository.js';
import { CarritoRepository } from '../../../../../Carrito/Infrestructura/adapters/repositories/CarritoRepository.js';

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
PagoRouter.post("/pago", (req, res) => pagoController.createPago(req, res));
PagoRouter.put("/pago/:id", (req, res) => pagoController.updateProductoById(req, res));
PagoRouter.delete("/pago/:id", (req, res) => pagoController.deleteProductoById(req, res));

// New endpoint for completing payment and transferring cart data to orders
PagoRouter.post("/pago/complete", (req, res) => pagoController.completePayment(req, res));

// Endpoint para obtener productos por arreglo de IDs
PagoRouter.post("/pago/productos/by-ids", (req, res) => pagoController.getProductosByIdsController(req, res));
