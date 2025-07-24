/**
 * Funciones auxiliares para visualizaciones de datos en el módulo de análisis
 * 
 * Este archivo contiene métodos para preparar y formatear datos para gráficos
 * avanzados como box plots, scatter plots y más.
 */

/**
 * Calcula los valores necesarios para un box plot (diagrama de caja)
 * @param {Array<number>} data - Array de valores numéricos
 * @returns {Object} - Objeto con valores de box plot
 */
export function calculateBoxPlotStats(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      min: 0,
      q1: 0,
      median: 0,
      q3: 0,
      max: 0,
      outliers: []
    };
  }

  // Ordenar los datos
  const sortedData = [...data].sort((a, b) => a - b);
  
  // Calcular mediana y cuartiles
  const median = calculateMedian(sortedData);
  const lowerHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
  const upperHalf = sortedData.slice(Math.ceil(sortedData.length / 2));
  
  const q1 = calculateMedian(lowerHalf);
  const q3 = calculateMedian(upperHalf);
  
  // Calcular el IQR (rango intercuartílico)
  const iqr = q3 - q1;
  
  // Límites para outliers (valores atípicos)
  const lowerOutlierBound = q1 - 1.5 * iqr;
  const upperOutlierBound = q3 + 1.5 * iqr;
  
  // Encontrar outliers y valores no outliers
  const outliers = sortedData.filter(x => x < lowerOutlierBound || x > upperOutlierBound);
  const nonOutliers = sortedData.filter(x => x >= lowerOutlierBound && x <= upperOutlierBound);
  
  // Min y max no outliers
  const min = nonOutliers.length > 0 ? Math.min(...nonOutliers) : q1;
  const max = nonOutliers.length > 0 ? Math.max(...nonOutliers) : q3;
  
  return {
    min,
    q1,
    median,
    q3,
    max,
    outliers
  };
}

/**
 * Calcula la mediana de un array de números
 * @param {Array<number>} data - Array ordenado de valores numéricos
 * @returns {number} - Valor de la mediana
 */
function calculateMedian(data) {
  if (!data || data.length === 0) return 0;
  
  const middle = Math.floor(data.length / 2);
  
  if (data.length % 2 === 0) {
    return (data[middle - 1] + data[middle]) / 2;
  } else {
    return data[middle];
  }
}
