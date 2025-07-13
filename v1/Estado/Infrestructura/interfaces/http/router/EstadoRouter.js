
import express from 'express';
import { Controller } from '../../../adapters/controllers/Controller.js';
import { Repository } from '../../../adapters/repositories/Repository.js';

export const EstadoRouter = express.Router();

const estadoRepository = new Repository();
const estadoController = new Controller(estadoRepository);

// Definir la ruta POST /clients

EstadoRouter.get('/estado', (req, res) => estadoController.getAllProducto(req, res));
EstadoRouter.get("/estado/:id", (req, res) => estadoController.getProductoById(req, res));
EstadoRouter.post("/estado",(req, res) => estadoController.createProducto(req, res));
EstadoRouter.put("/estado/:id",(req, res) => estadoController.updateProductoById(req, res));
EstadoRouter.delete("/estado/:id" ,(req, res) => estadoController.deleteProductoById(req, res));
