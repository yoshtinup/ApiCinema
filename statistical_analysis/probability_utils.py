import numpy as np
from scipy import stats
from scipy.special import factorial
from typing import Dict, List, Union, Optional
from dataclasses import dataclass

@dataclass
class TestResult:
    test_statistic: float
    critical_value: float
    p_value: float
    reject_null: bool
    interpretation: str

@dataclass
class Distribution:
    type: str
    parameters: dict
    probabilities: dict
    confidence_intervals: dict
    goodness_of_fit: Optional[TestResult]
    data: List[float]

class ProbabilityUtils:
    """
    Utilidades para distribuciones de probabilidad
    Implementa cálculos para distribuciones Normal, Binomial y Poisson
    """
    
    @staticmethod
    def normal_pdf(x: float, mu: float = 0, sigma: float = 1) -> float:
        """Función de densidad de probabilidad (PDF) para distribución normal"""
        return stats.norm.pdf(x, mu, sigma)
    
    @staticmethod
    def normal_cdf(x: float, mu: float = 0, sigma: float = 1) -> float:
        """Función de distribución acumulativa (CDF) para distribución normal"""
        return stats.norm.cdf(x, mu, sigma)
    
    @staticmethod
    def calculate_normal_probabilities(mu: float, sigma: float, values: List[float]) -> Dict[str, float]:
        """Calcula probabilidades específicas para distribución normal"""
        probabilities = {}
        for value in values:
            probabilities[f"exactly_{value}"] = ProbabilityUtils.normal_pdf(value, mu, sigma)
            probabilities[f"less_than_{value}"] = ProbabilityUtils.normal_cdf(value, mu, sigma)
            probabilities[f"greater_than_{value}"] = 1 - ProbabilityUtils.normal_cdf(value, mu, sigma)
        return probabilities

    @staticmethod
    def poisson_pmf(k: int, lambda_: float) -> float:
        """Función de masa de probabilidad (PMF) para distribución Poisson"""
        if k < 0 or not isinstance(k, int):
            return 0
        return stats.poisson.pmf(k, lambda_)

    @staticmethod
    def poisson_cdf(k: int, lambda_: float) -> float:
        """Función de distribución acumulativa (CDF) para distribución Poisson"""
        return stats.poisson.cdf(k, lambda_)

    @staticmethod
    def calculate_poisson_probabilities(lambda_: float, values: List[int]) -> Dict[str, float]:
        """Calcula probabilidades específicas para distribución Poisson"""
        probabilities = {}
        for value in values:
            if isinstance(value, int) and value >= 0:
                probabilities[f"exactly_{value}"] = ProbabilityUtils.poisson_pmf(value, lambda_)
                probabilities[f"less_than_or_equal_{value}"] = ProbabilityUtils.poisson_cdf(value, lambda_)
                probabilities[f"greater_than_{value}"] = 1 - ProbabilityUtils.poisson_cdf(value, lambda_)
        return probabilities

    @staticmethod
    def binomial_pmf(k: int, n: int, p: float) -> float:
        """Función de masa de probabilidad (PMF) para distribución Binomial"""
        if k > n or k < 0:
            return 0
        return stats.binom.pmf(k, n, p)

    @staticmethod
    def binomial_cdf(k: int, n: int, p: float) -> float:
        """Función de distribución acumulativa (CDF) para distribución Binomial"""
        return stats.binom.cdf(k, n, p)

    @staticmethod
    def calculate_binomial_probabilities(n: int, p: float, values: List[int]) -> Dict[str, float]:
        """Calcula probabilidades específicas para distribución Binomial"""
        probabilities = {}
        for value in values:
            if isinstance(value, int) and 0 <= value <= n:
                probabilities[f"exactly_{value}"] = ProbabilityUtils.binomial_pmf(value, n, p)
                probabilities[f"less_than_or_equal_{value}"] = ProbabilityUtils.binomial_cdf(value, n, p)
                probabilities[f"greater_than_{value}"] = 1 - ProbabilityUtils.binomial_cdf(value, n, p)
        return probabilities

    @staticmethod
    def goodness_of_fit(observed_data: List[float], theoretical_cdf) -> TestResult:
        """Test de bondad de ajuste (Kolmogorov-Smirnov)"""
        # Ordenar datos y calcular CDF empírica
        sorted_data = np.sort(observed_data)
        n = len(observed_data)
        
        # Calcular estadístico KS
        empirical_cdf = np.arange(1, n + 1) / n
        theoretical_cdf_values = [theoretical_cdf(x) for x in sorted_data]
        
        # Calcular diferencias máximas
        max_diff = np.max(np.abs(empirical_cdf - theoretical_cdf_values))
        
        # Valor crítico (α = 0.05)
        critical_value = 1.36 / np.sqrt(n)
        
        # Calcular p-valor
        p_value = ProbabilityUtils.calculate_ks_pvalue(max_diff, n)
        
        return TestResult(
            test_statistic=max_diff,
            critical_value=critical_value,
            p_value=p_value,
            reject_null=max_diff > critical_value,
            interpretation="Los datos no siguen la distribución teórica" if max_diff > critical_value 
                         else "Los datos son consistentes con la distribución teórica"
        )

    @staticmethod
    def calculate_ks_pvalue(test_stat: float, n: int) -> float:
        """Aproximación del p-valor para Kolmogorov-Smirnov"""
        lambda_ = test_stat * np.sqrt(n)
        return 2 * np.exp(-2 * lambda_ * lambda_)

    @staticmethod
    def find_best_distribution(data: List[float]) -> Dict:
        """Determina la mejor distribución para un conjunto de datos"""
        stats_summary = {
            'mean': np.mean(data),
            'std': np.std(data, ddof=1),
            'variance': np.var(data, ddof=1)
        }

        # Test para distribución normal
        normal_test = ProbabilityUtils.goodness_of_fit(
            data,
            lambda x: ProbabilityUtils.normal_cdf(x, stats_summary['mean'], stats_summary['std'])
        )

        # Test para distribución Poisson (si datos son enteros no negativos)
        is_integer_data = all(isinstance(x, (int, np.integer)) and x >= 0 for x in data)
        poisson_test = None
        if is_integer_data:
            poisson_test = ProbabilityUtils.goodness_of_fit(
                data,
                lambda x: ProbabilityUtils.poisson_cdf(int(x), stats_summary['mean'])
            )

        results = {
            'normal': {
                'parameters': {'mu': stats_summary['mean'], 'sigma': stats_summary['std']},
                'goodness_of_fit': normal_test,
                'score': 1 - normal_test.test_statistic
            }
        }

        if poisson_test:
            results['poisson'] = {
                'parameters': {'lambda': stats_summary['mean']},
                'goodness_of_fit': poisson_test,
                'score': 1 - poisson_test.test_statistic
            }

        # Determinar la mejor distribución
        best_dist = max(results.items(), key=lambda x: x[1]['score'])

        return {
            'best_distribution': best_dist[0],
            'all_results': results,
            'recommendation': f"La distribución {best_dist[0]} es la que mejor se ajusta a los datos"
        }

    @staticmethod
    def calculate_confidence_intervals(data: List[float], confidence_level: float = 0.95) -> Dict:
        """Calcula intervalos de confianza para diferentes distribuciones"""
        z_scores = {
            0.80: 1.28,
            0.90: 1.645,
            0.95: 1.96,
            0.99: 2.576
        }

        z_score = z_scores.get(confidence_level, 1.96)
        mean = np.mean(data)
        std = np.std(data, ddof=1)
        n = len(data)

        # Intervalo de confianza para la media
        margin_error = z_score * (std / np.sqrt(n))
        ci_lower = mean - margin_error
        ci_upper = mean + margin_error

        # Intervalo de predicción
        pred_margin = z_score * std * np.sqrt(1 + 1/n)
        pred_lower = mean - pred_margin
        pred_upper = mean + pred_margin

        return {
            'confidence_interval': {
                'lower': ci_lower,
                'upper': ci_upper,
                'level': confidence_level,
                'interpretation': f"{confidence_level*100}% de confianza de que la media poblacional está entre {ci_lower:.2f} y {ci_upper:.2f}"
            },
            'prediction_interval': {
                'lower': pred_lower,
                'upper': pred_upper,
                'level': confidence_level,
                'interpretation': f"Un nuevo valor tendrá {confidence_level*100}% de probabilidad de estar entre {pred_lower:.2f} y {pred_upper:.2f}"
            }
        }
