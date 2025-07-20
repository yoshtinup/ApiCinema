/**
 * Modelo de dominio para las métricas de ventas
 */
export class SalesMetrics {
  constructor({
    totalRevenue,
    totalSales,
    averageOrderValue,
    period,
    startDate,
    endDate
  }) {
    this.totalRevenue = totalRevenue;
    this.totalSales = totalSales;
    this.averageOrderValue = averageOrderValue;
    this.period = period; // 'today', 'week', 'month'
    this.startDate = startDate;
    this.endDate = endDate;
  }

  /**
   * Calcula el valor promedio de orden
   */
  calculateAverageOrderValue() {
    if (this.totalSales === 0) return 0;
    return Number((this.totalRevenue / this.totalSales).toFixed(2));
  }

  /**
   * Valida que las métricas sean válidas
   */
  isValid() {
    return this.totalRevenue >= 0 && 
           this.totalSales >= 0;
  }
}
