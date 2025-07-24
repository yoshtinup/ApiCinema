import { GetSalesMetrics } from '../../../Aplicativo/GetSalesMetrics.js';
import { GetTopSellingProducts } from '../../../Aplicativo/GetTopSellingProducts.js';
import { GetDashboardData } from '../../../Aplicativo/GetDashboardData.js';
import { GetProbabilityAnalysis } from '../../../Aplicativo/GetProbabilityAnalysis.js';

/**
 * Controlador para las funcionalidades de Analytics
 */
export class AnalyticsController {
  constructor(analyticsRepository) {
    this.getSalesMetricsUseCase = new GetSalesMetrics(analyticsRepository);
    this.getTopSellingProductsUseCase = new GetTopSellingProducts(analyticsRepository);
    this.getDashboardDataUseCase = new GetDashboardData(analyticsRepository);
    this.getProbabilityAnalysisUseCase = new GetProbabilityAnalysis(analyticsRepository);
  }

  /**
   * Obtiene métricas generales de ventas
   * GET /api/v1/analytics/sales-metrics?period=today|week|month
   */
  async getSalesMetrics(req, res) {
    try {
      const { period = 'today', startDate, endDate } = req.query;
      
      const salesMetrics = await this.getSalesMetricsUseCase.execute(
        period, 
        startDate ? new Date(startDate) : null, 
        endDate ? new Date(endDate) : null
      );

      res.status(200).json({
        success: true,
        data: salesMetrics,
        message: 'Sales metrics retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getSalesMetrics controller:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get sales metrics'
      });
    }
  }

  /**
   * Obtiene los productos más vendidos
   * GET /api/v1/analytics/top-products?period=today|week|month&limit=10
   */
  async getTopSellingProducts(req, res) {
    try {
      const { period = 'today', limit = 10 } = req.query;
      
      const topProducts = await this.getTopSellingProductsUseCase.execute(
        period, 
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        data: topProducts,
        message: 'Top selling products retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getTopSellingProducts controller:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get top selling products'
      });
    }
  }

  /**
   * Obtiene todos los datos del dashboard
   * GET /api/v1/analytics/dashboard?period=today|week|month
   */
  async getDashboardData(req, res) {
    try {
      const { period = 'today' } = req.query;
      
      const dashboardData = await this.getDashboardDataUseCase.execute(period);

      res.status(200).json({
        success: true,
        data: dashboardData,
        message: 'Dashboard data retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getDashboardData controller:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get dashboard data'
      });
    }
  }

  /**
   * Obtiene resumen de ventas para la vista principal
   * GET /api/v1/analytics/sales-summary
   */
  async getSalesSummary(req, res) {
    try {
      const { period = 'month' } = req.query;
      
      // Obtener métricas del período actual y anterior para comparación
      const currentMetrics = await this.getSalesMetricsUseCase.execute(period);
      
      // Calcular período anterior para comparación
      let previousPeriod;
      switch (period) {
        case 'today':
          previousPeriod = 'yesterday';
          break;
        case 'week':
          previousPeriod = 'previous_week';
          break;
        case 'month':
          previousPeriod = 'previous_month';
          break;
        default:
          previousPeriod = 'month';
      }

      const summary = {
        totalRevenue: currentMetrics.totalRevenue,
        totalSales: currentMetrics.totalSales,
        averageOrderValue: currentMetrics.averageOrderValue,
        period: period,
        // Aquí podrías agregar lógica de comparación con período anterior
        growthPercentage: 12 // Placeholder - implementar cálculo real
      };

      res.status(200).json({
        success: true,
        data: summary,
        message: 'Sales summary retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getSalesSummary controller:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get sales summary'
      });
    }
  }

  /**
   * Obtiene análisis completo de probabilidades y distribuciones
   * GET /api/v1/analytics/probability?period=month&type=sales
   */
  async getProbabilityAnalysis(req, res) {
    try {
      const { period = 'month', type = 'sales' } = req.query;
      
      const analysisData = await this.getProbabilityAnalysisUseCase.execute(period, type);

      res.status(200).json({
        success: true,
        data: analysisData,
        message: 'Probability analysis retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getProbabilityAnalysis controller:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get probability analysis'
      });
    }
  }
}
