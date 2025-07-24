/**
 * Prepara datos para diagrama de dispersión (scatter plot)
 * @param {Array} salesData - Datos de ventas
 * @param {string} analysisType - Tipo de análisis
 * @returns {Object} - Configuración de scatter plot
 */
_prepareScatterPlotData(salesData, analysisType = 'sales') {
  try {
    if (!salesData || salesData.length < 5) {
      console.log(`⚠️ Datos insuficientes para scatter plot de ${analysisType}`);
      return null;
    }
    
    const points = [];
    
    // Diferentes visualizaciones según el tipo de análisis
    switch (analysisType) {
      case 'sales':
        // Relación entre día del mes y volumen de ventas
        salesData.forEach((item, index) => {
          if (item && item.date) {
            const date = new Date(item.date);
            const dayOfMonth = date.getDate();
            const revenue = parseFloat(item.revenue) || 0;
            
            points.push({
              x: dayOfMonth,  // X = día del mes
              y: revenue,     // Y = ventas
              label: `${date.toLocaleDateString('es-MX')}: $${revenue}`
            });
          }
        });
        
        return {
          title: 'Ventas por Día del Mes',
          xAxis: { title: 'Día del Mes' },
          yAxis: { title: 'Ingresos (pesos)' },
          points: points,
          trendLine: true
        };
        
      case 'dispensers':
        // Para dispensadores, relación entre ubicación y ventas
        if (this.dispenserStats && this.dispenserStats.length > 0) {
          this.dispenserStats.forEach(dispenser => {
            const location = dispenser.location || 'Sin ubicación';
            const revenue = parseFloat(dispenser.total_revenue) || 0;
            const orders = parseInt(dispenser.total_orders) || 0;
            
            points.push({
              x: orders,  // X = número de órdenes
              y: revenue, // Y = ingresos totales
              label: `${location}: ${orders} órdenes, $${revenue}`
            });
          });
          
          return {
            title: 'Relación Órdenes vs Ingresos por Dispensador',
            xAxis: { title: 'Número de Órdenes' },
            yAxis: { title: 'Ingresos Totales (pesos)' },
            points: points,
            trendLine: true
          };
        }
        break;
        
      case 'users':
        // Comportamiento de usuarios
        // Aquí podríamos usar métricas de usuario si las tuviéramos disponibles
        if (salesData.length > 0) {
          // Usar día de la semana vs ventas como ejemplo
          salesData.forEach(item => {
            if (item && item.date) {
              const date = new Date(item.date);
              const dayOfWeek = date.getDay(); // 0=Domingo, 1=Lunes, etc.
              const revenue = parseFloat(item.revenue) || 0;
              
              points.push({
                x: dayOfWeek,
                y: revenue,
                label: `${['Dom','Lun','Mar','Mie','Jue','Vie','Sab'][dayOfWeek]}: $${revenue}`
              });
            }
          });
          
          return {
            title: 'Ventas por Día de la Semana',
            xAxis: { 
              title: 'Día de la Semana',
              categories: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
            },
            yAxis: { title: 'Ingresos (pesos)' },
            points: points,
            trendLine: false
          };
        }
        break;
    }
    
    // Si no hay suficientes puntos o no se pudo procesar
    if (points.length < 3) {
      return null;
    }
    
    return {
      title: 'Diagrama de Dispersión',
      xAxis: { title: 'X' },
      yAxis: { title: 'Y' },
      points: points,
      trendLine: false
    };
    
  } catch (error) {
    console.error('Error al preparar scatter plot:', error);
    return null;
  }
}

/**
 * Prepara un scatter plot específico para análisis de productos
 * @param {Array} products - Datos de productos
 * @returns {Object} - Configuración de scatter plot
 */
_prepareProductScatterPlotData(products) {
  try {
    if (!products || products.length < 3) {
      return null;
    }
    
    const points = [];
    
    // Relación entre cantidad vendida y precio promedio
    products.forEach(product => {
      const quantity = parseInt(product.total_quantity_sold) || 0;
      const revenue = parseFloat(product.total_revenue) || 0;
      let avgPrice = 0;
      
      if (quantity > 0) {
        avgPrice = revenue / quantity;
      }
      
      points.push({
        x: avgPrice,
        y: quantity,
        label: `${product.product_name}: ${quantity} unid. a $${avgPrice.toFixed(2)} c/u`
      });
    });
    
    return {
      title: 'Relación Precio vs Cantidad Vendida',
      xAxis: { title: 'Precio Promedio (pesos)' },
      yAxis: { title: 'Cantidad Vendida' },
      points: points,
      trendLine: true
    };
  } catch (error) {
    console.error('Error al preparar scatter plot de productos:', error);
    return null;
  }
}
