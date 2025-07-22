
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

/**
 * @swagger
 * /api/v1/pago/nfc/{nfc}/status:
 *   put:
 *     summary: Actualizar el status de una orden por NFC
 *     description: Permite actualizar el status de una orden específica usando su código NFC
 *     tags: [Orders/NFC]
 *     parameters:
 *       - in: path
 *         name: nfc
 *         required: true
 *         schema:
 *           type: string
 *         description: Código NFC asociado a la orden
 *         example: "ABC123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, paid, dispensed, cancelled]
 *                 description: Nuevo status de la orden
 *                 example: "dispensed"
 *           examples:
 *             dispensed:
 *               summary: Marcar como dispensado
 *               value:
 *                 status: "dispensed"
 *             cancelled:
 *               summary: Cancelar orden
 *               value:
 *                 status: "cancelled"
 *     responses:
 *       200:
 *         description: Status de orden actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Orden actualizada exitosamente de 'paid' a 'dispensed'"
 *                 order:
 *                   type: object
 *                   properties:
 *                     order_id:
 *                       type: string
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     previous_status:
 *                       type: string
 *                       example: "paid"
 *                     new_status:
 *                       type: string
 *                       example: "dispensed"
 *                     nfc:
 *                       type: string
 *                       example: "ABC123"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Error de validación o transición de estado inválida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     - "Status inválido. Los valores permitidos son: pending, paid, dispensed, cancelled"
 *                     - "Transición de estado no válida: de 'dispensed' a 'pending'"
 *                     - "Status es requerido en el body"
 *       404:
 *         description: Orden no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No se encontró ninguna orden asociada al NFC: ABC123"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al actualizar orden por NFC"
 */
// Endpoint para actualizar el status de una orden por NFC
PagoRouter.put("/pago/nfc/:nfc/status", (req, res) => pagoController.updateOrderStatusByNFC(req, res));

// New endpoint for completing payment and transferring cart data to orders - requiere autenticación
PagoRouter.post("/pago/complete", authMiddleware, (req, res) => pagoController.completePayment(req, res));

// Endpoint para obtener productos por arreglo de IDs
PagoRouter.post("/pago/productos/by-ids", (req, res) => pagoController.getProductosByIdsController(req, res));
