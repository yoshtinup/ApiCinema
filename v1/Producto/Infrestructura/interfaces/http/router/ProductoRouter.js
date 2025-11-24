
import express from 'express';
import { ProductoController } from  "../../../adapters/controllers/ProductoController.js"
import { ProductoRepository } from '../../../adapters/repositories/ProductoRepository.js';

export const ProductoRouter = express.Router();

const productoRepository = new ProductoRepository();
const productoController = new ProductoController(productoRepository);

// Configurar multer para manejo de imágenes
const upload = productoController.getMulterConfig();

// Rutas CRUD estándar
ProductoRouter.get('/producto', (req, res) => productoController.getAllProducto(req, res));
ProductoRouter.get("/producto/:id", (req, res) => productoController.getProductoById(req, res));

// Rutas con soporte para imágenes (usa multer)
ProductoRouter.post("/producto", upload.single('imagen'), (req, res) => productoController.createProducto(req, res));
ProductoRouter.put("/producto/:id", upload.single('imagen'), (req, res) => productoController.updateProductoById(req, res));

ProductoRouter.delete("/producto/:id" ,(req, res) => productoController.deleteProductoById(req, res));

// Nueva ruta para actualizar solo el apartado
ProductoRouter.put("/producto/:id/apartado", (req, res) => productoController.updateApartado(req, res));
