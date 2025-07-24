# Guía de integración de API Analytics para Frontend React

## Introducción

Esta guía describe cómo integrar el dashboard de análisis estadístico con tu aplicación frontend en React. La API proporciona endpoints para obtener datos de analítica en formatos preparados para ser visualizados con librerías como Chart.js, Recharts, o cualquier otra librería de gráficos compatible con React.

## Endpoint principal

```
GET /api/v1/analytics/dashboard
```

### Parámetros de consulta

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| period | string | Sí | Período de tiempo para el análisis. Valores posibles: "today", "week", "month", "year" |

### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:3002/api/v1/analytics/dashboard?period=month')
  .then(response => response.json())
  .then(data => {
    // Procesar los datos
    console.log(data);
  });

// Usando axios
import axios from 'axios';

axios.get('http://localhost:3002/api/v1/analytics/dashboard', {
  params: { period: 'month' }
})
.then(response => {
  // Procesar los datos
  console.log(response.data);
})
.catch(error => {
  console.error('Error fetching dashboard data:', error);
});
```

## Estructura de respuesta

La API devuelve una respuesta JSON con la siguiente estructura:

```javascript
{
  "salesSummary": {
    "totalRevenue": 125000,       // Ingresos totales en el período
    "totalSales": 2500,           // Número total de ventas
    "averageOrderValue": 50,      // Valor promedio de orden
    "growthPercentage": 15        // % de crecimiento respecto al período anterior
  },
  "visualization": {              // Datos estructurados para gráficos
    "charts": {
      "barChart": {               // Datos para gráfico de barras
        "labels": ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
        "datasets": [
          {
            "name": "Ventas semanales",
            "data": [28500, 30200, 32500, 33800],
            "color": "#4e73df"
          }
        ],
        "options": {
          "xAxisTitle": "Semana del mes",
          "yAxisTitle": "Pesos (MXN)"
        }
      },
      "lineChart": {              // Datos para gráfico de líneas
        "labels": ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
        "datasets": [
          {
            "name": "Este mes",
            "data": [28500, 30200, 32500, 33800],
            "color": "#36b9cc"
          },
          {
            "name": "Mes anterior",
            "data": [26000, 27500, 28900, 30600],
            "color": "#1cc88a"
          }
        ],
        "options": {
          "xAxisTitle": "Semana del mes",
          "yAxisTitle": "Ventas (MXN)"
        }
      },
      "pieChart": {               // Datos para gráfico circular
        "labels": ["Palomitas", "Nachos", "Refrescos", "Dulces", "Combos"],
        "datasets": [
          {
            "name": "Productos populares del mes",
            "data": [35, 25, 20, 10, 10],
            "colors": ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b"]
          }
        ]
      },
      "dispenserPieChart": {      // Datos para gráfico circular de dispensadores
        "labels": ["Dispensador 1", "Dispensador 2", "Dispensador 3"],
        "datasets": [
          {
            "name": "Uso mensual de dispensadores",
            "data": [45, 30, 25],
            "colors": ["#4e73df", "#1cc88a", "#36b9cc"]
          }
        ]
      }
    }
  },
  "recommendations": [            // Recomendaciones basadas en los datos
    {
      "type": "opportunity",      // Tipos: opportunity, warning, prediction
      "message": "Las ventas de combos han aumentado un 15% - considera crear más opciones de combos"
    },
    {
      "type": "warning",
      "message": "El dispensador 2 muestra baja actividad - verifica su funcionamiento"
    },
    {
      "type": "prediction",
      "message": "Se espera un aumento del 20% en ventas el próximo fin de semana basado en tendencias históricas"
    }
  ],
  "statistics": {                 // Estadísticas descriptivas detalladas
    "centralTendency": {
      "mean": 50,
      "median": 48,
      "mode": 45
    },
    "dispersion": {
      "standardDeviation": 15.2,
      "variance": 231.04,
      "range": 75,
      "coefficientOfVariation": 30.4
    },
    "shape": {
      "skewness": 0.8,
      "skewnessInterpretation": "Sesgada hacia la derecha (cola derecha)",
      "kurtosis": 1.2,
      "kurtosisInterpretation": "Leptocúrtica (más puntiaguda que normal)"
    },
    "percentiles": {
      "25": 35,
      "50": 48,
      "75": 62,
      "90": 78,
      "95": 85,
      "99": 95
    },
    "basic": {
      "count": 2500,
      "sum": 125000,
      "min": 20,
      "max": 95
    }
  }
}
```

## Implementación en React con Recharts

### Instalación de dependencias

```bash
npm install recharts
# o con yarn
yarn add recharts
```

### Ejemplo de componente de Dashboard

```jsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import axios from 'axios';

// Componente principal de Dashboard
function AnalyticsDashboard() {
  // Estados para almacenar datos y período actual
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState('month');

  // Función para cargar datos desde la API
  const loadDashboardData = async (period) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3002/api/v1/analytics/dashboard', {
        params: { period }
      });
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar los datos del dashboard. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos cuando cambie el período
  useEffect(() => {
    loadDashboardData(currentPeriod);
  }, [currentPeriod]);

  // Manejar cambio de período
  const handlePeriodChange = (period) => {
    setCurrentPeriod(period);
  };

  // Mostrar estado de carga
  if (loading) {
    return <div className="loading">Cargando datos...</div>;
  }

  // Mostrar mensaje de error si hay algún problema
  if (error) {
    return <div className="error">{error}</div>;
  }

  // Si no hay datos, mostrar mensaje
  if (!dashboardData) {
    return <div className="no-data">No hay datos disponibles</div>;
  }

  // Preparar datos para Recharts
  const prepareDataForRecharts = () => {
    const { visualization, salesSummary, recommendations, statistics } = dashboardData;
    
    // Convertir datos para gráfico de barras
    const barChartData = visualization.charts.barChart.labels.map((label, index) => ({
      name: label,
      value: visualization.charts.barChart.datasets[0].data[index]
    }));

    // Convertir datos para gráfico de líneas
    const lineChartData = visualization.charts.lineChart.labels.map((label, index) => {
      const dataPoint = {
        name: label
      };
      visualization.charts.lineChart.datasets.forEach(dataset => {
        dataPoint[dataset.name] = dataset.data[index];
      });
      return dataPoint;
    });

    // Convertir datos para gráfico circular
    const pieChartData = visualization.charts.pieChart.labels.map((label, index) => ({
      name: label,
      value: visualization.charts.pieChart.datasets[0].data[index]
    }));

    // Convertir datos para gráfico circular de dispensadores
    const dispenserChartData = visualization.charts.dispenserPieChart.labels.map((label, index) => ({
      name: label,
      value: visualization.charts.dispenserPieChart.datasets[0].data[index]
    }));

    return {
      barChartData,
      lineChartData,
      pieChartData,
      dispenserChartData,
      salesSummary,
      recommendations,
      statistics
    };
  };

  const {
    barChartData,
    lineChartData,
    pieChartData,
    dispenserChartData,
    salesSummary,
    recommendations,
    statistics
  } = prepareDataForRecharts();

  // Colores para gráficos
  const COLORS = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'];

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Analytics</h1>
        <div className="period-selector">
          <button
            onClick={() => handlePeriodChange('today')}
            className={currentPeriod === 'today' ? 'active' : ''}
          >
            Hoy
          </button>
          <button
            onClick={() => handlePeriodChange('week')}
            className={currentPeriod === 'week' ? 'active' : ''}
          >
            Semana
          </button>
          <button
            onClick={() => handlePeriodChange('month')}
            className={currentPeriod === 'month' ? 'active' : ''}
          >
            Mes
          </button>
          <button
            onClick={() => handlePeriodChange('year')}
            className={currentPeriod === 'year' ? 'active' : ''}
          >
            Año
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-cards">
        <div className="kpi-card">
          <h3>Ingresos Totales</h3>
          <p className="kpi-value">
            {new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN'
            }).format(salesSummary.totalRevenue)}
          </p>
        </div>
        <div className="kpi-card">
          <h3>Órdenes</h3>
          <p className="kpi-value">{salesSummary.totalSales}</p>
        </div>
        <div className="kpi-card">
          <h3>Valor Promedio</h3>
          <p className="kpi-value">
            {new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN'
            }).format(salesSummary.averageOrderValue)}
          </p>
        </div>
        <div className="kpi-card">
          <h3>Crecimiento</h3>
          <p className={`kpi-value ${salesSummary.growthPercentage > 0 ? 'positive' : 'negative'}`}>
            {salesSummary.growthPercentage}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-container">
        {/* Bar Chart */}
        <div className="chart-box">
          <h2>Ingresos por Período</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Ventas']} />
              <Legend />
              <Bar dataKey="value" fill="#4e73df" name="Ventas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="chart-box">
          <h2>Tendencia de Ventas</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(lineChartData[0] || {}).filter(key => key !== 'name').map((key, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[index % COLORS.length]}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Charts */}
        <div className="charts-row">
          <div className="chart-box">
            <h2>Productos Populares</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-box">
            <h2>Uso de Dispensadores</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dispenserChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {dispenserChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommendations */}
        <div className="chart-box recommendations">
          <h2>Insights y Recomendaciones</h2>
          <div className="recommendations-container">
            {recommendations && recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <div key={index} className={`recommendation ${rec.type}`}>
                  <p>{rec.message}</p>
                </div>
              ))
            ) : (
              <p>No hay recomendaciones disponibles para este período.</p>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="chart-box statistics">
          <h2>Estadísticas Detalladas</h2>
          <div className="statistics-grid">
            <div className="stat-section">
              <h3>Tendencia Central</h3>
              <p><strong>Media:</strong> {statistics.centralTendency.mean}</p>
              <p><strong>Mediana:</strong> {statistics.centralTendency.median}</p>
              <p><strong>Moda:</strong> {statistics.centralTendency.mode}</p>
            </div>
            <div className="stat-section">
              <h3>Dispersión</h3>
              <p><strong>Desviación Estándar:</strong> {statistics.dispersion.standardDeviation}</p>
              <p><strong>Varianza:</strong> {statistics.dispersion.variance}</p>
              <p><strong>Rango:</strong> {statistics.dispersion.range}</p>
              <p><strong>Coeficiente de Variación:</strong> {statistics.dispersion.coefficientOfVariation}%</p>
            </div>
            <div className="stat-section">
              <h3>Forma de Distribución</h3>
              <p><strong>Sesgo:</strong> {statistics.shape.skewness}</p>
              <p><strong>Interpretación:</strong> {statistics.shape.skewnessInterpretation}</p>
              <p><strong>Curtosis:</strong> {statistics.shape.kurtosis}</p>
              <p><strong>Interpretación:</strong> {statistics.shape.kurtosisInterpretation}</p>
            </div>
            <div className="stat-section">
              <h3>Información Básica</h3>
              <p><strong>Cantidad:</strong> {statistics.basic.count}</p>
              <p><strong>Suma:</strong> {statistics.basic.sum}</p>
              <p><strong>Mínimo:</strong> {statistics.basic.min}</p>
              <p><strong>Máximo:</strong> {statistics.basic.max}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
```

### Ejemplo de estilos CSS

```css
/* Dashboard.css */
.analytics-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.period-selector button {
  padding: 8px 16px;
  margin-left: 5px;
  border: 1px solid #4e73df;
  background-color: white;
  color: #4e73df;
  cursor: pointer;
  transition: all 0.3s;
}

.period-selector button.active {
  background-color: #4e73df;
  color: white;
}

.kpi-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.kpi-card {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}

.kpi-value {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0 0;
}

.kpi-value.positive {
  color: #1cc88a;
}

.kpi-value.negative {
  color: #e74a3b;
}

.charts-container {
  display: grid;
  gap: 20px;
}

.chart-box {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.recommendations-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recommendation {
  padding: 12px;
  border-radius: 4px;
}

.recommendation.opportunity {
  background-color: #1cc88a33;
  border-left: 4px solid #1cc88a;
}

.recommendation.warning {
  background-color: #f6c23e33;
  border-left: 4px solid #f6c23e;
}

.recommendation.prediction {
  background-color: #4e73df33;
  border-left: 4px solid #4e73df;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-section h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #4e73df;
}
```

## Nota para desarrollo

Este es un ejemplo básico que puedes adaptar a tus necesidades específicas. Si estás utilizando una librería de componentes como Material-UI o Ant Design, puedes reemplazar los componentes HTML básicos con los equivalentes de esas librerías.

Para la gestión de estado más compleja, considera usar Context API, Redux o React Query para manejar los datos de la aplicación.

## Pruebas de integración

Para probar la integración entre tu frontend React y la API de analytics sin necesidad de conectarte al backend real, puedes crear un archivo de datos de ejemplo (mock) basado en la estructura de respuesta y utilizarlo durante el desarrollo:

```javascript
// mockData.js
export const mockDashboardData = {
  month: {
    salesSummary: {
      totalRevenue: 125000,
      totalSales: 2500,
      averageOrderValue: 50,
      growthPercentage: 15
    },
    // Resto de los datos para el período "month"...
  },
  // Otros períodos...
};
```

Luego, puedes modificar tu función `loadDashboardData` para usar estos datos en modo desarrollo:

```javascript
const loadDashboardData = async (period) => {
  setLoading(true);
  try {
    if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
      // Usar datos de ejemplo en desarrollo
      setTimeout(() => {
        setDashboardData(mockDashboardData[period]);
        setError(null);
        setLoading(false);
      }, 500); // Simular retraso de red
    } else {
      // Usar API real
      const response = await axios.get('http://localhost:3002/api/v1/analytics/dashboard', {
        params: { period }
      });
      setDashboardData(response.data);
      setError(null);
      setLoading(false);
    }
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    setError('Error al cargar los datos del dashboard. Por favor, inténtelo de nuevo.');
    setLoading(false);
  }
};
```

Esto te permitirá desarrollar y probar la interfaz de usuario sin depender del backend.
