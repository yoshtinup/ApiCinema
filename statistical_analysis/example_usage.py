"""
Ejemplo de uso del módulo de análisis estadístico
"""
from statistical_analysis import StatisticalAnalysis
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

def analyze_orders_data(data_file: str):
    """
    Analiza los datos de órdenes usando el módulo de análisis estadístico
    """
    # Cargar datos
    df = pd.read_csv(data_file)
    
    # Análisis de montos de pedidos
    amounts = df['amount'].values
    analysis = StatisticalAnalysis(amounts)
    
    # Obtener interpretación de resultados
    results = analysis.interpret_results()
    
    # Calcular probabilidades para valores específicos
    test_values = [100, 200, 500, 1000]
    probabilities = analysis.calculate_probabilities(test_values)
    
    # Calcular intervalos de confianza
    confidence_intervals = analysis.get_confidence_intervals(confidence_level=0.95)
    
    # Visualización
    plt.figure(figsize=(12, 6))
    
    # Histograma con curva de densidad
    sns.histplot(amounts, kde=True)
    plt.title('Distribución de Montos de Pedidos')
    plt.xlabel('Monto ($)')
    plt.ylabel('Frecuencia')
    
    # Agregar líneas verticales para intervalos de confianza
    ci = confidence_intervals['confidence_interval']
    plt.axvline(ci['lower'], color='r', linestyle='--', label=f"IC {ci['level']*100}%")
    plt.axvline(ci['upper'], color='r', linestyle='--')
    
    plt.legend()
    plt.savefig('order_amounts_distribution.png')
    plt.close()
    
    # Imprimir resultados
    print("\n=== Análisis Estadístico de Pedidos ===")
    print("\nEstadísticas Básicas:")
    print(f"- {results['basic_statistics']['typical_value']['description']}")
    print(f"- {results['basic_statistics']['variability']['description']}")
    
    print("\nAjuste de Distribución:")
    print(f"- Mejor distribución: {results['distribution_fit']['best_fit']}")
    print(f"- {results['distribution_fit']['recommendation']}")
    print(f"- Confiabilidad: {results['distribution_fit']['reliability']['level']}")
    print(f"  ({results['distribution_fit']['reliability']['description']})")
    
    print("\nEvaluación de Riesgos:")
    risks = results['risk_assessment']
    print(f"- Riesgo de variabilidad: {risks['variability_risk']['level']}")
    print(f"- Predictibilidad: {risks['predictability']['score']}")
    print(f"  {risks['predictability']['implications']}")
    
    print("\nProbabilidades Específicas:")
    for value in test_values:
        prob = probabilities['normal'][f'greater_than_{value}']
        print(f"- Probabilidad de pedido > ${value}: {prob:.1%}")
    
    print("\nIntervalos de Confianza:")
    print(f"- {confidence_intervals['confidence_interval']['interpretation']}")
    print(f"- {confidence_intervals['prediction_interval']['interpretation']}")

if __name__ == "__main__":
    # Ejemplo de uso
    data_file = 'orders_data.csv'  # Asegúrate de tener este archivo
    try:
        analyze_orders_data(data_file)
    except FileNotFoundError:
        print(f"Error: No se encontró el archivo {data_file}")
        print("Por favor, asegúrate de tener un archivo CSV con una columna 'amount'")
