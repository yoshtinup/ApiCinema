# 🤖 PROMPT PARA AGENTE IA - FRONTEND ANALYTICS DASHBOARD

## 📋 CONTEXTO DEL PROYECTO

Soy el desarrollador de **ApiCinema**, un sistema de dispensadores inteligentes con análisis estadístico avanzado. Necesito que me ayudes a crear una interfaz de usuario moderna y funcional para visualizar datos analíticos.

## 🎯 OBJETIVO PRINCIPAL

Crear un **dashboard de analytics** completo que consuma los datos de mi API REST y los presente de manera visual e interactiva usando tecnologías web modernas.

## 📊 ENDPOINTS DISPONIBLES (YA LISTOS)

### 1. Endpoint Principal para Dashboard
```
GET /api/v1/analytics/dashboard?period={period}
```
Donde `period` puede ser: `today`, `week`, `month`, `year` o `custom` (con parámetros adicionales startDate y endDate)

**Estructura de Respuesta:**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "generatedAt": "2025-07-24T07:00:16.824Z",
    "salesSummary": {
      "totalRevenue": "194.00",
      "totalSales": 3,
      "averageOrderValue": "64.666667",
      "growthPercentage": 0
    },
    "topProducts": [
      {
        "product_id": "[\"1\"]",
        "product_name": "[\"Coca Cola\"]",
        "sales_count": 5,
        "total_quantity_sold": 0,
        "total_revenue": 0
      },
      {
        "product_id": "[\"2\", \"3\"]",
        "product_name": "[\"Vuala\", \"Skwintles\"]",
        "sales_count": 5,
        "total_quantity_sold": 0,
        "total_revenue": 0
      }
    ],
    "salesChart": [
      {
        "period_label": "2025-07-24T06:00:00.000Z",
        "sales_count": 0,
        "revenue": 0
      }
    ],
    "dispenserStats": [
      {
        "dispenser_id": "Dispensador_001",
        "dispenser_name": "Dispensador Dispensador_001",
        "location": "Sala 1 TGZ Cinepolis Plaza Sol",
        "status": "online",
        "total_orders": 3,
        "total_revenue": "194.00",
        "unique_customers": 3
      }
    ],
    "userMetrics": {
      "totalUsers": 9,
      "activeUsers": 2,
      "newUsers": 0
    }
  },
  "message": "Dashboard data retrieved successfully"
}
```

### 2. Endpoints de Análisis Probabilístico (✨NUEVO)
```
GET /api/v1/analytics/probability?period=month&type=sales
```

Tipos de análisis disponibles:
- `sales`: Análisis de ventas e ingresos
- `products`: Análisis de productos y demanda
- `users`: Análisis de comportamiento de usuarios
- `dispensers`: Análisis de dispensadores y uso

**Estructura de Respuesta:**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "analysisType": "sales",
    "metadata": {
      "type": "Ventas",
      "unit": "pesos",
      "description": "Análisis de ingresos por período"
    },
    "generatedAt": "2025-07-24T07:30:00Z",
    "dataPoints": 30,
    
    "descriptiveStats": {
      "mean": 58.2,
      "median": 60.0,
      "standardDeviation": 20.75,
      "min": 10.0,
      "max": 100.0,
      "percentiles": {
        "25": 40.0,
        "50": 60.0,
        "75": 75.0
      }
    },
    
    "probabilityDistributions": {
      "normal": {
        "mean": 58.2,
        "standardDeviation": 20.75,
        "goodnessOfFit": 0.87
      }
    },
    
    "predictions": {
      "nextPeriod": 62.5,
      "confidence": 0.85,
      "trend": "increasing",
      "trendValue": 8.3
    },
    
    "confidenceIntervals": {
      "95%": {
        "lower": 53.15,
        "upper": 63.25,
        "mean": 58.2,
        "marginOfError": 5.05
      }
    },
    
    "trends": {
      "trend": "increasing",
      "strength": 8.5,
      "changePercent": 8.5
    },
    
    "recommendations": [
      {
        "type": "opportunity",
        "priority": "high",
        "message": "Tendencia positiva detectada. Considere aumentar inventario."
      }
    ]
  },
  "message": "Probability analysis retrieved successfully"
}
```

### 3. Otros Endpoints de Analytics
```
GET /api/v1/analytics/sales-metrics?period=month    # Métricas de ventas
GET /api/v1/analytics/top-products?period=week      # Productos más vendidos
GET /api/v1/analytics/sales-summary?period=today    # Resumen de ventas
```

## 🎨 REQUISITOS DE DISEÑO

### Tecnologías Preferidas:
- **Frontend:** React.js con hooks modernos
- **Charts:** Chart.js o D3.js para visualizaciones
- **Styling:** Tailwind CSS o Material-UI
- **Estado:** Context API o Zustand
- **HTTP Client:** Axios

### Componentes Requeridos:

#### 1. **KPI Cards Section**
```jsx
// Mostrar métricas principales en tarjetas
<KPICard title="Pedidos Totales" value={1250} trend="up" percentage={12} />
<KPICard title="Ingresos" value="$195,937" trend="up" percentage={8} />
<KPICard title="AOV" value="$156.75" trend="down" percentage={-2} />
<KPICard title="Satisfacción" value="85%" trend="stable" />
```

#### 2. **Charts Grid Layout**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <ChartContainer>
    <BarChart data={revenueData} title="Ingresos Diarios" />
  </ChartContainer>
  
  <ChartContainer>
    <LineChart data={ordersData} title="Tendencia de Pedidos" />
  </ChartContainer>
  
  <ChartContainer>
    <DoughnutChart data={categoryData} title="Por Categorías" />
  </ChartContainer>
  
  <ChartContainer>
    <AreaChart data={hourlyData} title="Actividad por Horas" />
  </ChartContainer>
</div>
```

#### 3. **Insights Panel**
```jsx
<InsightsPanel>
  <OpportunitiesSection opportunities={insights.opportunities} />
  <RisksSection risks={insights.risks} />
  <RecommendationsSection recommendations={insights.recommendations} />
</InsightsPanel>
```

#### 4. **Filters Bar**
```jsx
<FiltersBar>
  <PeriodSelector value="month" onChange={handlePeriodChange} />
  <DateRangePicker startDate={startDate} endDate={endDate} />
  <CategoryFilter categories={categories} />
  <RefreshButton onClick={handleRefresh} />
</FiltersBar>
```

## 🔧 FUNCIONALIDADES ESPECÍFICAS

### 1. **Auto-refresh en tiempo real**
```javascript
// Actualizar datos cada 5 minutos
useEffect(() => {
  const interval = setInterval(fetchDashboardData, 300000);
  return () => clearInterval(interval);
}, []);
```

### 2. **Manejo de estados de loading**
```javascript
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [data, setData] = useState(null);
```

### 3. **Responsive Design**
- Mobile-first approach
- Adaptación automática de gráficos
- Sidebar colapsable en móviles

### 4. **Interactividad**
- Click en gráficos para drill-down
- Tooltips informativos
- Exportar gráficos como imagen
- Compartir insights

## 📱 ESTRUCTURA DE COMPONENTES SUGERIDA

```
src/
├── components/
│   ├── Dashboard/
│   │   ├── DashboardLayout.jsx
│   │   ├── KPICards.jsx
│   │   ├── ChartsGrid.jsx
│   │   └── InsightsPanel.jsx
│   ├── Charts/
│   │   ├── BarChart.jsx
│   │   ├── LineChart.jsx
│   │   ├── DoughnutChart.jsx
│   │   └── AreaChart.jsx
│   ├── UI/
│   │   ├── Card.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorBoundary.jsx
│   └── Filters/
│       ├── FiltersBar.jsx
│       ├── PeriodSelector.jsx
│       └── DateRangePicker.jsx
├── hooks/
│   ├── useDashboardData.js
│   ├── useChartData.js
│   └── useFilters.js
├── services/
│   ├── api.js
│   └── chartUtils.js
└── utils/
    ├── formatters.js
    └── constants.js
```

## 🎯 CARACTERÍSTICAS ESPECÍFICAS QUE NECESITO

### 1. **Custom Hook para API**
```javascript
const useDashboardData = (filters) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData(filters)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [filters]);

  return { data, loading, error, refetch };
};
```

### 2. **Configuración de Chart.js**
```javascript
const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Chart Title' }
  },
  scales: {
    y: { beginAtZero: true }
  }
};
```

### 3. **Sistema de Alertas**
```jsx
<AlertsSection>
  {alerts.map(alert => (
    <Alert 
      key={alert.id}
      type={alert.level} 
      message={alert.message}
      action={alert.action}
    />
  ))}
</AlertsSection>
```

## 📊 PALETA DE COLORES SUGERIDA

```css
:root {
  --primary-blue: #2980b9;
  --secondary-blue: #3498db;
  --success-green: #27ae60;
  --warning-orange: #f39c12;
  --danger-red: #e74c3c;
  --light-gray: #ecf0f1;
  --dark-gray: #34495e;
}
```

## 🚀 EJEMPLO DE LLAMADA A LA API

```javascript
// services/api.js
const API_BASE_URL = 'http://localhost:3002/api/v1';

export const fetchDashboardOverview = async (period = 'month') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard/overview`, {
      params: { period }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching dashboard data: ${error.message}`);
  }
};
```

## 📋 TAREAS ESPECÍFICAS QUE QUIERO QUE IMPLEMENTES

1. **Crear el componente principal Dashboard**
2. **Implementar los 4 tipos de gráficos**
3. **Crear las tarjetas KPI con animaciones**
4. **Sistema de filtros funcional**
5. **Panel de insights con recomendaciones**
6. **Manejo de errores robusto**
7. **Loading states elegantes**
8. **Responsive design completo**
9. **Dark/Light mode toggle**
10. **Export functionality para reportes**

## ⚠️ CONSIDERACIONES IMPORTANTES

- **Base URL:** `http://localhost:3002`
- **CORS:** Ya está habilitado en el backend
- **Rate Limiting:** 10 requests/minuto por IP
- **Formatos de fecha:** YYYY-MM-DD para filtros
- **Datos de prueba:** 60+ órdenes ya insertadas (Enero-Julio 2025)
- **Usuarios de prueba:** IDs del 1-11 disponibles
- **Productos en sistema:** 5 productos (Coca Cola, Vuala, Skwintles, Hershey, Doritos)
- **Dispensador único:** "Dispensador_001" (Sala 1 TGZ Cinepolis Plaza Sol)
- **Análisis estadístico:** Disponible con intervalos de confianza y predicciones
- **Manejo de errores:** Mostrar mensajes user-friendly
- **Performance:** Memoizar componentes pesados
- **Accessibility:** Cumplir estándares WCAG

## 🎯 OUTPUT ESPERADO

Proporciona:
1. **Código completo de todos los componentes**
2. **Configuración de dependencias (package.json)**
3. **Estilos CSS/Tailwind necesarios**
4. **Documentación de cómo integrar**
5. **Ejemplos de uso de cada componente**

## 💡 EXTRAS DESEABLES

- Animaciones suaves entre estados
- Exportar dashboard como PDF
- Compartir insights por email
- Notificaciones push para alertas críticas
- Modo presentation para pantallas grandes
- Filtros avanzados con múltiples criterios
- Comparación entre períodos
- Predicciones visuales basadas en tendencias

---

**¿Puedes ayudarme a crear este dashboard completo siguiendo estos requerimientos?** Necesito que sea profesional, moderno y completamente funcional con mi API ya implementada.
