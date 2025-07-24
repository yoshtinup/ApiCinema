/**
 * Método auxiliar para usar datos de ejemplo para la gráfica de barras
 */
_useFallbackBarChartData(periodos, datos, grouping) {
  periodos.length = 0; // Limpiar array
  
  if (grouping === 'trimestre') {
    // Datos trimestrales para el año
    periodos.push('Trim 1', 'Trim 2', 'Trim 3', 'Trim 4');
    datos.ingresos = [600, 590, 450, 470];
    datos.ordenes = [15, 14, 10, 12];
  } else {
    // Datos semanales para el mes
    periodos.push('Sem 1', 'Sem 2', 'Sem 3', 'Sem 4');
    datos.ingresos = [150, 180, 120, 200];
    datos.ordenes = [4, 5, 3, 6];
  }
}
