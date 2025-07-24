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

      // Generar datos optimizados para visualización
      const visualizationData = this._prepareVisualizationData({
        period,
        salesMetrics,
        topProducts,
        salesByPeriod,
        dispenserStats,
        userMetrics
      });
      
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
        },
        // Datos específicos para visualización
        visualization: visualizationData
      };
    } catch (error) {
      console.error('Error in GetDashboardData use case:', error);
      throw new Error(`Failed to get dashboard data: ${error.message}`);
    }
  }
  
  /**
   * Prepara datos específicos para visualizaciones en el frontend
   * siguiendo la estructura estandarizada de visualización
   * @private
   */
  _prepareVisualizationData(data) {
    const { period, salesMetrics, topProducts, salesByPeriod, dispenserStats } = data;
    
    // Objeto para almacenar todas las visualizaciones en formato estandarizado
    const visualizations = {
      charts: {
        // Gráfico de barras principal (ingresos por período)
        barChart: this._prepareBarChartData(period, salesByPeriod),
        
        // Gráfico de líneas para tendencia de ventas
        lineChart: this._prepareLineChartData(salesByPeriod),
        
        // Gráfico circular para productos top
        pieChart: this._prepareTopProductsChart(topProducts),
        
        // Gráfico circular para dispensadores
        dispenserPieChart: this._prepareDispenserChart(dispenserStats)
      }
    };
    
    return visualizations;
  }
  
  /**
   * Prepara datos para gráfico de barras de ingresos por período
   * siguiendo la estructura estandarizada de visualización
   */
  _prepareBarChartData(period, salesData) {
    // Datos de etiquetas y series según el período
    let labels = [];
    let ingresos = [];
    let ordenes = [];
    
    // Si tenemos datos reales, los agrupamos según el período
    if (salesData && salesData.length > 0) {
      // Para el ejemplo de la imagen, agrupar en trimestres/semestres
      if (period === 'year') {
        // Agrupar por trimestres para año
        const trimestres = {
          'Sem 1': { ingresos: 0, ordenes: 0 },
          'Sem 2': { ingresos: 0, ordenes: 0 },
          'Sem 3': { ingresos: 0, ordenes: 0 },
          'Sem 4': { ingresos: 0, ordenes: 0 }
        };
        
        // Asignar datos a los trimestres (simplificado)
        salesData.forEach((item, index) => {
          const quarterIndex = Math.floor(index / (salesData.length / 4));
          const quarterKey = `Sem ${quarterIndex + 1}`;
          if (trimestres[quarterKey]) {
            trimestres[quarterKey].ingresos += parseFloat(item.revenue) || 0;
            trimestres[quarterKey].ordenes += parseInt(item.orders) || 0;
          }
        });
        
        // Extraer datos para el gráfico
        labels = Object.keys(trimestres);
        ingresos = labels.map(key => trimestres[key].ingresos);
        ordenes = labels.map(key => trimestres[key].ordenes);
      } else {
        // Para otros períodos, usar datos directamente o agrupar según necesidad
        labels = salesData.map(item => {
          const date = new Date(item.date);
          return date.toLocaleDateString('es-MX', {day: '2-digit', month: 'short'});
        });
        ingresos = salesData.map(item => parseFloat(item.revenue) || 0);
        ordenes = salesData.map(item => parseInt(item.orders) || 0);
        
        // Si hay demasiados puntos, agrupar
        if (labels.length > 10) {
          const groupSize = Math.ceil(labels.length / 10);
          const newLabels = [];
          const newIngresos = [];
          const newOrdenes = [];
          
          for (let i = 0; i < labels.length; i += groupSize) {
            const endIndex = Math.min(i + groupSize, labels.length);
            newLabels.push(labels[i]);
            
            // Promediar los valores del grupo
            const ingresosGroup = ingresos.slice(i, endIndex);
            const ordenesGroup = ordenes.slice(i, endIndex);
            
            newIngresos.push(ingresosGroup.reduce((sum, val) => sum + val, 0));
            newOrdenes.push(ordenesGroup.reduce((sum, val) => sum + val, 0));
          }
          
          labels = newLabels;
          ingresos = newIngresos;
          ordenes = newOrdenes;
        }
      }
    } else {
      // Datos simulados en caso de no tener datos reales
      labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
      ingresos = [600, 590, 450, 470];
      ordenes = [15, 14, 10, 12];
    }
    
    // Devolver datos en formato estandarizado
    return {
      type: "bar",
      labels: labels,
      datasets: [
        {
          name: "Ingresos",
          data: ingresos,
          color: "#36a2eb"
        },
        {
          name: "Órdenes",
          data: ordenes,
          color: "#9966ff"
        }
      ],
      options: {
        yAxisTitle: "Valor en pesos",
        xAxisTitle: "Período"
      }
    };
  }
  
  /**
   * Prepara datos para gráfico de top productos
   * siguiendo la estructura estandarizada de visualización
   */
  _prepareTopProductsChart(products) {
    let labels, data;
    
    if (!products || products.length === 0) {
      // Datos simulados
      labels = ['Coca Cola', 'Vuala', 'Skwintles', 'Doritos', 'Hershey'];
      data = [35, 25, 20, 15, 5];
    } else {
      labels = products.map(p => p.product_name || p.name);
      data = products.map(p => parseInt(p.sales_count) || 0);
    }
    
    // Devolver datos en formato estandarizado
    return {
      type: "pie",
      labels: labels,
      datasets: [
        {
          name: "Productos Populares",
          data: data,
          colors: ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966ff"]
        }
      ]
    };
  }
  
  /**
   * Prepara datos para gráfico de líneas
   * siguiendo la estructura estandarizada de visualización
   */
  _prepareLineChartData(salesData) {
    const labels = [];
    const ingresos = [];
    
    // Si tenemos datos reales
    if (salesData && salesData.length > 0) {
      salesData.forEach(item => {
        const fecha = new Date(item.date);
        labels.push(fecha.toLocaleDateString('es-MX', {day: '2-digit', month: 'short'}));
        ingresos.push(parseFloat(item.revenue) || 0);
      });
    } else {
      // Datos simulados
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        labels.push(date.toLocaleDateString('es-MX', {day: '2-digit', month: 'short'}));
        ingresos.push(Math.floor(Math.random() * 200) + 100);
      }
    }
    
    // Devolver datos en formato estandarizado
    return {
      type: "line",
      labels: labels,
      datasets: [
        {
          name: "Ingresos Diarios",
          data: ingresos,
          color: "#4bc0c0"
        }
      ],
      options: {
        yAxisTitle: "Valor en pesos",
        xAxisTitle: "Fecha"
      }
    };
  }
  
  /**
   * Prepara datos para gráfico de dispensadores
   * siguiendo la estructura estandarizada de visualización
   */
  _prepareDispenserChart(dispensers) {
    let labels, data;
    
    if (!dispensers || dispensers.length === 0) {
      // Datos simulados
      labels = ['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4'];
      data = [30, 25, 20, 25];
    } else {
      labels = dispensers.map(d => d.dispenser_name || d.id || `Dispensador ${d.dispenser_id}`);
      data = dispensers.map(d => parseInt(d.total_orders) || 0);
    }
    
    // Devolver datos en formato estandarizado
    return {
      type: "pie",
      labels: labels,
      datasets: [
        {
          name: "Órdenes por Dispensador",
          data: data,
          colors: ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0"]
        }
      ]
    };
  }
}
