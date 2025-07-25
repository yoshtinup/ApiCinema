import { GetBestSellingProductsUseCase } from '../../../Aplicativo/GetBestSellingProducts.js';

export class BestSellingProductsController {
  constructor(pagoRepository) {
    this.getBestSellingProductsUseCase = new GetBestSellingProductsUseCase(pagoRepository);
  }

  /**
   * Endpoint para obtener los productos más vendidos
   * GET /api/v1/reports/best-selling-products
   * 
   * Query parameters:
   * - limit: número máximo de productos (default: 10)
   * - period: período de tiempo - 'week', 'month', 'year', 'all' (default: 'all')
   */
  async getBestSellingProducts(req, res) {
    try {
      // Extraer parámetros de consulta
      const limit = parseInt(req.query.limit) || 10;
      const period = req.query.period || 'all';

      // Validar parámetros
      if (limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          error: 'El límite debe estar entre 1 y 100'
        });
      }

      const validPeriods = ['week', 'month', 'year', 'all'];
      if (!validPeriods.includes(period)) {
        return res.status(400).json({
          success: false,
          error: 'Período válido: week, month, year, all'
        });
      }

      console.log(`📊 Obteniendo top ${limit} productos más vendidos (período: ${period})`);

      // Ejecutar caso de uso
      const result = await this.getBestSellingProductsUseCase.execute(limit, period);

      // Calcular porcentajes
      const totalQuantity = result.summary.total_quantity_sold;
      const totalRevenue = result.summary.total_revenue;

      result.products = result.products.map(product => ({
        ...product,
        quantity_percentage: totalQuantity > 0 ? 
          ((product.total_quantity / totalQuantity) * 100).toFixed(2) : 0,
        revenue_percentage: totalRevenue > 0 ? 
          ((product.total_revenue / totalRevenue) * 100).toFixed(2) : 0
      }));

      console.log(`✅ Encontrados ${result.products.length} productos más vendidos`);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Productos más vendidos obtenidos exitosamente'
      });

    } catch (error) {
      console.error('❌ Error obteniendo productos más vendidos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }

  /**
   * Endpoint para obtener estadísticas resumidas de ventas
   * GET /api/v1/reports/sales-summary
   */
  async getSalesSummary(req, res) {
    try {
      const period = req.query.period || 'month';

      // Obtener los top 5 productos para el resumen
      const result = await this.getBestSellingProductsUseCase.execute(5, period);

      // Crear resumen ejecutivo
      const summary = {
        period: period,
        total_products_sold: result.summary.total_quantity_sold,
        total_revenue: result.summary.total_revenue,
        top_product: result.products[0] || null,
        product_diversity: result.products.length,
        average_order_value: result.summary.total_revenue / 
          (result.products.reduce((sum, p) => sum + p.order_count, 0) || 1),
        generated_at: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        data: {
          summary: summary,
          top_products: result.products
        },
        message: 'Resumen de ventas obtenido exitosamente'
      });

    } catch (error) {
      console.error('❌ Error obteniendo resumen de ventas:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }
}
