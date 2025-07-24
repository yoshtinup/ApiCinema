import { StatisticalAnalyticsRepository } from '../../StatisticalAnalytics/Infrestructura/adapters/StatisticalAnalyticsRepository.js';
import { StatisticalUtils } from '../../StatisticalAnalytics/Infrestructura/utils/StatisticalUtils.js';

/**
 * Caso de uso para obtener análisis de probabilidades y distribuciones
 */
export class GetProbabilityAnalysis {
  constructor(analyticsRepository) {
    this.analyticsRepository = analyticsRepository;
    this.statisticalRepository = new StatisticalAnalyticsRepository();
  }

  /**
   * Ejecuta análisis completo de probabilidades
   * @param {string} period - Período: 'today', 'week', 'month', 'year'
   * @param {string} analysisType - Tipo: 'sales', 'products', 'users', 'dispensers'
   * @returns {Promise<Object>} Análisis probabilístico completo
   */
  async execute(period = 'month', analysisType = 'sales') {
    try {
      // 1. Obtener datos base según el tipo de análisis
      let rawData = [];
      let metadata = {};

      switch (analysisType) {
        case 'sales':
          rawData = await this._getSalesDataForProbability(period);
          metadata = { type: 'Ventas', unit: 'pesos', description: 'Análisis de ingresos por período' };
          break;
        case 'products':
          rawData = await this._getProductDataForProbability(period);
          metadata = { type: 'Productos', unit: 'unidades', description: 'Análisis de demanda por producto' };
          break;
        case 'users':
          rawData = await this._getUserDataForProbability(period);
          metadata = { type: 'Usuarios', unit: 'usuarios', description: 'Análisis de comportamiento de usuarios' };
          break;
        case 'dispensers':
          rawData = await this._getDispenserDataForProbability(period);
          metadata = { type: 'Dispensadores', unit: 'órdenes', description: 'Análisis de uso por dispensador' };
          break;
      }

      if (!rawData || rawData.length === 0) {
        return this._getEmptyAnalysis(analysisType, period, metadata);
      }

      // 2. Análisis estadístico completo usando los métodos existentes
      const filters = { period: period, analysisType: analysisType };
      
      const [descriptiveStats, probabilityDistributions] = await Promise.allSettled([
        this.statisticalRepository.getDescriptiveStatistics(filters),
        this.statisticalRepository.getProbabilityDistributions(filters)
      ]);

      const statisticalAnalysis = {
        descriptiveStatistics: descriptiveStats.status === 'fulfilled' ? descriptiveStats.value : null,
        probabilityDistributions: probabilityDistributions.status === 'fulfilled' ? probabilityDistributions.value : null
      };

      // 3. Predicciones y probabilidades
      const predictions = await this._calculatePredictions(rawData, period);
      
      // 4. Intervalos de confianza
      const confidenceIntervals = this._calculateConfidenceIntervals(rawData);

      // 5. Análisis de tendencias
      const trends = this._analyzeTrends(rawData, period);

      return {
        success: true,
        period: period,
        analysisType: analysisType,
        metadata: metadata,
        generatedAt: new Date().toISOString(),
        dataPoints: rawData.length,
        
        // Estadísticas básicas
        descriptiveStats: statisticalAnalysis.descriptiveStatistics,
        
        // Distribuciones de probabilidad
        probabilityDistributions: statisticalAnalysis.probabilityDistributions,
        
        // Predicciones
        predictions: predictions,
        
        // Intervalos de confianza
        confidenceIntervals: confidenceIntervals,
        
        // Análisis de tendencias
        trends: trends,
        
        // Recomendaciones basadas en probabilidades
        recommendations: this._generateRecommendations(statisticalAnalysis, predictions, trends)
      };

    } catch (error) {
      console.error('Error in GetProbabilityAnalysis:', error);
      return {
        success: false,
        error: error.message,
        period: period,
        analysisType: analysisType
      };
    }
  }

  /**
   * Obtiene datos de ventas para análisis probabilístico
   */
  async _getSalesDataForProbability(period) {
    try {
      const salesByPeriod = await this.analyticsRepository.getSalesByPeriod(period, 'day');
      return salesByPeriod.map(item => parseFloat(item.revenue) || 0);
    } catch (error) {
      console.error('Error getting sales data:', error);
      return [];
    }
  }

  /**
   * Obtiene datos de productos para análisis probabilístico
   */
  async _getProductDataForProbability(period) {
    try {
      const topProducts = await this.analyticsRepository.getTopSellingProducts(period, 50);
      return topProducts.map(product => parseInt(product.sales_count) || 0);
    } catch (error) {
      console.error('Error getting product data:', error);
      return [];
    }
  }

  /**
   * Obtiene datos de usuarios para análisis probabilístico
   */
  async _getUserDataForProbability(period) {
    try {
      const userMetrics = await this.analyticsRepository.getUserMetrics(period);
      return [
        userMetrics.totalUsers || 0,
        userMetrics.activeUsers || 0,
        userMetrics.newUsers || 0
      ];
    } catch (error) {
      console.error('Error getting user data:', error);
      return [];
    }
  }

  /**
   * Obtiene datos de dispensadores para análisis probabilístico
   */
  async _getDispenserDataForProbability(period) {
    try {
      const dispenserStats = await this.analyticsRepository.getDispenserStats(period);
      return dispenserStats.map(dispenser => parseInt(dispenser.total_orders) || 0);
    } catch (error) {
      console.error('Error getting dispenser data:', error);
      return [];
    }
  }

  /**
   * Calcula predicciones basadas en los datos históricos
   */
  async _calculatePredictions(data, period) {
    if (data.length < 2) {
      return {
        nextPeriod: 0,
        confidence: 0,
        trend: 'insufficient_data'
      };
    }

    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const trend = data.length > 1 ? (data[data.length - 1] - data[0]) / (data.length - 1) : 0;
    
    return {
      nextPeriod: Math.max(0, mean + trend),
      confidence: data.length >= 10 ? 0.8 : 0.5,
      trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
      trendValue: trend
    };
  }

  /**
   * Calcula intervalos de confianza para diferentes niveles
   */
  _calculateConfidenceIntervals(data) {
    if (data.length === 0) return {};

    const levels = [0.90, 0.95, 0.99];
    const intervals = {};

    levels.forEach(level => {
      try {
        // Usar el método que ya corregimos en StatisticalUtils
        const interval = StatisticalUtils.confidenceInterval(data, level);
        intervals[`${(level * 100)}%`] = interval;
      } catch (error) {
        intervals[`${(level * 100)}%`] = { lower: 0, upper: 0, mean: 0 };
      }
    });

    return intervals;
  }

  /**
   * Analiza tendencias en los datos
   */
  _analyzeTrends(data, period) {
    if (data.length < 3) {
      return { trend: 'insufficient_data', strength: 0 };
    }

    const midPoint = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, midPoint);
    const secondHalf = data.slice(midPoint);

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const changePercent = ((secondAvg - firstAvg) / (firstAvg || 1)) * 100;

    return {
      trend: changePercent > 5 ? 'increasing' : changePercent < -5 ? 'decreasing' : 'stable',
      strength: Math.abs(changePercent),
      changePercent: changePercent,
      firstHalfAverage: firstAvg,
      secondHalfAverage: secondAvg
    };
  }

  /**
   * Genera recomendaciones basadas en el análisis
   */
  _generateRecommendations(statistical, predictions, trends) {
    const recommendations = [];

    // Recomendaciones basadas en tendencias
    if (trends.trend === 'increasing') {
      recommendations.push({
        type: 'opportunity',
        priority: 'high',
        message: `Tendencia positiva detectada (+${trends.changePercent.toFixed(1)}%). Considere aumentar inventario.`
      });
    } else if (trends.trend === 'decreasing') {
      recommendations.push({
        type: 'warning',
        priority: 'medium',
        message: `Tendencia negativa detectada (${trends.changePercent.toFixed(1)}%). Revise estrategias de marketing.`
      });
    }

    // Recomendaciones basadas en predicciones
    if (predictions.confidence > 0.7) {
      recommendations.push({
        type: 'prediction',
        priority: 'medium',
        message: `Predicción para próximo período: ${predictions.nextPeriod.toFixed(2)} (confianza: ${(predictions.confidence * 100).toFixed(0)}%)`
      });
    }

    // Recomendaciones basadas en distribuciones
    if (statistical.probabilityDistributions) {
      if (statistical.probabilityDistributions.normal?.goodnessOfFit > 0.8) {
        recommendations.push({
          type: 'insight',
          priority: 'low',
          message: 'Los datos siguen una distribución normal, ideal para predicciones estadísticas.'
        });
      }
    }

    return recommendations;
  }

  /**
   * Retorna análisis vacío cuando no hay datos
   */
  _getEmptyAnalysis(analysisType, period, metadata) {
    return {
      success: true,
      period: period,
      analysisType: analysisType,
      metadata: metadata,
      generatedAt: new Date().toISOString(),
      dataPoints: 0,
      message: 'No hay suficientes datos para realizar análisis probabilístico',
      descriptiveStats: {},
      probabilityDistributions: {},
      predictions: { nextPeriod: 0, confidence: 0, trend: 'no_data' },
      confidenceIntervals: {},
      trends: { trend: 'no_data', strength: 0 },
      recommendations: [{
        type: 'info',
        priority: 'low',
        message: 'Genere más datos para obtener análisis probabilísticos precisos.'
      }]
    };
  }
}
