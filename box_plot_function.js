/**
 * Prepara datos para diagrama de caja (box plot)
 * @param {Array} rawData - Datos numéricos para analizar
 * @param {string} analysisType - Tipo de análisis ('sales', 'products', etc)
 * @returns {Object} - Configuración de box plot
 */
async function _prepareBoxPlotData(rawData, analysisType = 'sales') { 
     try {
    // Importar la función de ayuda para cálculos de box plot
    const { calculateBoxPlotStats } = await import('./visualization_helpers.js');

    if (!rawData || rawData.length < 5) {
      console.log(`⚠️ Datos insuficientes para box plot de ${analysisType}`);
      return null;
    }

    let boxPlotData;
    let title = '';
    let yAxisTitle = '';

    switch (analysisType) {
      case 'sales':
        // Usar rawData directamente para ventas
        boxPlotData = calculateBoxPlotStats(rawData);
        title = 'Distribución de Ingresos';
        yAxisTitle = 'Ingresos (pesos)';
        break;
        
      case 'products':
        // Para productos, extraer las cantidades vendidas
        if (this.topProducts && this.topProducts.length > 0) {
          const productCounts = this.topProducts.map(product => 
            parseInt(product.sales_count) || 0
          );
          boxPlotData = calculateBoxPlotStats(productCounts);
          title = 'Distribución de Ventas por Producto';
          yAxisTitle = 'Unidades vendidas';
        } else {
          return null;
        }
        break;
        
      case 'dispensers':
      case 'users':
        // Calcular estadísticas para estos tipos de datos
        boxPlotData = calculateBoxPlotStats(rawData);
        title = analysisType === 'dispensers' 
          ? 'Distribución de Ventas por Dispensador' 
          : 'Distribución de Compras por Usuario';
        yAxisTitle = 'Cantidad';
        break;
        
      default:
        // Si el tipo no es reconocido, usar los datos raw
        boxPlotData = calculateBoxPlotStats(rawData);
        title = 'Distribución de Datos';
        yAxisTitle = 'Valor';
    }

    return {
      title: title,
      yAxis: {
        title: yAxisTitle
      },
      stats: boxPlotData,
      display: true
    };
  } catch (error) {
    console.error('Error al preparar box plot:', error);
    return null;
  }
}
