from probability_utils import ProbabilityUtils
import numpy as np
from typing import List, Dict, Any

class StatisticalAnalysis:
    """
    Implementación del análisis estadístico para ApiCinema
    """
    
    def __init__(self, data: List[float]):
        self.data = data
        self.basic_stats = self._calculate_basic_stats()
        self.distribution_analysis = self._analyze_distributions()
        
    def _calculate_basic_stats(self) -> Dict[str, float]:
        """Calcula estadísticas básicas de los datos"""
        return {
            'mean': np.mean(self.data),
            'median': np.median(self.data),
            'std': np.std(self.data, ddof=1),
            'variance': np.var(self.data, ddof=1),
            'cv': np.std(self.data, ddof=1) / np.mean(self.data) if np.mean(self.data) != 0 else float('inf')
        }
    
    def _analyze_distributions(self) -> Dict[str, Any]:
        """Analiza las distribuciones de probabilidad que mejor se ajustan a los datos"""
        return ProbabilityUtils.find_best_distribution(self.data)
    
    def calculate_probabilities(self, values: List[float]) -> Dict[str, Dict[str, float]]:
        """Calcula probabilidades específicas para valores dados"""
        probabilities = {}
        
        # Probabilidades para distribución normal
        probabilities['normal'] = ProbabilityUtils.calculate_normal_probabilities(
            self.basic_stats['mean'],
            self.basic_stats['std'],
            values
        )
        
        # Probabilidades para distribución Poisson si los datos son enteros
        if all(isinstance(x, (int, np.integer)) and x >= 0 for x in self.data):
            probabilities['poisson'] = ProbabilityUtils.calculate_poisson_probabilities(
                self.basic_stats['mean'],
                [int(v) for v in values if isinstance(v, (int, float)) and v >= 0]
            )
            
        return probabilities
    
    def get_confidence_intervals(self, confidence_level: float = 0.95) -> Dict[str, Dict]:
        """Calcula intervalos de confianza"""
        return ProbabilityUtils.calculate_confidence_intervals(self.data, confidence_level)
    
    def interpret_results(self) -> Dict[str, Any]:
        """Genera interpretaciones de los resultados del análisis"""
        cv = self.basic_stats['cv']
        
        return {
            'basic_statistics': {
                'typical_value': {
                    'amount': f"{self.basic_stats['mean']:.2f}",
                    'description': f"El valor típico es {self.basic_stats['mean']:.2f}"
                },
                'variability': {
                    'level': 'Baja' if cv < 0.2 else 'Moderada' if cv < 0.5 else 'Alta',
                    'description': f"La variabilidad es {cv*100:.1f}% del valor medio"
                }
            },
            'distribution_fit': {
                'best_fit': self.distribution_analysis['best_distribution'],
                'recommendation': self.distribution_analysis['recommendation'],
                'reliability': self._assess_reliability()
            },
            'risk_assessment': self._assess_risks()
        }
    
    def _assess_reliability(self) -> Dict[str, str]:
        """Evalúa la confiabilidad del ajuste estadístico"""
        best_dist = self.distribution_analysis['best_distribution']
        gof = self.distribution_analysis['all_results'][best_dist]['goodness_of_fit']
        
        if gof.p_value > 0.1:
            reliability = 'Alta'
            description = 'Evidencia fuerte a favor del ajuste'
        elif gof.p_value > 0.05:
            reliability = 'Moderada'
            description = 'Evidencia moderada a favor del ajuste'
        elif gof.p_value > 0.01:
            reliability = 'Baja'
            description = 'Evidencia débil contra el ajuste'
        else:
            reliability = 'Muy Baja'
            description = 'Evidencia fuerte contra el ajuste'
            
        return {
            'level': reliability,
            'description': description
        }
    
    def _assess_risks(self) -> Dict[str, Any]:
        """Evalúa los riesgos basados en el análisis estadístico"""
        cv = self.basic_stats['cv']
        
        return {
            'variability_risk': {
                'level': 'Alto' if cv > 0.5 else 'Moderado' if cv > 0.3 else 'Bajo',
                'impact': 'Variaciones significativas en valores',
                'mitigation': 'Implementar sistemas de monitoreo y alertas'
            },
            'predictability': {
                'score': 'Alta' if cv < 0.3 else 'Moderada' if cv < 0.6 else 'Baja',
                'implications': ('Los valores son predecibles, facilitando la planificación'
                               if cv < 0.3 else
                               'Alta variabilidad requiere estrategias de gestión de riesgo')
            }
        }
