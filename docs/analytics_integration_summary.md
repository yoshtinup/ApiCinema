# Resumen Ejecutivo: Integración API Analytics para Frontend React

## 🚀 Pasos clave para la integración

1. **Consultar el endpoint principal:**
   ```
   GET /api/v1/analytics/dashboard?period=[today|week|month|year]
   ```

2. **Estructura de datos:**
   - `salesSummary`: KPIs principales (ingresos, ventas, etc.)
   - `visualization.charts`: Datos pre-formateados para gráficos
   - `recommendations`: Insights y sugerencias basadas en datos
   - `statistics`: Métricas estadísticas detalladas

3. **Componentes React recomendados:**
   - Contenedor principal para Dashboard
   - Selector de período (hoy, semana, mes, año)
   - Tarjetas de KPIs para métricas principales
   - Componentes de gráficos (usando Recharts, Chart.js o similar)
   - Sección de recomendaciones/insights

## 📊 Guía rápida de implementación

### 1. Instalar dependencias

```bash
npm install recharts axios
# o
yarn add recharts axios
```

### 2. Crear hook para datos de analytics

```jsx
// useAnalyticsData.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useAnalyticsData = (baseUrl) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month');

  const fetchData = async (selectedPeriod) => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/analytics/dashboard`, {
        params: { period: selectedPeriod }
      });
      setData(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(period);
  }, [period, baseUrl]);

  return { data, loading, error, period, setPeriod, refetch: () => fetchData(period) };
};
```

### 3. Implementar componente principal

```jsx
// AnalyticsDashboard.jsx
import React from 'react';
import { useAnalyticsData } from './useAnalyticsData';
import SalesSummary from './components/SalesSummary';
import PeriodSelector from './components/PeriodSelector';
import BarChartComponent from './components/BarChartComponent';
import LineChartComponent from './components/LineChartComponent';
import PieChartComponent from './components/PieChartComponent';
import Recommendations from './components/Recommendations';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const { data, loading, error, period, setPeriod } = useAnalyticsData('http://localhost:3002/api/v1');

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!data) return <div className="no-data">No hay datos disponibles</div>;

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Analytics</h1>
        <PeriodSelector period={period} onChangePeriod={setPeriod} />
      </div>

      <SalesSummary data={data.salesSummary} />

      <div className="charts-container">
        <div className="chart-box">
          <h2>Ingresos por Período</h2>
          <BarChartComponent data={data.visualization.charts.barChart} />
        </div>

        <div className="charts-row">
          <div className="chart-box">
            <h2>Tendencia de Ventas</h2>
            <LineChartComponent data={data.visualization.charts.lineChart} />
          </div>
          <div className="chart-box">
            <h2>Productos Populares</h2>
            <PieChartComponent data={data.visualization.charts.pieChart} />
          </div>
        </div>

        <div className="chart-box">
          <h2>Uso de Dispensadores</h2>
          <PieChartComponent data={data.visualization.charts.dispenserPieChart} />
        </div>

        <Recommendations recommendations={data.recommendations} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
```

## 🧪 Pruebas y desarrollo

### Usar datos de prueba durante desarrollo

1. Crea un archivo con datos mock siguiendo el esquema proporcionado
2. Añade una variable de entorno: `REACT_APP_USE_MOCK_DATA=true`
3. Modifica el hook para usar los datos mock cuando la variable está activada

### Resolución de problemas comunes

- **Problema**: No aparecen los gráficos
  **Solución**: Verifica la estructura de datos recibida de la API y compárala con el esquema esperado

- **Problema**: Los datos no se actualizan al cambiar el período
  **Solución**: Asegúrate de que el parámetro de período se está enviando correctamente a la API

- **Problema**: Error de CORS al conectar con la API
  **Solución**: Configura los headers CORS en el servidor backend o usa un proxy en desarrollo

## 📋 Recursos adicionales

- [Documentación completa de la API](./frontend_integration_guide.md)
- [Esquema JSON de la API](./analytics_api_schema.json)
- [Ejemplos de datos de prueba](../public/sample-dashboard-data.js)

## 🔍 Contacto y soporte

Para cualquier duda sobre la integración, contacta al equipo de backend en [correo@ejemplo.com]
