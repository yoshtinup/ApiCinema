/**
 * Router para el módulo de análisis estadístico
 */
import express from 'express';
import { StatisticalAnalyticsController } from '../../../adapters/controllers/StatisticalAnalyticsController.js';

export const AnalyticsRouter = express.Router();
const analyticsController = new StatisticalAnalyticsController();

// Endpoint para obtener análisis estadístico de órdenes
AnalyticsRouter.get('/analytics/orders', (req, res) => analyticsController.getOrdersAnalysis(req, res));

// Endpoint para el dashboard completo
AnalyticsRouter.get('/analytics/dashboard', (req, res) => analyticsController.getDashboard(req, res));
