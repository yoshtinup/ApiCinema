/**
 * Caso de uso para análisis estadístico de órdenes
 * Utiliza directamente datos de la base de datos
 */
import { StatisticalUtils } from '../Infrestructura/utils/StatisticalUtils.js';
import { db } from '../../../database/mysql.js';

export class OrderAnalyticsUseCase {
  /**
   * Genera un análisis estadístico completo de las órdenes
   * @param {string} period - Período de tiempo ('today', 'week', 'month', 'year', 'all')
   * @returns {Promise<Object>} - Datos del análisis estadístico
   */
  async generateOrdersAnalysis(period = 'month') {
    try {
      // Obtener datos directamente de la base de datos
      const ordersData = await this.fetchOrdersFromDatabase(period);
      
      if (ordersData.length === 0) {
        return {
          success: false,
          message: "No se encontraron órdenes para el período especificado"
        };
      }

      // Análisis de precios y valores totales
      const priceAnalysis = this.analyzeOrderPrices(ordersData);
      
      // Análisis por productos con probabilidades
      const productAnalysis = this.analyzeProductProbabilities(ordersData);
      
      // Análisis temporal de tendencias
      const timeAnalysis = await this.analyzeTimePatterns(period);
      
      // Predicciones basadas en datos históricos
      const predictions = this.generatePredictions(ordersData, timeAnalysis);
      
      return {
        success: true,
        period,
        orderCount: ordersData.length,
        priceAnalysis,
        productAnalysis,
        timeAnalysis,
        predictions,
        dataVisualization: this.prepareVisualizationData(ordersData, productAnalysis, timeAnalysis)
      };
    } catch (error) {
      console.error('Error generando análisis de órdenes:', error);
      return {
        success: false,
        message: `Error generando análisis: ${error.message}`,
        error: error
      };
    }
  }

  /**
   * Obtiene los datos de órdenes directamente desde la base de datos
   * @param {string} period - Período de tiempo
   * @returns {Promise<Array>} - Datos de órdenes
   */
  async fetchOrdersFromDatabase(period) {
    let dateFilter = '';
    
    switch (period) {
      case 'today':
        dateFilter = `WHERE DATE(created_at) = CURDATE()`;
        break;
      case 'week':
        dateFilter = `WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
        break;
      case 'month':
        dateFilter = `WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
        break;
      case 'year':
        dateFilter = `WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)`;
        break;
      default:
        // 'all' o cualquier otro valor muestra todos los datos
        dateFilter = '';
    }
    
    const sql = `
      SELECT * FROM orders
      ${dateFilter}
      ORDER BY created_at DESC
    `;
    
    try {
      const [results] = await db.query(sql);
      return results;
    } catch (error) {
      console.error('Error al obtener datos de órdenes:', error);
      throw new Error('Error al obtener datos de órdenes');
    }
  }

  /**
   * Analiza precios y valores totales de órdenes
   * @param {Array} orders - Datos de órdenes
   * @returns {Object} - Análisis estadístico de precios
   */
  analyzeOrderPrices(orders) {
    // Extraer valores totales para análisis
    const totalValues = orders.map(order => parseFloat(order.total || 0));
    
    // Usar StatisticalUtils para análisis completo
    const priceStats = StatisticalUtils.calculateDescriptiveStats(totalValues);
    
    // Detectar outliers en precios
    const outlierAnalysis = StatisticalUtils.detectOutliers(totalValues);
    
    // Calcular intervalos de confianza
    const confidenceInterval = StatisticalUtils.calculateConfidenceInterval(totalValues);
    
    return {
      basicStats: priceStats,
      outliers: outlierAnalysis,
      confidenceInterval: confidenceInterval,
      distribution: this.calculatePriceDistribution(totalValues)
    };
  }
  
  /**
   * Calcula la distribución de precios en rangos
   * @param {Array} prices - Lista de precios
   * @returns {Object} - Distribución por rangos
   */
  calculatePriceDistribution(prices) {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;
    
    // Crear 5 rangos de precios
    const binSize = range / 5;
    const bins = Array(5).fill(0);
    const binRanges = Array(5).fill().map((_, i) => ({
      min: min + (i * binSize),
      max: min + ((i + 1) * binSize)
    }));
    
    // Contar valores en cada rango
    prices.forEach(price => {
      for (let i = 0; i < 5; i++) {
        if (price >= binRanges[i].min && (i === 4 || price < binRanges[i].max)) {
          bins[i]++;
          break;
        }
      }
    });
    
    // Calcular probabilidades para cada rango
    const totalCount = prices.length;
    const probabilities = bins.map(count => count / totalCount);
    
    return {
      ranges: binRanges.map((range, i) => ({
        ...range,
        count: bins[i],
        probability: probabilities[i],
        percentage: (probabilities[i] * 100).toFixed(2) + '%'
      }))
    };
  }
  
  /**
   * Analiza probabilidades de productos
   * @param {Array} orders - Datos de órdenes
   * @returns {Object} - Análisis probabilístico de productos
   */
  analyzeProductProbabilities(orders) {
    // Contar apariciones de cada producto
    const productCounts = {};
    const productRevenue = {};
    let totalProducts = 0;
    
    orders.forEach(order => {
      if (order.items) {
        try {
          // Handle different types of items data
          let items;
          if (typeof order.items === 'string') {
            items = JSON.parse(order.items);
          } else if (Array.isArray(order.items)) {
            items = order.items;
          } else if (typeof order.items === 'object' && order.items !== null) {
            items = [order.items]; // Single item object
          } else {
            console.log('Unknown items format:', typeof order.items, order.items);
            return; // Skip this order
          }
          
          items.forEach(item => {
            const productId = item.product_id;
            const quantity = parseInt(item.quantity || 1);
            totalProducts += quantity;
            
            if (!productCounts[productId]) {
              productCounts[productId] = {
                id: productId,
                name: item.name,
                count: 0,
                revenue: 0
              };
            }
            
            productCounts[productId].count += quantity;
            productCounts[productId].revenue += parseFloat(item.subtotal || 0);
          });
        } catch (e) {
          console.error('Error al procesar items para análisis probabilístico:', e);
          console.error('Datos problemáticos:', JSON.stringify(order.items).substring(0, 100) + '...');
        }
      }
    });
    
    // Calcular probabilidades para cada producto
    const productProbabilities = Object.values(productCounts).map(product => {
      const probability = product.count / totalProducts;
      return {
        ...product,
        probability: probability,
        probabilityPercentage: (probability * 100).toFixed(2) + '%'
      };
    }).sort((a, b) => b.probability - a.probability);
    
    // Calcular el índice de Gini para medir concentración de ventas
    const giniIndex = this.calculateGiniIndex(
      productProbabilities.map(p => p.count)
    );
    
    // Calcular entropía para medir variedad de ventas
    const entropy = this.calculateEntropy(
      productProbabilities.map(p => p.probability)
    );
    
    return {
      productProbabilities,
      diversityMetrics: {
        giniIndex,
        entropy,
        totalUniqueProducts: productProbabilities.length,
        totalProductsSold: totalProducts,
        interpretation: {
          gini: this.interpretGini(giniIndex),
          entropy: this.interpretEntropy(entropy, productProbabilities.length)
        }
      }
    };
  }
  
  /**
   * Calcula el índice de Gini (medida de desigualdad)
   * @param {Array} values - Valores para calcular Gini
   * @returns {number} - Índice de Gini (0=igualdad perfecta, 1=desigualdad perfecta)
   */
  calculateGiniIndex(values) {
    const sortedValues = [...values].sort((a, b) => a - b);
    const n = sortedValues.length;
    let sumNumerator = 0;
    
    for (let i = 0; i < n; i++) {
      sumNumerator += (i + 1) * sortedValues[i];
    }
    
    const sumValues = sortedValues.reduce((sum, val) => sum + val, 0);
    return (2 * sumNumerator) / (n * sumValues) - (n + 1) / n;
  }
  
  /**
   * Calcula la entropía de Shannon (medida de diversidad)
   * @param {Array} probabilities - Probabilidades (deben sumar 1)
   * @returns {number} - Entropía
   */
  calculateEntropy(probabilities) {
    return -probabilities.reduce((sum, p) => {
      return sum + (p > 0 ? p * Math.log2(p) : 0);
    }, 0);
  }
  
  /**
   * Interpreta el valor del índice de Gini
   */
  interpretGini(giniValue) {
    if (giniValue < 0.2) return 'Distribución muy equitativa';
    if (giniValue < 0.4) return 'Distribución equitativa';
    if (giniValue < 0.6) return 'Distribución moderada';
    if (giniValue < 0.8) return 'Distribución desigual';
    return 'Distribución muy desigual';
  }
  
  /**
   * Interpreta el valor de la entropía
   */
  interpretEntropy(entropyValue, totalItems) {
    const maxEntropy = Math.log2(totalItems);
    const normalizedEntropy = entropyValue / maxEntropy;
    
    if (normalizedEntropy > 0.8) return 'Alta diversidad';
    if (normalizedEntropy > 0.5) return 'Diversidad moderada';
    return 'Baja diversidad';
  }
  
  /**
   * Analiza patrones temporales en las órdenes
   * @param {string} period - Período de análisis
   * @returns {Promise<Object>} - Análisis temporal
   */
  async analyzeTimePatterns(period) {
    // Definir el intervalo adecuado según el período
    let groupBy = '';
    let dateFormat = '';
    
    switch (period) {
      case 'today':
        groupBy = 'HOUR(created_at)';
        dateFormat = '%H:00';
        break;
      case 'week':
        groupBy = 'DATE(created_at)';
        dateFormat = '%Y-%m-%d';
        break;
      case 'month':
        groupBy = 'DATE(created_at)';
        dateFormat = '%Y-%m-%d';
        break;
      case 'year':
        groupBy = 'WEEK(created_at)';
        dateFormat = 'Semana %u';
        break;
      default:
        groupBy = 'MONTH(created_at)';
        dateFormat = '%Y-%m';
    }
    
    // SQL para obtener datos temporales
    const sql = `
      SELECT 
        ${groupBy} as time_group,
        DATE_FORMAT(created_at, '${dateFormat}') as time_label,
        COUNT(*) as order_count,
        SUM(total) as total_revenue
      FROM orders
      ${period !== 'all' ? this.getDateFilterForPeriod(period) : ''}
      GROUP BY time_group
      ORDER BY MIN(created_at) ASC
    `;
    
    try {
      const [results] = await db.query(sql);
      
      // Calcular tendencias
      const revenueData = results.map(row => parseFloat(row.total_revenue));
      const orderCountData = results.map(row => parseInt(row.order_count));
      
      // Calcular correlación entre número de órdenes y revenue
      const correlation = StatisticalUtils.calculateCorrelation(orderCountData, revenueData);
      
      // Detectar tendencias
      const revenueTrend = this.detectTrend(revenueData);
      
      return {
        timeSeriesData: results,
        correlation,
        trends: {
          revenue: revenueTrend,
          orderCount: this.detectTrend(orderCountData)
        },
        peakPeriods: this.detectPeakPeriods(results),
        seasonality: this.detectSeasonality(results, period)
      };
    } catch (error) {
      console.error('Error al analizar patrones temporales:', error);
      return {
        error: `Error al analizar patrones temporales: ${error.message}`
      };
    }
  }
  
  /**
   * Obtiene la cláusula WHERE para filtrar por período
   */
  getDateFilterForPeriod(period) {
    switch (period) {
      case 'today':
        return `WHERE DATE(created_at) = CURDATE()`;
      case 'week':
        return `WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
      case 'month':
        return `WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
      case 'year':
        return `WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)`;
      default:
        return '';
    }
  }
  
  /**
   * Detecta la tendencia en una serie temporal
   * @param {Array} data - Serie de datos
   * @returns {Object} - Información de tendencia
   */
  detectTrend(data) {
    if (data.length < 2) return { type: 'insuficiente', slope: 0 };
    
    // Calcular pendiente usando una aproximación simple de regresión lineal
    const n = data.length;
    const xMean = (n - 1) / 2; // x = [0, 1, 2, ..., n-1]
    const yMean = data.reduce((sum, y) => sum + y, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (data[i] - yMean);
      denominator += Math.pow(i - xMean, 2);
    }
    
    const slope = denominator !== 0 ? numerator / denominator : 0;
    const percentChange = data.length > 1 ? 
      ((data[data.length - 1] - data[0]) / data[0]) * 100 : 0;
    
    let type = 'estable';
    if (slope > 0.05) type = 'creciente';
    else if (slope < -0.05) type = 'decreciente';
    
    return {
      type,
      slope,
      percentChange: percentChange.toFixed(2) + '%'
    };
  }
  
  /**
   * Detecta períodos pico en una serie temporal
   * @param {Array} timeData - Datos temporales
   * @returns {Array} - Períodos pico
   */
  detectPeakPeriods(timeData) {
    if (timeData.length < 3) return [];
    
    // Convertir a arrays para análisis
    const revenueData = timeData.map(row => ({
      label: row.time_label,
      value: parseFloat(row.total_revenue)
    }));
    
    const orderCountData = timeData.map(row => ({
      label: row.time_label,
      value: parseInt(row.order_count)
    }));
    
    // Identificar picos en revenue
    const revenuePeaks = this.findPeaks(revenueData);
    
    // Identificar picos en conteo de órdenes
    const orderCountPeaks = this.findPeaks(orderCountData);
    
    return {
      revenue: revenuePeaks,
      orderCount: orderCountPeaks
    };
  }
  
  /**
   * Encuentra picos en una serie de datos
   * @param {Array} data - Datos con {label, value}
   * @returns {Array} - Picos encontrados
   */
  findPeaks(data) {
    if (data.length < 3) return [];
    
    const values = data.map(item => item.value);
    const mean = StatisticalUtils.calculateMean(values);
    const stdDev = StatisticalUtils.calculateStandardDeviation(values);
    const threshold = mean + stdDev;
    
    return data.filter(item => item.value > threshold)
      .map(item => ({
        period: item.label,
        value: item.value
      }))
      .sort((a, b) => b.value - a.value);
  }
  
  /**
   * Detecta estacionalidad en las ventas
   * @param {Array} timeData - Datos temporales
   * @param {string} period - Período de análisis
   * @returns {Object} - Patrones estacionales detectados
   */
  detectSeasonality(timeData, period) {
    // Simplificación: si el período es pequeño, no podemos detectar estacionalidad
    if (period === 'today' || period === 'week' || timeData.length < 12) {
      return { detected: false, reason: 'Período insuficiente para análisis estacional' };
    }
    
    // En un caso real, se implementaría análisis de Fourier o descomposición estacional
    // Simplificación para este ejemplo
    return {
      detected: timeData.length >= 12,
      patterns: period === 'year' ? 'Posibles patrones mensuales detectados' : 'Análisis estacional requiere período más largo',
      confidence: 'Media'
    };
  }
  
  /**
   * Genera predicciones basadas en datos históricos
   * @param {Array} orders - Datos de órdenes
   * @param {Object} timeAnalysis - Análisis temporal
   * @returns {Object} - Predicciones generadas
   */
  generatePredictions(orders, timeAnalysis) {
    // Calcular métricas de productos
    const productAnalysis = this.analyzeProductProbabilities(orders);
    const topProducts = productAnalysis.productProbabilities.slice(0, 3);
    
    // Predicción de ventas basada en tendencias
    let revenuePrediction = 'estable';
    let salesGrowth = 0;
    
    if (timeAnalysis && timeAnalysis.trends && timeAnalysis.trends.revenue) {
      const trend = timeAnalysis.trends.revenue;
      revenuePrediction = trend.type;
      salesGrowth = parseFloat(trend.percentChange);
    }
    
    return {
      revenue: {
        trend: revenuePrediction,
        nextPeriodEstimate: this.estimateNextPeriodRevenue(orders, timeAnalysis),
        confidence: 'Media'  // En un sistema real, calcularíamos el intervalo de confianza
      },
      products: {
        mostLikely: topProducts.map(p => ({
          name: p.name,
          probability: p.probability,
          recommendation: p.probability > 0.2 ? 'Aumentar inventario' : 'Mantener inventario'
        }))
      },
      recommendations: this.generateRecommendations(orders, productAnalysis, timeAnalysis)
    };
  }
  
  /**
   * Estima el revenue para el siguiente período
   * @param {Array} orders - Datos de órdenes
   * @param {Object} timeAnalysis - Análisis temporal
   * @returns {Object} - Estimación para el siguiente período
   */
  estimateNextPeriodRevenue(orders, timeAnalysis) {
    if (!timeAnalysis || !timeAnalysis.timeSeriesData || timeAnalysis.timeSeriesData.length < 2) {
      return { value: 0, range: { min: 0, max: 0 }, confidence: 'Baja' };
    }
    
    const timeData = timeAnalysis.timeSeriesData;
    const lastPeriods = timeData.slice(-3);
    
    // Promedio simple de los últimos períodos como predicción base
    const recentValues = lastPeriods.map(d => parseFloat(d.total_revenue));
    const mean = StatisticalUtils.calculateMean(recentValues);
    const stdDev = StatisticalUtils.calculateStandardDeviation(recentValues);
    
    // Aplicar ajuste según la tendencia
    let adjustment = 1;
    if (timeAnalysis.trends && timeAnalysis.trends.revenue) {
      const slope = timeAnalysis.trends.revenue.slope;
      adjustment = 1 + slope;
    }
    
    const predictedValue = mean * adjustment;
    
    // Rango de predicción (simplificado)
    return {
      value: predictedValue.toFixed(2),
      range: {
        min: (predictedValue - stdDev).toFixed(2),
        max: (predictedValue + stdDev).toFixed(2)
      },
      confidence: stdDev / mean < 0.2 ? 'Alta' : 'Media'
    };
  }
  
  /**
   * Genera recomendaciones basadas en análisis estadístico
   * @param {Array} orders - Datos de órdenes
   * @param {Object} productAnalysis - Análisis de productos
   * @param {Object} timeAnalysis - Análisis temporal
   * @returns {Array} - Recomendaciones
   */
  generateRecommendations(orders, productAnalysis, timeAnalysis) {
    const recommendations = [];
    
    // Recomendaciones basadas en productos
    const topProducts = productAnalysis.productProbabilities.slice(0, 3);
    if (topProducts.length > 0) {
      recommendations.push({
        type: 'inventory',
        title: 'Gestión de inventario',
        description: `Mantener stock adicional de: ${topProducts.map(p => p.name).join(', ')}`,
        priority: 'Alta'
      });
    }
    
    // Recomendaciones basadas en diversidad
    const { giniIndex, entropy } = productAnalysis.diversityMetrics;
    if (giniIndex > 0.7) {
      recommendations.push({
        type: 'product_mix',
        title: 'Diversificación de productos',
        description: 'La concentración de ventas en pocos productos es alta. Considerar ampliar la variedad.',
        priority: 'Media'
      });
    }
    
    // Recomendaciones basadas en tendencias temporales
    if (timeAnalysis && timeAnalysis.trends && timeAnalysis.trends.revenue) {
      const revenueTrend = timeAnalysis.trends.revenue;
      if (revenueTrend.type === 'decreciente') {
        recommendations.push({
          type: 'promotion',
          title: 'Campaña promocional',
          description: 'Tendencia de ingresos a la baja. Considerar implementar promociones.',
          priority: 'Alta'
        });
      }
    }
    
    // Recomendaciones basadas en picos
    if (timeAnalysis && timeAnalysis.peakPeriods && timeAnalysis.peakPeriods.revenue) {
      const peaks = timeAnalysis.peakPeriods.revenue;
      if (peaks.length > 0) {
        recommendations.push({
          type: 'planning',
          title: 'Planificación de capacidad',
          description: `Prepararse para mayor demanda en períodos pico: ${peaks.slice(0, 2).map(p => p.period).join(', ')}`,
          priority: 'Media'
        });
      }
    }
    
    return recommendations;
  }
  
  /**
   * Prepara datos para visualización
   * @param {Array} orders - Datos de órdenes
   * @param {Object} productAnalysis - Análisis de productos
   * @param {Object} timeAnalysis - Análisis temporal
   * @returns {Object} - Datos para visualización
   */
  prepareVisualizationData(orders, productAnalysis, timeAnalysis) {
    // Datos para gráfico de barras de ventas por período
    let barChartData = [];
    if (timeAnalysis && timeAnalysis.timeSeriesData) {
      barChartData = timeAnalysis.timeSeriesData.map(item => ({
        period: item.time_label,
        revenue: parseFloat(item.total_revenue).toFixed(2)
      }));
    }
    
    // Datos para gráfico de pie de productos
    let pieChartData = [];
    if (productAnalysis && productAnalysis.productProbabilities) {
      pieChartData = productAnalysis.productProbabilities.slice(0, 5).map(item => ({
        name: item.name,
        value: Math.round(item.probability * 100)
      }));
    }
    
    // Datos para gráfico de línea de tendencia
    let lineChartData = [];
    if (timeAnalysis && timeAnalysis.timeSeriesData) {
      lineChartData = timeAnalysis.timeSeriesData.map(item => ({
        period: item.time_label,
        orders: parseInt(item.order_count),
        revenue: parseFloat(item.total_revenue).toFixed(2)
      }));
    }
    
    // Datos para distribución de estados de órdenes
    const statusCounts = {};
    orders.forEach(order => {
      const status = order.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));
    
    return {
      barChart: barChartData,
      pieChart: pieChartData,
      lineChart: lineChartData,
      statusChart: statusChartData
    };
  }
}
