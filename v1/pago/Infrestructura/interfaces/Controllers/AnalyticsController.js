/**
 * Controlador para análisis estadísticos avanzados con distribuciones gaussianas
 * Proporciona insights del negocio basados en patrones de datos
 */
export class AnalyticsController {
  constructor(pagoRepository) {
    this.pagoRepository = pagoRepository;
  }

  /**
   * Obtiene la distribución gaussiana de valores de órdenes
   * Analiza patrones de gasto de clientes
   */
  async getOrderValueDistribution(req, res) {
    try {
      console.log('📊 [Analytics] Solicitando distribución de valores de orden');
      
      const { 
        period = 'month', 
        target_value = 100, 
        confidence_level = 95,
        data_points = 50 
      } = req.query;

      // Validaciones
      const validPeriods = ['week', 'month', 'quarter', 'year', 'all'];
      if (!validPeriods.includes(period)) {
        return res.status(400).json({
          success: false,
          error: 'Período inválido',
          details: `Períodos válidos: ${validPeriods.join(', ')}`
        });
      }

      const targetValueNum = parseFloat(target_value);
      if (isNaN(targetValueNum) || targetValueNum <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valor objetivo inválido',
          details: 'El valor objetivo debe ser un número positivo'
        });
      }

      // Importar dinámicamente el caso de uso
      const { GetOrderValueDistribution } = await import('../../Aplicativo/GetOrderValueDistribution.js');
      const getOrderValueDistributionUseCase = new GetOrderValueDistribution(this.pagoRepository);

      // Ejecutar análisis
      const distributionData = await getOrderValueDistributionUseCase.execute({
        period,
        target_value: targetValueNum,
        confidence_level: parseInt(confidence_level),
        data_points: parseInt(data_points)
      });

      console.log('✅ [Analytics] Distribución de valores calculada exitosamente');

      res.status(200).json({
        success: true,
        data: distributionData,
        message: 'Distribución gaussiana de valores de orden obtenida exitosamente'
      });

    } catch (error) {
      console.error('❌ [Analytics] Error obteniendo distribución de valores:', error.message);
      
      let statusCode = 500;
      let errorMessage = 'Error interno del servidor';
      
      if (error.message.includes('Insufficient data')) {
        statusCode = 400;
        errorMessage = 'Datos insuficientes para el análisis';
      }
      
      res.status(statusCode).json({
        success: false,
        error: errorMessage,
        details: error.message
      });
    }
  }

  /**
   * Obtiene distribución de cantidad de productos por orden
   */
  async getProductsPerOrderDistribution(req, res) {
    try {
      console.log('📊 [Analytics] Solicitando distribución de productos por orden');
      
      const { period = 'month', target_quantity = 3 } = req.query;

      // Importar dinámicamente el caso de uso
      const { GetProductsPerOrderDistribution } = await import('../../Aplicativo/GetProductsPerOrderDistribution.js');
      const getProductsPerOrderDistributionUseCase = new GetProductsPerOrderDistribution(this.pagoRepository);

      const distributionData = await getProductsPerOrderDistributionUseCase.execute({
        period,
        target_quantity: parseInt(target_quantity)
      });

      res.status(200).json({
        success: true,
        data: distributionData,
        message: 'Distribución de productos por orden obtenida exitosamente'
      });

    } catch (error) {
      console.error('❌ [Analytics] Error obteniendo distribución de productos:', error.message);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }

  /**
   * Obtiene un resumen completo de analytics del negocio
   */
  async getBusinessAnalyticsSummary(req, res) {
    try {
      console.log('📊 [Analytics] Generando resumen completo de analytics');
      
      const { period = 'month' } = req.query;

      // Importar dinámicamente los casos de uso
      const { GetOrderValueDistribution } = await import('../../Aplicativo/GetOrderValueDistribution.js');
      const getOrderValueDistributionUseCase = new GetOrderValueDistribution(this.pagoRepository);

      // Ejecutar múltiples análisis en paralelo
      const [orderValueDistribution] = await Promise.allSettled([
        getOrderValueDistributionUseCase.execute({ 
          period, 
          target_value: 100 
        })
      ]);

      const summary = {
        period_analyzed: period,
        order_value_analysis: orderValueDistribution.status === 'fulfilled' ? orderValueDistribution.value : null,
        generated_at: new Date().toISOString(),
        business_kpis: {
          average_order_value: orderValueDistribution.status === 'fulfilled' ? orderValueDistribution.value.mean : null,
          order_value_consistency: orderValueDistribution.status === 'fulfilled' ? 
            (orderValueDistribution.value.std_deviation / orderValueDistribution.value.mean < 0.3 ? 'Alta' : 'Baja') : null
        }
      };

      res.status(200).json({
        success: true,
        data: summary,
        message: 'Resumen de analytics generado exitosamente'
      });

    } catch (error) {
      console.error('❌ [Analytics] Error generando resumen:', error.message);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }
}
