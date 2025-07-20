/**
 * Puerto (interfaz) para el repositorio de Analytics
 * Define los contratos que debe cumplir cualquier implementación
 */
export class AnalyticsRepositoryPort {
  
  /**
   * Obtiene las métricas generales de ventas
   * @param {string} period - Período: 'today', 'week', 'month'
   * @param {Date} startDate - Fecha de inicio (opcional)
   * @param {Date} endDate - Fecha de fin (opcional)
   * @returns {Promise<Object>} Métricas de ventas
   */
  async getSalesMetrics(period, startDate = null, endDate = null) {
    throw new Error('Method getSalesMetrics must be implemented');
  }

  /**
   * Obtiene los productos más vendidos
   * @param {string} period - Período: 'today', 'week', 'month'
   * @param {number} limit - Límite de productos a retornar
   * @returns {Promise<Array>} Lista de productos más vendidos
   */
  async getTopSellingProducts(period, limit = 10) {
    throw new Error('Method getTopSellingProducts must be implemented');
  }

  /**
   * Obtiene las ventas por período de tiempo
   * @param {string} period - Período: 'today', 'week', 'month'
   * @param {string} groupBy - Agrupar por: 'hour', 'day', 'week'
   * @returns {Promise<Array>} Ventas agrupadas por período
   */
  async getSalesByPeriod(period, groupBy = 'day') {
    throw new Error('Method getSalesByPeriod must be implemented');
  }

  /**
   * Obtiene estadísticas de dispensadores
   * @param {string} period - Período: 'today', 'week', 'month'
   * @returns {Promise<Array>} Estadísticas por dispensador
   */
  async getDispenserStats(period) {
    throw new Error('Method getDispenserStats must be implemented');
  }

  /**
   * Obtiene métricas de usuarios
   * @param {string} period - Período: 'today', 'week', 'month'
   * @returns {Promise<Object>} Métricas de usuarios
   */
  async getUserMetrics(period) {
    throw new Error('Method getUserMetrics must be implemented');
  }
}
