import express from 'express';
import { PagoRepository } from '../../adapters/repositories/PagoRepository.js';
import { BestSellingProductsController } from '../Controllers/BestSellingProductsController.js';

export const ReportsRouter = express.Router();

// Inicializar repositorio y controlador
const pagoRepository = new PagoRepository();
const bestSellingController = new BestSellingProductsController(pagoRepository);

/**
 * @swagger
 * /api/v1/reports/best-selling-products:
 *   get:
 *     summary: Obtiene los productos más vendidos
 *     description: Analiza las órdenes para determinar qué productos se venden más
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número máximo de productos a retornar
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year, all]
 *           default: all
 *         description: Período de tiempo para el análisis
 *     responses:
 *       200:
 *         description: Lista de productos más vendidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product_id:
 *                             type: integer
 *                           product_name:
 *                             type: string
 *                           total_quantity:
 *                             type: integer
 *                           total_revenue:
 *                             type: number
 *                           order_count:
 *                             type: integer
 *                           average_price:
 *                             type: number
 *                           quantity_percentage:
 *                             type: string
 *                           revenue_percentage:
 *                             type: string
 *                     summary:
 *                       type: object
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
ReportsRouter.get('/best-selling-products', (req, res) => 
  bestSellingController.getBestSellingProducts(req, res)
);

/**
 * @swagger
 * /api/v1/reports/sales-summary:
 *   get:
 *     summary: Obtiene un resumen ejecutivo de ventas
 *     description: Proporciona estadísticas clave de ventas y top productos
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year, all]
 *           default: month
 *         description: Período de tiempo para el análisis
 *     responses:
 *       200:
 *         description: Resumen de ventas obtenido exitosamente
 *       500:
 *         description: Error interno del servidor
 */
ReportsRouter.get('/sales-summary', (req, res) => 
  bestSellingController.getSalesSummary(req, res)
);

console.log('📊 Rutas de reportes configuradas:');
console.log('   GET /api/v1/reports/best-selling-products');
console.log('   GET /api/v1/reports/sales-summary');
