
import express from 'express';

import { ProductoController } from  "../../../adapters/controllers/ProductoController.js"
import { ProductoRepository } from '../../../adapters/repositories/ProductoRepository.js';

export const ProductoRouter = express.Router();

const productoRepository = new ProductoRepository();
const productoController = new ProductoController(productoRepository);

// Definir la ruta POST /clients

ProductoRouter.get('/producto', (req, res) => productoController.getAllProducto(req, res));
ProductoRouter.get("/producto/:id", (req, res) => productoController.getProductoById(req, res));
ProductoRouter.post("/producto",(req, res) => productoController.createProducto(req, res));
ProductoRouter.put("/producto/:id",(req, res) => productoController.updateProductoById(req, res));
ProductoRouter.delete("/producto/:id" ,(req, res) => productoController.deleteProductoById(req, res));
