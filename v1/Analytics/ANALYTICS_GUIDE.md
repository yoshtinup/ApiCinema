# 📊 Guía Completa de Analytics y Probabilidades

## 🎯 **Endpoints Disponibles**

### 1. **Dashboard General por Períodos**
```bash
# Hoy
GET /api/v1/analytics/dashboard?period=today

# Semana 
GET /api/v1/analytics/dashboard?period=week

# Mes
GET /api/v1/analytics/dashboard?period=month

# Año
GET /api/v1/analytics/dashboard?period=year

# Período personalizado
GET /api/v1/analytics/dashboard?period=custom&startDate=2025-01-01&endDate=2025-07-24
```

### 2. **Análisis de Probabilidades y Distribuciones** ✨ **NUEVO**
```bash
# Análisis de ventas
GET /api/v1/analytics/probability?period=month&type=sales

# Análisis de productos
GET /api/v1/analytics/probability?period=week&type=products

# Análisis de usuarios
GET /api/v1/analytics/probability?period=year&type=users

# Análisis de dispensadores
GET /api/v1/analytics/probability?period=month&type=dispensers
```

### 3. **Métricas Específicas**
```bash
# Solo métricas de ventas
GET /api/v1/analytics/sales-metrics?period=month

# Solo productos más vendidos
GET /api/v1/analytics/top-products?period=week&limit=10

# Resumen de ventas
GET /api/v1/analytics/sales-summary?period=today
```

## 🔮 **Análisis de Probabilidades - Detalles**

### **Tipos de Análisis Disponibles:**

#### **1. Sales (Ventas)**
- **Descripción**: Análisis probabilístico de ingresos por período
- **Datos**: Ingresos diarios/semanales/mensuales
- **Distribuciones**: Normal, Log-normal, Exponencial
- **Predicciones**: Ingresos del próximo período
- **Intervalos de Confianza**: 90%, 95%, 99%

#### **2. Products (Productos)**
- **Descripción**: Análisis de demanda por producto
- **Datos**: Cantidades vendidas por producto
- **Distribuciones**: Poisson, Normal, Binomial
- **Predicciones**: Demanda futura por producto
- **Recomendaciones**: Gestión de inventario

#### **3. Users (Usuarios)**
- **Descripción**: Análisis de comportamiento de usuarios
- **Datos**: Usuarios activos, nuevos usuarios
- **Distribuciones**: Exponencial, Normal
- **Predicciones**: Crecimiento de base de usuarios
- **Métricas**: Retención, actividad

#### **4. Dispensers (Dispensadores)**
- **Descripción**: Análisis de uso por dispensador
- **Datos**: Órdenes por dispensador
- **Distribuciones**: Poisson, Normal
- **Predicciones**: Carga de trabajo futura
- **Optimización**: Distribución de recursos

## 📈 **Respuesta del Análisis de Probabilidades**

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
  "generatedAt": "2025-07-24T07:30:00Z",
  "dataPoints": 30,
  
  "descriptiveStats": {
    "mean": 1250.50,
    "median": 1180.00,
    "mode": 1100.00,
    "standardDeviation": 320.75,
    "variance": 102880.56,
    "skewness": 0.23,
    "kurtosis": -0.45,
    "min": 650.00,
    "max": 2100.00,
    "range": 1450.00,
    "percentiles": {
      "25": 980.00,
      "50": 1180.00,
      "75": 1420.00,
      "90": 1680.00,
      "95": 1850.00
    }
  },
  
  "probabilityDistributions": {
    "normal": {
      "mean": 1250.50,
      "standardDeviation": 320.75,
      "goodnessOfFit": 0.87,
      "pValue": 0.12,
      "isSignificant": false
    },
    "logNormal": {
      "mu": 7.02,
      "sigma": 0.25,
      "goodnessOfFit": 0.92,
      "pValue": 0.45,
      "isSignificant": true
    },
    "exponential": {
      "lambda": 0.0008,
      "goodnessOfFit": 0.34,
      "pValue": 0.001,
      "isSignificant": false
    }
  },
  
  "predictions": {
    "nextPeriod": 1285.75,
    "confidence": 0.85,
    "trend": "increasing",
    "trendValue": 12.3
  },
  
  "confidenceIntervals": {
    "90%": {
      "lower": 1155.20,
      "upper": 1345.80,
      "mean": 1250.50,
      "marginOfError": 95.30
    },
    "95%": {
      "lower": 1125.85,
      "upper": 1375.15,
      "mean": 1250.50,
      "marginOfError": 124.65
    },
    "99%": {
      "lower": 1082.45,
      "upper": 1418.55,
      "mean": 1250.50,
      "marginOfError": 168.05
    }
  },
  
  "trends": {
    "trend": "increasing",
    "strength": 8.5,
    "changePercent": 8.5,
    "firstHalfAverage": 1180.20,
    "secondHalfAverage": 1280.80
  },
  
  "recommendations": [
    {
      "type": "opportunity",
      "priority": "high",
      "message": "Tendencia positiva detectada (+8.5%). Considere aumentar inventario."
    },
    {
      "type": "prediction",
      "priority": "medium",
      "message": "Predicción para próximo período: 1285.75 (confianza: 85%)"
    },
    {
      "type": "insight",
      "priority": "low",
      "message": "Los datos siguen una distribución log-normal, ideal para análisis de ingresos."
    }
  ]
}
```

## 🎛️ **Parámetros Disponibles**

### **Períodos (`period`)**
- `today` - Datos del día actual
- `week` - Últimos 7 días
- `month` - Últimos 30 días
- `year` - Último año
- `custom` - Rango personalizado (requiere `startDate` y `endDate`)

### **Tipos de Análisis (`type`)**
- `sales` - Análisis de ventas e ingresos
- `products` - Análisis de productos y demanda
- `users` - Análisis de usuarios y comportamiento
- `dispensers` - Análisis de dispensadores y uso

### **Parámetros Adicionales**
- `startDate` - Fecha inicio (formato: YYYY-MM-DD)
- `endDate` - Fecha fin (formato: YYYY-MM-DD)
- `limit` - Límite de resultados (para top products)

## 🚀 **Ejemplos de Uso**

### **Análisis Mensual de Ventas**
```bash
curl -X GET "http://localhost:3002/api/v1/analytics/probability?period=month&type=sales"
```

### **Predicción de Demanda de Productos**
```bash
curl -X GET "http://localhost:3002/api/v1/analytics/probability?period=week&type=products"
```

### **Análisis de Comportamiento de Usuarios Anual**
```bash
curl -X GET "http://localhost:3002/api/v1/analytics/probability?period=year&type=users"
```

### **Dashboard Completo por Año**
```bash
curl -X GET "http://localhost:3002/api/v1/analytics/dashboard?period=year"
```

### **Análisis de Período Personalizado**
```bash
curl -X GET "http://localhost:3002/api/v1/analytics/probability?period=custom&startDate=2025-01-01&endDate=2025-06-30&type=sales"
```

## 📊 **Interpretación de Resultados**

### **Distribuciones de Probabilidad**
- **Normal**: Datos simétricos, ideales para predicciones lineales
- **Log-Normal**: Común en datos financieros, crecimiento exponencial
- **Poisson**: Ideal para conteos (productos vendidos, usuarios activos)
- **Exponential**: Tiempos entre eventos, tasas de decay

### **Intervalos de Confianza**
- **90%**: Confianza alta para decisiones operativas
- **95%**: Estándar para reportes estadísticos
- **99%**: Máxima confianza para decisiones críticas

### **Tendencias**
- **increasing**: Crecimiento positivo
- **decreasing**: Decrecimiento
- **stable**: Sin cambios significativos

### **Recomendaciones**
- **opportunity**: Oportunidades de negocio
- **warning**: Alertas que requieren atención
- **prediction**: Predicciones y pronósticos
- **insight**: Insights estadísticos
- **info**: Información general

## 🎯 **Casos de Uso Prácticos**

1. **Gestión de Inventario**: Usar análisis de productos para predecir demanda
2. **Planificación Financiera**: Análisis de ventas para presupuestos
3. **Optimización de Recursos**: Análisis de dispensadores para distribución
4. **Marketing y Retención**: Análisis de usuarios para estrategias
5. **Predicción de Ingresos**: Intervalos de confianza para proyecciones
6. **Detección de Tendencias**: Identificar patrones y oportunidades
