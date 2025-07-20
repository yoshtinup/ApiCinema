import express from 'express';
import rateLimit from 'express-rate-limit';
import { AnalyticsRepository } from '../../../adapters/repositories/AnalyticsRepository.js';
import { AnalyticsController } from '../../../adapters/controllers/AnalyticsController.js';
import { auditLogger } from '../../../../../../middleware/auditLogger.js';

export const AnalyticsRouter = express.Router();

// Inicializar repositorio y controlador
const analyticsRepository = new AnalyticsRepository();
const analyticsController = new AnalyticsController(analyticsRepository);

// Configuración del rate limiting para Analytics
const analyticsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 peticiones por IP
  message: "Límite de solicitudes de analytics excedido. Intente de nuevo más tarde.",
  handler: (req, res, next) => {
    console.warn(`Analytics rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ 
      success: false,
      error: "Límite de solicitudes excedido. Intente de nuevo más tarde." 
    });
  }
});

// Aplicar rate limiter a todas las rutas de analytics
AnalyticsRouter.use(analyticsRateLimiter);

// ===== RUTAS DE ANALYTICS =====

/**
 * @route GET /api/v1/analytics/dashboard
 * @desc Obtiene todos los datos del dashboard
 * @query {string} period - Período: today, week, month
 * @access Admin (requiere verificación de rol)
 */
AnalyticsRouter.get('/dashboard', 
  auditLogger('Consulta Dashboard Analytics'),
  (req, res) => analyticsController.getDashboardData(req, res)
);

/**
 * @route GET /api/v1/analytics/sales-metrics
 * @desc Obtiene métricas generales de ventas
 * @query {string} period - Período: today, week, month, custom
 * @query {string} startDate - Fecha inicio (para período custom)
 * @query {string} endDate - Fecha fin (para período custom)
 * @access Admin
 */
AnalyticsRouter.get('/sales-metrics',
  auditLogger('Consulta Métricas de Ventas'),
  (req, res) => analyticsController.getSalesMetrics(req, res)
);

/**
 * @route GET /api/v1/analytics/top-products
 * @desc Obtiene los productos más vendidos
 * @query {string} period - Período: today, week, month
 * @query {number} limit - Límite de productos (default: 10, max: 100)
 * @access Admin
 */
AnalyticsRouter.get('/top-products',
  auditLogger('Consulta Productos Más Vendidos'),
  (req, res) => analyticsController.getTopSellingProducts(req, res)
);

/**
 * @route GET /api/v1/analytics/sales-summary
 * @desc Obtiene resumen de ventas (para vista principal)
 * @query {string} period - Período: today, week, month
 * @access Admin
 */
AnalyticsRouter.get('/sales-summary',
  auditLogger('Consulta Resumen de Ventas'),
  (req, res) => analyticsController.getSalesSummary(req, res)
);

// ===== MIDDLEWARE DE MANEJO DE ERRORES =====
AnalyticsRouter.use((error, req, res, next) => {
  console.error('Analytics Router Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error in analytics',
    message: 'Ha ocurrido un error en el servicio de analytics'
  });
});

export default AnalyticsRouter;
