# Estructura de Datos para Visualizaciones

Este documento define las estructuras estándar de datos que devuelven los endpoints de analytics para su visualización en el frontend.

## Estructura General

Todos los endpoints de analytics devuelven un objeto con la siguiente estructura básica:

```json
{
  "success": true,
  "period": "month",  // 'today', 'week', 'month', 'year'
  "generatedAt": "2025-07-24T14:30:00Z",
  "data": { ... },     // Datos específicos del endpoint
  "visualization": {   // Datos preformateados para gráficos
    "charts": {
      "barChart": { ... },
      "lineChart": { ... },
      "pieChart": { ... },
      // Otros tipos de gráficos...
    }
  }
}
```

## Estructuras Específicas para Gráficos

### 1. Gráfico de Barras (`barChart`)

```json
"barChart": {
  "type": "bar",
  "labels": ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
  "datasets": [
    {
      "name": "Ingresos",
      "data": [600, 590, 450, 470],
      "color": "#36a2eb"
    },
    {
      "name": "Órdenes",
      "data": [15, 14, 10, 12],
      "color": "#9966ff"
    }
  ],
  "options": {
    "yAxisTitle": "Valor en pesos",
    "xAxisTitle": "Período"
  }
}
```

### 2. Gráfico de Líneas (`lineChart`)

```json
"lineChart": {
  "type": "line",
  "labels": ["01/Jul", "02/Jul", "03/Jul", "04/Jul", "05/Jul"],
  "datasets": [
    {
      "name": "Ingresos",
      "data": [120, 150, 180, 140, 200],
      "color": "#4bc0c0"
    }
  ],
  "options": {
    "yAxisTitle": "Valor en pesos",
    "xAxisTitle": "Fecha"
  }
}
```

### 3. Gráfico Circular (`pieChart`)

```json
"pieChart": {
  "type": "pie",
  "labels": ["Coca Cola", "Vuala", "Skwintles", "Doritos", "Hershey"],
  "datasets": [
    {
      "name": "Ventas por Producto",
      "data": [35, 25, 20, 15, 5],
      "colors": ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966ff"]
    }
  ]
}
```

### 4. Gráfico de Dispersión (`scatterChart`)

```json
"scatterChart": {
  "type": "scatter",
  "datasets": [
    {
      "name": "Distribución de Ventas",
      "data": [
        {"x": 10, "y": 20},
        {"x": 15, "y": 25},
        {"x": 20, "y": 30},
        {"x": 25, "y": 28},
        {"x": 30, "y": 22}
      ],
      "color": "#ff6384"
    }
  ],
  "options": {
    "yAxisTitle": "Valor Y",
    "xAxisTitle": "Valor X"
  }
}
```

## Ejemplos Completos por Endpoint

### Endpoint `/dashboard`

```json
{
  "success": true,
  "period": "month",
  "generatedAt": "2025-07-24T14:30:00Z",
  "salesSummary": {
    "totalRevenue": 2110,
    "totalSales": 51,
    "averageOrderValue": 41.37,
    "growthPercentage": 3.2
  },
  "topProducts": [...],
  "salesChart": [...],
  "visualization": {
    "charts": {
      "barChart": {
        "type": "bar",
        "labels": ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
        "datasets": [
          {
            "name": "Ingresos",
            "data": [600, 590, 450, 470],
            "color": "#36a2eb"
          },
          {
            "name": "Órdenes",
            "data": [15, 14, 10, 12],
            "color": "#9966ff"
          }
        ]
      },
      "lineChart": {
        "type": "line",
        "labels": ["01/Jul", "02/Jul", "03/Jul", "04/Jul", "05/Jul"],
        "datasets": [
          {
            "name": "Ingresos Diarios",
            "data": [120, 150, 180, 140, 200],
            "color": "#4bc0c0"
          }
        ]
      },
      "pieChart": {
        "type": "pie",
        "labels": ["Coca Cola", "Vuala", "Skwintles", "Doritos", "Hershey"],
        "datasets": [
          {
            "name": "Productos Populares",
            "data": [35, 25, 20, 15, 5],
            "colors": ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966ff"]
          }
        ]
      },
      "dispenserPieChart": {
        "type": "pie",
        "labels": ["Sala 1", "Sala 2", "Sala 3", "Sala 4"],
        "datasets": [
          {
            "name": "Órdenes por Dispensador",
            "data": [30, 25, 20, 25],
            "colors": ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0"]
          }
        ]
      }
    }
  }
}
```

### Endpoint `/probability`

```json
{
  "success": true,
  "period": "month",
  "analysisType": "sales",
  "metadata": {
    "type": "Ventas",
    "unit": "pesos",
    "description": "Análisis de ingresos por período"
  },
  "descriptiveStats": {...},
  "probabilityDistributions": {...},
  "visualization": {
    "charts": {
      "distributionChart": {
        "type": "line",
        "labels": ["100", "150", "200", "250", "300", "350", "400"],
        "datasets": [
          {
            "name": "Distribución Normal",
            "data": [0.001, 0.005, 0.02, 0.05, 0.02, 0.005, 0.001],
            "color": "#4bc0c0",
            "fill": true
          }
        ],
        "options": {
          "yAxisTitle": "Probabilidad",
          "xAxisTitle": "Valor en pesos"
        }
      },
      "confidenceIntervalChart": {
        "type": "bar",
        "labels": ["90%", "95%", "99%"],
        "datasets": [
          {
            "name": "Intervalo de Confianza",
            "data": [
              {"lower": 220.3, "upper": 360.7},
              {"lower": 210.5, "upper": 370.5},
              {"lower": 190.1, "upper": 390.9}
            ],
            "color": "#36a2eb"
          }
        ]
      }
    }
  }
}
```
