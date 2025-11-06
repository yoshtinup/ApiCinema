# 📋 ApiCinema - Evidencia de Pruebas de Base de Datos

## 🧪 Resumen
Este documento presenta la evidencia de la fase de pruebas sobre la base de datos del proyecto ApiCinema. Se validó la estructura, integridad, operaciones CRUD y la correcta relación entre tablas principales.

---

## 🎯 Objetivos de las Pruebas
- Verificar la correcta creación y estructura de las tablas principales.
- Validar la integridad referencial y los constraints.
- Probar operaciones de inserción, actualización, consulta y eliminación.
- Asegurar que los datos se almacenan y recuperan correctamente.
- Comprobar la integración con el backend y los casos de uso.

---

## 📚 Tablas Principales Probadas
- **clients** (clientes)
- **orders** (órdenes)
- **products** (productos)
- **order_items** (detalle de productos por orden)
- **roles** (roles de usuario)

---

## 🧑‍💻 Ejemplos de Scripts y Consultas SQL

### 1. **Verificar estructura de tabla**
```sql
DESCRIBE clients;
```

### 2. **Contar registros**
```sql
SELECT COUNT(*) AS total FROM orders;
```

### 3. **Insertar un cliente**
```sql
INSERT INTO clients (nombre, apellido, telefono, gmail, usuario, id_role_fk, nfc)
VALUES ('Juan', 'Pérez', '5551234567', 'juanperez@gmail.com', 'juanp', 1, 'NFC12345');
```

### 4. **Actualizar campo NFC**
```sql
UPDATE clients SET nfc = 'NFC67890' WHERE id = 1;
```

### 5. **Eliminar un cliente**
```sql
DELETE FROM clients WHERE id = 1;
```

### 6. **Consultar órdenes y productos**
```sql
SELECT o.id, o.created_at, c.nombre, p.nombre AS producto, oi.cantidad
FROM orders o
JOIN clients c ON o.client_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON oi.product_id = p.id;
```

---

## 🧪 Ejemplo de Script Node.js para Pruebas de BD
```javascript
// test-db.js
const db = require('./src/db');
async function testDBConnection() {
  const result = await db.query('SELECT COUNT(*) as total FROM orders');
  console.log('Total de órdenes:', result[0].total);
}
testDBConnection();
```

---

## 📝 Pruebas Manuales Realizadas
- **Inserción:** Se agregaron clientes y productos de prueba y se verificó su aparición en las consultas.
- **Actualización:** Se modificó el campo NFC de clientes y se comprobó el cambio.
- **Eliminación:** Se eliminaron registros y se verificó que no aparecieran en consultas posteriores.
- **Consulta:** Se realizaron queries para validar la relación entre órdenes, clientes y productos.
- **Integridad:** Se intentó insertar datos inválidos para comprobar restricciones y errores.

---

## ✅ Resultados Esperados
- Las tablas contienen los datos correctos y cumplen con la estructura definida.
- Las operaciones CRUD funcionan correctamente y reflejan los cambios en la base de datos.
- Las relaciones entre tablas permiten obtener información agregada y detallada.
- Los constraints y claves foráneas previenen errores de integridad.
- El backend puede interactuar correctamente con la base de datos.

---

## 📄 Recomendaciones para convertir a PDF
1. Abre este archivo en un editor Markdown compatible (VS Code, Typora, etc.).
2. Exporta como PDF desde el menú "Archivo" o usando la opción "Exportar".
3. Alternativamente, usa una herramienta online como [markdowntopdf.com](https://markdowntopdf.com/) o [pandoc](https://pandoc.org/).

---

## 📞 Contacto
Para dudas o soporte, contacta al equipo de ApiCinema.
