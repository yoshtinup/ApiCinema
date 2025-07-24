/**
 * Generador de dashboard de analytics para API Cinema
 * Este módulo analiza los datos de órdenes y genera visualizaciones
 * y estadísticas para el panel de administración
 */
const fs = require('fs');
const path = require('path');
const { db } = require('../../database/mysql.js');

class AnalyticsDashboardGenerator {
  /**
   * Genera los datos del dashboard de analytics
   * @param {string} period - Período de tiempo ('today', 'week', 'month', 'year')
   * @returns {Object} - Datos formateados para el dashboard
   */
  async generateDashboard(period = 'month') {
    try {
      // Obtener datos de la base de datos según el período
      const ordersData = await this.fetchOrdersData(period);
      
      // Calcular métricas principales
      const salesSummary = this.calculateSalesSummary(ordersData);
      
      // Generar datos para visualizaciones
      const visualization = this.generateVisualizationData(ordersData);
      
      // Análisis estadístico y probabilístico
      const statistics = this.performStatisticalAnalysis(ordersData);
      
      // Generar recomendaciones basadas en datos
      const recommendations = this.generateRecommendations(statistics, salesSummary);
      
      // Construir respuesta completa
      return {
        salesSummary,
        visualization,
        statistics,
        recommendations,
        period
      };
    } catch (error) {
      console.error('Error generando dashboard:', error);
      throw new Error(`Error generando dashboard: ${error.message}`);
    }
  }
  
  /**
   * Obtiene los datos de órdenes según el período especificado
   * @param {string} period - Período de tiempo
   * @returns {Array} - Datos de órdenes
   */
  async fetchOrdersData(period) {
    let dateFilter;
    const now = new Date();
    
    switch (period) {
      case 'today':
        dateFilter = `DATE(created_at) = CURDATE()`;
        break;
      case 'week':
        dateFilter = `created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
        break;
      case 'month':
        dateFilter = `created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
        break;
      case 'year':
        dateFilter = `created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)`;
        break;
      default:
        dateFilter = `created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
    }
    
    const sql = `
      SELECT 
        orders.*, 
        usuario.nombre as user_name 
      FROM orders 
      LEFT JOIN usuario ON orders.user_id = usuario.id
      WHERE ${dateFilter}
      ORDER BY created_at DESC
    `;
    
    try {
      const [results] = await db.query(sql);
      return results;
    } catch (error) {
      console.error('Error al obtener datos de órdenes:', error);
      throw new Error('Error al obtener datos de órdenes');
    }
  }
  
  /**
   * Calcula métricas principales de ventas
   * @param {Array} ordersData - Datos de órdenes
   * @returns {Object} - Resumen de ventas
   */
  calculateSalesSummary(ordersData) {
    const totalOrders = ordersData.length;
    
    // Sumar ingresos totales
    const totalRevenue = ordersData.reduce((sum, order) => {
      return sum + parseFloat(order.total || 0);
    }, 0);
    
    // Calcular ticket promedio
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Contar órdenes por estado
    const ordersByStatus = ordersData.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    
    // Calcular productos más vendidos (extrayendo de los JSON de items)
    const productSales = {};
    let totalItems = 0;
    
    ordersData.forEach(order => {
      if (order.items) {
        try {
          const items = JSON.parse(order.items);
          items.forEach(item => {
            const productId = item.product_id;
            const quantity = parseInt(item.quantity || 1);
            totalItems += quantity;
            
            if (!productSales[productId]) {
              productSales[productId] = {
                name: item.name,
                quantity: 0,
                revenue: 0
              };
            }
            
            productSales[productId].quantity += quantity;
            productSales[productId].revenue += parseFloat(item.subtotal || 0);
          });
        } catch (e) {
          console.error('Error al procesar items de la orden:', e);
        }
      }
    });
    
    // Convertir a array y ordenar por cantidad
    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    
    return {
      totalRevenue: totalRevenue.toFixed(2),
      totalOrders,
      totalItems,
      averageTicket: averageTicket.toFixed(2),
      ordersByStatus,
      topProducts
    };
  }
  
  /**
   * Genera datos para visualizaciones
   * @param {Array} ordersData - Datos de órdenes
   * @returns {Object} - Datos formateados para gráficos
   */
  generateVisualizationData(ordersData) {
    // Agrupar ingresos por fecha
    const salesByDate = {};
    const dispenserUsage = {};
    const statusDistribution = {};
    const productSalesData = {};
    
    // Inicializar datos para cada día en los últimos 30 días
    const last30Days = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      salesByDate[dateStr] = 0;
      last30Days.push(dateStr);
    }
    
    ordersData.forEach(order => {
      // Agrupar por fecha
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      if (salesByDate.hasOwnProperty(orderDate)) {
        salesByDate[orderDate] += parseFloat(order.total || 0);
      }
      
      // Contar uso de dispensadores
      const dispenserId = order.dispenser_id;
      if (dispenserId) {
        dispenserUsage[dispenserId] = (dispenserUsage[dispenserId] || 0) + 1;
      }
      
      // Distribución por estado
      const status = order.status;
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;
      
      // Datos de productos
      if (order.items) {
        try {
          const items = JSON.parse(order.items);
          items.forEach(item => {
            const productId = item.product_id;
            const name = item.name;
            const quantity = parseInt(item.quantity || 1);
            
            if (!productSalesData[productId]) {
              productSalesData[productId] = {
                name,
                quantity: 0,
                revenue: 0
              };
            }
            
            productSalesData[productId].quantity += quantity;
            productSalesData[productId].revenue += parseFloat(item.subtotal || 0);
          });
        } catch (e) {
          console.error('Error al procesar items para visualizaciones:', e);
        }
      }
    });
    
    // Formatear datos para gráficos
    const lineChartData = last30Days.map(date => ({
      date,
      revenue: salesByDate[date].toFixed(2)
    }));
    
    const barChartData = Object.entries(salesByDate)
      .filter(([_, value]) => value > 0)
      .map(([date, value]) => ({
        date,
        revenue: value.toFixed(2)
      }))
      .slice(-14); // Últimos 14 días con ventas
    
    const pieChartData = Object.entries(productSalesData)
      .map(([id, { name, quantity }]) => ({
        name,
        value: quantity
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    
    const dispenserPieChartData = Object.entries(dispenserUsage)
      .map(([name, value]) => ({ name, value }));
    
    return {
      charts: {
        lineChart: lineChartData,
        barChart: barChartData,
        pieChart: pieChartData,
        dispenserPieChart: dispenserPieChartData,
        statusDistribution: Object.entries(statusDistribution).map(([name, value]) => ({ name, value }))
      }
    };
  }
  
  /**
   * Realiza análisis estadístico de los datos
   * @param {Array} ordersData - Datos de órdenes
   * @returns {Object} - Estadísticas calculadas
   */
  performStatisticalAnalysis(ordersData) {
    // Extraer totales para análisis
    const totals = ordersData.map(order => parseFloat(order.total || 0));
    
    // Calcular probabilidades y distribución
    const totalSum = totals.reduce((sum, value) => sum + value, 0);
    
    // Análisis de probabilidad por producto
    const productProbabilities = {};
    const productSales = {};
    
    // Contar ventas totales por producto
    ordersData.forEach(order => {
      if (order.items) {
        try {
          const items = JSON.parse(order.items);
          items.forEach(item => {
            const productId = item.product_id;
            const quantity = parseInt(item.quantity || 1);
            
            if (!productSales[productId]) {
              productSales[productId] = {
                name: item.name,
                quantity: 0
              };
            }
            
            productSales[productId].quantity += quantity;
          });
        } catch (e) {
          console.error('Error al procesar items para análisis estadístico:', e);
        }
      }
    });
    
    // Calcular el total de productos vendidos
    const totalProductsSold = Object.values(productSales).reduce(
      (sum, product) => sum + product.quantity, 0
    );
    
    // Calcular probabilidades
    Object.entries(productSales).forEach(([id, data]) => {
      const probability = totalProductsSold > 0 ? data.quantity / totalProductsSold : 0;
      productProbabilities[id] = {
        name: data.name,
        quantity: data.quantity,
        probability: probability.toFixed(4),
        percentage: (probability * 100).toFixed(2) + '%'
      };
    });
    
    // Estadísticas básicas
    const stats = {
      totalOrders: ordersData.length,
      min: Math.min(...totals),
      max: Math.max(...totals),
      median: this.calculateMedian(totals),
      mean: totalSum / totals.length,
      productProbabilities: Object.values(productProbabilities)
        .sort((a, b) => b.quantity - a.quantity)
    };
    
    return stats;
  }
  
  /**
   * Calcula la mediana de un conjunto de valores
   * @param {Array} values - Array de valores numéricos
   * @returns {number} - Valor mediana
   */
  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      return sorted[middle];
    }
  }
  
  /**
   * Genera recomendaciones basadas en el análisis
   * @param {Object} statistics - Estadísticas calculadas
   * @param {Object} salesSummary - Resumen de ventas
   * @returns {Array} - Lista de recomendaciones
   */
  generateRecommendations(statistics, salesSummary) {
    const recommendations = [];
    
    // Recomendación basada en productos más vendidos
    if (statistics.productProbabilities.length > 0) {
      const topProduct = statistics.productProbabilities[0];
      recommendations.push({
        type: 'product',
        title: 'Producto más popular',
        description: `"${topProduct.name}" representa el ${topProduct.percentage} de las ventas totales. Considera aumentar su stock o crear promociones con este producto.`
      });
      
      // Identificar productos con baja demanda
      const lowPerformers = statistics.productProbabilities
        .filter(p => parseFloat(p.probability) < 0.1)
        .map(p => p.name);
      
      if (lowPerformers.length > 0) {
        recommendations.push({
          type: 'product',
          title: 'Productos con baja demanda',
          description: `Considera revisar la estrategia para: ${lowPerformers.join(', ')}`
        });
      }
    }
    
    // Recomendación basada en el valor promedio de ticket
    const avgTicket = parseFloat(salesSummary.averageTicket);
    if (!isNaN(avgTicket)) {
      if (avgTicket < 30) {
        recommendations.push({
          type: 'revenue',
          title: 'Aumentar valor del ticket',
          description: `El valor promedio del ticket es $${avgTicket.toFixed(2)}. Considera implementar ventas cruzadas o promociones para aumentarlo.`
        });
      } else {
        recommendations.push({
          type: 'revenue',
          title: 'Buen valor de ticket',
          description: `El valor promedio del ticket es $${avgTicket.toFixed(2)}. Mantén la estrategia actual de ventas.`
        });
      }
    }
    
    // Recomendaciones de inventario basadas en probabilidad
    const highProbabilityProducts = statistics.productProbabilities
      .filter(p => parseFloat(p.probability) > 0.15);
    
    if (highProbabilityProducts.length > 0) {
      recommendations.push({
        type: 'inventory',
        title: 'Recomendación de inventario',
        description: `Basado en la demanda, mantén un inventario más alto de: ${highProbabilityProducts.map(p => p.name).join(', ')}`
      });
    }
    
    return recommendations;
  }
}

module.exports = { AnalyticsDashboardGenerator };
