
import express from 'express';
import { CarritoController } from '../../../adapters/controllers/CarritoController.js';
import { CarritoRepository } from '../../../adapters/repositories/CarritoRepository.js';

export const CarritoRouter = express.Router();

const carritoRepository = new CarritoRepository();
const carritoController = new CarritoController(carritoRepository);

// Rutas tradicionales
CarritoRouter.get('/carrito', (req, res) => carritoController.getAllProducto(req, res));
CarritoRouter.get("/carrito/:id", (req, res) => carritoController.getProductoById(req, res));
CarritoRouter.post("/carrito",(req, res) => carritoController.createProducto(req, res));
CarritoRouter.put("/carrito/:id",(req, res) => carritoController.updateProductoById(req, res));
CarritoRouter.delete("/carrito/:id" ,(req, res) => carritoController.deleteProductoById(req, res));

// Nuevas rutas para manejo de carrito con cantidades
CarritoRouter.get("/carrito/user/:userId", (req, res) => carritoController.getCartByUserId(req, res));
CarritoRouter.post("/carrito/:userId/increment/:productId", (req, res) => carritoController.incrementQuantity(req, res));
CarritoRouter.post("/carrito/:userId/decrement/:productId", (req, res) => carritoController.decrementQuantity(req, res));
CarritoRouter.put("/carrito/:userId/quantity/:productId", (req, res) => carritoController.updateQuantity(req, res));
