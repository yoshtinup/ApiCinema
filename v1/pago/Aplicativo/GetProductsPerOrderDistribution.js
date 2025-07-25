/**
 * Caso de uso para obtener la distribución gaussiana de productos por orden
 * Analiza cuántos productos compran típicamente los clientes
 */
export class GetProductsPerOrderDistribution {
  constructor(pagoRepository) {
    this.pagoRepository = pagoRepository;
  }

  async execute(options = {}) {
    try {
      const {
        period = 'month',
        target_quantity = 3,
        data_points = 30
      } = options;

      console.log(`📊 Analizando distribución de productos por orden (período: ${period}, objetivo: ${target_quantity} productos)`);

      // Obtener datos de cantidad de productos
      const productQuantities = await this.pagoRepository.getProductQuantitiesPerOrder(period);
      
      if (productQuantities.length < 10) {
        throw new Error('Insufficient data for distribution analysis. Need at least 10 orders.');
      }

      // Calcular distribución gaussiana
      const distribution = this.calculateGaussianDistribution(productQuantities, target_quantity, data_points);
      
      // Agregar insights del negocio
      const insights = this.generateBusinessInsights(distribution, target_quantity);

      return {
        ...distribution,
        insights,
        metadata: {
          period_analyzed: period,
          target_quantity: target_quantity,
          analysis_type: 'products_per_order_distribution'
        }
      };

    } catch (error) {
      console.error('❌ Error en análisis de distribución de productos por orden:', error.message);
      throw new Error(`Error analyzing products per order distribution: ${error.message}`);
    }
  }

  /**
   * Calcula la distribución gaussiana de las cantidades
   */
  calculateGaussianDistribution(data, targetQuantity, dataPoints) {
    // Estadísticas básicas
    const mean = this.calculateMean(data);
    const stdDev = this.calculateStandardDeviation(data, mean);
    
    // Generar puntos para la curva gaussiana (solo números enteros para productos)
    const minX = Math.max(1, Math.floor(mean - 3 * stdDev));
    const maxX = Math.ceil(mean + 3 * stdDev);
    
    const points = [];
    for (let x = minX; x <= maxX; x++) {
      const probability = this.gaussianPDF(x, mean, stdDev);
      points.push({ 
        quantity: x, 
        probability: parseFloat(probability.toFixed(6)) 
      });
    }
    
    // Probabilidad de alcanzar el objetivo
    const probabilityWithinTarget = this.gaussianCDF(targetQuantity, mean, stdDev);
    
    // Intervalos de confianza (redondeados a enteros)
    const confidence68 = [
      Math.max(1, Math.round(mean - stdDev)), 
      Math.round(mean + stdDev)
    ];
    const confidence95 = [
      Math.max(1, Math.round(mean - 2 * stdDev)), 
      Math.round(mean + 2 * stdDev)
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
  generateBusinessInsights(distribution, targetQuantity) {
    const { mean, std_deviation, probability_within_target } = distribution;
    
    let efficiency_score;
    let recommendation;
    
    if (probability_within_target >= 0.7) {
      efficiency_score = "Excelente";
      recommendation = `${Math.round(probability_within_target * 100)}% de las órdenes alcanzan el objetivo de ${targetQuantity} productos. Los clientes están comprando bien.`;
    } else if (probability_within_target >= 0.5) {
      efficiency_score = "Bueno";
      recommendation = `${Math.round(probability_within_target * 100)}% de las órdenes alcanzan el objetivo. Considera ofrecer combos para incrementar productos por orden.`;
    } else {
      efficiency_score = "Necesita Mejora";
      recommendation = `Solo ${Math.round(probability_within_target * 100)}% de las órdenes alcanzan el objetivo. Implementa estrategias de cross-selling y up-selling.`;
    }

    return {
      efficiency_score,
      recommendation,
      average_products_per_order: mean,
      purchase_consistency: std_deviation < 1 ? "Alta" : std_deviation < 2 ? "Media" : "Baja",
      customer_behavior: mean >= targetQuantity ? "Compras múltiples" : "Compras individuales"
    };
  }
}
