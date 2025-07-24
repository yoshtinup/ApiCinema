/**
 * Utilidades para cálculos estadísticos descriptivos
 * Implementa algoritmos estadísticos fundamentales
 */
export class StatisticalUtils {

  /**
   * Calcula estadísticas descriptivas completas
   * @param {Array} data - Array de números
   * @returns {Object} Estadísticas descriptivas
   */
  static calculateDescriptiveStats(data) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data must be a non-empty array');
    }

    const numericData = data.filter(val => typeof val === 'number' && !isNaN(val));
    if (numericData.length === 0) {
      throw new Error('Data must contain numeric values');
    }

    const sortedData = [...numericData].sort((a, b) => a - b);
    const n = sortedData.length;

    return {
      mean: this.calculateMean(numericData),
      median: this.calculateMedian(sortedData),
      mode: this.calculateMode(numericData),
      standardDeviation: this.calculateStandardDeviation(numericData),
      variance: this.calculateVariance(numericData),
      range: this.calculateRange(sortedData),
      min: Math.min(...numericData),
      max: Math.max(...numericData),
      skewness: this.calculateSkewness(numericData),
      kurtosis: this.calculateKurtosis(numericData),
      percentiles: this.calculatePercentiles(sortedData),
      count: n,
      sum: this.calculateSum(numericData)
    };
  }

  /**
   * Calcula la media aritmética
   */
  static calculateMean(data) {
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  }

  /**
   * Calcula la mediana
   */
  static calculateMedian(sortedData) {
    const n = sortedData.length;
    if (n % 2 === 0) {
      return (sortedData[n / 2 - 1] + sortedData[n / 2]) / 2;
    }
    return sortedData[Math.floor(n / 2)];
  }

  /**
   * Calcula la moda (valor más frecuente)
   */
  static calculateMode(data) {
    const frequency = {};
    data.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1;
    });

    let maxFreq = 0;
    let modes = [];

    for (const [value, freq] of Object.entries(frequency)) {
      if (freq > maxFreq) {
        maxFreq = freq;
        modes = [parseFloat(value)];
      } else if (freq === maxFreq) {
        modes.push(parseFloat(value));
      }
    }

    return modes.length === data.length ? null : modes;
  }

  /**
   * Calcula la varianza
   */
  static calculateVariance(data) {
    const mean = this.calculateMean(data);
    const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
    return this.calculateMean(squaredDiffs);
  }

  /**
   * Calcula la desviación estándar
   */
  static calculateStandardDeviation(data) {
    return Math.sqrt(this.calculateVariance(data));
  }

  /**
   * Calcula el rango
   */
  static calculateRange(sortedData) {
    return sortedData[sortedData.length - 1] - sortedData[0];
  }

  /**
   * Calcula la suma
   */
  static calculateSum(data) {
    return data.reduce((sum, val) => sum + val, 0);
  }

  /**
   * Calcula el sesgo (skewness)
   */
  static calculateSkewness(data) {
    const n = data.length;
    const mean = this.calculateMean(data);
    const stdDev = this.calculateStandardDeviation(data);

    if (stdDev === 0) return 0;

    const skewSum = data.reduce((sum, val) => {
      return sum + Math.pow((val - mean) / stdDev, 3);
    }, 0);

    return (n / ((n - 1) * (n - 2))) * skewSum;
  }

  /**
   * Calcula la curtosis
   */
  static calculateKurtosis(data) {
    const n = data.length;
    const mean = this.calculateMean(data);
    const stdDev = this.calculateStandardDeviation(data);

    if (stdDev === 0) return 0;

    const kurtSum = data.reduce((sum, val) => {
      return sum + Math.pow((val - mean) / stdDev, 4);
    }, 0);

    const kurtosis = (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * kurtSum - 
                    (3 * Math.pow(n - 1, 2) / ((n - 2) * (n - 3)));

    return kurtosis;
  }

  /**
   * Calcula percentiles específicos
   */
  static calculatePercentiles(sortedData, percentiles = [25, 50, 75, 90, 95]) {
    const result = {};
    
    percentiles.forEach(p => {
      const index = (p / 100) * (sortedData.length - 1);
      
      if (index === Math.floor(index)) {
        result[`p${p}`] = sortedData[index];
      } else {
        const lower = sortedData[Math.floor(index)];
        const upper = sortedData[Math.ceil(index)];
        result[`p${p}`] = lower + (upper - lower) * (index - Math.floor(index));
      }
    });

    return result;
  }

  /**
   * Calcula coeficiente de correlación de Pearson
   */
  static calculateCorrelation(x, y) {
    if (x.length !== y.length) {
      throw new Error('Arrays must have the same length');
    }

    const n = x.length;
    const meanX = this.calculateMean(x);
    const meanY = this.calculateMean(y);

    let numerator = 0;
    let sumXSquared = 0;
    let sumYSquared = 0;

    for (let i = 0; i < n; i++) {
      const diffX = x[i] - meanX;
      const diffY = y[i] - meanY;
      
      numerator += diffX * diffY;
      sumXSquared += diffX * diffX;
      sumYSquared += diffY * diffY;
    }

    const denominator = Math.sqrt(sumXSquared * sumYSquared);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Detecta outliers usando el método IQR
   */
  static detectOutliers(data) {
    const sortedData = [...data].sort((a, b) => a - b);
    const q1 = this.calculatePercentiles(sortedData, [25]).p25;
    const q3 = this.calculatePercentiles(sortedData, [75]).p75;
    const iqr = q3 - q1;
    
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return {
      outliers: data.filter(val => val < lowerBound || val > upperBound),
      cleanData: data.filter(val => val >= lowerBound && val <= upperBound),
      bounds: { lower: lowerBound, upper: upperBound },
      q1,
      q3,
      iqr
    };
  }

  /**
   * Calcula estadísticas robustas (resistentes a outliers)
   */
  static calculateRobustStats(data) {
    const outlierAnalysis = this.detectOutliers(data);
    const cleanData = outlierAnalysis.cleanData;
    
    return {
      ...this.calculateDescriptiveStats(cleanData),
      outlierInfo: {
        totalOutliers: outlierAnalysis.outliers.length,
        outlierPercentage: (outlierAnalysis.outliers.length / data.length) * 100,
        outliers: outlierAnalysis.outliers,
        bounds: outlierAnalysis.bounds
      }
    };
  }

  /**
   * Calcula intervalos de confianza para la media
   */
  static calculateConfidenceInterval(data, confidenceLevel = 0.95) {
    const n = data.length;
    const mean = this.calculateMean(data);
    const stdDev = this.calculateStandardDeviation(data);
    const standardError = stdDev / Math.sqrt(n);
    
    // Aproximación usando distribución normal (válida para n > 30)
    const alpha = 1 - confidenceLevel;
    const zScore = this.getZScore(1 - alpha / 2);
    
    const marginOfError = zScore * standardError;
    
    return {
      mean,
      standardError,
      marginOfError,
      lowerBound: mean - marginOfError,
      upperBound: mean + marginOfError,
      confidenceLevel
    };
  }

  /**
   * Obtiene el valor Z para un percentil dado (aproximación)
   */
  static getZScore(percentile) {
    // Aproximación inversa de la función de distribución normal estándar
    if (percentile === 0.975) return 1.96; // 95% CI
    if (percentile === 0.995) return 2.576; // 99% CI
    if (percentile === 0.95) return 1.645; // 90% CI
    
    // Aproximación general (Beasley-Springer-Moro algorithm simplified)
    const p = percentile;
    if (p <= 0 || p >= 1) return 0;
    
    const c0 = 2.515517;
    const c1 = 0.802853;
    const c2 = 0.010328;
    const d1 = 1.432788;
    const d2 = 0.189269;
    const d3 = 0.001308;
    
    let t, z;
    
    if (p > 0.5) {
      t = Math.sqrt(-2 * Math.log(1 - p));
      z = t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t);
    } else {
      t = Math.sqrt(-2 * Math.log(p));
      z = -(t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t));
    }
    
    return z;
  }

  /**
   * Calcula el intervalo de confianza para una media
   * @param {Array} data - Array de números
   * @param {number} confidence - Nivel de confianza (ej: 0.95 para 95%)
   * @returns {Object} Intervalo de confianza {lower, upper}
   */
  static confidenceInterval(data, confidence = 0.95) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data must be a non-empty array');
    }

    const numericData = data.filter(val => typeof val === 'number' && !isNaN(val));
    if (numericData.length === 0) {
      throw new Error('Data must contain numeric values');
    }

    const mean = StatisticalUtils.calculateMean(numericData);
    const stdDev = StatisticalUtils.calculateStandardDeviation(numericData);
    const n = numericData.length;
    
    // Para muestras grandes (n >= 30), usar distribución normal
    // Para muestras pequeñas, usar distribución t (simplificado)
    const alpha = 1 - confidence;
    const percentile = 1 - alpha / 2;
    const zScore = StatisticalUtils.getZScore(percentile);
    
    const marginOfError = zScore * (stdDev / Math.sqrt(n));
    
    return {
      lower: mean - marginOfError,
      upper: mean + marginOfError,
      mean: mean,
      marginOfError: marginOfError,
      confidence: confidence
    };
  }
}
