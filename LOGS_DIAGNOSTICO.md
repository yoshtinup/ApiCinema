# Sistema de Logs Detallados para Pagos con MercadoPago

## 📋 Cambios Implementados

### 1. **Logs Detallados en Endpoints**

#### ✅ GET /api/v1/payment/status
- Log de inicio con timestamp
- Log de parámetros recibidos (`external_reference`, `user_id`)
- Log del proceso de búsqueda en BD
- Log de resultados (orden encontrada o no)
- Log de errores con stack trace completo

#### ✅ POST /api/v1/payment/complete
- Log de inicio con timestamp
- Log del body recibido completo
- Log de validación de parámetros
- Log de ejecución del use case
- Log de resultado final
- Log de errores con stack trace completo

#### ✅ POST /webhooks/mercadopago
- Log de notificación recibida con timestamp
- Log del body completo de MercadoPago
- Log de headers importantes (x-signature, x-request-id)
- Log de tipo de notificación
- Log de respuesta enviada a MercadoPago

#### ✅ Repository: findOrderByExternalReference()
- Log de búsqueda en BD
- Log del SQL ejecutado
- Log de resultados obtenidos
- Log de orden encontrada (con detalles completos)
- Log de errores con stack trace

---

## 🗄️ Migración de Base de Datos

### ⚠️ **IMPORTANTE: Ejecutar Migración Antes de Deploy**

La tabla `orders` necesita el campo `external_reference` para el sistema de polling.

### Ejecutar Migración

```bash
# Conectar a la base de datos MySQL
mysql -u tu_usuario -p nombre_base_datos

# Ejecutar el script de migración
source database/migrations/add_external_reference_to_orders.sql

# O ejecutar directamente
ALTER TABLE orders 
ADD COLUMN external_reference VARCHAR(255) DEFAULT NULL,
ADD INDEX idx_external_reference (external_reference);
```

### Verificar Migración

```sql
DESCRIBE orders;
```

Deberías ver el nuevo campo `external_reference VARCHAR(255)`.

---

## 🚀 Deploy

```bash
# 1. PRIMERO: Ejecutar migración de BD (ver arriba)

# 2. En el servidor de producción
cd ~/ApiCinema
git pull origin master

# 3. Reiniciar PM2
pm2 restart cinesnacks-api

# 4. Ver logs en tiempo real
pm2 logs cinesnacks-api --lines 100
```

---

## 🔍 Cómo Usar los Logs para Diagnosticar

### Logs de Polling (Frontend llamando /status)

Busca en logs:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 [CHECK PAYMENT STATUS] Iniciando verificación
📋 Query params: { external_reference: 'USER_5_...', user_id: '5' }
```

Esto indica que el frontend está haciendo polling correctamente.

### Logs de Búsqueda en BD

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 [REPOSITORY] Buscando orden por external_reference
📋 external_reference: USER_5_1764398681047
📝 SQL Query: SELECT * FROM orders WHERE external_reference = ? LIMIT 1
📊 Ejecutando consulta en BD...
📊 Resultados obtenidos: 0 filas
⚠️ No se encontró ninguna orden con ese external_reference
```

Si dice "0 filas", significa que el pago aún no se ha completado (webhook no ha insertado la orden).

### Logs de Webhook de MercadoPago

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📨 [WEBHOOK] Notificación recibida de MercadoPago
🕐 Timestamp: 2025-11-29T06:44:41.000Z
📦 Body completo: { "type": "payment", "data": { "id": "123456789" } }
```

Si NO ves estos logs, significa que MercadoPago no está enviando notificaciones al servidor.

### Logs de Orden Creada

```
✅ Orden encontrada: {
  order_id: 'ORDER_1764398681047_abc123',
  user_id: '5',
  external_reference: 'USER_5_1764398681047',
  payment_status: 'approved',
  status: 'paid',
  total: '15.00',
  created_at: '2025-11-29 06:44:41'
}
```

Esto significa que el pago se completó exitosamente.

---

## 🐛 Diagnosticar Problemas Comunes

### Problema: Frontend va directo a error

**Síntoma en logs:**
```
🔍 [CHECK PAYMENT STATUS] Iniciando verificación
❌ Faltan parámetros requeridos
```

**Solución:** El frontend no está enviando `external_reference` o `user_id` en la URL.

---

### Problema: Polling infinito sin éxito

**Síntoma en logs:**
```
⚠️ No se encontró ninguna orden con ese external_reference
```
(Repetido muchas veces)

**Posibles causas:**
1. Webhook de MercadoPago no llega al servidor
2. Campo `external_reference` no existe en tabla `orders` (ejecutar migración)
3. Usuario canceló el pago en MercadoPago

**Verificar:**
```bash
# Ver si hay logs de webhook
pm2 logs cinesnacks-api | grep "WEBHOOK"

# Ver estructura de tabla
mysql -u usuario -p -e "DESCRIBE orders;" nombre_bd
```

---

### Problema: Error 500 en /status

**Síntoma en logs:**
```
❌ [REPOSITORY] Database Error: Unknown column 'external_reference'
```

**Solución:** 
```bash
# Ejecutar migración de BD (ver sección arriba)
ALTER TABLE orders ADD COLUMN external_reference VARCHAR(255);
```

---

## 📊 Monitoreo en Producción

### Ver logs en tiempo real con filtros

```bash
# Solo logs de polling
pm2 logs cinesnacks-api | grep "CHECK PAYMENT STATUS"

# Solo logs de webhook
pm2 logs cinesnacks-api | grep "WEBHOOK"

# Solo logs de errores
pm2 logs cinesnacks-api | grep "❌"

# Solo órdenes creadas
pm2 logs cinesnacks-api | grep "Orden encontrada"
```

### Verificar flujo completo de un pago

```bash
# Buscar por external_reference específico
pm2 logs cinesnacks-api | grep "USER_5_1764398681047"
```

Deberías ver:
1. ✅ Creación de preferencia
2. 📨 Webhook recibido (opcional)
3. 🔍 Polling queries
4. ✅ Orden encontrada

---

## ✅ Flujo Esperado (Logs Exitosos)

```
# 1. Usuario crea pago
📝 Creando preferencia de MercadoPago
✅ Preferencia creada (API directa): 1511044485-43f75849...

# 2. Usuario completa pago en MercadoPago
# (puede haber o no webhook aquí)

# 3. Frontend hace polling cada 2 segundos
🔍 [CHECK PAYMENT STATUS] Iniciando verificación
⚠️ No se encontró ninguna orden
⏳ Pago aún pendiente

# 4. Webhook crea orden (o frontend completa pago manualmente)
💳 [COMPLETE PAYMENT] Iniciando completación de pago
✅ Pago completado exitosamente

# 5. Siguiente polling encuentra la orden
🔍 [CHECK PAYMENT STATUS] Iniciando verificación
✅ Orden encontrada: { order_id: 'ORDER_...', status: 'paid' }
```

---

¡Listo! Ahora tienes logs ultra-detallados para diagnosticar cualquier problema. 🎉
