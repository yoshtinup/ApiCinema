import { SalesMetrics } from '../Dominio/models/SalesMetrics.js';

/**
 * Caso de uso para obtener métricas generales de ventas
 */
export class GetSalesMetrics {
  constructor(analyticsRepository) {
    this.analyticsRepository = analyticsRepository;
  }

  /**
   * Ejecuta el caso de uso para obtener métricas de ventas
   * @param {string} period - Período: 'today', 'week', 'month'
   * @param {Date} startDate - Fecha de inicio personalizada
   * @param {Date} endDate - Fecha de fin personalizada
   * @returns {Promise<SalesMetrics>} Métricas de ventas
   */
  async execute(period = 'today', startDate = null, endDate = null) {
    // Validar y normalizar período
    period = period || 'today'; // Si period es undefined, usar 'today'
    const validPeriods = ['today', 'week', 'month', 'custom'];
    if (!validPeriods.includes(period)) {
      console.warn(`Invalid period received: ${period}, using 'today' as default`);
      period = 'today'; // Usar valor por defecto en lugar de lanzar error
    }

    // Si es período personalizado, validar fechas
    if (period === 'custom' && (!startDate || !endDate)) {
      throw new Error('Custom period requires startDate and endDate');
    }

    try {
      // Obtener datos del repositorio
      const metricsData = await this.analyticsRepository.getSalesMetrics(period, startDate, endDate);
      
      // Crear objeto de dominio
      const salesMetrics = new SalesMetrics({
        totalRevenue: metricsData.totalRevenue || 0,
        totalSales: metricsData.totalSales || 0,
        averageOrderValue: metricsData.averageOrderValue || 0,
        period: period,
        startDate: startDate || metricsData.startDate || new Date().toISOString(),
        endDate: endDate || metricsData.endDate || new Date().toISOString()
      });

      return salesMetrics;
    } catch (error) {
      console.error('Error in GetSalesMetrics use case:', error);
      throw new Error(`Failed to get sales metrics: ${error.message}`);
    }
  }
}
