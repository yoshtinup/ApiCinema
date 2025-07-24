/**
 * Modelo de dominio para distribuciones de probabilidad
 * Representa diferentes tipos de distribuciones y sus parámetros
 */
export class ProbabilityDistribution {
  constructor({
    type = 'normal',
    parameters = {},
    probabilities = {},
    confidenceIntervals = {},
    goodnessOfFit = null,
    data = []
  } = {}) {
    this.type = type;
    this.parameters = parameters;
    this.probabilities = probabilities;
    this.confidenceIntervals = confidenceIntervals;
    this.goodnessOfFit = goodnessOfFit;
    this.data = data;
  }

  /**
   * Valida si el tipo de distribución es válido
   */
  isValidDistributionType() {
    const validTypes = ['normal', 'binomial', 'poisson', 'exponential', 'uniform'];
    return validTypes.includes(this.type);
  }

  /**
   * Obtiene los parámetros principales según el tipo de distribución
   */
  getKeyParameters() {
    switch (this.type) {
      case 'normal':
        return {
          mu: this.parameters.mean,
          sigma: this.parameters.standardDeviation,
          variance: this.parameters.variance
        };
      case 'binomial':
        return {
          n: this.parameters.trials,
          p: this.parameters.probability,
          q: 1 - this.parameters.probability
        };
      case 'poisson':
        return {
          lambda: this.parameters.lambda,
          rate: this.parameters.rate
        };
      default:
        return this.parameters;
    }
  }

  /**
   * Calcula probabilidades específicas según el tipo de distribución
   */
  calculateProbability(value, type = 'exactly') {
    // Esta función será implementada por las utilidades estadísticas
    return this.probabilities[`${type}_${value}`] || 0;
  }

  /**
   * Genera datos para visualización de la distribución
   */
  getVisualizationData(points = 100) {
    return {
      type: this.type,
      parameters: this.getKeyParameters(),
      plotPoints: this.data.length > points ? 
        this.data.slice(0, points) : 
        this.data,
      distributionCurve: this.generateCurvePoints(points)
    };
  }

  /**
   * Genera puntos para la curva de distribución
   */
  generateCurvePoints(points) {
    // Esta función será implementada por las utilidades estadísticas
    return [];
  }

  /**
   * Resumen de la distribución
   */
  getSummary() {
    return {
      type: this.type,
      parameters: this.getKeyParameters(),
      probabilities: this.probabilities,
      confidenceIntervals: this.confidenceIntervals,
      goodnessOfFit: this.goodnessOfFit,
      isValid: this.isValidDistributionType()
    };
  }
}
