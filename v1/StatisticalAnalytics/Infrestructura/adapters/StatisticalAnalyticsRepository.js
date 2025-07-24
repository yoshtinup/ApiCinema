import { DescriptiveStatistics } from '../../Dominio/models/DescriptiveStatistics.js';
import { ProbabilityDistribution } from '../../Dominio/models/ProbabilityDistribution.js';
import { BusinessInsights } from '../../Dominio/models/BusinessInsights.js';
import { StatisticalUtils } from '../utils/StatisticalUtils.js';
import { ProbabilityUtils } from '../utils/ProbabilityUtils.js';

/**
 * Repositorio de análisis estadístico
 * Implementa la interfaz IStatisticalAnalyticsRepository
 */
export class StatisticalAnalyticsRepository {
  constructor(database) {
    this.db = database;
  }

  /**
   * Obtiene estadísticas descriptivas de los pedidos
   */
  async getDescriptiveStatistics(filters = {}) {
    try {
      // Add default filter for dispensed orders if not specified
      if (!filters.status) {
        filters.status = 'dispensed';
      }
      
      const { query, params } = this.buildOrdersQuery(filters);
      const orderData = await this.db.query(query, params);

      if (!orderData || !orderData[0] || orderData[0].length === 0) {
        throw new Error('No hay datos suficientes para el análisis estadístico');
      }

      // Extraer datos numéricos para análisis - con debugging
      console.log('🔍 Raw order data:', JSON.stringify(orderData[0].slice(0, 3), null, 2));
      
      const amounts = orderData[0].map(order => {
        const amount = parseFloat(order.amount);
        console.log(`🔍 Converting ${order.amount} to ${amount}`);
        return amount;
      }).filter(amount => !isNaN(amount));
      
      console.log('🔍 Processed amounts:', amounts.slice(0, 5));
      
      const quantities = orderData[0].map(order => 1); // Cantidad fija para test
      const processingTimes = []; // Sin processing times para test

      // Calcular estadísticas descriptivas
      const amountStats = StatisticalUtils.calculateDescriptiveStats(amounts);
      const quantityStats = StatisticalUtils.calculateDescriptiveStats(quantities);
      const timeStats = processingTimes.length > 0 ? 
        StatisticalUtils.calculateDescriptiveStats(processingTimes) : null;

      // Análisis temporal
      const temporalAnalysis = await this.getTemporalAnalysis(filters);

      // Análisis por categorías
      const categoryAnalysis = await this.getCategoryAnalysis(filters);

      return new DescriptiveStatistics(
        amountStats,
        quantityStats,
        timeStats,
        temporalAnalysis,
        categoryAnalysis,
        orderData.length,
        new Date()
      );
    } catch (error) {
      throw new Error(`Error calculando estadísticas descriptivas: ${error.message}`);
    }
  }

  /**
   * Calcula distribuciones de probabilidad para los datos de pedidos
   */
  async getProbabilityDistributions(filters = {}) {
    try {
      // Add default filter for dispensed orders if not specified
      if (!filters.status) {
        filters.status = 'dispensed';
      }
      
      const { query, params } = this.buildOrdersQuery(filters);
      const orderData = await this.db.query(query, params);

      if (!orderData || !orderData[0] || orderData[0].length < 10) {
        throw new Error('Se requieren al menos 10 observaciones para análisis de distribución confiable');
      }

      const amounts = orderData[0].map(order => {
        const amount = parseFloat(order.amount);
        return amount;
      }).filter(amount => !isNaN(amount));
      
      console.log('🔍 Probability amounts:', amounts.slice(0, 5));
      
      const dailyOrders = await this.getDailyOrderCounts(filters);

      // Análisis de distribución para montos
      const amountDistribution = ProbabilityUtils.findBestDistribution(amounts);
      
      // Análisis de distribución para órdenes diarias (Poisson)
      const dailyCounts = Object.values(dailyOrders);
      const dailyDistribution = ProbabilityUtils.findBestDistribution(dailyCounts);

      // Calcular parámetros específicos
      const normalParams = {
        mu: StatisticalUtils.calculateMean(amounts),
        sigma: StatisticalUtils.calculateStandardDeviation(amounts)
      };

      const poissonParams = {
        lambda: StatisticalUtils.calculateMean(dailyCounts)
      };

      // Calcular probabilidades específicas para casos de negocio
      const businessProbabilities = this.calculateBusinessProbabilities(amounts, dailyCounts);

      return new ProbabilityDistribution(
        'normal',
        normalParams,
        amountDistribution.allResults.normal.goodnessOfFit,
        'poisson',
        poissonParams,
        dailyDistribution.allResults.poisson?.goodnessOfFit || null,
        businessProbabilities,
        new Date()
      );
    } catch (error) {
      throw new Error(`Error calculando distribuciones de probabilidad: ${error.message}`);
    }
  }

  /**
   * Genera insights de negocio basados en análisis estadístico
   */
  async getBusinessInsights(filters = {}) {
    try {
      const descriptiveStats = await this.getDescriptiveStatistics(filters);
      const probabilityDist = await this.getProbabilityDistributions(filters);

      // Análisis de tendencias
      const trends = await this.analyzeTrends(filters);
      
      // Análisis de segmentación de clientes
      const customerSegmentation = await this.analyzeCustomerSegmentation(filters);
      
      // Análisis de productos
      const productAnalysis = await this.analyzeProductPerformance(filters);
      
      // Detección de anomalías
      const anomalies = await this.detectAnomalies(filters);
      
      // Análisis de correlaciones
      const correlations = await this.analyzeCorrelations(filters);

      // Generar recomendaciones
      const recommendations = this.generateRecommendations({
        descriptiveStats,
        probabilityDist,
        trends,
        customerSegmentation,
        productAnalysis,
        anomalies,
        correlations
      });

      return new BusinessInsights(
        trends,
        customerSegmentation,
        productAnalysis,
        anomalies,
        correlations,
        recommendations,
        new Date()
      );
    } catch (error) {
      throw new Error(`Error generando insights de negocio: ${error.message}`);
    }
  }

  /**
   * Construye la consulta base para obtener datos de pedidos
   */
  buildOrdersQuery(filters) {
    console.log('🔍 Building query with filters:', JSON.stringify(filters, null, 2));
    
    // Consulta completa para obtener todos los datos necesarios
    let query = 'SELECT id, total as amount, 1 as quantity, status, created_at, user_id FROM orders WHERE status = "dispensed"';
    const params = [];
    
    console.log('🔍 Final query:', query);
    console.log('🔍 Final params:', params);

    return { query: query, params };
  }

  /**
   * Análisis temporal de pedidos
   */
  async getTemporalAnalysis(filters) {
    const hourlyQuery = 'SELECT HOUR(created_at) as hour, COUNT(*) as order_count, AVG(total) as avg_amount, SUM(total) as total_amount FROM orders WHERE created_at >= COALESCE(?, DATE_SUB(NOW(), INTERVAL 30 DAY)) GROUP BY HOUR(created_at) ORDER BY hour';

    const dailyQuery = 'SELECT DATE(created_at) as date, COUNT(*) as order_count, AVG(total) as avg_amount, SUM(total) as total_amount FROM orders WHERE created_at >= COALESCE(?, DATE_SUB(NOW(), INTERVAL 90 DAY)) GROUP BY DATE(created_at) ORDER BY date';

    const monthlyQuery = 'SELECT YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as order_count, AVG(total) as avg_amount, SUM(total) as total_amount FROM orders WHERE created_at >= COALESCE(?, DATE_SUB(NOW(), INTERVAL 1 YEAR)) GROUP BY YEAR(created_at), MONTH(created_at) ORDER BY year, month';

    const [hourlyData, dailyData, monthlyData] = await Promise.all([
      this.db.query(hourlyQuery, [filters.startDate || null]),
      this.db.query(dailyQuery, [filters.startDate || null]),
      this.db.query(monthlyQuery, [filters.startDate || null])
    ]);

    return {
      hourly: hourlyData[0] || [],
      daily: dailyData[0] || [],
      monthly: monthlyData[0] || [],
      peakHours: this.findPeakHours(hourlyData[0] || []),
      seasonality: this.analyzeSeasonality(monthlyData[0] || [])
    };
  }

  /**
   * Análisis por categorías de productos
   */
  async getCategoryAnalysis(filters) {
    const query = 'SELECT JSON_UNQUOTE(JSON_EXTRACT(items, "$[0].name")) as category_name, "general" as category_id, COUNT(id) as order_count, AVG(total) as avg_amount, SUM(total) as total_revenue, MIN(total) as min_amount, MAX(total) as max_amount FROM orders WHERE created_at >= COALESCE(?, DATE_SUB(NOW(), INTERVAL 90 DAY)) AND status = "dispensed" GROUP BY JSON_UNQUOTE(JSON_EXTRACT(items, "$[0].name")) ORDER BY total_revenue DESC';

    const categoryData = await this.db.query(query, [filters.startDate || null]);
    
    return {
      categories: categoryData[0] || [],
      topCategory: categoryData[0] && categoryData[0][0] ? categoryData[0][0] : null,
      categoryDistribution: this.calculateCategoryDistribution(categoryData[0] || [])
    };
  }

  /**
   * Obtiene conteos diarios de pedidos
   */
  async getDailyOrderCounts(filters) {
    const query = 'SELECT DATE(created_at) as date, COUNT(*) as count FROM orders WHERE created_at >= COALESCE(?, DATE_SUB(NOW(), INTERVAL 90 DAY)) GROUP BY DATE(created_at) ORDER BY date';

    const data = await this.db.query(query, [filters.startDate || null]);
    
    const dailyOrders = {};
    data[0].forEach(row => {
      dailyOrders[row.date] = row.count;
    });

    return dailyOrders;
  }

  /**
   * Calcula probabilidades específicas para casos de negocio
   */
  calculateBusinessProbabilities(amounts, dailyCounts) {
    const amountMean = StatisticalUtils.calculateMean(amounts);
    const amountStd = StatisticalUtils.calculateStandardDeviation(amounts);
    const dailyMean = StatisticalUtils.calculateMean(dailyCounts);

    return {
      // Probabilidades para montos
      highValueOrder: ProbabilityUtils.normal.cdf(amountMean * 2, amountMean, amountStd),
      lowValueOrder: ProbabilityUtils.normal.cdf(amountMean * 0.5, amountMean, amountStd),
      
      // Probabilidades para volumen diario
      highVolumeDay: 1 - ProbabilityUtils.poisson.cdf(Math.floor(dailyMean * 1.5), dailyMean),
      lowVolumeDay: ProbabilityUtils.poisson.cdf(Math.floor(dailyMean * 0.5), dailyMean),
      
      // Intervalos de confianza
      amountConfidenceInterval: StatisticalUtils.confidenceInterval(amounts, 0.95),
      dailyVolumeRange: {
        p25: Math.floor(dailyMean * 0.75),
        p75: Math.floor(dailyMean * 1.25)
      }
    };
  }

  /**
   * Análisis de tendencias
   */
  async analyzeTrends(filters) {
    const query = 'SELECT DATE(created_at) as date, COUNT(*) as order_count, SUM(total) as revenue, AVG(total) as avg_order_value FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) GROUP BY DATE(created_at) ORDER BY date';

    const trendData = await this.db.query(query, []);
    
    if (!trendData[0] || trendData[0].length < 2) return null;

    const orderCounts = trendData[0].map(d => d.order_count);
    const revenues = trendData[0].map(d => parseFloat(d.revenue));
    const avgValues = trendData[0].map(d => parseFloat(d.avg_order_value));

    return {
      orderCountTrend: StatisticalUtils.calculateTrend(orderCounts),
      revenueTrend: StatisticalUtils.calculateTrend(revenues),
      avgOrderValueTrend: StatisticalUtils.calculateTrend(avgValues),
      seasonality: this.detectSeasonality(trendData)
    };
  }

  /**
   * Análisis de segmentación de clientes
   */
  async analyzeCustomerSegmentation(filters) {
    const query = 'SELECT user_id, COUNT(*) as order_frequency, SUM(total) as total_spent, AVG(total) as avg_order_value, MIN(created_at) as first_order, MAX(created_at) as last_order, DATEDIFF(MAX(created_at), MIN(created_at)) as customer_lifetime_days FROM orders WHERE created_at >= COALESCE(?, DATE_SUB(NOW(), INTERVAL 1 YEAR)) GROUP BY user_id HAVING COUNT(*) > 0';

    const customerData = await this.db.query(query, [filters.startDate || null]);
    
    const frequencies = customerData[0].map(c => c.order_frequency);
    const totalSpents = customerData[0].map(c => parseFloat(c.total_spent));
    const avgValues = customerData[0].map(c => parseFloat(c.avg_order_value));

    // Segmentación RFM simplificada
    const segments = this.performRFMSegmentation(customerData[0] || []);

    return {
      totalCustomers: customerData[0]?.length || 0,
      frequencyStats: StatisticalUtils.calculateDescriptiveStats(frequencies),
      spendingStats: StatisticalUtils.calculateDescriptiveStats(totalSpents),
      avgOrderValueStats: StatisticalUtils.calculateDescriptiveStats(avgValues),
      segments: segments,
      churnRisk: this.calculateChurnRisk(customerData[0] || [])
    };
  }

  /**
   * Análisis de rendimiento de productos
   */
  async analyzeProductPerformance(filters) {
    const query = 'SELECT JSON_UNQUOTE(JSON_EXTRACT(items, "$[0].product_id")) as id, JSON_UNQUOTE(JSON_EXTRACT(items, "$[0].name")) as name, "general" as category_id, COUNT(id) as order_count, SUM(total) as total_revenue, AVG(total) as avg_price, SUM(JSON_UNQUOTE(JSON_EXTRACT(items, "$[0].quantity"))) as total_quantity FROM orders WHERE created_at >= COALESCE(?, DATE_SUB(NOW(), INTERVAL 90 DAY)) AND status = "dispensed" GROUP BY JSON_UNQUOTE(JSON_EXTRACT(items, "$[0].product_id")), JSON_UNQUOTE(JSON_EXTRACT(items, "$[0].name")) ORDER BY total_revenue DESC';

    const productData = await this.db.query(query, [filters.startDate || null]);
    
    return {
      topProducts: (productData[0] || []).slice(0, 10),
      productPerformanceMatrix: this.createPerformanceMatrix(productData[0] || []),
      revenueConcentration: this.calculateRevenueConcentration(productData[0] || [])
    };
  }

  /**
   * Detección de anomalías
   */
  async detectAnomalies(filters) {
    const query = 'SELECT DATE(created_at) as date, COUNT(*) as order_count, SUM(total) as revenue FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH) GROUP BY DATE(created_at) ORDER BY date';

    const dailyData = await this.db.query(query, []);
    
    const orderCounts = dailyData[0].map(d => d.order_count);
    const revenues = dailyData[0].map(d => parseFloat(d.revenue));

    return {
      orderCountAnomalies: StatisticalUtils.detectOutliers(orderCounts),
      revenueAnomalies: StatisticalUtils.detectOutliers(revenues),
      anomalousDays: this.identifyAnomalousDays(dailyData[0] || [], orderCounts, revenues)
    };
  }

  /**
   * Análisis de correlaciones
   */
  async analyzeCorrelations(filters) {
    const query = 'SELECT HOUR(created_at) as hour, DAYOFWEEK(created_at) as day_of_week, total as amount, 1 as quantity FROM orders WHERE created_at >= COALESCE(?, DATE_SUB(NOW(), INTERVAL 90 DAY))';

    const correlationData = await this.db.query(query, [filters.startDate || null]);
    
    const hours = correlationData[0].map(d => d.hour);
    const amounts = correlationData[0].map(d => parseFloat(d.amount));
    const quantities = correlationData[0].map(d => d.quantity);

    return {
      hourAmountCorrelation: StatisticalUtils.correlation(hours, amounts),
      quantityAmountCorrelation: StatisticalUtils.correlation(quantities, amounts),
      correlationMatrix: this.buildCorrelationMatrix(correlationData[0] || [])
    };
  }

  /**
   * Genera recomendaciones basadas en análisis
   */
  generateRecommendations(analysisData) {
    const recommendations = [];

    // Recomendaciones basadas en tendencias
    if (analysisData.trends?.revenueTrend?.slope < -0.1) {
      recommendations.push({
        type: 'revenue_decline',
        priority: 'high',
        title: 'Declive en Ingresos Detectado',
        description: 'Los ingresos muestran una tendencia decreciente. Se recomienda revisar estrategias de precios y marketing.',
        actionItems: [
          'Revisar precios de productos',
          'Implementar campañas promocionales',
          'Analizar competencia'
        ]
      });
    }

    // Recomendaciones basadas en segmentación
    if (analysisData.customerSegmentation?.churnRisk?.highRisk > 0) {
      recommendations.push({
        type: 'customer_retention',
        priority: 'medium',
        title: 'Clientes en Riesgo de Abandono',
        description: `${analysisData.customerSegmentation.churnRisk.highRisk} clientes presentan riesgo alto de abandono.`,
        actionItems: [
          'Implementar programa de fidelización',
          'Contactar clientes en riesgo',
          'Ofrecer incentivos personalizados'
        ]
      });
    }

    return recommendations;
  }

  // Métodos auxiliares para análisis específicos
  findPeakHours(hourlyData) {
    const sortedByCount = [...hourlyData].sort((a, b) => b.order_count - a.order_count);
    return sortedByCount.slice(0, 3);
  }

  analyzeSeasonality(monthlyData) {
    if (monthlyData.length < 12) return null;
    
    const revenues = monthlyData.map(d => parseFloat(d.total_amount));
    const avgRevenue = StatisticalUtils.calculateMean(revenues);
    
    return monthlyData.map(d => ({
      ...d,
      seasonalityIndex: parseFloat(d.total_amount) / avgRevenue
    }));
  }

  calculateCategoryDistribution(categoryData) {
    const totalRevenue = categoryData.reduce((sum, cat) => sum + parseFloat(cat.total_revenue), 0);
    
    return categoryData.map(cat => ({
      ...cat,
      revenuePercentage: (parseFloat(cat.total_revenue) / totalRevenue) * 100
    }));
  }

  performRFMSegmentation(customerData) {
    // Implementación simplificada de segmentación RFM
    const now = new Date();
    
    return customerData.map(customer => {
      const recency = Math.floor((now - new Date(customer.last_order)) / (1000 * 60 * 60 * 24));
      const frequency = customer.order_frequency;
      const monetary = parseFloat(customer.total_spent);
      
      let segment = 'Regular';
      
      if (frequency >= 10 && monetary >= 1000 && recency <= 30) {
        segment = 'VIP';
      } else if (frequency >= 5 && monetary >= 500 && recency <= 60) {
        segment = 'Loyal';
      } else if (recency > 90) {
        segment = 'At Risk';
      } else if (frequency === 1) {
        segment = 'New';
      }
      
      return {
        user_id: customer.user_id,
        recency,
        frequency,
        monetary,
        segment
      };
    });
  }

  calculateChurnRisk(customerData) {
    const now = new Date();
    let highRisk = 0;
    let mediumRisk = 0;
    let lowRisk = 0;
    
    customerData.forEach(customer => {
      const daysSinceLastOrder = Math.floor((now - new Date(customer.last_order)) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastOrder > 90) {
        highRisk++;
      } else if (daysSinceLastOrder > 60) {
        mediumRisk++;
      } else {
        lowRisk++;
      }
    });
    
    return { highRisk, mediumRisk, lowRisk };
  }

  createPerformanceMatrix(productData) {
    const revenues = productData.map(p => parseFloat(p.total_revenue));
    const orderCounts = productData.map(p => p.order_count);
    
    const revenueThreshold = StatisticalUtils.percentile(revenues, 50);
    const volumeThreshold = StatisticalUtils.percentile(orderCounts, 50);
    
    return productData.map(product => ({
      ...product,
      performance_category: this.categorizeProduct(
        parseFloat(product.total_revenue),
        product.order_count,
        revenueThreshold,
        volumeThreshold
      )
    }));
  }

  categorizeProduct(revenue, volume, revenueThreshold, volumeThreshold) {
    if (revenue >= revenueThreshold && volume >= volumeThreshold) {
      return 'Star';
    } else if (revenue >= revenueThreshold && volume < volumeThreshold) {
      return 'Cash Cow';
    } else if (revenue < revenueThreshold && volume >= volumeThreshold) {
      return 'Question Mark';
    } else {
      return 'Dog';
    }
  }

  calculateRevenueConcentration(productData) {
    const sortedByRevenue = [...productData].sort((a, b) => 
      parseFloat(b.total_revenue) - parseFloat(a.total_revenue)
    );
    
    const totalRevenue = sortedByRevenue.reduce((sum, p) => 
      sum + parseFloat(p.total_revenue), 0
    );
    
    let cumulativeRevenue = 0;
    const concentration = sortedByRevenue.map((product, index) => {
      cumulativeRevenue += parseFloat(product.total_revenue);
      return {
        product_rank: index + 1,
        cumulative_percentage: (cumulativeRevenue / totalRevenue) * 100
      };
    });
    
    // Calcular el punto donde el 80% de los ingresos se concentra
    const eightyPercentPoint = concentration.find(c => c.cumulative_percentage >= 80);
    
    return {
      concentration_curve: concentration,
      pareto_point: eightyPercentPoint,
      top_20_percent_revenue: concentration.find(c => c.cumulative_percentage >= 20)?.cumulative_percentage || 0
    };
  }

  identifyAnomalousDays(dailyData, orderCounts, revenues) {
    const orderOutliers = StatisticalUtils.detectOutliers(orderCounts);
    const revenueOutliers = StatisticalUtils.detectOutliers(revenues);
    
    return dailyData.filter((day, index) => 
      orderOutliers.outliers.includes(orderCounts[index]) ||
      revenueOutliers.outliers.includes(revenues[index])
    );
  }

  buildCorrelationMatrix(data) {
    const variables = ['hour', 'amount', 'quantity'];
    const matrix = {};
    
    variables.forEach(var1 => {
      matrix[var1] = {};
      variables.forEach(var2 => {
        const values1 = data.map(d => parseFloat(d[var1]));
        const values2 = data.map(d => parseFloat(d[var2]));
        matrix[var1][var2] = StatisticalUtils.correlation(values1, values2);
      });
    });
    
    return matrix;
  }

  detectSeasonality(trendData) {
    // Implementación simplificada de detección de estacionalidad
    const monthlyRevenues = {};
    
    trendData.forEach(day => {
      const month = new Date(day.date).getMonth();
      if (!monthlyRevenues[month]) {
        monthlyRevenues[month] = [];
      }
      monthlyRevenues[month].push(parseFloat(day.revenue));
    });
    
    const monthlyAverages = {};
    Object.keys(monthlyRevenues).forEach(month => {
      monthlyAverages[month] = StatisticalUtils.calculateMean(monthlyRevenues[month]);
    });
    
    return monthlyAverages;
  }
}
