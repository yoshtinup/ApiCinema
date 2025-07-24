/**
 * Controlador para el módulo de análisis estadístico
 */
import { OrderAnalyticsUseCase } from '../../../Aplicativo/OrderAnalyticsUseCase.js';

export class StatisticalAnalyticsController {
  constructor() {
    this.orderAnalyticsUseCase = new OrderAnalyticsUseCase();
  }

  /**
   * Obtiene análisis estadístico de órdenes
   * @param {Object} req - Request HTTP
   * @param {Object} res - Response HTTP
   */
  async getOrdersAnalysis(req, res) {
    try {
      // Obtener período del query string o usar valor predeterminado
      const { period = 'month' } = req.query;
      
      // Validar período
      const validPeriods = ['today', 'week', 'month', 'year', 'all'];
      if (!validPeriods.includes(period)) {
        return res.status(400).json({
          success: false,
          message: `Período no válido. Use uno de: ${validPeriods.join(', ')}`
        });
      }
      
      // Generar análisis
      const analysis = await this.orderAnalyticsUseCase.generateOrdersAnalysis(period);
      
      if (!analysis.success) {
        return res.status(404).json(analysis);
      }
      
      res.status(200).json(analysis);
    } catch (error) {
      console.error('Error en controlador de análisis estadístico:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar análisis estadístico',
        error: error.message
      });
    }
  }

  /**
   * Obtiene el dashboard completo de analytics
   * @param {Object} req - Request HTTP
   * @param {Object} res - Response HTTP
   */
  async getDashboard(req, res) {
    try {
      // Obtener período del query string o usar valor predeterminado
      const { period = 'month' } = req.query;
      
      // Validar período
      const validPeriods = ['today', 'week', 'month', 'year', 'all'];
      if (!validPeriods.includes(period)) {
        return res.status(400).json({
          success: false,
          message: `Período no válido. Use uno de: ${validPeriods.join(', ')}`
        });
      }
      
      // Generar análisis
      const analysis = await this.orderAnalyticsUseCase.generateOrdersAnalysis(period);
      
      if (!analysis.success) {
        return res.status(404).json(analysis);
      }
      
      // Formatear para el dashboard
      const dashboard = {
        period: analysis.period,
        salesSummary: {
          totalRevenue: analysis.priceAnalysis.basicStats.sum.toFixed(2),
          totalOrders: analysis.orderCount,
          averageTicket: analysis.priceAnalysis.basicStats.mean.toFixed(2),
          ordersByStatus: analysis.dataVisualization.statusChart.reduce((acc, item) => {
            acc[item.name] = item.value;
            return acc;
          }, {})
        },
        visualization: {
          charts: {
            barChart: analysis.dataVisualization.barChart,
            lineChart: analysis.dataVisualization.lineChart,
            pieChart: analysis.dataVisualization.pieChart,
            dispenserPieChart: [], // Se podría implementar si se tienen datos de dispensadores
            statusDistribution: analysis.dataVisualization.statusChart
          }
        },
        statistics: {
          prices: {
            min: analysis.priceAnalysis.basicStats.min,
            max: analysis.priceAnalysis.basicStats.max,
            mean: analysis.priceAnalysis.basicStats.mean,
            median: analysis.priceAnalysis.basicStats.median
          },
          products: analysis.productAnalysis.productProbabilities.map(p => ({
            name: p.name,
            probability: p.probability,
            count: p.count,
            revenue: p.revenue
          })),
          trends: analysis.timeAnalysis.trends
        },
        recommendations: analysis.predictions.recommendations
      };
      
      res.status(200).json(dashboard);
    } catch (error) {
      console.error('Error en controlador de dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar dashboard',
        error: error.message
      });
    }
  }
}
