/**
 * Modelo de dominio para productos más vendidos
 */
export class ProductSales {
  constructor({
    productId,
    productName,
    totalQuantitySold,
    totalRevenue,
    salesCount,
    period
  }) {
    this.productId = productId;
    this.productName = productName;
    this.totalQuantitySold = totalQuantitySold;
    this.totalRevenue = totalRevenue;
    this.salesCount = salesCount;
    this.period = period;
  }

  /**
   * Calcula el porcentaje de participación en ventas
   */
  calculateSalesPercentage(totalSales) {
    if (totalSales === 0) return 0;
    return Number(((this.salesCount / totalSales) * 100).toFixed(2));
  }

  /**
   * Obtiene el precio promedio del producto
   */
  getAveragePrice() {
    if (this.totalQuantitySold === 0) return 0;
    return Number((this.totalRevenue / this.totalQuantitySold).toFixed(2));
  }
}
