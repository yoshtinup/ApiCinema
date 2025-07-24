/**
 * Caso de uso para obtener el dashboard completo de analytics
 */
export class GetDashboardData {
  constructor(analyticsRepository) {
    this.analyticsRepository = analyticsRepository;
  }

  /**
   * Ejecuta el caso de uso para obtener todos los datos del dashboard
   * @param {string} period - Período: 'today', 'week', 'month'
   * @returns {Promise<Object>} Datos completos del dashboard
   */
  async execute(period = 'today') {
    // Validar y normalizar período
    period = period || 'today';
    const validPeriods = ['today', 'week', 'month', 'year', 'custom'];
    if (!validPeriods.includes(period)) {
      console.warn(`Invalid period received: ${period}, using 'today' as default`);
      period = 'today';
    }

    try {
      // Ejecutar todas las consultas en paralelo para mejor performance
      // Usamos Promise.allSettled para evitar que un error falle todo
      const results = await Promise.allSettled([
        this.analyticsRepository.getSalesMetrics(period),
        this.analyticsRepository.getTopSellingProducts(period, 5),
        this.analyticsRepository.getSalesByPeriod(period, 'day'),
        this.analyticsRepository.getDispenserStats(period),
        this.analyticsRepository.getUserMetrics(period)
      ]);

      // Extraer resultados o valores por defecto
      const salesMetrics = results[0].status === 'fulfilled' ? results[0].value : {
        totalSales: 0, totalRevenue: 0, averageOrderValue: 0, startDate: null, endDate: null
      };
      const topProducts = results[1].status === 'fulfilled' ? results[1].value : [];
      const salesByPeriod = results[2].status === 'fulfilled' ? results[2].value : [];
      const dispenserStats = results[3].status === 'fulfilled' ? results[3].value : [];
      const userMetrics = results[4].status === 'fulfilled' ? results[4].value : {
        totalUsers: 0, activeUsers: 0, newUsers: 0
      };

      // Formatear respuesta
      return {
        period: period,
        generatedAt: new Date().toISOString(),
        salesSummary: {
          totalRevenue: salesMetrics.totalRevenue || 0,
          totalSales: salesMetrics.totalSales || 0,
          averageOrderValue: salesMetrics.averageOrderValue || 0,
          growthPercentage: salesMetrics.growthPercentage || 0
        },
        topProducts: topProducts || [],
        salesChart: salesByPeriod || [],
        dispenserStats: dispenserStats || [],
        userMetrics: userMetrics || {
          totalUsers: 0,
          activeUsers: 0,
          newUsers: 0
        }
      };
    } catch (error) {
      console.error('Error in GetDashboardData use case:', error);
      throw new Error(`Failed to get dashboard data: ${error.message}`);
    }
  }
}
