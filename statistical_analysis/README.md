# Módulo de Análisis Estadístico para ApiCinema

Este módulo proporciona una implementación en Python de las funcionalidades de análisis estadístico y probabilístico para ApiCinema. Incluye cálculos de distribuciones de probabilidad, pruebas de bondad de ajuste, y análisis estadístico de datos.

## 📊 Características

- Implementación de distribuciones de probabilidad:
  - Normal
  - Poisson
  - Binomial
- Cálculo de probabilidades específicas
- Pruebas de bondad de ajuste (Kolmogorov-Smirnov)
- Intervalos de confianza y predicción
- Análisis de riesgos y variabilidad
- Visualización de datos estadísticos

## 🛠 Requisitos

```bash
pip install -r requirements.txt
```

## 🚀 Uso

```python
from statistical_analysis import StatisticalAnalysis

# Crear instancia con datos
data = [100, 150, 200, 175, 225]
analysis = StatisticalAnalysis(data)

# Obtener interpretación de resultados
results = analysis.interpret_results()

# Calcular probabilidades específicas
probabilities = analysis.calculate_probabilities([100, 200])

# Obtener intervalos de confianza
intervals = analysis.get_confidence_intervals(confidence_level=0.95)
```

## 📋 Estructura del Módulo

- `probability_utils.py`: Implementación de utilidades estadísticas y distribuciones de probabilidad
- `statistical_analysis.py`: Clase principal para realizar análisis estadísticos
- `example_usage.py`: Script de ejemplo que muestra cómo usar el módulo

## 🔍 Detalles de Implementación

### Distribuciones de Probabilidad

1. **Distribución Normal**
   - PDF (Función de Densidad de Probabilidad)
   - CDF (Función de Distribución Acumulativa)
   - Cálculo de probabilidades específicas

2. **Distribución Poisson**
   - PMF (Función de Masa de Probabilidad)
   - CDF
   - Análisis de eventos discretos

3. **Distribución Binomial**
   - PMF
   - CDF
   - Análisis de eventos binarios

### Análisis Estadístico

- Estadísticas descriptivas básicas
- Pruebas de bondad de ajuste
- Intervalos de confianza
- Evaluación de riesgos
- Interpretación automática de resultados

## 📈 Visualización

El módulo incluye capacidades de visualización usando matplotlib y seaborn:
- Histogramas con curvas de densidad
- Diagramas de caja (boxplots)
- Visualización de intervalos de confianza

## 🔬 Tests Estadísticos

- Test de Kolmogorov-Smirnov para bondad de ajuste
- Cálculo de p-valores
- Evaluación de hipótesis nula

## 💡 Ejemplo de Uso Completo

Ver `example_usage.py` para un ejemplo detallado de cómo usar todas las funcionalidades del módulo.

## 📝 Notas

- Los cálculos estadísticos utilizan numpy y scipy para mayor eficiencia
- Las visualizaciones requieren matplotlib y seaborn
- Los datos deben ser numéricos y no contener valores nulos

## 🤝 Contribución

Para contribuir al módulo:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Implementa tus cambios
4. Envía un pull request
