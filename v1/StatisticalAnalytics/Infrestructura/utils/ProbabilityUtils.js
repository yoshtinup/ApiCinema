import { StatisticalUtils } from './StatisticalUtils.js';

/**
 * Utilidades para distribuciones de probabilidad
 * Implementa cálculos para distribuciones Normal, Binomial y Poisson
 */
export class ProbabilityUtils {

  /**
   * Distribución Normal
   */
  static normal = {
    /**
     * Función de densidad de probabilidad (PDF)
     */
    pdf(x, mu = 0, sigma = 1) {
      const coefficient = 1 / (sigma * Math.sqrt(2 * Math.PI));
      const exponent = -0.5 * Math.pow((x - mu) / sigma, 2);
      return coefficient * Math.exp(exponent);
    },

    /**
     * Función de distribución acumulativa (CDF) - Aproximación
     */
    cdf(x, mu = 0, sigma = 1) {
      const z = (x - mu) / sigma;
      return 0.5 * (1 + this.erf(z / Math.sqrt(2)));
    },

    /**
     * Función de error (aproximación)
     */
    erf(x) {
      // Aproximación de Abramowitz y Stegun
      const a1 = 0.254829592;
      const a2 = -0.284496736;
      const a3 = 1.421413741;
      const a4 = -1.453152027;
      const a5 = 1.061405429;
      const p = 0.3275911;

      const sign = x >= 0 ? 1 : -1;
      x = Math.abs(x);

      const t = 1.0 / (1.0 + p * x);
      const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

      return sign * y;
    },

    /**
     * Calcula probabilidades específicas
     */
    calculateProbabilities(mu, sigma, values) {
      const probabilities = {};
      
      values.forEach(value => {
        probabilities[`exactly_${value}`] = this.pdf(value, mu, sigma);
        probabilities[`less_than_${value}`] = this.cdf(value, mu, sigma);
        probabilities[`greater_than_${value}`] = 1 - this.cdf(value, mu, sigma);
      });

      return probabilities;
    },

    /**
     * Genera puntos para la curva de distribución
     */
    generateCurve(mu, sigma, points = 100, range = 4) {
      const start = mu - range * sigma;
      const end = mu + range * sigma;
      const step = (end - start) / points;
      
      const curve = [];
      for (let i = 0; i <= points; i++) {
        const x = start + i * step;
        curve.push({
          x: x,
          y: this.pdf(x, mu, sigma)
        });
      }
      
      return curve;
    }
  };

  /**
   * Distribución Binomial
   */
  static binomial = {
    /**
     * Función de masa de probabilidad (PMF)
     */
    pmf(k, n, p) {
      if (k > n || k < 0) return 0;
      
      const binomialCoeff = this.binomialCoefficient(n, k);
      return binomialCoeff * Math.pow(p, k) * Math.pow(1 - p, n - k);
    },

    /**
     * Función de distribución acumulativa (CDF)
     */
    cdf(k, n, p) {
      let sum = 0;
      for (let i = 0; i <= k; i++) {
        sum += this.pmf(i, n, p);
      }
      return sum;
    },

    /**
     * Coeficiente binomial
     */
    binomialCoefficient(n, k) {
      if (k > n) return 0;
      if (k === 0 || k === n) return 1;
      
      // Optimización: C(n,k) = C(n,n-k)
      k = Math.min(k, n - k);
      
      let result = 1;
      for (let i = 0; i < k; i++) {
        result = result * (n - i) / (i + 1);
      }
      
      return Math.round(result);
    },

    /**
     * Media de la distribución binomial
     */
    mean(n, p) {
      return n * p;
    },

    /**
     * Varianza de la distribución binomial
     */
    variance(n, p) {
      return n * p * (1 - p);
    },

    /**
     * Calcula probabilidades específicas
     */
    calculateProbabilities(n, p, values) {
      const probabilities = {};
      
      values.forEach(value => {
        if (Number.isInteger(value) && value >= 0 && value <= n) {
          probabilities[`exactly_${value}`] = this.pmf(value, n, p);
          probabilities[`less_than_or_equal_${value}`] = this.cdf(value, n, p);
          probabilities[`greater_than_${value}`] = 1 - this.cdf(value, n, p);
        }
      });

      return probabilities;
    }
  };

  /**
   * Distribución de Poisson
   */
  static poisson = {
    /**
     * Función de masa de probabilidad (PMF)
     */
    pmf(k, lambda) {
      if (k < 0 || !Number.isInteger(k)) return 0;
      
      return (Math.pow(lambda, k) * Math.exp(-lambda)) / this.factorial(k);
    },

    /**
     * Función de distribución acumulativa (CDF)
     */
    cdf(k, lambda) {
      let sum = 0;
      for (let i = 0; i <= k; i++) {
        sum += this.pmf(i, lambda);
      }
      return sum;
    },

    /**
     * Factorial (con optimización para números grandes)
     */
    factorial(n) {
      if (n <= 1) return 1;
      if (n > 170) return Infinity; // Evitar overflow
      
      let result = 1;
      for (let i = 2; i <= n; i++) {
        result *= i;
      }
      return result;
    },

    /**
     * Media de la distribución de Poisson
     */
    mean(lambda) {
      return lambda;
    },

    /**
     * Varianza de la distribución de Poisson
     */
    variance(lambda) {
      return lambda;
    },

    /**
     * Calcula probabilidades específicas
     */
    calculateProbabilities(lambda, values) {
      const probabilities = {};
      
      values.forEach(value => {
        if (Number.isInteger(value) && value >= 0) {
          probabilities[`exactly_${value}`] = this.pmf(value, lambda);
          probabilities[`less_than_or_equal_${value}`] = this.cdf(value, lambda);
          probabilities[`greater_than_${value}`] = 1 - this.cdf(value, lambda);
        }
      });

      return probabilities;
    }
  };

  /**
   * Test de bondad de ajuste (Kolmogorov-Smirnov simplificado)
   */
  static goodnessOfFit(observedData, theoreticalCDF) {
    const n = observedData.length;
    const sortedData = [...observedData].sort((a, b) => a - b);
    
    let maxDifference = 0;
    
    for (let i = 0; i < n; i++) {
      const empiricalCDF = (i + 1) / n;
      const theoretical = theoreticalCDF(sortedData[i]);
      const difference = Math.abs(empiricalCDF - theoretical);
      
      if (difference > maxDifference) {
        maxDifference = difference;
      }
    }

    // Valor crítico aproximado para α = 0.05
    const criticalValue = 1.36 / Math.sqrt(n);
    
    return {
      testStatistic: maxDifference,
      criticalValue: criticalValue,
      pValue: this.calculateKSPValue(maxDifference, n),
      rejectNull: maxDifference > criticalValue,
      interpretation: maxDifference > criticalValue ? 
        'Los datos no siguen la distribución teórica' : 
        'Los datos son consistentes con la distribución teórica'
    };
  }

  /**
   * Aproximación del p-valor para Kolmogorov-Smirnov
   */
  static calculateKSPValue(testStat, n) {
    // Aproximación simple
    const lambda = testStat * Math.sqrt(n);
    return 2 * Math.exp(-2 * lambda * lambda);
  }

  /**
   * Determina la mejor distribución para un conjunto de datos
   */
  static findBestDistribution(data) {
    const stats = StatisticalUtils.calculateDescriptiveStats(data);
    
    // Test para distribución normal
    const normalTest = this.goodnessOfFit(data, (x) => 
      this.normal.cdf(x, stats.mean, stats.standardDeviation)
    );

    // Test para distribución de Poisson (si datos son enteros no negativos)
    const isIntegerData = data.every(x => Number.isInteger(x) && x >= 0);
    let poissonTest = null;
    
    if (isIntegerData) {
      poissonTest = this.goodnessOfFit(data, (x) => 
        this.poisson.cdf(Math.floor(x), stats.mean)
      );
    }

    const results = {
      normal: {
        parameters: { mu: stats.mean, sigma: stats.standardDeviation },
        goodnessOfFit: normalTest,
        score: 1 - normalTest.testStatistic
      }
    };

    if (poissonTest) {
      results.poisson = {
        parameters: { lambda: stats.mean },
        goodnessOfFit: poissonTest,
        score: 1 - poissonTest.testStatistic
      };
    }

    // Determinar la mejor distribución
    const bestDistribution = Object.entries(results)
      .sort((a, b) => b[1].score - a[1].score)[0];

    return {
      bestDistribution: bestDistribution[0],
      allResults: results,
      recommendation: `La distribución ${bestDistribution[0]} es la que mejor se ajusta a los datos`
    };
  }
}
