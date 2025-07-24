/**
 * Configuración y inicialización del módulo Statistical Analytics
 * Configura la inyección de dependencias y expone los servicios
 */

import { StatisticalAnalyticsRepository } from './Infrestructura/adapters/StatisticalAnalyticsRepository.js';
import { StatisticalAnalyticsController } from './Infrestructura/interfaces/StatisticalAnalyticsController.js';
import { GetDescriptiveStatisticsUseCase } from './Aplicativo/GetDescriptiveStatisticsUseCase.js';
import { GetProbabilityDistributionsUseCase } from './Aplicativo/GetProbabilityDistributionsUseCase.js';
import { GenerateBusinessInsightsUseCase } from './Aplicativo/GenerateBusinessInsightsUseCase.js';

/**
 * Factory para crear e inicializar el módulo de análisis estadístico
 */
export class StatisticalAnalyticsModule {
  constructor(database) {
    this.database = database;
    this.repository = null;
    this.controller = null;
    this.useCases = {};
  }

  /**
   * Inicializa el módulo con todas sus dependencias
   */
  async initialize() {
    try {
      // Crear repositorio
      this.repository = new StatisticalAnalyticsRepository(this.database);

      // Crear casos de uso
      this.useCases = {
        getDescriptiveStatistics: new GetDescriptiveStatisticsUseCase(this.repository),
        getProbabilityDistributions: new GetProbabilityDistributionsUseCase(this.repository),
        generateBusinessInsights: new GenerateBusinessInsightsUseCase(this.repository)
      };

      // Crear controlador
      this.controller = new StatisticalAnalyticsController(this.database);

      // Test basic database connectivity
      await this.healthCheck();
      
      return this;
    } catch (error) {
      throw new Error(`Failed to initialize StatisticalAnalyticsModule: ${error.message}`);
    }
  }

  /**
   * Obtiene el router para integrar con Express
   */
  getRouter() {
    if (!this.controller) {
      throw new Error('Módulo no inicializado. Llama a initialize() primero.');
    }
    return this.controller.getRouter();
  }

  /**
   * Obtiene el repositorio
   */
  getRepository() {
    if (!this.repository) {
      throw new Error('Módulo no inicializado. Llama a initialize() primero.');
    }
    return this.repository;
  }

  /**
   * Obtiene los casos de uso
   */
  getUseCases() {
    if (!this.useCases) {
      throw new Error('Módulo no inicializado. Llama a initialize() primero.');
    }
    return this.useCases;
  }

  /**
   * Verifica la salud del módulo
   */
  async healthCheck() {
    try {
      // Verificar conexión a base de datos
      await this.database.query('SELECT 1');
      
      // Verificar que el repositorio puede ejecutar consultas básicas
      const testQuery = `
        SELECT COUNT(*) as count 
        FROM orders 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
      `;
      
      await this.database.query(testQuery);

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        module: 'StatisticalAnalytics',
        version: '1.0.0'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        module: 'StatisticalAnalytics',
        version: '1.0.0',
        error: error.message
      };
    }
  }

  /**
   * Ejecuta análisis básico para validar funcionamiento
   */
  async validateModule() {
    try {
      const filters = {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días atrás
        limit: 100
      };

      // Ejecutar análisis descriptivo básico
      const descriptiveStats = await this.useCases.getDescriptiveStatistics.execute(filters);
      
      if (!descriptiveStats || !descriptiveStats.amountStats) {
        throw new Error('Análisis descriptivo no retornó datos válidos');
      }

      return {
        status: 'validated',
        timestamp: new Date().toISOString(),
        sampleSize: descriptiveStats.sampleSize,
        hasData: descriptiveStats.sampleSize > 0
      };
    } catch (error) {
      throw new Error(`Validación del módulo falló: ${error.message}`);
    }
  }
}

/**
 * Configuración de Swagger para documentación API
 */
export const swaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Statistical Analytics API',
    version: '1.0.0',
    description: 'API para análisis estadístico y probabilístico de datos de pedidos comerciales',
    contact: {
      name: 'Equipo de Desarrollo',
      email: 'dev@empresa.com'
    }
  },
  servers: [
    {
      url: '/api/v1/analytics',
      description: 'Servidor de análisis estadístico'
    }
  ],
  tags: [
    {
      name: 'Statistical Analytics',
      description: 'Endpoints para análisis estadístico y probabilístico'
    }
  ],
  components: {
    schemas: {
      DescriptiveStatistics: {
        type: 'object',
        properties: {
          amountStats: {
            type: 'object',
            properties: {
              mean: { type: 'number', description: 'Media aritmética' },
              median: { type: 'number', description: 'Mediana' },
              mode: { type: 'number', description: 'Moda' },
              standardDeviation: { type: 'number', description: 'Desviación estándar' },
              variance: { type: 'number', description: 'Varianza' },
              skewness: { type: 'number', description: 'Asimetría' },
              kurtosis: { type: 'number', description: 'Curtosis' },
              min: { type: 'number', description: 'Valor mínimo' },
              max: { type: 'number', description: 'Valor máximo' },
              range: { type: 'number', description: 'Rango' },
              coefficientOfVariation: { type: 'number', description: 'Coeficiente de variación' }
            }
          },
          quantityStats: {
            type: 'object',
            description: 'Estadísticas de cantidades de productos'
          },
          temporalAnalysis: {
            type: 'object',
            properties: {
              hourly: { type: 'array', description: 'Análisis por horas' },
              daily: { type: 'array', description: 'Análisis diario' },
              monthly: { type: 'array', description: 'Análisis mensual' }
            }
          },
          sampleSize: { type: 'integer', description: 'Tamaño de la muestra' }
        }
      },
      ProbabilityDistribution: {
        type: 'object',
        properties: {
          normalParameters: {
            type: 'object',
            properties: {
              mu: { type: 'number', description: 'Media de distribución normal' },
              sigma: { type: 'number', description: 'Desviación estándar' }
            }
          },
          poissonParameters: {
            type: 'object',
            properties: {
              lambda: { type: 'number', description: 'Parámetro lambda de Poisson' }
            }
          },
          businessProbabilities: {
            type: 'object',
            description: 'Probabilidades para casos de negocio específicos'
          },
          goodnessOfFitAnalysis: {
            type: 'object',
            description: 'Análisis de bondad de ajuste a distribuciones teóricas'
          }
        }
      },
      BusinessInsights: {
        type: 'object',
        properties: {
          trends: {
            type: 'object',
            description: 'Análisis de tendencias de negocio'
          },
          customerSegmentation: {
            type: 'object',
            description: 'Segmentación y análisis de clientes'
          },
          productAnalysis: {
            type: 'object',
            description: 'Análisis de rendimiento de productos'
          },
          opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                category: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                potential_impact: { type: 'string', enum: ['Alto', 'Medio', 'Bajo'] },
                confidence: { type: 'number', minimum: 0, maximum: 1 }
              }
            }
          },
          risks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                category: { type: 'string' },
                title: { type: 'string' },
                severity: { type: 'string', enum: ['Alto', 'Medio', 'Bajo'] },
                probability: { type: 'number', minimum: 0, maximum: 1 }
              }
            }
          },
          recommendations: {
            type: 'array',
            description: 'Recomendaciones estratégicas'
          }
        }
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' },
          metadata: {
            type: 'object',
            properties: {
              executionTime: { type: 'number' },
              timestamp: { type: 'string', format: 'date-time' },
              version: { type: 'string' }
            }
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' },
          code: { type: 'string' }
        }
      }
    },
    responses: {
      BadRequest: {
        description: 'Solicitud inválida',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      },
      InternalServerError: {
        description: 'Error interno del servidor',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      }
    }
  }
};

/**
 * Middleware de validación para endpoints de análisis
 */
export const validationMiddleware = {
  /**
   * Valida parámetros de fecha
   */
  validateDateRange: (req, res, next) => {
    const { startDate, endDate } = req.query;
    
    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({
        success: false,
        error: 'startDate debe tener formato YYYY-MM-DD',
        code: 'INVALID_START_DATE'
      });
    }
    
    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({
        success: false,
        error: 'endDate debe tener formato YYYY-MM-DD',
        code: 'INVALID_END_DATE'
      });
    }
    
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        error: 'startDate debe ser anterior a endDate',
        code: 'INVALID_DATE_RANGE'
      });
    }
    
    next();
  },

  /**
   * Valida parámetros numéricos
   */
  validateNumericParams: (req, res, next) => {
    const { minAmount, maxAmount, limit, userId, categoryId } = req.query;
    
    if (minAmount && (isNaN(minAmount) || parseFloat(minAmount) < 0)) {
      return res.status(400).json({
        success: false,
        error: 'minAmount debe ser un número no negativo',
        code: 'INVALID_MIN_AMOUNT'
      });
    }
    
    if (maxAmount && (isNaN(maxAmount) || parseFloat(maxAmount) < 0)) {
      return res.status(400).json({
        success: false,
        error: 'maxAmount debe ser un número no negativo',
        code: 'INVALID_MAX_AMOUNT'
      });
    }
    
    if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 10000)) {
      return res.status(400).json({
        success: false,
        error: 'limit debe ser un entero entre 1 y 10000',
        code: 'INVALID_LIMIT'
      });
    }
    
    if (userId && (isNaN(userId) || parseInt(userId) < 1)) {
      return res.status(400).json({
        success: false,
        error: 'userId debe ser un entero positivo',
        code: 'INVALID_USER_ID'
      });
    }
    
    if (categoryId && (isNaN(categoryId) || parseInt(categoryId) < 1)) {
      return res.status(400).json({
        success: false,
        error: 'categoryId debe ser un entero positivo',
        code: 'INVALID_CATEGORY_ID'
      });
    }
    
    next();
  },

  /**
   * Valida límites de rate limiting
   */
  rateLimiting: (req, res, next) => {
    // Implementación básica de rate limiting
    // En producción se usaría Redis o similar
    const clientIP = req.ip;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minuto
    const maxRequests = 10; // máximo 10 requests por minuto
    
    // Simulación de verificación
    // En implementación real se verificaría contra almacén persistente
    next();
  }
};

/**
 * Función auxiliar para validar formato de fecha
 */
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Configuración de logging para el módulo
 */
export const loggingConfig = {
  level: 'info',
  format: 'json',
  metadata: {
    module: 'StatisticalAnalytics',
    version: '1.0.0'
  },
  sensitive_fields: ['user_id', 'customer_data'],
  performance_monitoring: true
};

export default StatisticalAnalyticsModule;
