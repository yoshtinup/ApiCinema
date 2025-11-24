# 🛒 Sistema de Carrito de Compras - CineSnacks

## 📋 Resumen de Cambios

Se implementó un sistema completo de carrito de compras con incremento/decremento de cantidades, similar al de Amazon/MercadoLibre.

### ✨ Características Implementadas:

1. **Campo `cantidad` en tabla carrito** - Permite múltiples unidades del mismo producto
2. **Constraint único** - Un usuario solo puede tener UNA entrada por producto
3. **Auto-incremento** - Al agregar un producto existente, incrementa la cantidad automáticamente
4. **Incrementar/Decrementar** - Botones +/- para ajustar cantidades
5. **Eliminación automática** - Si la cantidad llega a 0, se elimina el producto
6. **Carrito detallado** - Obtiene información completa del producto con JOIN
7. **Cálculo de subtotales** - Cantidad × Precio por cada producto
8. **Total del carrito** - Suma de todos los subtotales

---

## 🗄️ Cambios en Base de Datos

### Migración Ejecutada:
```bash
database/migrations/add_cantidad_to_carrito.sql
```

### Nueva Estructura de `carrito`:
```sql
CREATE TABLE carrito (
  id INT AUTO_INCREMENT PRIMARY KEY,
  iduser VARCHAR(255) NOT NULL,
  idproducto INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,  -- ✨ NUEVO CAMPO
  fecha DATE,
  hora TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- ✨ NUEVO: Evita productos duplicados por usuario
  UNIQUE KEY unique_user_product (iduser, idproducto),
  
  FOREIGN KEY (idproducto) REFERENCES productos(id)
);
```

---

## 🚀 Nuevos Endpoints API

### 1. Obtener Carrito del Usuario
```
GET /api/v1/carrito/user/:userId
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "iduser": "123",
        "idproducto": 5,
        "cantidad": 2,
        "nombre": "Palomitas",
        "precio": 45.00,
        "subtotal": "90.00",
        "stock_disponible": 100
      }
    ],
    "total": "90.00",
    "itemCount": 1,
    "totalQuantity": 2
  }
}
```

### 2. Agregar Producto al Carrito
```
POST /api/v1/carrito
```

**Body:**
```json
{
  "iduser": "123",
  "idproducto": 5,
  "cantidad": 1
}
```

**Comportamiento:**
- Si el producto NO existe → Crea nuevo registro
- Si el producto YA existe → Incrementa la cantidad

### 3. Incrementar Cantidad (+1)
```
POST /api/v1/carrito/:userId/increment/:productId
```

**Ejemplo:**
```bash
POST /api/v1/carrito/123/increment/5
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Cantidad incrementada",
  "cantidad": 3
}
```

### 4. Decrementar Cantidad (-1)
```
POST /api/v1/carrito/:userId/decrement/:productId
```

**Comportamiento:**
- Si cantidad > 1 → Decrementa en 1
- Si cantidad = 1 → Elimina el producto del carrito

**Respuesta (si se elimina):**
```json
{
  "success": true,
  "message": "Producto eliminado del carrito",
  "cantidad": 0,
  "removed": true
}
```

### 5. Actualizar Cantidad Directamente
```
PUT /api/v1/carrito/:userId/quantity/:productId
```

**Body:**
```json
{
  "cantidad": 5
}
```

**Comportamiento:**
- Si cantidad >= 1 → Actualiza la cantidad
- Si cantidad = 0 → Elimina el producto

---

## 💻 Código Frontend

### HTML del Carrito:
```html
<div class="cart-item" id="item-5">
  <img src="palomitas.jpg" alt="Palomitas">
  <div class="item-details">
    <h3>Palomitas Grandes</h3>
    <p class="price">$45.00</p>
    <p class="stock">+100 disponibles</p>
  </div>
  
  <!-- Controles de cantidad -->
  <div class="quantity-controls">
    <button onclick="decrementItem(5)" class="btn-qty">-</button>
    <span id="qty-5" class="quantity">2</span>
    <button onclick="incrementItem(5)" class="btn-qty">+</button>
  </div>
  
  <div class="subtotal">$90.00</div>
  
  <button onclick="removeItem(5)" class="btn-remove">Eliminar</button>
</div>
```

### JavaScript:
```javascript
// Incrementar cantidad
async function incrementItem(productId) {
  const userId = localStorage.getItem('userId');
  
  const response = await fetch(
    `http://localhost:3002/api/v1/carrito/${userId}/increment/${productId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }
  );

  const result = await response.json();
  
  if (result.success) {
    // Actualizar UI
    document.getElementById(`qty-${productId}`).textContent = result.cantidad;
    updateTotal();
  }
}

// Decrementar cantidad
async function decrementItem(productId) {
  const userId = localStorage.getItem('userId');
  
  const response = await fetch(
    `http://localhost:3002/api/v1/carrito/${userId}/decrement/${productId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }
  );

  const result = await response.json();
  
  if (result.success) {
    if (result.removed) {
      // Eliminar del DOM
      document.getElementById(`item-${productId}`).remove();
    } else {
      // Actualizar cantidad
      document.getElementById(`qty-${productId}`).textContent = result.cantidad;
    }
    updateTotal();
  }
}

// Cargar carrito
async function getCart(userId) {
  const response = await fetch(
    `http://localhost:3002/api/v1/carrito/user/${userId}`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }
  );

  const result = await response.json();
  
  if (result.success) {
    displayCart(result.data);
  }
}
```

---

## 🧪 Pruebas

### 1. Ejecutar Migración:
```bash
# En MySQL Workbench o terminal:
SOURCE database/migrations/add_cantidad_to_carrito.sql;
```

### 2. Ejecutar Tests:
```bash
SOURCE database/test_carrito_sistema.sql;
```

### 3. Probar en Postman/Thunder Client:

**Agregar Palomitas (2x):**
```bash
POST http://localhost:3002/api/v1/carrito
Content-Type: application/json

{
  "iduser": "1",
  "idproducto": 1,
  "cantidad": 2
}
```

**Ver Carrito:**
```bash
GET http://localhost:3002/api/v1/carrito/user/1
```

**Incrementar:**
```bash
POST http://localhost:3002/api/v1/carrito/1/increment/1
```

**Decrementar:**
```bash
POST http://localhost:3002/api/v1/carrito/1/decrement/1
```

---

## 📊 Flujo Completo

```
1. Usuario ve producto en catálogo
   ↓
2. Click en "Agregar al carrito"
   → POST /carrito (cantidad: 1)
   ↓
3. Producto aparece en carrito
   ← GET /carrito/user/:userId
   ↓
4. Usuario incrementa cantidad (botón +)
   → POST /carrito/:userId/increment/:productId
   ↓
5. Cantidad aumenta a 2, subtotal se actualiza
   ← Response: {cantidad: 2}
   ↓
6. Usuario decrementa cantidad (botón -)
   → POST /carrito/:userId/decrement/:productId
   ↓
7. Si cantidad > 1: Decrementa
   Si cantidad = 1: Elimina producto
   ← Response: {cantidad: 0, removed: true}
   ↓
8. Usuario procede al pago
   → POST /pago/complete
```

---

## 🔧 Archivos Modificados

### Backend:
1. ✅ `database/migrations/add_cantidad_to_carrito.sql` - Migración de BD
2. ✅ `v1/Carrito/Infrestructura/adapters/repositories/CarritoRepository.js` - Lógica de negocio
3. ✅ `v1/Carrito/Infrestructura/adapters/controllers/CarritoController.js` - Controladores HTTP
4. ✅ `v1/Carrito/Infrestructura/interfaces/http/router/CarritoRouter.js` - Rutas

### Frontend:
5. ✅ `FRONTEND_INTEGRATION_GUIDE.md` - Documentación completa con ejemplos

### Testing:
6. ✅ `database/test_carrito_sistema.sql` - Scripts de prueba

---

## ⚠️ Notas Importantes

1. **Ejecuta la migración ANTES de iniciar el servidor**
   ```bash
   mysql -u root -p basecine < database/migrations/add_cantidad_to_carrito.sql
   ```

2. **Si ya tienes datos en carrito**, la migración los consolidará automáticamente

3. **Constraint unique_user_product** previene duplicados a nivel de BD

4. **Stock validation**: Considera validar que `cantidad <= stock_disponible` en el frontend

5. **Precio actualizado**: El subtotal se calcula en tiempo real desde la tabla productos

---

## 🎯 Próximos Pasos Recomendados

1. ✅ Ejecutar migración
2. ✅ Reiniciar servidor (`npm run dev`)
3. ✅ Probar endpoints en Postman
4. 🔲 Implementar UI en frontend
5. 🔲 Agregar validación de stock
6. 🔲 Implementar "Guardar para después"
7. 🔲 Agregar animaciones de incremento/decremento

---

¡Sistema de carrito listo para producción! 🎉
