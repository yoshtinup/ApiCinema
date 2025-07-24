# 📊 ApiCinema - Statistical Analytics Integration

## 🚀 ENDPOINTS DISPONIBLES PARA FRONTEND

### 📈 **Dashboard Principal (LISTO PARA GRÁFICOS)**
```http
GET /api/v1/statistics/dashboard?period=month
```

**Respuesta JSON lista para gráficos:**
```json
{
  "success": true,
  "data": {
    "kpis": {
      "totalOrders": 1250,
      "averageOrderValue": 156.75,
      "totalRevenue": 195937.50,
      "growthTrend": "positive",
      "customerSatisfaction": 85,
      "conversionRate": 12.5
    },
    "charts": {
      "revenueChart": {
        "type": "bar",
        "data": [
          {"date": "2024-01-01", "revenue": 1500, "orders": 12},
          {"date": "2024-01-02", "revenue": 2300, "orders": 18}
        ],
        "title": "Ingresos Diarios"
      },
      "ordersChart": {
        "type": "line", 
        "data": [...],
        "title": "Tendencia de Pedidos"
      },
      "categoryChart": {
        "type": "doughnut",
        "data": [
          {"label": "Bebidas", "value": 45000, "percentage": 23},
          {"label": "Snacks", "value": 38000, "percentage": 19.4}
        ],
        "title": "Distribución por Categorías"
      },
      "hourlyChart": {
        "type": "area",
        "data": [...],
        "title": "Actividad por Horas del Día"
      }
    },
    "insights": {
      "opportunities": [...],
      "risks": [...],
      "recommendations": [...],
      "trends": {...}
    },
    "alerts": [...],
    "metadata": {
      "period": "month",
      "lastUpdated": "2024-12-20T10:30:00Z",
      "sampleSize": 1250
    }
  }
}
```

### 📊 **Análisis Estadístico Detallado**

#### 1. Estadísticas Descriptivas
```http
GET /api/v1/statistics/descriptive?startDate=2024-01-01&endDate=2024-01-31
```

#### 2. Distribuciones de Probabilidad
```http
GET /api/v1/statistics/probability?confidenceLevel=0.95&testValues=100,200,300
```

#### 3. Insights de Negocio Avanzados
```http
GET /api/v1/statistics/business-insights?businessContext=growth&timeHorizon=medium
```

#### 4. Dashboard Ejecutivo
```http
GET /api/v1/statistics/dashboard?period=quarter&compareWithPrevious=true
```

#### 5. Exportar Reportes
```http
POST /api/v1/statistics/export
Content-Type: application/json

{
  "format": "json",
  "sections": ["descriptive", "insights"],
  "includeCharts": true,
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }
}
```

## 🎨 **PARÁMETROS PARA FILTROS**

### Filtros de Fecha:
- `startDate`: Formato YYYY-MM-DD
- `endDate`: Formato YYYY-MM-DD
- `period`: week, month, quarter, year

### Filtros de Negocio:
- `status`: pending, paid, dispensed, cancelled
- `userId`: ID del usuario
- `categoryId`: ID de categoría
- `minAmount`, `maxAmount`: Rangos de monto
- `limit`: Límite de registros (1-10000)

### Opciones de Análisis:
- `businessContext`: growth, optimization, risk_assessment
- `timeHorizon`: short, medium, long
- `focusAreas`: trends, customers, products, operations
- `confidenceLevel`: 0.80, 0.90, 0.95, 0.99

## 📊 **TIPOS DE GRÁFICOS RECOMENDADOS**

### Para el Frontend (Chart.js, D3.js, etc.):

1. **KPIs Cards** - Tarjetas con métricas principales
2. **Bar Chart** - Ingresos por período
3. **Line Chart** - Tendencias temporales
4. **Doughnut Chart** - Distribución por categorías
5. **Area Chart** - Actividad por horas
6. **Gauge Chart** - Customer Satisfaction
7. **Heatmap** - Patrones de actividad
8. **Scatter Plot** - Correlaciones

## 🔄 **ESTADO DE INTEGRACIÓN**

✅ **COMPLETADO:**
- Módulo de análisis estadístico integrado al server.js
- Base de datos MySQL conectada
- Endpoints REST funcionales
- Endpoint `/api/v1/dashboard/overview` listo para frontend
- Validación de parámetros
- Manejo de errores
- Health checks automáticos

✅ **FUNCIONALIDADES ACTIVAS:**
- Análisis descriptivo (media, mediana, desviación estándar)
- Distribuciones de probabilidad (Normal, Poisson)
- Insights de negocio automatizados
- Segmentación de clientes RFM
- Análisis de tendencias
- Detección de oportunidades y riesgos
- Recomendaciones estratégicas

## 🚀 **CÓMO USAR DESDE FRONTEND**

### Ejemplo con Fetch API:
```javascript
// Obtener datos para dashboard
const dashboardData = await fetch('/api/v1/dashboard/overview?period=month')
  .then(res => res.json());

// Usar datos en gráficos
const revenueData = dashboardData.data.charts.revenueChart.data;
const kpis = dashboardData.data.kpis;

// Chart.js example
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: revenueData.map(d => d.date),
    datasets: [{
      label: 'Ingresos',
      data: revenueData.map(d => d.revenue),
      backgroundColor: 'rgba(54, 162, 235, 0.2)'
    }]
  }
});
```

### Ejemplo con Axios:
```javascript
// Análisis detallado
const insights = await axios.get('/api/v1/statistics/business-insights', {
  params: {
    businessContext: 'growth',
    timeHorizon: 'medium',
    focusAreas: ['trends', 'customers']
  }
});
```

## ⚠️ **NOTAS IMPORTANTES**

1. **Servidor debe estar corriendo** en puerto 3002 (o el configurado)
2. **Base de datos MySQL** debe estar conectada
3. **Datos de prueba** necesarios en tabla `orders` para análisis
4. **Rate limiting** configurado (10 requests/minuto por IP)
5. **CORS habilitado** para requests desde frontend

## 🔍 **VERIFICAR FUNCIONAMIENTO**

### Health Check:
```http
GET /api/v1/dashboard/overview
```

Si responde con datos, todo está funcionando correctamente.

### Logs del servidor:
```
✔ Server online on port 3002
✔ Conexión exitosa a la BD  
✔ 📊 Statistical Analytics Module: READY
```
