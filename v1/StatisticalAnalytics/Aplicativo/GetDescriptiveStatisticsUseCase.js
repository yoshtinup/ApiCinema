/**
 * Caso de uso: Obtener estadísticas descriptivas
 * Calcula medidas estadísticas básicas para análisis de pedidos
 */
export class GetDescriptiveStatisticsUseCase {
  constructor(statisticalRepository) {
    this.statisticalRepository = statisticalRepository;
  }

  /**
   * Ejecuta el análisis de estadísticas descriptivas
   * @param {Object} filters - Filtros para el análisis
   * @param {Date} filters.startDate - Fecha de inicio
   * @param {Date} filters.endDate - Fecha de fin
   * @param {string} filters.status - Estado de los pedidos
   * @param {number} filters.userId - ID del usuario
   * @param {number} filters.categoryId - ID de la categoría
   * @param {number} filters.minAmount - Monto mínimo
   * @param {number} filters.maxAmount - Monto máximo
   * @param {number} filters.limit - Límite de registros
   * @returns {Promise<DescriptiveStatistics>}
   */
  async execute(filters = {}) {
    try {
      // Validar filtros
      this.validateFilters(filters);

      // Obtener estadísticas descriptivas
      const descriptiveStats = await this.statisticalRepository.getDescriptiveStatistics(filters);

      // Enriquecer con análisis adicional
      const enrichedStats = this.enrichStatistics(descriptiveStats);

      return enrichedStats;
    } catch (error) {
      throw new Error(`Error en análisis de estadísticas descriptivas: ${error.message}`);
    }
  }

  /**
   * Valida los filtros de entrada
   */
  validateFilters(filters) {
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      
      if (start > end) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
      }

      if (start > new Date()) {
        throw new Error('La fecha de inicio no puede ser futura');
      }
    }

    if (filters.minAmount && filters.maxAmount) {
      if (filters.minAmount > filters.maxAmount) {
        throw new Error('El monto mínimo debe ser menor al monto máximo');
      }
    }

    if (filters.minAmount && filters.minAmount < 0) {
      throw new Error('El monto mínimo no puede ser negativo');
    }

    if (filters.limit && (filters.limit < 1 || filters.limit > 10000)) {
      throw new Error('El límite debe estar entre 1 y 10,000');
    }
  }

  /**
   * Enriquece las estadísticas con análisis adicional
   */
  enrichStatistics(stats) {
    // Agregar interpretaciones
    stats.interpretation = this.generateInterpretation(stats);
    
    // Agregar alertas
    stats.alerts = this.generateAlerts(stats);
    
    // Agregar benchmarks
    stats.benchmarks = this.generateBenchmarks(stats);

    return stats;
  }

  /**
   * Genera interpretaciones de las estadísticas
   */
  generateInterpretation(stats) {
    const interpretation = {
      variability: this.interpretVariability(stats.amountStats),
      distribution: this.interpretDistribution(stats.amountStats),
      temporal: this.interpretTemporal(stats.temporalAnalysis),
      categories: this.interpretCategories(stats.categoryAnalysis)
    };

    return interpretation;
  }

  /**
   * Interpreta la variabilidad de los datos
   */
  interpretVariability(amountStats) {
    const cv = amountStats.coefficientOfVariation;
    
    if (cv < 0.1) {
      return {
        level: 'Baja',
        description: 'Los montos de pedidos son muy consistentes, con poca variación.',
        business_impact: 'Indica precios estables y comportamiento predecible de compra.'
      };
    } else if (cv < 0.3) {
      return {
        level: 'Moderada',
        description: 'Los montos de pedidos muestran variación moderada.',
        business_impact: 'Comportamiento normal del mercado con cierta diversidad en pedidos.'
      };
    } else {
      return {
        level: 'Alta',
        description: 'Los montos de pedidos varían significativamente.',
        business_impact: 'Indica gran diversidad en tipos de pedidos o posible segmentación de mercado.'
      };
    }
  }

  /**
   * Interpreta la distribución de los datos
   */
  interpretDistribution(amountStats) {
    const skewnessInterpretation = amountStats.skewnessInterpretation;
    const kurtosisInterpretation = amountStats.kurtosisInterpretation;

    let distributionType = 'Normal';
    let recommendation = '';

    if (skewnessInterpretation.includes('Sesgada a la derecha')) {
      distributionType = 'Sesgada positivamente';
      recommendation = 'Considerar estrategias para incrementar pedidos de mayor valor.';
    } else if (skewnessInterpretation.includes('Sesgada a la izquierda')) {
      distributionType = 'Sesgada negativamente';
      recommendation = 'Explorar oportunidades en el segmento de pedidos de menor valor.';
    }

    return {
      type: distributionType,
      skewness: skewnessInterpretation,
      kurtosis: kurtosisInterpretation,
      recommendation
    };
  }

  /**
   * Interpreta el análisis temporal
   */
  interpretTemporal(temporalAnalysis) {
    if (!temporalAnalysis) return null;

    const peakHours = temporalAnalysis.peakHours;
    const seasonality = temporalAnalysis.seasonality;

    return {
      peak_hours: {
        hours: peakHours.map(h => h.hour),
        recommendation: `Optimizar inventario y personal durante las horas pico: ${peakHours.map(h => `${h.hour}:00`).join(', ')}`
      },
      seasonality: seasonality ? {
        pattern: 'Detectado',
        recommendation: 'Ajustar estrategias de marketing y inventario según patrones estacionales identificados.'
      } : {
        pattern: 'No detectado',
        recommendation: 'Los datos no muestran patrones estacionales claros en el período analizado.'
      }
    };
  }

  /**
   * Interpreta el análisis por categorías
   */
  interpretCategories(categoryAnalysis) {
    if (!categoryAnalysis || !categoryAnalysis.categories.length) return null;

    const totalRevenue = categoryAnalysis.categories.reduce((sum, cat) => 
      sum + parseFloat(cat.total_revenue), 0);
    
    const topCategory = categoryAnalysis.topCategory;
    const topCategoryShare = (parseFloat(topCategory.total_revenue) / totalRevenue) * 100;

    return {
      concentration: topCategoryShare > 50 ? 'Alta' : topCategoryShare > 30 ? 'Moderada' : 'Baja',
      top_category: {
        name: topCategory.category_name,
        revenue_share: topCategoryShare.toFixed(2) + '%',
        recommendation: topCategoryShare > 60 ? 
          'Considerar diversificar el portafolio para reducir dependencia.' :
          'Mantener enfoque en categorías exitosas mientras se desarrollan otras.'
      }
    };
  }

  /**
   * Genera alertas basadas en las estadísticas
   */
  generateAlerts(stats) {
    const alerts = [];

    // Alerta por baja cantidad de datos
    if (stats.sampleSize < 30) {
      alerts.push({
        type: 'warning',
        level: 'medium',
        message: 'Muestra pequeña: Los resultados pueden no ser representativos.',
        recommendation: 'Ampliar el período de análisis para obtener resultados más confiables.'
      });
    }

    // Alerta por alta variabilidad
    if (stats.amountStats.coefficientOfVariation > 0.5) {
      alerts.push({
        type: 'info',
        level: 'low',
        message: 'Alta variabilidad en montos de pedidos detectada.',
        recommendation: 'Considerar análisis de segmentación de clientes para entender mejor los patrones.'
      });
    }

    // Alerta por valores extremos
    const outlierPercentage = (stats.amountStats.outliers?.length || 0) / stats.sampleSize * 100;
    if (outlierPercentage > 5) {
      alerts.push({
        type: 'warning',
        level: 'medium',
        message: `${outlierPercentage.toFixed(1)}% de los pedidos son valores extremos.`,
        recommendation: 'Revisar pedidos atípicos para identificar oportunidades o problemas.'
      });
    }

    return alerts;
  }

  /**
   * Genera benchmarks de referencia
   */
  generateBenchmarks(stats) {
    return {
      industry_standards: {
        cv_benchmark: {
          excellent: '< 15%',
          good: '15% - 30%',
          fair: '30% - 50%',
          poor: '> 50%',
          current: `${(stats.amountStats.coefficientOfVariation * 100).toFixed(1)}%`
        },
        sample_size: {
          minimum_recommended: 30,
          good_practice: 100,
          current: stats.sampleSize,
          assessment: stats.sampleSize >= 100 ? 'Excelente' : 
                     stats.sampleSize >= 30 ? 'Bueno' : 'Insuficiente'
        }
      },
      performance_indicators: {
        data_quality: this.assessDataQuality(stats),
        analysis_confidence: this.calculateConfidenceLevel(stats)
      }
    };
  }

  /**
   * Evalúa la calidad de los datos
   */
  assessDataQuality(stats) {
    let score = 0;
    const factors = [];

    // Tamaño de muestra
    if (stats.sampleSize >= 100) {
      score += 30;
      factors.push('Tamaño de muestra adecuado');
    } else if (stats.sampleSize >= 30) {
      score += 20;
      factors.push('Tamaño de muestra aceptable');
    } else {
      factors.push('Tamaño de muestra pequeño');
    }

    // Variabilidad
    if (stats.amountStats.coefficientOfVariation < 0.5) {
      score += 25;
      factors.push('Variabilidad controlada');
    } else {
      factors.push('Alta variabilidad');
    }

    // Completitud de datos
    if (stats.temporalAnalysis && stats.categoryAnalysis) {
      score += 25;
      factors.push('Datos temporales y categoriales disponibles');
    }

    // Distribución
    if (Math.abs(stats.amountStats.skewness) < 1) {
      score += 20;
      factors.push('Distribución relativamente normal');
    }

    return {
      score: Math.min(score, 100),
      level: score >= 80 ? 'Excelente' : score >= 60 ? 'Buena' : score >= 40 ? 'Regular' : 'Baja',
      factors
    };
  }

  /**
   * Calcula el nivel de confianza del análisis
   */
  calculateConfidenceLevel(stats) {
    const sampleSize = stats.sampleSize;
    
    if (sampleSize >= 1000) {
      return { level: '99%', description: 'Muy alta confianza en los resultados' };
    } else if (sampleSize >= 100) {
      return { level: '95%', description: 'Alta confianza en los resultados' };
    } else if (sampleSize >= 30) {
      return { level: '90%', description: 'Confianza moderada en los resultados' };
    } else {
      return { level: '80%', description: 'Confianza limitada, muestra pequeña' };
    }
  }
}
