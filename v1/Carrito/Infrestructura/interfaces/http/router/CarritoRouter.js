
import express from 'express';
import { CarritoController } from '../../../adapters/controllers/CarritoController.js';
import { CarritoRepository } from '../../../adapters/repositories/CarritoRepository.js';

export const CarritoRouter = express.Router();

const carritoRepository = new CarritoRepository();
const carritoController = new CarritoController(carritoRepository);

// Definir la ruta POST /clients

CarritoRouter.get('/carrito', (req, res) => carritoController.getAllProducto(req, res));
CarritoRouter.get("/carrito/:id", (req, res) => carritoController.getProductoById(req, res));
CarritoRouter.post("/carrito",(req, res) => carritoController.createProducto(req, res));
CarritoRouter.put("/carrito/:id",(req, res) => carritoController.updateProductoById(req, res));
CarritoRouter.delete("/carrito/:id" ,(req, res) => carritoController.deleteProductoById(req, res));
