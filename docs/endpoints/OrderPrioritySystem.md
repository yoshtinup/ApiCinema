# Sistema de Gestión de Órdenes con Prioridades

## 📋 Descripción

Este sistema permite a los usuarios seleccionar órdenes específicas para dispensar mediante código NFC, implementando un sistema de prioridades donde se muestran solo las órdenes pagadas (estado `paid`) y pendientes de dispensar.

## 🏗️ Arquitectura Implementada

### Nuevos Casos de Uso

1. **GetPendingOrdersByNFC**: Obtiene solo órdenes con estado `paid` (listas para dispensar)
2. **SelectOrderForDispensing**: Permite seleccionar una orden específica y asignarla a un dispensador

### Endpoints Implementados

#### 1. Obtener Órdenes Pendientes por NFC
```
GET /api/v1/pago/nfc/:nfc/pending
```

**Descripción**: Devuelve solo las órdenes con estado `paid` (pagadas pero no dispensadas) para un código NFC específico.

**Parámetros**:
- `nfc` (string, requerido): Código NFC del usuario

**Respuesta Exitosa (200)**:
```json
{
  "message": "Found 2 pending order(s) for NFC: ABC123",
  "orders": [
    {
      "id": 1,
      "order_id": "ORD-001",
      "user_id": "user-123",
      "items": [
        {
          "name": "Palomitas Grandes",
          "quantity": 1,
          "price": 12.50
        }
      ],
      "total": 25.50,
      "status": "paid",
      "created_at": "2025-01-19T10:00:00.000Z",
      "dispenser_id": null
    }
  ],
  "availableForDispensing": 2
}
```

#### 2. Seleccionar Orden para Dispensar
```
POST /api/v1/pago/select/:orderId/nfc/:nfc
```

**Descripción**: Selecciona una orden específica para dispensar y opcionalmente la asigna a un dispensador.

**Parámetros**:
- `orderId` (string, requerido): ID de la orden a dispensar
- `nfc` (string, requerido): Código NFC del usuario

**Body**:
```json
{
  "dispenserId": "DISP-001"  // Opcional
}
```

**Respuesta Exitosa (200)**:
```json
{
  "message": "Order selected for dispensing successfully",
  "order": {
    "id": 1,
    "order_id": "ORD-001",
    "user_id": "user-123",
    "total": 25.50,
    "status": "paid",
    "dispenser_id": "DISP-001",
    "created_at": "2025-01-19T10:00:00.000Z"
  }
}
```

## 🎯 Sistema de Prioridades

### Criterios de Prioridad

1. **Estado de la Orden**: Solo se muestran órdenes con estado `paid`
2. **Orden Cronológico**: Las órdenes más antiguas tienen mayor prioridad (FIFO - First In, First Out)
3. **Validación de Propiedad**: Solo se pueden seleccionar órdenes que pertenezcan al usuario del NFC

### Flujo de Prioridades

1. **Escaneo NFC**: El usuario presenta su código NFC
2. **Consulta Pendientes**: Se obtienen solo las órdenes `paid` del usuario
3. **Mostrar Lista**: Se presenta una lista ordenada por antigüedad (prioridad)
4. **Selección Manual**: El usuario selecciona la orden específica que desea dispensar
5. **Asignación**: La orden se asigna al dispensador correspondiente

## 💻 Implementación Frontend

### JavaScript Client

El archivo `orderPriorityManager.js` proporciona una clase completa para gestionar las órdenes:

```javascript
// Instanciar el manager
const orderManager = new OrderPriorityManager();

// Obtener órdenes pendientes
const pendingOrders = await orderManager.getPendingOrders('ABC123');

// Seleccionar orden específica
const selectedOrder = await orderManager.selectOrderForDispensing(
  'ORD-001', 
  'ABC123', 
  'DISP-001'
);

// Renderizar interfaz completa
orderManager.renderOrderSelector('ABC123', 'container-id');
```

### Interfaz de Usuario

La interfaz incluye:

- **Lista de Órdenes**: Muestra todas las órdenes pendientes con información detallada
- **Badges de Prioridad**: Indica el orden de prioridad de cada orden
- **Detalles de Items**: Muestra los productos incluidos en cada orden
- **Botones de Selección**: Permite seleccionar orden específica
- **Confirmación**: Modal de confirmación tras seleccionar una orden

## 🧪 Demostración

Puedes probar el sistema accediendo a:
```
http://localhost:3000/orderPriorityDemo.html
```

### Códigos NFC de Prueba:

- **ABC123**: Usuario con 2 órdenes pendientes
- **XYZ789**: Usuario con 1 orden pendiente  
- **DEF456**: Usuario sin órdenes pendientes

## 🔒 Validaciones Implementadas

### Backend

1. **Validación de NFC**: Verifica que el parámetro NFC esté presente
2. **Validación de Orden**: Confirma que la orden existe y pertenece al usuario
3. **Validación de Estado**: Solo permite dispensar órdenes con estado `paid`
4. **Validación de Propiedad**: Verifica que la orden pertenezca al usuario del NFC

### Frontend

1. **Validación de Entrada**: Requiere código NFC válido
2. **Manejo de Errores**: Muestra mensajes de error apropiados
3. **Estados de Loading**: Indica cuando se están cargando datos
4. **Confirmaciones**: Solicita confirmación antes de acciones importantes

## 📊 Estados de Órdenes

| Estado | Descripción | Puede Dispensar |
|--------|-------------|-----------------|
| `pending` | Orden pendiente de pago | ❌ No |
| `paid` | Orden pagada, lista para dispensar | ✅ Sí |
| `dispensed` | Orden ya dispensada | ❌ No |
| `cancelled` | Orden cancelada | ❌ No |

## 🔄 Flujo Completo de Uso

### 1. Frontend - Escaneo NFC
```javascript
// El usuario escanea su NFC
const nfc = scanNFC(); // 'ABC123'

// Se cargan las órdenes pendientes
orderManager.renderOrderSelector(nfc, 'orders-container');
```

### 2. Backend - Consulta Pendientes
```sql
SELECT o.* 
FROM orders o 
INNER JOIN usuario u ON o.user_id = u.id 
WHERE u.nfc = 'ABC123' AND o.status = 'paid'
ORDER BY o.created_at ASC
```

### 3. Frontend - Selección Usuario
```javascript
// El usuario selecciona una orden específica
orderManager.selectOrder('ORD-001', 'ABC123');
```

### 4. Backend - Validación y Asignación
```sql
-- Validar orden y usuario
SELECT o.* FROM orders o 
INNER JOIN usuario u ON o.user_id = u.id 
WHERE o.order_id = 'ORD-001' AND u.nfc = 'ABC123'

-- Asignar a dispensador
UPDATE orders 
SET dispenser_id = 'DISP-001'
WHERE order_id = 'ORD-001' AND status = 'paid'
```

## 🧪 Testing

### Pruebas Unitarias

```bash
# Ejecutar pruebas específicas del sistema de prioridades
npm test -- --grep "GetPendingOrdersByNFC\|SelectOrderForDispensing"
```

### Casos de Prueba

1. **Usuario con múltiples órdenes pendientes**
2. **Usuario sin órdenes pendientes**
3. **Selección de orden válida**
4. **Intento de seleccionar orden de otro usuario**
5. **Intento de seleccionar orden con estado incorrecto**

## 🚀 Siguientes Pasos Sugeridos

1. **Notificaciones en Tiempo Real**: WebSockets para actualizaciones automáticas
2. **Sistema de Reservas**: Temporalmente reservar órdenes mientras el usuario decide
3. **Analytics**: Métricas sobre patrones de selección y tiempo de dispensado
4. **Integración con Hardware**: Conexión directa con dispensadores físicos
5. **Sistema de Colas**: Gestión automática de colas cuando hay múltiples usuarios

## 📝 Consideraciones de Seguridad

1. **Validación de Propiedad**: Siempre verificar que la orden pertenezca al usuario
2. **Rate Limiting**: Limitar consultas frecuentes del mismo NFC
3. **Logs de Auditoría**: Registrar todas las selecciones y dispensados
4. **Timeout de Selección**: Liberar órdenes no dispensadas después de cierto tiempo
