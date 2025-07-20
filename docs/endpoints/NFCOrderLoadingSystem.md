# 🎯 Sistema de Carga de Órdenes al NFC

## 📋 Descripción del Flujo

Este sistema permite que el usuario **seleccione una orden específica en la web** y la **"cargue" a su NFC** para que cuando escanee posteriormente en cualquier dispensador, se dispense automáticamente esa orden que eligió.

## 🔄 Flujo Completo de Uso

### 1. **Usuario selecciona orden en la web**
```
👤 Usuario ve lista de órdenes pendientes
📱 Selecciona orden específica: "ORD-001"
🎯 Orden se carga al NFC: "ABC123"
✅ Confirmación: "Orden cargada exitosamente"
```

### 2. **Usuario escanea NFC en dispensador**
```
🏪 Usuario va al dispensador físico
📡 Escanea su NFC: "ABC123"
🤖 Sistema detecta orden cargada: "ORD-001"
🎁 Dispensador entrega automáticamente la orden
```

### 3. **Orden por defecto (si no seleccionó)**
```
📡 Usuario escanea NFC sin haber seleccionado orden
🔍 Sistema busca órdenes pendientes
📅 Toma la más antigua automáticamente
🎁 Dispensador entrega la orden por defecto
```

## 🆕 Nuevos Endpoints

### 1. Cargar Orden al NFC
```
POST /api/v1/pago/select/:orderId/nfc/:nfc
```
**Función**: Carga una orden específica al NFC del usuario
**Resultado**: La orden queda "preparada" para dispensar al escanear

### 2. Ver Orden Cargada
```
GET /api/v1/pago/nfc/:nfc/ready
```
**Función**: Muestra qué orden está cargada en el NFC
**Resultado**: Orden seleccionada o orden por defecto

### 3. Dispensar Orden
```
POST /api/v1/pago/nfc/:nfc/dispense
```
**Función**: Dispensa la orden cargada cuando se escanea el NFC
**Resultado**: Orden marcada como 'dispensed' y NFC liberado

## 🎮 Ejemplos de Uso

### Ejemplo 1: Usuario Selecciona Orden Específica

```javascript
// 1. Usuario ve sus órdenes pendientes
const orders = await orderManager.getPendingOrders('ABC123');
// Resultado: [ORD-001, ORD-002, ORD-003]

// 2. Usuario selecciona orden específica (la del medio)
await orderManager.selectOrder('ORD-002', 'ABC123');
// Resultado: ORD-002 queda cargada en NFC ABC123

// 3. Usuario escanea NFC en dispensador
const dispensed = await orderManager.dispenseOrder('ABC123', 'DISP-001');
// Resultado: Se dispensa ORD-002 (la que eligió)
```

### Ejemplo 2: Usuario No Selecciona (Orden por Defecto)

```javascript
// 1. Usuario NO selecciona ninguna orden en la web

// 2. Usuario escanea NFC directamente en dispensador
const dispensed = await orderManager.dispenseOrder('ABC123', 'DISP-001');
// Resultado: Se dispensa ORD-001 (la más antigua por defecto)
```

## 🗃️ Estructura de Base de Datos

### Nueva Tabla: `nfc_selected_orders`
```sql
CREATE TABLE nfc_selected_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nfc VARCHAR(255) NOT NULL UNIQUE,
  order_id VARCHAR(36) NOT NULL,
  selected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  dispenser_id VARCHAR(36) NULL
);
```

**Función**: Almacena qué orden está "cargada" en cada NFC

## 🎯 Estados del Sistema

### Estado 1: Sin Orden Cargada
```
NFC: ABC123
Tabla nfc_selected_orders: (vacía para ABC123)
Al escanear: Se toma orden más antigua por defecto
```

### Estado 2: Con Orden Cargada
```
NFC: ABC123
Tabla nfc_selected_orders: ABC123 -> ORD-002
Al escanear: Se dispensa ORD-002 específicamente
```

### Estado 3: Después de Dispensar
```
NFC: ABC123
Tabla nfc_selected_orders: (se limpia ABC123)
Al escanear: Vuelve a orden por defecto
```

## 🎨 Interfaz de Usuario

### Lista de Órdenes
- ✅ **Botón "🔄 Cargar al NFC"** - Carga orden específica
- 📋 **Badge de Prioridad** - Muestra orden de antigüedad
- 💰 **Detalles de Orden** - Total, items, fecha

### Confirmación de Carga
- 🎯 **"¡Orden Cargada al NFC!"**
- 📱 **Instrucciones claras** - Cómo escanear en dispensador
- 🤖 **Simulador de Dispensado** - Para probar el flujo

### Estados Visuales
- ✅ **"Cargada en NFC"** - Orden seleccionada
- ❌ **"Otra orden cargada"** - Otras órdenes deshabilitadas
- 🔄 **Loading states** - Durante las operaciones

## 🧪 Casos de Prueba

### Caso 1: Selección Normal
```
1. Usuario tiene 3 órdenes: ORD-001, ORD-002, ORD-003
2. Selecciona ORD-002 en la web
3. Escanea NFC en dispensador
4. ✅ Se dispensa ORD-002 correctamente
```

### Caso 2: Sin Selección
```
1. Usuario tiene 3 órdenes: ORD-001, ORD-002, ORD-003
2. NO selecciona ninguna en la web
3. Escanea NFC en dispensador
4. ✅ Se dispensa ORD-001 (más antigua)
```

### Caso 3: Cambio de Selección
```
1. Usuario selecciona ORD-002
2. Cambia de opinión y selecciona ORD-003
3. Escanea NFC en dispensador
4. ✅ Se dispensa ORD-003 (última selección)
```

## 🔒 Validaciones de Seguridad

### Frontend
- ✅ Solo se permite seleccionar órdenes propias
- ✅ Solo órdenes con estado 'paid'
- ✅ Confirmaciones antes de cargar

### Backend
- ✅ Validación de propiedad (NFC vs Usuario)
- ✅ Validación de estado de orden
- ✅ Limpieza automática después de dispensar
- ✅ Un NFC solo puede tener una orden cargada

## 🚀 Ventajas del Sistema

### Para el Usuario
- 🎯 **Control total** - Elige exactamente qué orden quiere
- ⏰ **Conveniencia** - Selecciona con calma en casa
- 🚀 **Rapidez** - Solo escanea NFC en dispensador
- 🔄 **Flexibilidad** - Puede cambiar selección antes de escanear

### Para el Negocio
- 📊 **Mejor experiencia** - Usuario satisfecho con su elección
- ⚡ **Procesos más rápidos** - Menos tiempo en dispensador
- 📈 **Datos valiosos** - Analytics de preferencias de selección
- 🔧 **Mantenimiento simple** - Sistema automático de limpieza

## 📱 Demo Completa

Puedes probar todo el flujo en:
```
http://localhost:3000/orderPriorityDemo.html
```

**Flujo de prueba recomendado:**
1. Ingresa NFC: `ABC123`
2. Ve lista de órdenes pendientes
3. Selecciona una orden específica
4. Confirma que se cargó al NFC
5. Simula el dispensado
6. Ve cómo se libera el NFC

¡El sistema ahora funciona exactamente como querías! 🎉
