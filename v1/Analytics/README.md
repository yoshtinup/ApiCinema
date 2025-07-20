# Analytics API Documentation

## Feature: Analytics/Reports Dashboard

Esta feature proporciona análisis y reportes de ventas siguiendo arquitectura hexagonal.

### Endpoints disponibles:

#### 1. Dashboard completo
```
GET /api/v1/analytics/dashboard?period=today|week|month
```
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "period": "today",
    "generatedAt": "2025-07-20T10:30:00Z",
    "salesSummary": {
      "totalRevenue": 12500,
      "totalSales": 3200,
      "averageOrderValue": 3.91,
      "growthPercentage": 12
    },
    "topProducts": [
      {
        "productId": 1,
        "productName": "Skittles",
        "totalQuantitySold": 150,
        "totalRevenue": 450,
        "salesCount": 45,
        "salesPercentage": 25.5
      }
    ],
    "salesChart": [...],
    "dispenserStats": [...],
    "userMetrics": {
      "totalUsers": 1250,
      "activeUsers": 340,
      "newUsers": 25
    }
  }
}
```

#### 2. Métricas de ventas
```
GET /api/v1/analytics/sales-metrics?period=today&startDate=2025-01-01&endDate=2025-01-31
```

#### 3. Productos más vendidos
```
GET /api/v1/analytics/top-products?period=week&limit=5
```

#### 4. Resumen de ventas
```
GET /api/v1/analytics/sales-summary?period=month
```

### Períodos soportados:
- `today`: Hoy
- `week`: Últimos 7 días
- `month`: Últimos 30 días
- `custom`: Período personalizado (requiere startDate y endDate)

### Estructura de la Feature:

```
v1/Analytics/
├── Aplicativo/
│   ├── GetSalesMetrics.js
│   ├── GetTopSellingProducts.js
│   └── GetDashboardData.js
├── Dominio/
│   ├── models/
│   │   ├── SalesMetrics.js
│   │   └── ProductSales.js
│   └── ports/
│       └── AnalyticsRepositoryPort.js
└── Infrestructura/
    ├── adapters/
    │   ├── repositories/
    │   │   └── AnalyticsRepository.js
    │   └── controllers/
    │       └── AnalyticsController.js
    └── interfaces/
        └── http/
            └── router/
                └── AnalyticsRouter.js
```

### Principios implementados:
- ✅ **Arquitectura Hexagonal**: Separación clara entre dominio, aplicación e infraestructura
- ✅ **Dependency Injection**: Inyección de dependencias en constructores
- ✅ **Single Responsibility**: Cada clase tiene una responsabilidad específica
- ✅ **Open/Closed**: Fácil extensión sin modificación
- ✅ **Interface Segregation**: Interfaces específicas y cohesivas
- ✅ **Dependency Inversion**: Dependencias hacia abstracciones

### Para el Frontend React:
```javascript
// Obtener datos del dashboard
const getDashboardData = async (period = 'today') => {
  const response = await fetch(`/api/v1/analytics/dashboard?period=${period}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.json();
};
```

### Seguridad:
- Rate limiting: 100 requests por 15 minutos
- Audit logging en todas las operaciones
- Validación de parámetros
- Manejo de errores consistente
