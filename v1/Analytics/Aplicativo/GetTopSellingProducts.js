import { ProductSales } from '../Dominio/models/ProductSales.js';

/**
 * Caso de uso para obtener los productos más vendidos
 */
export class GetTopSellingProducts {
  constructor(analyticsRepository) {
    this.analyticsRepository = analyticsRepository;
  }

  /**
   * Ejecuta el caso de uso para obtener productos más vendidos
   * @param {string} period - Período: 'today', 'week', 'month'
   * @param {number} limit - Límite de productos a retornar
   * @returns {Promise<Array<ProductSales>>} Lista de productos más vendidos
   */
  async execute(period = 'today', limit = 10) {
    // Validar y normalizar período
    period = period || 'today';
    const validPeriods = ['today', 'week', 'month', 'year', 'custom'];
    if (!validPeriods.includes(period)) {
      console.warn(`Invalid period received: ${period}, using 'today' as default`);
      period = 'today';
    }

    // Validar límite
    if (limit <= 0 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    try {
      // Obtener datos del repositorio
      const productsData = await this.analyticsRepository.getTopSellingProducts(period, limit);
      
      // Convertir a objetos de dominio
      const productSales = productsData.map(product => new ProductSales({
        productId: product.product_id,
        productName: product.product_name,
        totalQuantitySold: product.total_quantity_sold || 0,
        totalRevenue: product.total_revenue || 0,
        salesCount: product.sales_count || 0,
        period: period
      }));

      // Calcular total de ventas para porcentajes
      const totalSales = productSales.reduce((sum, product) => sum + product.salesCount, 0);
      
      // Agregar porcentajes a cada producto
      productSales.forEach(product => {
        product.salesPercentage = product.calculateSalesPercentage(totalSales);
      });

      return productSales;
    } catch (error) {
      console.error('Error in GetTopSellingProducts use case:', error);
      throw new Error(`Failed to get top selling products: ${error.message}`);
    }
  }
}
