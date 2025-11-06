# 🗄️ Base de Datos ApiCinema - Guía de Instalación

## 📋 Descripción
Este documento te guía para crear la base de datos completa de ApiCinema desde cero.

---

## 🚀 Instalación Rápida

### Opción 1: Desde MySQL Workbench (Recomendado)

1. **Abre MySQL Workbench**
2. **Conecta a tu servidor MySQL**
3. **Abre el archivo**:
   - File → Open SQL Script
   - Selecciona: `CREATE_DATABASE_COMPLETE.sql`
4. **Ejecuta el script completo**:
   - Presiona el botón ⚡ "Execute" o `Ctrl+Shift+Enter`
5. **Verifica la creación**:
   - Deberías ver el mensaje de éxito y las estadísticas de las tablas

### Opción 2: Desde línea de comandos

```bash
# Conéctate a MySQL
mysql -u tu_usuario -p

# Ejecuta el script
source C:\Users\jesus\core\6C\Integrador\C2\ApiCinema\database\CREATE_DATABASE_COMPLETE.sql

# O en una sola línea:
mysql -u tu_usuario -p < CREATE_DATABASE_COMPLETE.sql
```

### Opción 3: Con Docker (si usas contenedores)

```bash
docker exec -i mysql_container mysql -uroot -p < CREATE_DATABASE_COMPLETE.sql
```

---

## 📊 Estructura de la Base de Datos

### Tablas Principales

1. **`roles`** - Roles de usuario (admin, usuario, operador)
2. **`usuario`** - Usuarios/clientes del sistema
3. **`productos`** - Catálogo de productos disponibles
4. **`dispensador`** - Dispositivos dispensadores
5. **`orders`** - Órdenes/pedidos del sistema
6. **`nfc_selected_orders`** - Órdenes seleccionadas por NFC
7. **`carrito`** - Carrito de compras
8. **`pago`** - Registro de pagos
9. **`estado`** - Estados del sistema

---

## 🔧 Configuración Post-Instalación

### 1. Actualiza tu archivo `database/config.js`

```javascript
export const dbConfig = {
  host: 'TU_HOST',        // Ej: 'localhost' o IP de tu servidor
  user: 'TU_USUARIO',     // Ej: 'root'
  password: 'TU_PASSWORD',
  database: 'basecine',
  port: 3306
};
```

### 2. Poblar con Datos de Prueba (Opcional)

Para agregar órdenes de prueba para análisis estadístico:

```bash
# Desde MySQL Workbench o línea de comandos
USE basecine;
SOURCE seed_orders_data.sql;
```

O ejecuta el archivo `seed_orders_data.sql` que ya tienes en el proyecto.

---

## ✅ Verificación

Después de crear la base de datos, verifica que todo esté correcto:

### Verificar tablas creadas

```sql
USE basecine;
SHOW TABLES;
```

Deberías ver:
```
+--------------------+
| Tables_in_basecine |
+--------------------+
| carrito            |
| dispensador        |
| estado             |
| nfc_selected_orders|
| orders             |
| pago               |
| productos          |
| roles              |
| usuario            |
| usuarios           | (vista)
+--------------------+
```

### Verificar datos iniciales

```sql
-- Ver roles
SELECT * FROM roles;

-- Ver productos
SELECT * FROM productos;

-- Ver dispensadores
SELECT * FROM dispensador;

-- Ver estados
SELECT * FROM estado;
```

---

## 🔑 Crear Usuario Administrador

Para crear tu primer usuario administrador:

```bash
# Desde la raíz del proyecto
node create-admin-account.js create
```

O manualmente en MySQL:

```sql
-- Inserta un usuario admin (la contraseña debe ser hasheada)
INSERT INTO usuario (nombre, apellido, gmail, codigo, usuario, id_role_fk) 
VALUES (
  'Admin',
  'Sistema',
  'admin@apicinema.com',
  '$2a$10$ejemplo_hash_bcrypt',  -- Usa bcrypt para hashear tu contraseña
  'admin',
  2  -- Role 2 = admin
);
```

---

## 📁 Archivos del Proyecto

```
database/
├── CREATE_DATABASE_COMPLETE.sql  ← Script principal (NUEVO)
├── seed_orders_data.sql          ← Datos de prueba para órdenes
├── config.js                     ← Configuración de conexión
├── mysql.js                      ← Cliente de conexión
└── migrations/                   ← Scripts de migración adicionales
    ├── create_orders_table.sql
    ├── create_nfc_selected_orders_table.sql
    └── add_payment_fields_to_orders.sql
```

---

## 🔄 Migraciones (Opcional)

Si ya tienes una base de datos existente y solo necesitas actualizarla:

```sql
-- Agregar campos de pago
SOURCE migrations/add_payment_fields_to_orders.sql;

-- Crear tabla NFC
SOURCE migrations/create_nfc_selected_orders_table.sql;
```

---

## 🧪 Pruebas de Conexión

Desde tu proyecto Node.js:

```bash
# Prueba la conexión
node -e "require('./database/mysql.js').db.query('SELECT 1').then(() => console.log('✅ Conexión exitosa'))"
```

O crea un archivo de prueba:

```javascript
// test-connection.js
import { db } from './database/mysql.js';

async function testConnection() {
  try {
    const [result] = await db.query('SELECT COUNT(*) as total FROM usuario');
    console.log('✅ Conexión exitosa');
    console.log(`Total de usuarios: ${result[0].total}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  }
}

testConnection();
```

---

## ⚠️ Notas Importantes

1. **Contraseñas**: Las contraseñas se almacenan hasheadas con bcrypt
2. **NFC**: Los IDs de NFC deben ser únicos por usuario
3. **Orders**: El campo `items` es JSON y almacena el detalle de productos
4. **Vistas**: La vista `usuarios` es un alias de `usuario` para compatibilidad

---

## 🛠️ Solución de Problemas

### Error: "Table already exists"

```sql
-- Elimina la base de datos y vuélvela a crear
DROP DATABASE IF EXISTS basecine;
SOURCE CREATE_DATABASE_COMPLETE.sql;
```

### Error: "Access denied"

Verifica que tu usuario tenga permisos:

```sql
GRANT ALL PRIVILEGES ON basecine.* TO 'tu_usuario'@'localhost';
FLUSH PRIVILEGES;
```

### Error de conexión desde Node.js

1. Verifica el archivo `database/config.js`
2. Asegúrate de que el servidor MySQL esté corriendo
3. Verifica el firewall y puertos (3306)

---

## 📞 Contacto y Soporte

Para dudas o problemas, contacta al equipo de ApiCinema.

---

## 🎉 ¡Listo!

Tu base de datos ApiCinema está lista para usar. Ahora puedes:

1. ✅ Iniciar el servidor: `npm start`
2. ✅ Crear usuarios
3. ✅ Gestionar productos
4. ✅ Procesar órdenes
5. ✅ Realizar análisis estadísticos

---

**Versión**: 1.0  
**Última actualización**: Noviembre 2025  
**Base de datos**: MySQL 8.0+