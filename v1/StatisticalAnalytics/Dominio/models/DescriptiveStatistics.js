/**
 * Modelo de dominio para análisis estadístico descriptivo
 * Representa las métricas estadísticas básicas de un conjunto de datos
 */
export class DescriptiveStatistics {
  constructor({
    mean = 0,
    median = 0,
    mode = null,
    standardDeviation = 0,
    variance = 0,
    range = 0,
    min = 0,
    max = 0,
    skewness = 0,
    kurtosis = 0,
    percentiles = {},
    count = 0,
    sum = 0
  } = {}) {
    this.mean = mean;
    this.median = median;
    this.mode = mode;
    this.standardDeviation = standardDeviation;
    this.variance = variance;
    this.range = range;
    this.min = min;
    this.max = max;
    this.skewness = skewness;
    this.kurtosis = kurtosis;
    this.percentiles = percentiles;
    this.count = count;
    this.sum = sum;
  }

  /**
   * Interpreta el sesgo de la distribución
   */
  getSkewnessInterpretation() {
    if (Math.abs(this.skewness) < 0.5) return 'Aproximadamente simétrica';
    if (this.skewness > 0.5) return 'Sesgada hacia la derecha (cola derecha)';
    return 'Sesgada hacia la izquierda (cola izquierda)';
  }

  /**
   * Interpreta la curtosis de la distribución
   */
  getKurtosisInterpretation() {
    if (Math.abs(this.kurtosis) < 0.5) return 'Mesocúrtica (distribución normal)';
    if (this.kurtosis > 0.5) return 'Leptocúrtica (más puntiaguda que normal)';
    return 'Platicúrtica (más plana que normal)';
  }

  /**
   * Calcula el coeficiente de variación
   */
  getCoefficientOfVariation() {
    return this.mean !== 0 ? (this.standardDeviation / this.mean) * 100 : 0;
  }

  /**
   * Resumen estadístico completo
   */
  getSummary() {
    return {
      centralTendency: {
        mean: this.mean,
        median: this.median,
        mode: this.mode
      },
      dispersion: {
        standardDeviation: this.standardDeviation,
        variance: this.variance,
        range: this.range,
        coefficientOfVariation: this.getCoefficientOfVariation()
      },
      shape: {
        skewness: this.skewness,
        skewnessInterpretation: this.getSkewnessInterpretation(),
        kurtosis: this.kurtosis,
        kurtosisInterpretation: this.getKurtosisInterpretation()
      },
      percentiles: this.percentiles,
      basic: {
        count: this.count,
        sum: this.sum,
        min: this.min,
        max: this.max
      }
    };
  }
}
