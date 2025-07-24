# 📊 DATOS DE PRUEBA PARA STATISTICAL ANALYTICS

## 🎯 RESUMEN DE DATOS GENERADOS

He creado **60+ órdenes de prueba** distribuidas estratégicamente para hacer tu sistema de analytics más robusto y realista.

### 📅 **DISTRIBUCIÓN TEMPORAL**
- **Enero 2025:** 12 órdenes
- **Febrero 2025:** 12 órdenes  
- **Marzo 2025:** 6 órdenes
- **Abril 2025:** 6 órdenes
- **Mayo 2025:** 5 órdenes
- **Junio 2025:** 5 órdenes
- **Julio 2025:** 13 órdenes (hasta hoy)

### 👥 **USUARIOS ACTIVOS**
- **Todos los usuarios:** Del 1 al 11 (como solicitaste)
- **Dispensador único:** Dispensador_001
- **Patrones realistas:** Algunos usuarios compran más frecuentemente que otros

### 💰 **RANGOS DE PRECIOS**
- **Mínimo:** $10.00 (Vuala individual)
- **Máximo:** $100.00 (Coca Cola x5 o Hershey x4)
- **Promedio esperado:** ~$55-65
- **Variedad:** Órdenes de 1-5 productos

### 🛍️ **PRODUCTOS INCLUIDOS**
1. **Coca Cola** - $20 (Bebida popular)
2. **Vuala** - $10 (Snack económico)
3. **Skwintles** - $15 (Dulce medio)
4. **Hershey** - $25 (Chocolate premium)
5. **Doritos** - $18 (Snack salado)

### 📊 **ESTADOS DE ÓRDENES**
- **Dispensed:** ~95% (órdenes completadas)
- **Paid:** 1-2 órdenes (pagadas, no dispensadas)
- **Pending:** 1-2 órdenes (esperando pago)
- **Cancelled:** 1 orden (cancelada)

## 🚀 CÓMO EJECUTAR LA INSERCIÓN

### **Opción 1: Script Automático (Recomendado)**
```cmd
# Desde el directorio del proyecto
populate_orders.bat
```

### **Opción 2: MySQL Command Line**
```cmd
# Conectarse a MySQL
mysql -u root -p

# Seleccionar base de datos
USE apicinema;

# Ejecutar script
SOURCE database/seed_orders_data.sql;
```

### **Opción 3: Ejecutar archivo directamente**
```cmd
mysql -u root -p apicinema < database/seed_orders_data.sql
```

## 📈 ANÁLISIS QUE PODRÁS REALIZAR

Con estos datos, tu sistema de analytics podrá calcular:

### **Estadísticas Descriptivas**
- ✅ Media, mediana, desviación estándar
- ✅ Coeficiente de variación
- ✅ Distribuciones de probabilidad
- ✅ Intervalos de confianza

### **Análisis Temporal**
- ✅ Tendencias por día/semana/mes
- ✅ Patrones estacionales
- ✅ Horas pico de ventas
- ✅ Crecimiento período a período

### **Análisis de Usuarios**
- ✅ RFM Segmentation (Recency, Frequency, Monetary)
- ✅ Usuarios más valiosos
- ✅ Patrones de compra
- ✅ Retención de clientes

### **Análisis de Productos**
- ✅ Productos más vendidos
- ✅ Ingresos por categoría
- ✅ Análisis de márgenes
- ✅ Oportunidades de cross-selling

## 🎯 TESTING DE TU API

Una vez insertados los datos, puedes probar:

### **Dashboard Principal**
```http
GET /api/v1/statistics/dashboard?period=month
```

### **Estadísticas Detalladas**
```http
GET /api/v1/statistics/descriptive?startDate=2025-06-01&endDate=2025-07-23
```

### **Insights de Negocio**
```http
GET /api/v1/statistics/business-insights?focusAreas=trends,customers,products
```

### **Distribuciones de Probabilidad**
```http
GET /api/v1/statistics/probability?testValues=50,75,100
```

## 📊 VERIFICACIÓN POST-INSERCIÓN

El script incluye consultas automáticas para verificar:
- Total de órdenes insertadas
- Rango de fechas
- Promedio de totales
- Ingresos totales
- Usuarios únicos
- Estadísticas por mes
- Productos más vendidos

## 🔍 CONSULTAS ÚTILES PARA VERIFICAR

```sql
-- Verificar inserción
SELECT COUNT(*) FROM orders;

-- Ver distribución por mes
SELECT 
    DATE_FORMAT(created_at, '%Y-%m') as mes,
    COUNT(*) as ordenes,
    SUM(total) as ingresos
FROM orders 
GROUP BY mes;

-- Top usuarios por gasto
SELECT 
    user_id,
    COUNT(*) as ordenes,
    SUM(total) as gasto_total
FROM orders 
WHERE status = 'dispensed'
GROUP BY user_id
ORDER BY gasto_total DESC;
```

## ✅ RESULTADO ESPERADO

Después de la inserción, tendrás:
- **60+ órdenes** distribuidas en 6 meses
- **Datos realistas** para análisis estadístico
- **Variabilidad suficiente** para tendencias
- **Múltiples estados** para análisis completo
- **Base sólida** para desarrollo de frontend

¡Tu sistema de analytics ahora tendrá datos ricos para generar insights significativos!
