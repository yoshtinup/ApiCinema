import express from 'express';
import { PagoRepository } from '../../adapters/repositories/PagoRepository.js';
import { AnalyticsController } from '../Controllers/AnalyticsController.js';

export const AnalyticsRouter = express.Router();

// Inicializar repositorio y controlador
const pagoRepository = new PagoRepository();
const analyticsController = new AnalyticsController(pagoRepository);

/**
 * @swagger
 * /api/v1/analytics/order-value-distribution:
 *   get:
 *     summary: Obtiene la distribución gaussiana de valores de órdenes
 *     description: Analiza patrones de gasto de clientes usando distribución normal
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year, all]
 *           default: month
 *         description: Período de tiempo para el análisis
 *       - in: query
 *         name: target_value
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 100
 *         description: Valor objetivo de orden en moneda local
 *       - in: query
 *         name: confidence_level
 *         schema:
 *           type: integer
 *           enum: [68, 95, 99]
 *           default: 95
 *         description: Nivel de confianza para intervalos
 *       - in: query
 *         name: data_points
 *         schema:
 *           type: integer
 *           minimum: 20
 *           maximum: 100
 *           default: 50
 *         description: Número de puntos para la curva gaussiana
 *     responses:
 *       200:
 *         description: Distribución gaussiana calculada exitosamente
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
 *                     mean:
 *                       type: number
 *                       description: Valor promedio de órdenes
 *                     std_deviation:
 *                       type: number
 *                       description: Desviación estándar
 *                     sample_size:
 *                       type: integer
 *                       description: Número de órdenes analizadas
 *                     probability_within_target:
 *                       type: number
 *                       description: Probabilidad de alcanzar el objetivo
 *                     data_points:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: number
 *                           probability:
 *                             type: number
 *                     confidence_intervals:
 *                       type: object
 *                       properties:
 *                         68_percent:
 *                           type: array
 *                           items:
 *                             type: number
 *                         95_percent:
 *                           type: array
 *                           items:
 *                             type: number
 *                     insights:
 *                       type: object
 *                       properties:
 *                         efficiency_score:
 *                           type: string
 *                         recommendation:
 *                           type: string
 *                         business_health:
 *                           type: string
 *       400:
 *         description: Parámetros inválidos o datos insuficientes
 *       500:
 *         description: Error interno del servidor
 */
AnalyticsRouter.get('/order-value-distribution', (req, res) => 
  analyticsController.getOrderValueDistribution(req, res)
);

/**
 * @swagger
 * /api/v1/analytics/products-per-order-distribution:
 *   get:
 *     summary: Obtiene la distribución de cantidad de productos por orden
 *     description: Analiza cuántos productos compran típicamente los clientes
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year, all]
 *           default: month
 *         description: Período de tiempo para el análisis
 *       - in: query
 *         name: target_quantity
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 3
 *         description: Cantidad objetivo de productos por orden
 *     responses:
 *       200:
 *         description: Distribución obtenida exitosamente
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
AnalyticsRouter.get('/products-per-order-distribution', (req, res) => 
  analyticsController.getProductsPerOrderDistribution(req, res)
);

/**
 * @swagger
 * /api/v1/analytics/business-summary:
 *   get:
 *     summary: Obtiene un resumen completo de analytics del negocio
 *     description: Proporciona múltiples análisis estadísticos en un solo endpoint
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *         description: Período de tiempo para el análisis
 *     responses:
 *       200:
 *         description: Resumen de analytics generado exitosamente
 *       500:
 *         description: Error interno del servidor
 */
AnalyticsRouter.get('/business-summary', (req, res) => 
  analyticsController.getBusinessAnalyticsSummary(req, res)
);

console.log('📊 Rutas de analytics configuradas:');
console.log('   GET /api/v1/analytics/order-value-distribution');
console.log('   GET /api/v1/analytics/products-per-order-distribution');
console.log('   GET /api/v1/analytics/business-summary');
