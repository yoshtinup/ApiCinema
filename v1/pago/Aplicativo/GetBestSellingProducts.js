export class GetBestSellingProductsUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  /**
   * Obtiene los productos más vendidos basado en las órdenes
   * @param {number} limit - Número máximo de productos a retornar (por defecto 10)
   * @param {string} period - Período de tiempo: 'week', 'month', 'year', 'all' (por defecto 'all')
   * @returns {Promise<Array>} Lista de productos más vendidos
   */
  async execute(limit = 10, period = 'all') {
    try {
      // Obtener productos más vendidos del repositorio
      const bestSellingProducts = await this.orderRepository.getBestSellingProducts(limit, period);
      
      // Calcular estadísticas adicionales
      const totalQuantitySold = bestSellingProducts.reduce((sum, product) => sum + product.total_quantity, 0);
      const totalRevenue = bestSellingProducts.reduce((sum, product) => sum + product.total_revenue, 0);
      
      return {
        products: bestSellingProducts,
        summary: {
          total_products_analyzed: bestSellingProducts.length,
          total_quantity_sold: totalQuantitySold,
          total_revenue: totalRevenue,
          period: period,
          generated_at: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Error obteniendo productos más vendidos: ${error.message}`);
    }
  }
}
