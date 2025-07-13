
import express from 'express';
import { Controller } from '../../../adapters/controllers/Controller.js';
import { Repository } from '../../../adapters/repositories/Repository.js';

export const PagoRouter = express.Router();

const estadoRepository = new Repository();
const estadoController = new Controller(estadoRepository);

// Definir la ruta POST /clients

PagoRouter.get('/pago', (req, res) => estadoController.getAllProducto(req, res));
PagoRouter.get("/pago/:id", (req, res) => estadoController.getProductoById(req, res));
PagoRouter.post("/pago",(req, res) => estadoController.createProducto(req, res));
PagoRouter.put("/pago/:id",(req, res) => estadoController.updateProductoById(req, res));
PagoRouter.delete("/pago/:id" ,(req, res) => estadoController.deleteProductoById(req, res));
