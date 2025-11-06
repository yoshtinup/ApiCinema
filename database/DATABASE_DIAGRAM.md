# 🗂️ Diagrama de Base de Datos - ApiCinema

## Esquema Visual de Relaciones

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     BASE DE DATOS: basecine                             │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│    roles     │
├──────────────┤
│ id (PK)      │◄────────┐
│ nombre       │         │
│ descripcion  │         │
└──────────────┘         │
                         │
                         │ FK: id_role_fk
┌──────────────┐         │
│   usuario    │─────────┘
├──────────────┤
│ id (PK)      │◄─────────────┐
│ nombre       │              │
│ apellido     │              │ FK: iduser
│ telefono     │              │
│ gmail (UK)   │         ┌────┴─────────┐
│ codigo       │         │   carrito    │
│ usuario (UK) │         ├──────────────┤
│ id_role_fk   │         │ id (PK)      │
│ nfc (UK)     │◄──┐     │ iduser (FK)  │
│ google_id    │   │     │ idproducto   │────┐
│ created_at   │   │     │ fecha        │    │
│ updated_at   │   │     │ hora         │    │
└──────────────┘   │     │ cantidad     │    │
                   │     └──────────────┘    │
                   │                         │ FK: idproducto
                   │                         │
                   │     ┌──────────────┐    │
                   │     │  productos   │◄───┘
                   │     ├──────────────┤
                   │     │ id (PK)      │
                   │     │ nombre       │
                   │     │ descripcion  │
                   │     │ precio       │
                   │     │ imagen       │
                   │     │ no_apartado  │
                   │     │ stock        │
                   │     │ activo       │
                   │     └──────────────┘
                   │
                   │ NFC
                   │
         ┌─────────┴──────────────┐
         │ nfc_selected_orders    │
         ├────────────────────────┤
         │ id (PK)                │
         │ nfc (UK, FK)           │
         │ order_id (FK)          │──────┐
         │ selected_at            │      │
         │ dispenser_id (FK)      │──┐   │
         └────────────────────────┘  │   │
                                     │   │
┌──────────────┐                    │   │
│ dispensador  │◄───────────────────┘   │
├──────────────┤                        │
│ id (PK)      │                        │
│dispenser_id  │◄──────────┐            │
│  (UK)        │           │            │
│ nombre       │           │ FK: dispenser_id
│ ubicacion    │           │            │
│ estado       │           │            │
│ ip_address   │           │            │
│ ultima_con   │           │            │
└──────────────┘           │            │
                           │            │
         ┌─────────────────┴────────────┴─────┐
         │          orders                    │
         ├────────────────────────────────────┤
         │ id (PK)                            │
         │ order_id (UK)                      │
         │ user_id                            │
         │ items (JSON)                       │
         │ total                              │
         │ status (enum)                      │
         │ payment_id                         │
         │ payment_status (enum)              │
         │ external_reference                 │
         │ created_at                         │
         │ dispensed_at                       │
         │ dispenser_id (FK)                  │
         └────────────────────────────────────┘
                      │
                      │ FK: order_id
                      │
                      ▼
         ┌────────────────────────┐
         │        pago            │
         ├────────────────────────┤
         │ id (PK)                │
         │ order_id (FK)          │
         │ user_id (FK)           │
         │ monto                  │
         │ metodo_pago (enum)     │
         │ estado (enum)          │
         │ referencia_externa     │
         │ payment_id             │
         │ fecha_pago             │
         └────────────────────────┘


┌──────────────┐
│   estado     │
├──────────────┤
│ id (PK)      │
│ nombre       │
│ descripcion  │
│ tipo (enum)  │
│ activo       │
└──────────────┘
```

## Leyenda

- **PK**: Primary Key (Llave Primaria)
- **FK**: Foreign Key (Llave Foránea)
- **UK**: Unique Key (Llave Única)
- **─►**: Relación Uno a Muchos
- **(enum)**: Campo con valores predefinidos

---

## 📋 Relaciones Detalladas

### 1. Usuario → Roles (N:1)
- Un usuario tiene **UN** rol
- Un rol puede tener **MUCHOS** usuarios
- Campo: `usuario.id_role_fk → roles.id`

### 2. Usuario → Carrito (1:N)
- Un usuario puede tener **MUCHOS** items en carrito
- Un item del carrito pertenece a **UN** usuario
- Campo: `carrito.iduser → usuario.id`

### 3. Carrito → Productos (N:1)
- Un item de carrito referencia a **UN** producto
- Un producto puede estar en **MUCHOS** carritos
- Campo: `carrito.idproducto → productos.id`

### 4. Usuario → NFC → Orders (1:1:N)
- Un NFC pertenece a **UN** usuario
- Un NFC puede tener **UNA** orden seleccionada activa
- Campo: `nfc_selected_orders.nfc → usuario.nfc`
- Campo: `nfc_selected_orders.order_id → orders.order_id`

### 5. Orders → Dispensador (N:1)
- Una orden se dispensa en **UN** dispensador
- Un dispensador puede dispensar **MUCHAS** órdenes
- Campo: `orders.dispenser_id → dispensador.dispenser_id`

### 6. Orders → Pago (1:N)
- Una orden puede tener **MUCHOS** registros de pago (reintentos)
- Un pago pertenece a **UNA** orden
- Campo: `pago.order_id → orders.order_id`

### 7. Pago → Usuario (N:1)
- Un pago es realizado por **UN** usuario
- Un usuario puede hacer **MUCHOS** pagos
- Campo: `pago.user_id → usuario.id`

---

## 🔑 Campos Importantes

### Campo JSON: `orders.items`

Estructura del JSON de items:
```json
[
  {
    "name": "Coca Cola",
    "price": "20",
    "quantity": 2,
    "subtotal": 40,
    "product_id": "1",
    "no_apartado": 5
  }
]
```

### Estados (ENUM)

**orders.status:**
- `pending` - Orden creada, sin pagar
- `paid` - Orden pagada
- `dispensed` - Orden dispensada al cliente
- `cancelled` - Orden cancelada

**pago.estado:**
- `pendiente` - Pago en proceso
- `aprobado` - Pago exitoso
- `rechazado` - Pago rechazado
- `cancelado` - Pago cancelado

**dispensador.estado:**
- `activo` - Funcionando normalmente
- `inactivo` - Desconectado
- `mantenimiento` - En mantenimiento

---

## 📊 Índices Principales

### Para Búsquedas Rápidas:
- `usuario.gmail` (UNIQUE)
- `usuario.nfc` (UNIQUE)
- `orders.user_id`
- `orders.created_at`
- `orders.status`

### Para Análisis Estadístico:
- `orders(created_at, status)`
- `orders.total`

---

## 🔐 Seguridad

1. **Contraseñas**: Hasheadas con `bcrypt` (campo `usuario.codigo`)
2. **Claves Únicas**: Gmail, Usuario, NFC
3. **Integridad Referencial**: Todas las FK con `ON DELETE CASCADE/SET NULL`

---

## 📈 Optimizaciones

- Índices compuestos para consultas frecuentes
- JSON para estructura flexible de items
- ENUM para campos con valores predefinidos
- Timestamps automáticos (`created_at`, `updated_at`)

---

**Última actualización**: Noviembre 2025