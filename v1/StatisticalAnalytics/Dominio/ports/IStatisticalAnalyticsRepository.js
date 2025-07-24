/**
 * Puerto del repositorio de análisis estadístico
 * Define las operaciones de acceso a datos para análisis estadísticos
 */
export class IStatisticalAnalyticsRepository {
  
  /**
   * Obtiene datos de pedidos para análisis estadístico
   * @param {Object} filters - Filtros de fecha, dispensador, etc.
   * @returns {Promise<Array>} Datos de pedidos
   */
  async getOrdersData(filters = {}) {
    throw new Error('Method getOrdersData must be implemented');
  }

  /**
   * Obtiene datos agregados por período de tiempo
   * @param {string} period - Período: 'daily', 'weekly', 'monthly'
   * @param {Object} filters - Filtros adicionales
   * @returns {Promise<Array>} Datos agregados por período
   */
  async getAggregatedDataByPeriod(period, filters = {}) {
    throw new Error('Method getAggregatedDataByPeriod must be implemented');
  }

  /**
   * Obtiene datos de comportamiento de usuarios
   * @param {Object} filters - Filtros de análisis
   * @returns {Promise<Array>} Datos de comportamiento de usuarios
   */
  async getUserBehaviorData(filters = {}) {
    throw new Error('Method getUserBehaviorData must be implemented');
  }

  /**
   * Obtiene datos de productos más vendidos
   * @param {Object} filters - Filtros de análisis
   * @returns {Promise<Array>} Datos de productos
   */
  async getProductAnalysisData(filters = {}) {
    throw new Error('Method getProductAnalysisData must be implemented');
  }

  /**
   * Obtiene datos de rendimiento por dispensador
   * @param {Object} filters - Filtros de análisis
   * @returns {Promise<Array>} Datos de dispensadores
   */
  async getDispenserPerformanceData(filters = {}) {
    throw new Error('Method getDispenserPerformanceData must be implemented');
  }

  /**
   * Obtiene datos para análisis temporal
   * @param {string} timeUnit - Unidad de tiempo: 'hour', 'day', 'week', 'month'
   * @param {Object} filters - Filtros adicionales
   * @returns {Promise<Array>} Datos temporales
   */
  async getTemporalAnalysisData(timeUnit, filters = {}) {
    throw new Error('Method getTemporalAnalysisData must be implemented');
  }

  /**
   * Obtiene datos para análisis de correlación
   * @param {Array} variables - Variables a correlacionar
   * @param {Object} filters - Filtros adicionales
   * @returns {Promise<Array>} Datos para correlación
   */
  async getCorrelationData(variables, filters = {}) {
    throw new Error('Method getCorrelationData must be implemented');
  }

  /**
   * Obtiene estadísticas básicas de la base de datos
   * @returns {Promise<Object>} Estadísticas básicas
   */
  async getBasicStats() {
    throw new Error('Method getBasicStats must be implemented');
  }

  /**
   * Obtiene datos para Customer Lifetime Value
   * @param {Object} filters - Filtros de análisis
   * @returns {Promise<Array>} Datos de CLV
   */
  async getCustomerLifetimeValueData(filters = {}) {
    throw new Error('Method getCustomerLifetimeValueData must be implemented');
  }

  /**
   * Obtiene datos para análisis de abandono
   * @param {Object} filters - Filtros de análisis
   * @returns {Promise<Array>} Datos de abandono
   */
  async getChurnAnalysisData(filters = {}) {
    throw new Error('Method getChurnAnalysisData must be implemented');
  }
}
