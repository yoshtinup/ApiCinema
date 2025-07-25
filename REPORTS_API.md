# 📊 API de Reportes - Productos Más Vendidos

## 🎯 Endpoints Disponibles

### 1. Productos Más Vendidos
```
GET /api/v1/reports/best-selling-products
```

**Parámetros de consulta:**
- `limit` (opcional): Número máximo de productos (1-100, default: 10)
- `period` (opcional): Período de tiempo (week, month, year, all, default: all)

**Ejemplo de uso:**
```bash
# Top 5 productos más vendidos de todos los tiempos
curl "https://apiempresacinesnack.acstree.xyz/api/v1/reports/best-selling-products?limit=5&period=all"

# Top 10 productos más vendidos del último mes
curl "https://apiempresacinesnack.acstree.xyz/api/v1/reports/best-selling-products?limit=10&period=month"
```

**Respuesta de ejemplo:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "product_id": 2,
        "product_name": "Vuala",
        "order_count": 8,
        "total_quantity": 12,
        "total_revenue": 120.00,
        "average_price": 10.00,
        "first_sale": "2025-01-03T09:15:00.000Z",
        "last_sale": "2025-07-22T18:52:45.000Z",
        "quantity_percentage": "23.08",
        "revenue_percentage": "21.43"
      },
      {
        "product_id": 3,
        "product_name": "Skwintles",
        "order_count": 6,
        "total_quantity": 8,
        "total_revenue": 120.00,
        "average_price": 15.00,
        "first_sale": "2025-01-08T16:20:00.000Z",
        "last_sale": "2025-01-22T09:30:00.000Z",
        "quantity_percentage": "15.38",
        "revenue_percentage": "21.43"
      }
    ],
    "summary": {
      "total_products_analyzed": 2,
      "total_quantity_sold": 52,
      "total_revenue": 560.00,
      "period": "all",
      "generated_at": "2025-07-25T06:30:00.000Z"
    }
  },
  "message": "Productos más vendidos obtenidos exitosamente"
}
```

### 2. Resumen Ejecutivo de Ventas
```
GET /api/v1/reports/sales-summary
```

**Parámetros de consulta:**
- `period` (opcional): Período de tiempo (week, month, year, all, default: month)

**Ejemplo de uso:**
```bash
# Resumen de ventas del último mes
curl "https://apiempresacinesnack.acstree.xyz/api/v1/reports/sales-summary?period=month"
```

**Respuesta de ejemplo:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "period": "month",
      "total_products_sold": 52,
      "total_revenue": 560.00,
      "top_product": {
        "product_id": 2,
        "product_name": "Vuala",
        "total_quantity": 12
      },
      "product_diversity": 5,
      "average_order_value": 35.00,
      "generated_at": "2025-07-25T06:30:00.000Z"
    },
    "top_products": [...]
  },
  "message": "Resumen de ventas obtenido exitosamente"
}
```

## 🔍 Cómo Funciona

El sistema analiza el campo JSON `items` de tu tabla `orders` que contiene estructura como:
```json
[
  {
    "name": "Vuala",
    "price": "10",
    "quantity": 1,
    "subtotal": 10,
    "product_id": "2",
    "no_apartado": 3
  }
]
```

### Análisis Realizado:
- **Extrae productos** del campo JSON de cada orden
- **Filtra órdenes** pagadas/dispensadas únicamente
- **Agrupa por producto** y calcula estadísticas
- **Ordena por cantidad** vendida y ingresos
- **Calcula porcentajes** de participación

### Métricas Incluidas:
- `order_count`: Número de órdenes que incluyen el producto
- `total_quantity`: Cantidad total vendida
- `total_revenue`: Ingresos totales generados
- `average_price`: Precio promedio de venta
- `quantity_percentage`: % del total de productos vendidos
- `revenue_percentage`: % del total de ingresos

## 🚀 Casos de Uso

### Para Dashboards:
```javascript
// Obtener datos para gráfico de productos más vendidos
fetch('/api/v1/reports/best-selling-products?limit=5&period=month')
  .then(res => res.json())
  .then(data => {
    // Usar data.products para crear gráficos
    const labels = data.products.map(p => p.product_name);
    const quantities = data.products.map(p => p.total_quantity);
  });
```

### Para Reportes Ejecutivos:
```javascript
// Obtener resumen para reportes gerenciales
fetch('/api/v1/reports/sales-summary?period=month')
  .then(res => res.json())
  .then(data => {
    console.log(`Producto estrella: ${data.summary.top_product.product_name}`);
    console.log(`Ingresos totales: $${data.summary.total_revenue}`);
  });
```

## 📈 Períodos Disponibles
- `week`: Últimos 7 días
- `month`: Último mes
- `year`: Último año  
- `all`: Todos los registros históricos

## ⚡ Rendimiento
- Optimizado con índices en `created_at` y `status`
- Usa `JSON_TABLE` para análisis eficiente del campo items
- Limita resultados para respuestas rápidas
