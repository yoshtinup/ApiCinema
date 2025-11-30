# 🔒 Control de Concurrencia - CineSnacks API

## ¿Qué es el Control de Concurrencia?

El control de concurrencia evita **race conditions** (condiciones de carrera) cuando múltiples usuarios intentan acceder a los mismos recursos simultáneamente.

## Problemas que Previene

### ❌ Sin Control de Concurrencia:
```
Usuario A: Lee stock = 5
Usuario B: Lee stock = 5
Usuario A: Compra 3 unidades → stock = 2
Usuario B: Compra 3 unidades → stock = 2
Resultado: ¡Se vendieron 6 unidades de 5 disponibles! 😱
```

### ✅ Con Control de Concurrencia:
```
Usuario A: Bloquea fila, lee stock = 5, compra 3 → stock = 2
Usuario B: Espera el bloqueo, lee stock = 2, compra 3 → ERROR (stock insuficiente)
Resultado: Solo se vendieron 3 unidades ✅
```

## Implementaciones en el Proyecto

### 1. 🛒 **Carrito - Evitar Duplicados**

**Archivo**: `v1/Carrito/Infrestructura/adapters/Repositories/CarritoRepository.js`

**Problema**: Dos clicks simultáneos en "Agregar al carrito" podrían crear 2 registros en lugar de 1.

**Solución**:
```javascript
async createNewProducto(producto) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 🔒 FOR UPDATE bloquea la fila
    const [existing] = await connection.query(
      "SELECT id, cantidad FROM carrito WHERE iduser = ? AND idproducto = ? FOR UPDATE",
      [producto.iduser, producto.idproducto]
    );
    
    if (existing.length > 0) {
      // Incrementar cantidad existente
      await connection.query("UPDATE carrito SET cantidad = ? WHERE id = ?", 
        [existing[0].cantidad + 1, existing[0].id]
      );
    } else {
      // Crear nuevo registro
      await connection.query("INSERT INTO carrito ...", [...]);
    }
    
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
```

**Beneficio**: Un usuario no puede agregar accidentalmente el mismo producto 2 veces por doble-click.

---

### 2. 📦 **Stock de Productos - Prevenir Sobreventa**

**Archivo**: `v1/Producto/Infrestructura/adapters/Repositories/ProductoRepository.js`

**Problema**: Dos usuarios compran el último producto simultáneamente.

**Solución**:
```javascript
async decrementStock(productId, quantity) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 🔒 FOR UPDATE bloquea la fila
    const [rows] = await connection.query(
      'SELECT cantidad FROM productos WHERE id = ? FOR UPDATE',
      [productId]
    );
    
    if (rows[0].cantidad < quantity) {
      throw new Error('Stock insuficiente');
    }
    
    // UPDATE con condición para seguridad extra
    await connection.query(
      'UPDATE productos SET cantidad = cantidad - ? WHERE id = ? AND cantidad >= ?',
      [quantity, productId, quantity]
    );
    
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
```

**Beneficio**: Imposible vender más productos de los que hay en stock.

---

### 3. 💳 **Webhook de Pagos - Descuento Atómico**

**Archivo**: `v1/Services/Infrestructura/interfaces/http/PaymentWebhook.js`

**Problema**: El webhook de MercadoPago puede enviar múltiples notificaciones del mismo pago.

**Solución**:
```javascript
// 🔒 UPDATE con condición para verificar stock disponible
const [result] = await db.query(
  'UPDATE productos SET cantidad = cantidad - ? WHERE id = ? AND cantidad >= ?',
  [item.quantity, item.product_id, item.quantity]
);

if (result.affectedRows === 0) {
  console.warn('⚠️ No se pudo descontar stock (insuficiente o duplicado)');
  // No lanzar error para permitir que el pago se complete
}
```

**Beneficio**: Si el webhook se ejecuta 2 veces, el stock solo se descuenta una vez.

---

## Técnicas Utilizadas

### 1. **Transacciones (`BEGIN/COMMIT/ROLLBACK`)**
Agrupa múltiples operaciones como una unidad atómica:
```javascript
await connection.beginTransaction();
// ... operaciones ...
await connection.commit(); // Todo o nada
```

### 2. **Bloqueos Pesimistas (`FOR UPDATE`)**
Bloquea filas hasta que termine la transacción:
```sql
SELECT * FROM productos WHERE id = 5 FOR UPDATE;
-- Nadie más puede leer/escribir esa fila hasta COMMIT
```

### 3. **Actualizaciones Condicionales**
Verifica condiciones en el mismo UPDATE:
```sql
UPDATE productos 
SET cantidad = cantidad - 3 
WHERE id = 5 AND cantidad >= 3;
-- Solo actualiza si hay suficiente stock
```

---

## Cuándo Usar Cada Técnica

| Escenario | Técnica Recomendada |
|-----------|---------------------|
| Crear/actualizar registros únicos | `FOR UPDATE` + Transacción |
| Descontar cantidades (stock, saldo) | UPDATE condicional |
| Operaciones críticas de dinero | Transacción completa |
| Lecturas sin modificación | Sin bloqueo |

---

## Testing de Concurrencia

Para probar el control de concurrencia:

```bash
# Simular 100 usuarios comprando simultáneamente
npm install -g artillery
artillery quick --count 100 --num 1 https://cinesnacksapi.chuy7x.space/api/v1/carrito
```

Verifica que:
- ✅ El stock nunca sea negativo
- ✅ No haya registros duplicados en el carrito
- ✅ Las órdenes se creen correctamente

---

## Rendimiento

**Impacto**: ~5-10ms adicionales por operación con bloqueo.

**Tradeoff**: Vale la pena para evitar inconsistencias de datos.

**Optimización**: Solo usar bloqueos en operaciones críticas (carrito, stock, pagos), no en lecturas simples.

---

## Referencias

- [MySQL Transactions](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking-reads.html)
- [Database Locking Strategies](https://www.postgresql.org/docs/current/explicit-locking.html)
- [Race Conditions Explained](https://en.wikipedia.org/wiki/Race_condition)

---

**Última actualización**: Noviembre 2025  
**Mantenido por**: Equipo CineSnacks
