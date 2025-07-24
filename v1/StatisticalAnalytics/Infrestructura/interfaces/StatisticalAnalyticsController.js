import express from 'express';
import { StatisticalAnalyticsRepository } from '../adapters/StatisticalAnalyticsRepository.js';
import { GetDescriptiveStatisticsUseCase } from '../../Aplicativo/GetDescriptiveStatisticsUseCase.js';
import { GetProbabilityDistributionsUseCase } from '../../Aplicativo/GetProbabilityDistributionsUseCase.js';
import { GenerateBusinessInsightsUseCase } from '../../Aplicativo/GenerateBusinessInsightsUseCase.js';

/**
 * Controlador REST para análisis estadístico
 * Proporciona endpoints para análisis descriptivo, distribuciones de probabilidad e insights de negocio
 */
export class StatisticalAnalyticsController {
  constructor(database) {
    this.router = express.Router();
    this.repository = new StatisticalAnalyticsRepository(database);
    this.descriptiveStatsUseCase = new GetDescriptiveStatisticsUseCase(this.repository);
    this.probabilityDistUseCase = new GetProbabilityDistributionsUseCase(this.repository);
    this.businessInsightsUseCase = new GenerateBusinessInsightsUseCase(this.repository);
    
    this.initializeRoutes();
  }

  /**
   * Inicializa las rutas del controlador
   */
  initializeRoutes() {
    /**
     * @swagger
     * /api/v1/analytics/descriptive:
     *   get:
     *     summary: Obtiene estadísticas descriptivas de los pedidos
     *     description: Calcula medidas estadísticas básicas (media, mediana, desviación estándar, etc.) para análisis de datos de pedidos
     *     tags: [Statistical Analytics]
     *     parameters:
     *       - in: query
     *         name: startDate
     *         schema:
     *           type: string
     *           format: date
     *         description: Fecha de inicio del análisis (YYYY-MM-DD)
     *       - in: query
     *         name: endDate
     *         schema:
     *           type: string
     *           format: date
     *         description: Fecha de fin del análisis (YYYY-MM-DD)
     *       - in: query
     *         name: status
     *         schema:
     *           type: string
     *           enum: [pending, paid, dispensed, cancelled]
     *         description: Estado de los pedidos a analizar
     *       - in: query
     *         name: userId
     *         schema:
     *           type: integer
     *         description: ID del usuario para filtrar pedidos
     *       - in: query
     *         name: categoryId
     *         schema:
     *           type: integer
     *         description: ID de la categoría de productos
     *       - in: query
     *         name: minAmount
     *         schema:
     *           type: number
     *         description: Monto mínimo de pedidos
     *       - in: query
     *         name: maxAmount
     *         schema:
     *           type: number
     *         description: Monto máximo de pedidos
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 10000
     *         description: Límite de registros a analizar
     *     responses:
     *       200:
     *         description: Estadísticas descriptivas calculadas exitosamente
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
     *                     amountStats:
     *                       type: object
     *                       description: Estadísticas de montos de pedidos
     *                     quantityStats:
     *                       type: object
     *                       description: Estadísticas de cantidades
     *                     temporalAnalysis:
     *                       type: object
     *                       description: Análisis temporal de pedidos
     *                     categoryAnalysis:
     *                       type: object
     *                       description: Análisis por categorías
     *                     interpretation:
     *                       type: object
     *                       description: Interpretaciones de los resultados
     *                     alerts:
     *                       type: array
     *                       description: Alertas y recomendaciones
     *                 metadata:
     *                   type: object
     *       400:
     *         description: Parámetros inválidos
     *       500:
     *         description: Error interno del servidor
     */
    this.router.get('/descriptive', this.getDescriptiveStatistics.bind(this));

    /**
     * @swagger
     * /api/v1/analytics/probability:
     *   get:
     *     summary: Obtiene análisis de distribuciones de probabilidad
     *     description: Analiza distribuciones estadísticas (Normal, Poisson) y calcula probabilidades para escenarios de negocio
     *     tags: [Statistical Analytics]
     *     parameters:
     *       - in: query
     *         name: startDate
     *         schema:
     *           type: string
     *           format: date
     *         description: Fecha de inicio del análisis
     *       - in: query
     *         name: endDate
     *         schema:
     *           type: string
     *           format: date
     *         description: Fecha de fin del análisis
     *       - in: query
     *         name: distributions
     *         schema:
     *           type: array
     *           items:
     *             type: string
     *             enum: [normal, poisson, binomial]
     *         description: Distribuciones a analizar
     *       - in: query
     *         name: testValues
     *         schema:
     *           type: array
     *           items:
     *             type: number
     *         description: Valores específicos para calcular probabilidades
     *       - in: query
     *         name: confidenceLevel
     *         schema:
     *           type: number
     *           enum: [0.80, 0.90, 0.95, 0.99]
     *         description: Nivel de confianza para intervalos
     *     responses:
     *       200:
     *         description: Análisis de probabilidades calculado exitosamente
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
     *                     normalParameters:
     *                       type: object
     *                       description: Parámetros de distribución normal
     *                     poissonParameters:
     *                       type: object
     *                       description: Parámetros de distribución Poisson
     *                     businessProbabilities:
     *                       type: object
     *                       description: Probabilidades para casos de negocio
     *                     goodnessOfFitAnalysis:
     *                       type: object
     *                       description: Análisis de bondad de ajuste
     *                     interpretation:
     *                       type: object
     *                       description: Interpretaciones estadísticas
     *       400:
     *         description: Parámetros inválidos
     *       500:
     *         description: Error interno del servidor
     */
    this.router.get('/probability', this.getProbabilityDistributions.bind(this));

    /**
     * @swagger
     * /api/v1/analytics/business-insights:
     *   get:
     *     summary: Genera insights avanzados de negocio
     *     description: Proporciona análisis estratégico con recomendaciones, identificación de oportunidades y evaluación de riesgos
     *     tags: [Statistical Analytics]
     *     parameters:
     *       - in: query
     *         name: startDate
     *         schema:
     *           type: string
     *           format: date
     *         description: Fecha de inicio del análisis
     *       - in: query
     *         name: endDate
     *         schema:
     *           type: string
     *           format: date
     *         description: Fecha de fin del análisis
     *       - in: query
     *         name: focusAreas
     *         schema:
     *           type: array
     *           items:
     *             type: string
     *             enum: [trends, customers, products, operations, financial]
     *         description: Áreas de enfoque para el análisis
     *       - in: query
     *         name: businessContext
     *         schema:
     *           type: string
     *           enum: [growth, optimization, risk_assessment, expansion, efficiency]
     *         description: Contexto de negocio para orientar el análisis
     *       - in: query
     *         name: timeHorizon
     *         schema:
     *           type: string
     *           enum: [short, medium, long]
     *         description: Horizonte temporal para recomendaciones
     *       - in: query
     *         name: priorityThreshold
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 10
     *         description: Umbral de prioridad para filtrar recomendaciones
     *     responses:
     *       200:
     *         description: Insights de negocio generados exitosamente
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
     *                     trends:
     *                       type: object
     *                       description: Análisis de tendencias
     *                     customerSegmentation:
     *                       type: object
     *                       description: Segmentación de clientes
     *                     productAnalysis:
     *                       type: object
     *                       description: Análisis de productos
     *                     opportunities:
     *                       type: array
     *                       description: Oportunidades identificadas
     *                     risks:
     *                       type: array
     *                       description: Riesgos evaluados
     *                     prioritizedRecommendations:
     *                       type: array
     *                       description: Recomendaciones priorizadas
     *                     actionPlan:
     *                       type: object
     *                       description: Plan de acción detallado
     *       400:
     *         description: Parámetros inválidos
     *       500:
     *         description: Error interno del servidor
     */
    this.router.get('/business-insights', this.getBusinessInsights.bind(this));

    /**
     * @swagger
     * /api/v1/analytics/dashboard:
     *   get:
     *     summary: Obtiene datos consolidados para dashboard ejecutivo
     *     description: Combina estadísticas descriptivas, probabilidades e insights para vista ejecutiva
     *     tags: [Statistical Analytics]
     *     parameters:
     *       - in: query
     *         name: period
     *         schema:
     *           type: string
     *           enum: [week, month, quarter, year]
     *         description: Período de análisis
     *       - in: query
     *         name: compareWithPrevious
     *         schema:
     *           type: boolean
     *         description: Comparar con período anterior
     *     responses:
     *       200:
     *         description: Datos de dashboard obtenidos exitosamente
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
     *                     summary:
     *                       type: object
     *                       description: Resumen ejecutivo
     *                     kpis:
     *                       type: object
     *                       description: Indicadores clave de rendimiento
     *                     trends:
     *                       type: object
     *                       description: Tendencias principales
     *                     alerts:
     *                       type: array
     *                       description: Alertas y avisos importantes
     *       500:
     *         description: Error interno del servidor
     */
    this.router.get('/dashboard', this.getDashboardData.bind(this));

    /**
     * @swagger
     * /api/v1/analytics/export:
     *   post:
     *     summary: Exporta análisis completo
     *     description: Genera reporte completo con todos los análisis en formato PDF o Excel
     *     tags: [Statistical Analytics]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               format:
     *                 type: string
     *                 enum: [pdf, excel, json]
     *               includeCharts:
     *                 type: boolean
     *               sections:
     *                 type: array
     *                 items:
     *                   type: string
     *                   enum: [descriptive, probability, insights, recommendations]
     *               filters:
     *                 type: object
     *                 description: Filtros para el análisis
     *     responses:
     *       200:
     *         description: Reporte generado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 downloadUrl:
     *                   type: string
     *                   description: URL de descarga del reporte
     *       400:
     *         description: Parámetros inválidos
     *       500:
     *         description: Error interno del servidor
     */
    this.router.post('/export', this.exportAnalysis.bind(this));
  }

  /**
   * Obtiene estadísticas descriptivas
   */
  async getDescriptiveStatistics(req, res) {
    try {
      const filters = this.extractFilters(req.query);
      const startTime = Date.now();

      const statistics = await this.descriptiveStatsUseCase.execute(filters);

      res.json({
        success: true,
        data: statistics,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          filters: filters
        }
      });
    } catch (error) {
      console.error('Error en estadísticas descriptivas:', error);
      res.status(error.message.includes('validación') ? 400 : 500).json({
        success: false,
        error: error.message,
        code: 'DESCRIPTIVE_STATS_ERROR'
      });
    }
  }

  /**
   * Obtiene análisis de distribuciones de probabilidad
   */
  async getProbabilityDistributions(req, res) {
    try {
      const filters = this.extractFilters(req.query);
      const analysisOptions = this.extractAnalysisOptions(req.query);
      const startTime = Date.now();

      const distributions = await this.probabilityDistUseCase.execute(filters, analysisOptions);

      res.json({
        success: true,
        data: distributions,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          filters: filters,
          analysisOptions: analysisOptions
        }
      });
    } catch (error) {
      console.error('Error en distribuciones de probabilidad:', error);
      res.status(error.message.includes('validación') || error.message.includes('inválid') ? 400 : 500).json({
        success: false,
        error: error.message,
        code: 'PROBABILITY_DIST_ERROR'
      });
    }
  }

  /**
   * Obtiene insights de negocio
   */
  async getBusinessInsights(req, res) {
    try {
      const filters = this.extractFilters(req.query);
      const insightOptions = this.extractInsightOptions(req.query);
      const startTime = Date.now();

      const insights = await this.businessInsightsUseCase.execute(filters, insightOptions);

      res.json({
        success: true,
        data: insights,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          filters: filters,
          insightOptions: insightOptions
        }
      });
    } catch (error) {
      console.error('Error en insights de negocio:', error);
      res.status(error.message.includes('validación') || error.message.includes('inválid') ? 400 : 500).json({
        success: false,
        error: error.message,
        code: 'BUSINESS_INSIGHTS_ERROR'
      });
    }
  }

  /**
   * Obtiene datos consolidados para dashboard
   */
  async getDashboardData(req, res) {
    try {
      const { period = 'month', compareWithPrevious = false } = req.query;
      const startTime = Date.now();

      // Calcular fechas basadas en el período
      const dateRange = this.calculateDateRange(period);
      const filters = {
        startDate: dateRange.start,
        endDate: dateRange.end
      };

      // Ejecutar análisis en paralelo
      const [descriptiveStats, probabilityStats, businessInsights] = await Promise.all([
        this.descriptiveStatsUseCase.execute(filters),
        this.probabilityDistUseCase.execute(filters),
        this.businessInsightsUseCase.execute(filters, { 
          focus_areas: ['trends', 'customers', 'products'],
          business_context: 'optimization',
          priority_threshold: 6
        })
      ]);

      // Preparar datos para dashboard
      const dashboardData = this.prepareDashboardData(descriptiveStats, businessInsights, period);
      
      // Agregar datos de probabilidad
      dashboardData.statistics.probability = {
        normalDistribution: probabilityStats.normalParameters,
        businessProbabilities: probabilityStats.businessProbabilities,
        confidenceIntervals: probabilityStats.confidenceIntervals
      };

      // Comparación con período anterior si se solicita
      let comparison = null;
      if (compareWithPrevious) {
        const previousRange = this.calculatePreviousDateRange(period, dateRange);
        const previousFilters = {
          startDate: previousRange.start,
          endDate: previousRange.end
        };
        
        const previousStats = await this.descriptiveStatsUseCase.execute(previousFilters);
        comparison = this.calculateComparison(descriptiveStats, previousStats);
      }

      res.json({
        success: true,
        data: {
          ...dashboardData,
          comparison,
          metadata: {
            period,
            dataQuality: descriptiveStats.benchmarks?.performance_indicators?.data_quality,
            lastUpdated: new Date().toISOString(),
            sampleSize: descriptiveStats.sampleSize
          }
        },
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          period,
          dateRange,
          version: '1.0.0'
        }
      });
    } catch (error) {
      console.error('Error en dashboard:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'DASHBOARD_ERROR'
      });
    }
  }

  /**
   * Exporta análisis completo
   */
  async exportAnalysis(req, res) {
    try {
      const { format = 'json', includeCharts = false, sections = ['descriptive', 'insights'], filters = {} } = req.body;
      const startTime = Date.now();

      // Validar formato
      const validFormats = ['pdf', 'excel', 'json'];
      if (!validFormats.includes(format)) {
        return res.status(400).json({
          success: false,
          error: 'Formato inválido. Formatos válidos: pdf, excel, json',
          code: 'INVALID_FORMAT'
        });
      }

      // Ejecutar análisis según secciones solicitadas
      const analysisResults = {};
      
      if (sections.includes('descriptive')) {
        analysisResults.descriptive = await this.descriptiveStatsUseCase.execute(filters);
      }
      
      if (sections.includes('probability')) {
        analysisResults.probability = await this.probabilityDistUseCase.execute(filters);
      }
      
      if (sections.includes('insights')) {
        analysisResults.insights = await this.businessInsightsUseCase.execute(filters);
      }

      // Generar reporte según formato
      const reportData = await this.generateReport(analysisResults, format, includeCharts);

      res.json({
        success: true,
        downloadUrl: reportData.url,
        fileName: reportData.fileName,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          format,
          sections,
          fileSize: reportData.size
        }
      });
    } catch (error) {
      console.error('Error en exportación:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'EXPORT_ERROR'
      });
    }
  }

  /**
   * Extrae filtros de los parámetros de consulta
   */
  extractFilters(query) {
    const filters = {};

    if (query.startDate) filters.startDate = query.startDate;
    if (query.endDate) filters.endDate = query.endDate;
    if (query.status) filters.status = query.status;
    if (query.userId) filters.userId = parseInt(query.userId);
    if (query.categoryId) filters.categoryId = parseInt(query.categoryId);
    if (query.minAmount) filters.minAmount = parseFloat(query.minAmount);
    if (query.maxAmount) filters.maxAmount = parseFloat(query.maxAmount);
    if (query.limit) filters.limit = parseInt(query.limit);

    return filters;
  }

  /**
   * Extrae opciones de análisis para distribuciones de probabilidad
   */
  extractAnalysisOptions(query) {
    const options = {};

    if (query.distributions) {
      options.distributions = Array.isArray(query.distributions) ? 
        query.distributions : query.distributions.split(',');
    }

    if (query.testValues) {
      options.testValues = Array.isArray(query.testValues) ? 
        query.testValues.map(v => parseFloat(v)) : 
        query.testValues.split(',').map(v => parseFloat(v));
    }

    if (query.confidenceLevel) {
      options.confidenceLevel = parseFloat(query.confidenceLevel);
    }

    return options;
  }

  /**
   * Extrae opciones de insights
   */
  extractInsightOptions(query) {
    const options = {};

    if (query.focusAreas) {
      options.focus_areas = Array.isArray(query.focusAreas) ? 
        query.focusAreas : query.focusAreas.split(',');
    }

    if (query.businessContext) {
      options.business_context = query.businessContext;
    }

    if (query.timeHorizon) {
      options.time_horizon = query.timeHorizon;
    }

    if (query.priorityThreshold) {
      options.priority_threshold = parseInt(query.priorityThreshold);
    }

    return options;
  }

  /**
   * Calcula rango de fechas basado en período
   */
  calculateDateRange(period) {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setMonth(end.getMonth() - 1);
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }

  /**
   * Calcula rango de fechas del período anterior
   */
  calculatePreviousDateRange(period, currentRange) {
    const currentStart = new Date(currentRange.start);
    const currentEnd = new Date(currentRange.end);
    const duration = currentEnd - currentStart;

    const previousEnd = new Date(currentStart);
    const previousStart = new Date(currentStart - duration);

    return {
      start: previousStart.toISOString().split('T')[0],
      end: previousEnd.toISOString().split('T')[0]
    };
  }

  /**
   * Prepara datos para dashboard
   */
  prepareDashboardData(descriptiveStats, businessInsights, period) {
    return {
      // Resumen principal
      summary: {
        period,
        totalOrders: descriptiveStats.sampleSize,
        averageOrderValue: descriptiveStats.amountStats.mean,
        totalRevenue: descriptiveStats.amountStats.mean * descriptiveStats.sampleSize,
        growthTrend: businessInsights.trends?.revenueTrend?.slope > 0 ? 'positive' : 'negative'
      },
      
      // KPIs principales
      kpis: {
        totalOrders: descriptiveStats.sampleSize,
        averageOrderValue: descriptiveStats.amountStats.mean,
        totalRevenue: descriptiveStats.amountStats.mean * descriptiveStats.sampleSize,
        growthTrend: businessInsights.trends?.revenueTrend?.slope > 0 ? 'positive' : 'negative',
        customerSatisfaction: 85, // Simulado - aquí se podría calcular de datos reales
        conversionRate: 12.5, // Simulado - aquí se podría calcular de datos reales
        revenue: {
          current: descriptiveStats.amountStats.mean * descriptiveStats.sampleSize,
          trend: businessInsights.trends?.revenueTrend?.slope || 0,
          target: descriptiveStats.amountStats.mean * descriptiveStats.sampleSize * 1.1
        },
        orders: {
          current: descriptiveStats.sampleSize,
          trend: businessInsights.trends?.orderCountTrend?.slope || 0,
          target: descriptiveStats.sampleSize * 1.05
        }
      },
      
      // Datos listos para gráficos del frontend
      charts: {
        // Gráfico de barras - Ingresos por período
        revenueChart: {
          type: 'bar',
          data: descriptiveStats.temporalAnalysis?.daily?.map(day => ({
            date: day.date,
            revenue: day.total_amount,
            orders: day.order_count
          })) || [],
          title: 'Ingresos Diarios',
          xAxis: 'date',
          yAxis: 'revenue'
        },
        
        // Gráfico de línea - Tendencia de pedidos
        ordersChart: {
          type: 'line',
          data: descriptiveStats.temporalAnalysis?.daily?.map(day => ({
            date: day.date,
            orders: day.order_count,
            avgAmount: day.avg_amount
          })) || [],
          title: 'Tendencia de Pedidos',
          xAxis: 'date',
          yAxis: 'orders'
        },
        
        // Gráfico de dona - Distribución por categorías
        categoryChart: {
          type: 'doughnut',
          data: descriptiveStats.categoryAnalysis?.categories?.map(cat => ({
            label: cat.category_name,
            value: parseFloat(cat.total_revenue),
            percentage: cat.revenuePercentage
          })) || [],
          title: 'Distribución por Categorías'
        },
        
        // Gráfico de área - Análisis temporal por horas
        hourlyChart: {
          type: 'area',
          data: descriptiveStats.temporalAnalysis?.hourly?.map(hour => ({
            hour: hour.hour,
            orders: hour.order_count,
            revenue: hour.total_amount
          })) || [],
          title: 'Actividad por Horas del Día',
          xAxis: 'hour',
          yAxis: 'orders'
        }
      },
      
      // Estadísticas detalladas
      statistics: {
        descriptive: {
          mean: descriptiveStats.amountStats.mean,
          median: descriptiveStats.amountStats.median,
          standardDeviation: descriptiveStats.amountStats.standardDeviation,
          variability: descriptiveStats.amountStats.coefficientOfVariation,
          skewness: descriptiveStats.amountStats.skewness
        }
      },
      
      // Tendencias y análisis temporal
      trends: {
        revenue: businessInsights.trends?.revenueTrend,
        volume: businessInsights.trends?.orderCountTrend,
        avgOrderValue: businessInsights.trends?.avgOrderValueTrend,
        seasonality: businessInsights.trends?.seasonality
      },
      
      // Insights y recomendaciones
      insights: {
        opportunities: businessInsights.opportunities?.slice(0, 3) || [],
        risks: businessInsights.risks?.slice(0, 3) || [],
        recommendations: businessInsights.prioritizedRecommendations?.slice(0, 5) || []
      },
      
      // Alertas importantes
      alerts: [
        ...descriptiveStats.alerts || [],
        ...businessInsights.prioritizedRecommendations?.slice(0, 2).map(rec => ({
          type: 'recommendation',
          level: rec.priority === 'high' ? 'high' : 'medium',
          message: rec.title,
          action: rec.actions?.[0]
        })) || []
      ]
    };
  }

  /**
   * Calcula comparación entre períodos
   */
  calculateComparison(current, previous) {
    return {
      revenue: {
        change: ((current.amountStats.mean * current.sampleSize) - 
                (previous.amountStats.mean * previous.sampleSize)) / 
                (previous.amountStats.mean * previous.sampleSize) * 100,
        direction: current.amountStats.mean > previous.amountStats.mean ? 'up' : 'down'
      },
      orders: {
        change: (current.sampleSize - previous.sampleSize) / previous.sampleSize * 100,
        direction: current.sampleSize > previous.sampleSize ? 'up' : 'down'
      },
      avgOrderValue: {
        change: (current.amountStats.mean - previous.amountStats.mean) / previous.amountStats.mean * 100,
        direction: current.amountStats.mean > previous.amountStats.mean ? 'up' : 'down'
      }
    };
  }

  /**
   * Calcula el rango de fechas del período anterior
   */
  calculatePreviousDateRange(period, currentRange) {
    const currentStart = new Date(currentRange.start);
    const currentEnd = new Date(currentRange.end);
    const duration = currentEnd.getTime() - currentStart.getTime();
    
    const previousEnd = new Date(currentStart.getTime() - 1); // Un día antes del inicio actual
    const previousStart = new Date(previousEnd.getTime() - duration);
    
    return {
      start: previousStart.toISOString().split('T')[0],
      end: previousEnd.toISOString().split('T')[0]
    };
  }

  /**
   * Genera reporte en el formato especificado
   */
  async generateReport(analysisResults, format, includeCharts) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `statistical-analysis-${timestamp}.${format}`;
    
    // Para esta implementación, retornamos los datos en JSON
    // En una implementación real, aquí se generarían PDFs o archivos Excel
    if (format === 'json') {
      return {
        url: `/downloads/${fileName}`,
        fileName,
        size: JSON.stringify(analysisResults).length
      };
    }

    // Simulación para otros formatos
    return {
      url: `/downloads/${fileName}`,
      fileName,
      size: 1024 * 100 // 100KB simulado
    };
  }

  /**
   * Obtiene el router configurado
   */
  getRouter() {
    return this.router;
  }
}
