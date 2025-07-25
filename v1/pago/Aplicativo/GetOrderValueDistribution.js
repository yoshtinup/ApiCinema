/**
 * Caso de uso para obtener la distribución gaussiana de valores de órdenes
 * Analiza patrones de gasto de clientes en el cinema
 */
export class GetOrderValueDistribution {
  constructor(pagoRepository) {
    this.pagoRepository = pagoRepository;
  }

  async execute(options = {}) {
    try {
      const {
        period = 'month',
        target_value = 100,
        confidence_level = 95,
        data_points = 50
      } = options;

      console.log(`📊 Analizando distribución de valores de orden (período: ${period}, objetivo: $${target_value})`);

      // Obtener datos de órdenes
      const orderValues = await this.pagoRepository.getOrderValuesForDistribution(period);
      
      if (orderValues.length < 10) {
        throw new Error('Insufficient data for distribution analysis. Need at least 10 orders.');
      }

      // Calcular distribución gaussiana
      const distribution = this.calculateGaussianDistribution(orderValues, target_value, data_points);
      
      // Agregar insights del negocio
      const insights = this.generateBusinessInsights(distribution, target_value);

      return {
        ...distribution,
        insights,
        metadata: {
          period_analyzed: period,
          target_value: target_value,
          analysis_type: 'order_value_distribution'
        }
      };

    } catch (error) {
      console.error('❌ Error en análisis de distribución de valores:', error.message);
      throw new Error(`Error analyzing order value distribution: ${error.message}`);
    }
  }

  /**
   * Calcula la distribución gaussiana de los valores
   */
  calculateGaussianDistribution(data, targetValue, dataPoints) {
    // Estadísticas básicas
    const mean = this.calculateMean(data);
    const stdDev = this.calculateStandardDeviation(data, mean);
    
    // Generar puntos para la curva gaussiana
    const minX = Math.max(0, mean - 3 * stdDev); // No valores negativos
    const maxX = mean + 3 * stdDev;
    const step = (maxX - minX) / dataPoints;
    
    const points = [];
    for (let x = minX; x <= maxX; x += step) {
      const probability = this.gaussianPDF(x, mean, stdDev);
      points.push({ 
        value: parseFloat(x.toFixed(2)), 
        probability: parseFloat(probability.toFixed(6)) 
      });
    }
    
    // Probabilidad de alcanzar el objetivo
    const probabilityWithinTarget = this.gaussianCDF(targetValue, mean, stdDev);
    
    // Intervalos de confianza
    const confidence68 = [
      parseFloat((mean - stdDev).toFixed(2)), 
      parseFloat((mean + stdDev).toFixed(2))
    ];
    const confidence95 = [
      parseFloat((mean - 2 * stdDev).toFixed(2)), 
      parseFloat((mean + 2 * stdDev).toFixed(2))
    ];

    return {
      mean: parseFloat(mean.toFixed(2)),
      std_deviation: parseFloat(stdDev.toFixed(2)),
      sample_size: data.length,
      data_points: points,
      probability_within_target: parseFloat(probabilityWithinTarget.toFixed(4)),
      confidence_intervals: {
        "68_percent": confidence68,
        "95_percent": confidence95
      }
    };
  }

  /**
   * Calcula la media de un array
   */
  calculateMean(data) {
    return data.reduce((sum, value) => sum + value, 0) / data.length;
  }

  /**
   * Calcula la desviación estándar
   */
  calculateStandardDeviation(data, mean) {
    const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / (data.length - 1);
    return Math.sqrt(variance);
  }

  /**
   * Función de densidad de probabilidad gaussiana
   */
  gaussianPDF(x, mean, stdDev) {
    const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
    const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
    return coefficient * Math.exp(exponent);
  }

  /**
   * Función de distribución acumulativa gaussiana (aproximación)
   */
  gaussianCDF(x, mean, stdDev) {
    const z = (x - mean) / stdDev;
    return 0.5 * (1 + this.erf(z / Math.sqrt(2)));
  }

  /**
   * Aproximación de la función error (erf)
   */
  erf(x) {
    // Aproximación de Abramowitz y Stegun
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  /**
   * Genera insights del negocio basados en la distribución
   */
  generateBusinessInsights(distribution, targetValue) {
    const { mean, std_deviation, probability_within_target } = distribution;
    
    let efficiency_score;
    let recommendation;
    
    if (probability_within_target >= 0.7) {
      efficiency_score = "Excelente";
      recommendation = `${Math.round(probability_within_target * 100)}% de las órdenes alcanzan el objetivo de $${targetValue}. El negocio está funcionando muy bien.`;
    } else if (probability_within_target >= 0.5) {
      efficiency_score = "Bueno";
      recommendation = `${Math.round(probability_within_target * 100)}% de las órdenes alcanzan el objetivo. Considera promociones para incrementar el ticket promedio.`;
    } else {
      efficiency_score = "Necesita Mejora";
      recommendation = `Solo ${Math.round(probability_within_target * 100)}% de las órdenes alcanzan el objetivo. Revisa estrategias de up-selling y combos.`;
    }

    return {
      efficiency_score,
      recommendation,
      average_order_value: mean,
      variability: std_deviation > mean * 0.3 ? "Alta" : std_deviation > mean * 0.15 ? "Media" : "Baja",
      business_health: mean > targetValue ? "Saludable" : "Requiere atención"
    };
  }
}
