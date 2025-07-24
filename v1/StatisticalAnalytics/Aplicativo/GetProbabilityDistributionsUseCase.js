import { ProbabilityUtils } from '../Infrestructura/utils/ProbabilityUtils.js';

/**
 * Caso de uso: Obtener distribuciones de probabilidad
 * Analiza distribuciones estadísticas de los datos de pedidos
 */
export class GetProbabilityDistributionsUseCase {
  constructor(statisticalRepository) {
    this.statisticalRepository = statisticalRepository;
  }

  /**
   * Ejecuta el análisis de distribuciones de probabilidad
   * @param {Object} filters - Filtros para el análisis
   * @param {Object} analysisOptions - Opciones específicas del análisis
   * @param {string[]} analysisOptions.distributions - Distribuciones a analizar ['normal', 'poisson', 'binomial']
   * @param {number[]} analysisOptions.testValues - Valores específicos para calcular probabilidades
   * @param {number} analysisOptions.confidenceLevel - Nivel de confianza (0.90, 0.95, 0.99)
   * @returns {Promise<ProbabilityDistribution>}
   */
  async execute(filters = {}, analysisOptions = {}) {
    try {
      // Validar entrada
      this.validateInputs(filters, analysisOptions);

      // Obtener distribuciones de probabilidad
      const probabilityDist = await this.statisticalRepository.getProbabilityDistributions(filters);

      // Enriquecer con análisis específico
      const enrichedDistribution = this.enrichDistributions(probabilityDist, analysisOptions);

      // Generar interpretaciones
      enrichedDistribution.interpretation = this.generateInterpretation(enrichedDistribution);

      // Generar recomendaciones
      enrichedDistribution.recommendations = this.generateRecommendations(enrichedDistribution);

      return enrichedDistribution;
    } catch (error) {
      throw new Error(`Error en análisis de distribuciones de probabilidad: ${error.message}`);
    }
  }

  /**
   * Valida las entradas del análisis
   */
  validateInputs(filters, analysisOptions) {
    // Validar distribuciones solicitadas
    const validDistributions = ['normal', 'poisson', 'binomial'];
    if (analysisOptions.distributions) {
      const invalidDistributions = analysisOptions.distributions.filter(
        d => !validDistributions.includes(d)
      );
      
      if (invalidDistributions.length > 0) {
        throw new Error(`Distribuciones inválidas: ${invalidDistributions.join(', ')}`);
      }
    }

    // Validar nivel de confianza
    if (analysisOptions.confidenceLevel) {
      const validLevels = [0.80, 0.90, 0.95, 0.99];
      if (!validLevels.includes(analysisOptions.confidenceLevel)) {
        throw new Error('Nivel de confianza debe ser 0.80, 0.90, 0.95 o 0.99');
      }
    }

    // Validar valores de prueba
    if (analysisOptions.testValues) {
      if (!Array.isArray(analysisOptions.testValues) || analysisOptions.testValues.length === 0) {
        throw new Error('testValues debe ser un array no vacío');
      }

      const invalidValues = analysisOptions.testValues.filter(v => 
        typeof v !== 'number' || isNaN(v) || v < 0
      );
      
      if (invalidValues.length > 0) {
        throw new Error('Todos los valores de prueba deben ser números no negativos');
      }
    }
  }

  /**
   * Enriquece las distribuciones con análisis adicional
   */
  enrichDistributions(distribution, options) {
    // Calcular probabilidades para valores específicos si se proporcionan
    if (options.testValues) {
      distribution.customProbabilities = this.calculateCustomProbabilities(
        distribution, 
        options.testValues
      );
    }

    // Generar intervalos de confianza
    const confidenceLevel = options.confidenceLevel || 0.95;
    distribution.confidenceIntervals = this.calculateConfidenceIntervals(
      distribution, 
      confidenceLevel
    );

    // Análisis de bondad de ajuste mejorado
    distribution.goodnessOfFitAnalysis = this.enhanceGoodnessOfFit(distribution);

    // Análisis comparativo entre distribuciones
    distribution.distributionComparison = this.compareDistributions(distribution);

    return distribution;
  }

  /**
   * Calcula probabilidades para valores específicos
   */
  calculateCustomProbabilities(distribution, testValues) {
    const probabilities = {
      normal: {},
      poisson: {}
    };

    // Probabilidades para distribución normal
    testValues.forEach(value => {
      const { mu, sigma } = distribution.normalParameters;
      
      probabilities.normal[`exactly_${value}`] = ProbabilityUtils.normal.pdf(value, mu, sigma);
      probabilities.normal[`less_than_${value}`] = ProbabilityUtils.normal.cdf(value, mu, sigma);
      probabilities.normal[`greater_than_${value}`] = 1 - ProbabilityUtils.normal.cdf(value, mu, sigma);
      probabilities.normal[`between_${value}_and_${value * 1.2}`] = 
        ProbabilityUtils.normal.cdf(value * 1.2, mu, sigma) - 
        ProbabilityUtils.normal.cdf(value, mu, sigma);
    });

    // Probabilidades para distribución Poisson (solo valores enteros)
    const integerValues = testValues.filter(v => Number.isInteger(v));
    integerValues.forEach(value => {
      const { lambda } = distribution.poissonParameters;
      
      probabilities.poisson[`exactly_${value}`] = ProbabilityUtils.poisson.pmf(value, lambda);
      probabilities.poisson[`less_than_or_equal_${value}`] = ProbabilityUtils.poisson.cdf(value, lambda);
      probabilities.poisson[`greater_than_${value}`] = 1 - ProbabilityUtils.poisson.cdf(value, lambda);
    });

    return probabilities;
  }

  /**
   * Calcula intervalos de confianza
   */
  calculateConfidenceIntervals(distribution, confidenceLevel) {
    const intervals = {};
    
    // Z-scores para diferentes niveles de confianza
    const zScores = {
      0.80: 1.28,
      0.90: 1.645,
      0.95: 1.96,
      0.99: 2.576
    };

    const zScore = zScores[confidenceLevel];
    const { mu, sigma } = distribution.normalParameters;

    // Intervalo de confianza para la media (distribución normal)
    intervals.normalMean = {
      lower: mu - zScore * sigma,
      upper: mu + zScore * sigma,
      level: confidenceLevel,
      interpretation: `${(confidenceLevel * 100)}% de los valores están entre ${(mu - zScore * sigma).toFixed(2)} y ${(mu + zScore * sigma).toFixed(2)}`
    };

    // Intervalo de predicción para un nuevo valor
    intervals.prediction = {
      lower: mu - zScore * sigma * Math.sqrt(1 + 1), // Aproximación simplificada
      upper: mu + zScore * sigma * Math.sqrt(1 + 1),
      level: confidenceLevel,
      interpretation: `Un nuevo pedido tiene ${(confidenceLevel * 100)}% de probabilidad de estar entre ${(mu - zScore * sigma * Math.sqrt(2)).toFixed(2)} y ${(mu + zScore * sigma * Math.sqrt(2)).toFixed(2)}`
    };

    // Intervalos para distribución Poisson
    if (distribution.poissonParameters) {
      const { lambda } = distribution.poissonParameters;
      const poissonStd = Math.sqrt(lambda);
      
      intervals.poissonVolume = {
        lower: Math.max(0, lambda - zScore * poissonStd),
        upper: lambda + zScore * poissonStd,
        level: confidenceLevel,
        interpretation: `El volumen diario de pedidos está entre ${Math.max(0, Math.floor(lambda - zScore * poissonStd))} y ${Math.ceil(lambda + zScore * poissonStd)} con ${(confidenceLevel * 100)}% de confianza`
      };
    }

    return intervals;
  }

  /**
   * Mejora el análisis de bondad de ajuste
   */
  enhanceGoodnessOfFit(distribution) {
    const analysis = {
      normal: distribution.normalGoodnessOfFit,
      poisson: distribution.poissonGoodnessOfFit
    };

    // Interpretar resultados de bondad de ajuste
    Object.keys(analysis).forEach(distType => {
      if (analysis[distType]) {
        const gof = analysis[distType];
        
        analysis[distType].detailedInterpretation = {
          strength: this.interpretTestStatistic(gof.testStatistic),
          reliability: this.assessTestReliability(gof.pValue),
          conclusion: this.generateConclusion(gof.rejectNull, distType)
        };
      }
    });

    // Recomendación general
    analysis.recommendation = this.selectBestDistribution(analysis);

    return analysis;
  }

  /**
   * Interpreta el estadístico de prueba
   */
  interpretTestStatistic(testStatistic) {
    if (testStatistic < 0.1) {
      return { level: 'Excelente', description: 'Ajuste muy bueno a la distribución teórica' };
    } else if (testStatistic < 0.15) {
      return { level: 'Bueno', description: 'Ajuste adecuado a la distribución teórica' };
    } else if (testStatistic < 0.25) {
      return { level: 'Regular', description: 'Ajuste moderado a la distribución teórica' };
    } else {
      return { level: 'Pobre', description: 'Ajuste deficiente a la distribución teórica' };
    }
  }

  /**
   * Evalúa la confiabilidad del test
   */
  assessTestReliability(pValue) {
    if (pValue > 0.1) {
      return { level: 'Alta', description: 'Evidencia fuerte a favor del ajuste' };
    } else if (pValue > 0.05) {
      return { level: 'Moderada', description: 'Evidencia moderada a favor del ajuste' };
    } else if (pValue > 0.01) {
      return { level: 'Baja', description: 'Evidencia débil contra el ajuste' };
    } else {
      return { level: 'Muy Baja', description: 'Evidencia fuerte contra el ajuste' };
    }
  }

  /**
   * Genera conclusión del test
   */
  generateConclusion(rejectNull, distributionType) {
    if (rejectNull) {
      return {
        result: 'Rechazar',
        message: `Los datos NO siguen una distribución ${distributionType}`,
        recommendation: `Considerar otras distribuciones o transformaciones de datos`
      };
    } else {
      return {
        result: 'No rechazar',
        message: `Los datos son consistentes con una distribución ${distributionType}`,
        recommendation: `Se puede usar la distribución ${distributionType} para modelado y predicciones`
      };
    }
  }

  /**
   * Selecciona la mejor distribución
   */
  selectBestDistribution(analysis) {
    const scores = {};
    
    Object.keys(analysis).forEach(distType => {
      if (analysis[distType] && analysis[distType].testStatistic !== undefined) {
        // Puntuación basada en estadístico de prueba (menor es mejor)
        scores[distType] = 1 - analysis[distType].testStatistic;
      }
    });

    const bestDist = Object.keys(scores).reduce((best, current) => 
      scores[current] > scores[best] ? current : best
    );

    return {
      bestDistribution: bestDist,
      score: scores[bestDist]?.toFixed(3),
      reasoning: `La distribución ${bestDist} presenta el mejor ajuste basado en el test Kolmogorov-Smirnov`
    };
  }

  /**
   * Compara las distribuciones disponibles
   */
  compareDistributions(distribution) {
    const comparison = {
      applicability: {},
      characteristics: {},
      use_cases: {}
    };

    // Aplicabilidad de distribución normal
    comparison.applicability.normal = {
      suitable: true,
      reasons: [
        'Adecuada para variables continuas como montos',
        'Permite cálculos de probabilidades complejos',
        'Base para muchos métodos estadísticos'
      ],
      limitations: [
        'Asume simetría en los datos',
        'Puede no capturar colas pesadas'
      ]
    };

    // Aplicabilidad de distribución Poisson
    if (distribution.poissonParameters) {
      comparison.applicability.poisson = {
        suitable: true,
        reasons: [
          'Ideal para conteos de eventos (pedidos diarios)',
          'Modela bien eventos raros',
          'Un solo parámetro (lambda)'
        ],
        limitations: [
          'Solo para variables discretas no negativas',
          'Asume eventos independientes'
        ]
      };
    }

    // Características comparativas
    comparison.characteristics = {
      normal: {
        type: 'Continua',
        parameters: 2,
        flexibility: 'Alta',
        interpretation: 'Media y varianza independientes'
      },
      poisson: {
        type: 'Discreta',
        parameters: 1,
        flexibility: 'Moderada',
        interpretation: 'Media igual a varianza'
      }
    };

    // Casos de uso recomendados
    comparison.use_cases = {
      normal: [
        'Predicción de montos de pedidos',
        'Análisis de desviaciones de precios',
        'Modelado de comportamiento de clientes',
        'Cálculo de intervalos de confianza'
      ],
      poisson: [
        'Predicción de volumen diario de pedidos',
        'Planificación de capacidad',
        'Análisis de demanda por períodos',
        'Detección de días atípicos'
      ]
    };

    return comparison;
  }

  /**
   * Genera interpretaciones detalladas
   */
  generateInterpretation(distribution) {
    const interpretation = {
      business_context: this.interpretBusinessContext(distribution),
      statistical_significance: this.interpretStatisticalSignificance(distribution),
      predictive_power: this.assessPredictivePower(distribution),
      risk_assessment: this.assessRisks(distribution)
    };

    return interpretation;
  }

  /**
   * Interpreta el contexto de negocio
   */
  interpretBusinessContext(distribution) {
    const { mu, sigma } = distribution.normalParameters;
    const cv = sigma / mu;

    return {
      typical_order: {
        amount: mu.toFixed(2),
        description: `El pedido típico tiene un valor de $${mu.toFixed(2)}`
      },
      variability: {
        level: cv < 0.2 ? 'Baja' : cv < 0.5 ? 'Moderada' : 'Alta',
        description: `La variabilidad en los montos es ${cv < 0.2 ? 'baja' : cv < 0.5 ? 'moderada' : 'alta'} (CV: ${(cv * 100).toFixed(1)}%)`
      },
      predictability: {
        score: cv < 0.3 ? 'Alta' : cv < 0.6 ? 'Moderada' : 'Baja',
        implications: cv < 0.3 ? 
          'Los ingresos son predecibles, facilitando la planificación' :
          'Alta variabilidad requiere estrategias de gestión de riesgo'
      }
    };
  }

  /**
   * Interpreta la significancia estadística
   */
  interpretStatisticalSignificance(distribution) {
    const normalGOF = distribution.goodnessOfFitAnalysis?.normal;
    const poissonGOF = distribution.goodnessOfFitAnalysis?.poisson;

    return {
      normal_distribution: normalGOF ? {
        is_significant: !normalGOF.rejectNull,
        confidence: normalGOF.detailedInterpretation?.reliability?.level || 'Desconocida',
        practical_meaning: normalGOF.rejectNull ? 
          'Los datos no siguen perfectamente una distribución normal, pero aún puede ser útil para aproximaciones' :
          'Los datos se ajustan bien a una distribución normal, permitiendo usar métodos paramétricos'
      } : null,
      
      poisson_distribution: poissonGOF ? {
        is_significant: !poissonGOF.rejectNull,
        confidence: poissonGOF.detailedInterpretation?.reliability?.level || 'Desconocida',
        practical_meaning: poissonGOF.rejectNull ? 
          'El conteo de pedidos no sigue exactamente un proceso Poisson' :
          'El volumen de pedidos puede modelarse como un proceso Poisson'
      } : null
    };
  }

  /**
   * Evalúa el poder predictivo
   */
  assessPredictivePower(distribution) {
    return {
      short_term: {
        horizon: '1-7 días',
        reliability: 'Alta',
        confidence_level: '90-95%',
        use_case: 'Planificación operativa diaria'
      },
      medium_term: {
        horizon: '1-4 semanas',
        reliability: 'Moderada',
        confidence_level: '80-90%',
        use_case: 'Planificación de inventario y personal'
      },
      long_term: {
        horizon: '1-3 meses',
        reliability: 'Limitada',
        confidence_level: '70-80%',
        use_case: 'Planificación estratégica y presupuestos'
      }
    };
  }

  /**
   * Evalúa riesgos asociados
   */
  assessRisks(distribution) {
    const { mu, sigma } = distribution.normalParameters;
    
    return {
      revenue_volatility: {
        level: sigma > mu * 0.5 ? 'Alto' : sigma > mu * 0.3 ? 'Moderado' : 'Bajo',
        impact: 'Variaciones significativas en ingresos diarios/semanales',
        mitigation: 'Diversificar productos y segmentos de clientes'
      },
      extreme_values: {
        probability: distribution.businessProbabilities?.highValueOrder || 'No calculada',
        description: 'Probabilidad de pedidos de alto valor',
        strategy: 'Preparar capacidad para manejar pedidos excepcionales'
      },
      demand_fluctuation: {
        coefficient_variation: (sigma / mu * 100).toFixed(1) + '%',
        assessment: sigma / mu > 0.4 ? 'Alto riesgo' : 'Riesgo controlado',
        recommendation: 'Implementar sistemas de monitoreo en tiempo real'
      }
    };
  }

  /**
   * Genera recomendaciones específicas
   */
  generateRecommendations(distribution) {
    const recommendations = [];

    // Recomendaciones basadas en distribución normal
    const normalGOF = distribution.goodnessOfFitAnalysis?.normal;
    if (normalGOF && !normalGOF.rejectNull) {
      recommendations.push({
        category: 'modeling',
        priority: 'high',
        title: 'Usar Distribución Normal para Modelado',
        description: 'Los datos se ajustan bien a una distribución normal.',
        actions: [
          'Implementar control estadístico de procesos',
          'Usar intervalos de confianza para predicciones',
          'Aplicar tests t para comparaciones'
        ]
      });
    }

    // Recomendaciones basadas en distribución Poisson
    const poissonGOF = distribution.goodnessOfFitAnalysis?.poisson;
    if (poissonGOF && !poissonGOF.rejectNull) {
      recommendations.push({
        category: 'capacity_planning',
        priority: 'medium',
        title: 'Optimizar Planificación de Capacidad',
        description: 'El volumen de pedidos sigue un patrón Poisson predecible.',
        actions: [
          'Calcular probabilidades de exceder capacidad',
          'Dimensionar personal basado en lambda',
          'Implementar alertas automáticas'
        ]
      });
    }

    // Recomendaciones basadas en variabilidad
    const cv = distribution.normalParameters.sigma / distribution.normalParameters.mu;
    if (cv > 0.5) {
      recommendations.push({
        category: 'risk_management',
        priority: 'high',
        title: 'Gestionar Alta Variabilidad',
        description: 'Los montos de pedidos muestran alta variabilidad.',
        actions: [
          'Implementar análisis de segmentación de clientes',
          'Desarrollar estrategias de precios dinámicos',
          'Crear fondos de contingencia para volatilidad'
        ]
      });
    }

    return recommendations;
  }
}
