# 📊 API de Análisis Gaussianos - Documentación

## 🎯 Nuevas Rutas de Analytics Avanzados

Tu API ahora incluye **análisis estadísticos avanzados** usando distribuciones gaussianas **SIN modificar ninguna tabla**. Los análisis se basan en los datos existentes de la tabla `orders`.

### 🔗 Endpoints Disponibles

---

## 1. **Distribución de Valores de Órdenes** 🛒💰

```
GET /api/v1/gaussian/order-value-distribution
```

**Analiza:** Patrones de gasto de clientes usando distribución normal

**Parámetros:**
```
period: week|month|quarter|year|all (default: month)
target_value: 100 (valor objetivo en moneda local)
confidence_level: 68|95|99 (default: 95)
data_points: 20-100 (default: 50)
```

**Ejemplo de uso:**
```bash
curl "https://apiempresacinesnack.acstree.xyz/api/v1/gaussian/order-value-distribution?period=month&target_value=150&confidence_level=95"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "mean": 127.50,
    "std_deviation": 45.20,
    "sample_size": 250,
    "probability_within_target": 0.7123,
    "data_points": [
      { "value": 50.0, "probability": 0.002 },
      { "value": 75.0, "probability": 0.008 },
      { "value": 100.0, "probability": 0.025 },
      { "value": 127.5, "probability": 0.088 },
      { "value": 150.0, "probability": 0.065 },
      { "value": 175.0, "probability": 0.032 }
    ],
    "confidence_intervals": {
      "68_percent": [82.30, 172.70],
      "95_percent": [37.10, 217.90]
    },
    "insights": {
      "efficiency_score": "Excelente",
      "recommendation": "71% de las órdenes alcanzan el objetivo de $150. El negocio está funcionando muy bien.",
      "average_order_value": 127.50,
      "variability": "Media",
      "business_health": "Requiere atención"
    },
    "metadata": {
      "period_analyzed": "month",
      "target_value": 150,
      "analysis_type": "order_value_distribution"
    }
  }
}
```

---

## 2. **Distribución de Productos por Orden** 🎬🍿

```
GET /api/v1/gaussian/products-per-order-distribution
```

**Analiza:** Cuántos productos compran típicamente los clientes

**Parámetros:**
```
period: week|month|quarter|year|all (default: month)
target_quantity: 3 (cantidad objetivo de productos)
```

**Ejemplo de uso:**
```bash
curl "https://apiempresacinesnack.acstree.xyz/api/v1/gaussian/products-per-order-distribution?period=month&target_quantity=4"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "mean": 2.85,
    "std_deviation": 1.20,
    "sample_size": 180,
    "probability_within_target": 0.8341,
    "data_points": [
      { "quantity": 1, "probability": 0.123 },
      { "quantity": 2, "probability": 0.285 },
      { "quantity": 3, "probability": 0.331 },
      { "quantity": 4, "probability": 0.198 },
      { "quantity": 5, "probability": 0.063 }
    ],
    "confidence_intervals": {
      "68_percent": [2, 4],
      "95_percent": [1, 5]
    },
    "insights": {
      "efficiency_score": "Excelente",
      "recommendation": "83% de las órdenes alcanzan el objetivo de 4 productos. Los clientes están comprando bien.",
      "average_products_per_order": 2.85,
      "purchase_consistency": "Media",
      "customer_behavior": "Compras individuales"
    }
  }
}
```

---

## 3. **Resumen Ejecutivo de Analytics** 📈📊

```
GET /api/v1/gaussian/business-summary
```

**Analiza:** Múltiples métricas estadísticas en un solo endpoint

**Parámetros:**
```
period: week|month|quarter|year (default: month)
```

**Ejemplo de uso:**
```bash
curl "https://apiempresacinesnack.acstree.xyz/api/v1/gaussian/business-summary?period=month"
```

---

## 🎮 Casos de Uso para tu Negocio de Cinema

### **Caso 1: Optimización de Precios** 💡
- Usa `/order-value-distribution` para ver si el ticket promedio está por debajo del objetivo
- Ajusta precios de combos basándote en la distribución

### **Caso 2: Estrategias de Cross-Selling** 🎯
- Usa `/products-per-order-distribution` para ver si los clientes compran pocos productos
- Implementa promociones de "compra 2 y llévate 3"

### **Caso 3: Análisis de Temporadas** 📅
- Compara distribuciones entre diferentes períodos
- Identifica patrones de consumo en diferentes épocas

### **Caso 4: Metas de Ventas** 🏆
- Establece objetivos realistas basados en la distribución actual
- Calcula probabilidades de alcanzar metas específicas

---

## 📊 Interpretación de Resultados

### **Curva Gaussiana (data_points)**
- Cada punto representa una probabilidad de que ocurra ese valor
- El pico de la curva es la media (valor más común)
- La anchura indica la variabilidad de los datos

### **Intervalos de Confianza**
- **68%**: Rango donde caen 2 de cada 3 órdenes
- **95%**: Rango donde caen 19 de cada 20 órdenes

### **Insights del Negocio**
- **Efficiency Score**: Qué tan bien está funcionando tu negocio
- **Recommendation**: Sugerencias específicas para mejorar
- **Business Health**: Estado general del negocio

---

## 🚀 Próximos Pasos

1. **Prueba los endpoints** con tus datos reales
2. **Integra en tu dashboard** para visualizar las curvas
3. **Establece KPIs** basados en las distribuciones
4. **Automatiza alertas** cuando las métricas se desvíen

¿Te gustaría que agregue más análisis como distribución de horarios de compra o análisis por categorías de productos?
