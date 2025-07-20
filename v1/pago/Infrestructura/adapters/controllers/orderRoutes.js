import { Router } from "express";
import { PagoRepository } from "../repositories/PagoRepository.js";
import { OrderController } from "./OrderController.js";
import { authMiddleware } from "../../../../../middleware/authMiddleware.js";

const router = Router();
const pagoRepository = new PagoRepository();
const orderController = new OrderController(pagoRepository);

// Endpoint para crear una orden (POST /orders) - requiere autenticación
router.post("/orders", authMiddleware, (req, res) => orderController.createOrder(req, res));

export default router;
