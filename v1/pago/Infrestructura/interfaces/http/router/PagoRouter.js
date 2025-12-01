
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
// Obtener una orden por su order_id (expuesta como /api/v1/orders/:orderId)
PagoRouter.get("/orders/:orderId", (req, res) => pagoController.getOrderById(req, res));
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

// Endpoint para actualizar el status de una orden por NFC
// Endpoint para diagnosticar el estado de las órdenes de un NFC
PagoRouter.get("/pago/nfc/:nfc/diagnose", async (req, res) => {
  try {
    const { nfc } = req.params;
    
    if (!nfc) {
      return res.status(400).json({ 
        success: false,
        error: 'El NFC es requerido' 
      });
    }

    // Importar repositorio
    const { PagoRepository } = await import('../../../adapters/repositories/PagoRepository.js');
    const pagoRepo = new PagoRepository();

    // Buscar en nfc_selected_orders
    const sqlNfcSelected = `
      SELECT nso.*, o.status, o.created_at 
      FROM nfc_selected_orders nso 
      LEFT JOIN orders o ON nso.order_id = o.order_id 
      WHERE nso.nfc = ?
    `;
    const [nfcSelectedOrders] = await pagoRepo.getDb().query(sqlNfcSelected, [nfc]);

    // Buscar en orders
    const sqlOrders = `
      SELECT o.order_id, o.status, o.created_at, o.nfc as order_nfc, u.nfc as user_nfc 
      FROM orders o 
      LEFT JOIN usuario u ON o.user_id = u.id 
      WHERE o.nfc = ? OR u.nfc = ? 
      ORDER BY o.created_at DESC
    `;
    const [orders] = await pagoRepo.getDb().query(sqlOrders, [nfc, nfc]);

    // Verificar si hay órdenes activas
    const hasActive = await pagoRepo.hasActiveOrderByNFC(nfc);

    res.status(200).json({
      success: true,
      nfc,
      diagnostics: {
        nfc_selected_orders: nfcSelectedOrders,
        orders: orders,
        has_active_orders: hasActive
      },
      recommendation: hasActive ? 
        'Hay órdenes activas para este NFC. Deberías procesarlas o cancelarlas antes de crear nuevas.' :
        'No hay órdenes activas para este NFC. Puedes crear nuevas órdenes.'
    });

  } catch (error) {
    console.error('Error diagnosing NFC:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al diagnosticar el NFC' 
    });
  }
});

PagoRouter.put("/pago/nfc/:nfc/status", async (req, res) => {
  try {
    const { nfc } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false,
        error: 'El campo status es requerido' 
      });
    }

    // Importar y usar el caso de uso directamente
    const { UpdateOrderStatusByNFC } = await import('../../../../Aplicativo/UpdateOrderStatusByNFC.js');
    const { PagoRepository } = await import('../../../adapters/repositories/PagoRepository.js');
    const pagoRepo = new PagoRepository();
    const updateUseCase = new UpdateOrderStatusByNFC(pagoRepo);
    
    const result = await updateUseCase.execute(nfc, status);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.order
    });

  } catch (error) {
    console.error('Error updating order status by NFC:', error);
    
    if (error.message.includes('Status inválido') || 
        error.message.includes('NFC es requerido') ||
        error.message.includes('No se encontró') ||
        error.message.includes('Transición de estado no válida')) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Endpoint para actualizar el status de una orden específica por NFC y orderId
// Endpoint para actualizar el status de una orden solo por order_id (sin requerir NFC)
PagoRouter.put("/pago/order/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false,
        error: 'El campo status es requerido' 
      });
    }

    // Importar y usar el caso de uso específico
    const { UpdateOrderStatusById } = await import('../../../../Aplicativo/UpdateOrderStatusById.js');
    const { PagoRepository } = await import('../../../adapters/repositories/PagoRepository.js');
    const pagoRepo = new PagoRepository();
    const updateUseCase = new UpdateOrderStatusById(pagoRepo);
    
    const result = await updateUseCase.execute(orderId, status);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.order
    });

  } catch (error) {
    console.error('Error updating order status by orderId:', error);
    
    if (error.message.includes('No se encontró') ||
        error.message.includes('Status inválido') ||
        error.message.includes('es requerido') ||
        error.message.includes('Transición de estado no válida')) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

PagoRouter.put("/pago/order/:orderId/nfc/:nfc/status", async (req, res) => {
  try {
    const { orderId, nfc } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false,
        error: 'El campo status es requerido' 
      });
    }

    // Importar y usar el caso de uso específico
    const { UpdateOrderStatusByOrderIdAndNFC } = await import('../../../../Aplicativo/UpdateOrderStatusByOrderIdAndNFC.js');
    const { PagoRepository } = await import('../../../adapters/repositories/PagoRepository.js');
    const pagoRepo = new PagoRepository();
    const updateUseCase = new UpdateOrderStatusByOrderIdAndNFC(pagoRepo);
    
    const result = await updateUseCase.execute(orderId, nfc, status);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.order
    });

  } catch (error) {
    console.error('Error updating order status by orderId and NFC:', error);
    
    if (error.message.includes('No se encontró') ||
        error.message.includes('Status inválido') ||
        error.message.includes('es requerido') ||
        error.message.includes('Transición de estado no válida')) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});
