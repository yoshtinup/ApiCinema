-- =========================================
-- 🎬 API CINEMA - BASE DE DATOS COMPLETA
-- =========================================
-- Script generado analizando los Repository del código
-- Basado en las queries SQL reales que usa la aplicación
-- Fecha: Noviembre 5, 2025
-- =========================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS basecine;
USE basecine;

-- =========================================
-- LIMPIAR TABLAS EXISTENTES
-- =========================================
-- ⚠️ ADVERTENCIA: Esto eliminará TODAS las tablas y sus datos
-- Orden correcto: primero tablas con foreign keys, luego tablas referenciadas

SET FOREIGN_KEY_CHECKS = 0; -- Desactivar temporalmente las foreign keys

-- Eliminar tablas que tienen foreign keys
DROP TABLE IF EXISTS nfc_selected_orders;
DROP TABLE IF EXISTS carrito;
DROP TABLE IF EXISTS pago;
DROP TABLE IF EXISTS estado;
DROP TABLE IF EXISTS orders;

-- Eliminar tablas referenciadas por otras
DROP TABLE IF EXISTS dispensador;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS roles;

-- Eliminar vistas
DROP VIEW IF EXISTS usuarios;

SET FOREIGN_KEY_CHECKS = 1; -- Reactivar foreign keys

-- =========================================
-- 1. TABLA: roles
-- =========================================
CREATE TABLE IF NOT EXISTS roles (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insertar roles por defecto
INSERT INTO roles (id, nombre, descripcion) VALUES
(1, 'usuario', 'Usuario regular del sistema'),
(2, 'admin', 'Administrador con permisos completos'),
(3, 'operador', 'Operador del dispensador');

-- =========================================
-- 2. TABLA: usuario
-- =========================================
-- Basado en: v1/Registro/Infrestructura/adapters/Repositories/RegistroRepository.js
-- v1/Auth/Infrestructura/adapters/googleAuth.js
--
-- Queries utilizadas:
-- INSERT INTO usuario(nombre, apellido, telefono, gmail, codigo, usuario, id_role_fk, nfc)
-- INSERT INTO usuario (nombre, gmail, usuario, google_id, id_role_fk, codigo) [Google OAuth]
-- UPDATE usuario SET nombre = ?, apellido = ?, telefono = ?, gmail = ?, usuario = ?, nfc = ?
-- UPDATE usuario SET nfc = ?
-- SELECT * FROM usuario WHERE gmail = ?
-- SELECT * FROM usuario WHERE google_id = ? OR gmail = ?
-- SELECT * FROM usuario WHERE id = ?
-- DELETE FROM usuario WHERE id = ?
--
CREATE TABLE IF NOT EXISTS usuario (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  telefono VARCHAR(20),
  gmail VARCHAR(255) NOT NULL,
  codigo VARCHAR(255) NULL COMMENT 'Contraseña hasheada con bcrypt - NULL para usuarios OAuth',
  usuario VARCHAR(50) NOT NULL,
  id_role_fk INT DEFAULT 1,
  nfc VARCHAR(255),
  google_id VARCHAR(255) NULL COMMENT 'ID de Google para OAuth',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_gmail (gmail),
  UNIQUE KEY unique_usuario (usuario),
  UNIQUE KEY unique_nfc (nfc),
  KEY idx_id_role (id_role_fk),
  KEY idx_gmail (gmail),
  KEY idx_nfc (nfc),
  KEY idx_google_id (google_id),
  CONSTRAINT fk_usuario_role FOREIGN KEY (id_role_fk) REFERENCES roles(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Vista para compatibilidad (SELECT * FROM usuarios)
CREATE OR REPLACE VIEW usuarios AS SELECT * FROM usuario;

-- =========================================
-- 3. TABLA: productos
-- =========================================
-- Basado en: v1/Producto/Infrestructura/adapters/repositories/ProductoRepository.js
-- v1/dispensador/Infrestructura/adapters/repositories/DispenserRepository.js (SELECT cantidad)
-- v1/Carrito/Infrestructura/adapters/repositories/CarritoRepository.js (SELECT * WHERE id)
--
-- Queries utilizadas:
-- INSERT INTO productos (nombre, descripcion, precio, peso, cantidad, categoria, ingreso, imagen, no_apartado)
-- UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, peso = ?, cantidad = ?, categoria = ?, ingreso = ?, imagen = ?, no_apartado = ?
-- UPDATE productos SET no_apartado = ?
-- UPDATE productos SET cantidad = cantidad - ? [Decrementar inventario]
-- SELECT * FROM productos
-- SELECT * FROM productos WHERE id = ?
-- SELECT cantidad FROM productos WHERE id = ?
-- DELETE FROM productos WHERE id = ?
--
CREATE TABLE IF NOT EXISTS productos (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  peso DECIMAL(10,2),
  cantidad INT DEFAULT 0 COMMENT 'Inventario disponible (se decrementa al rellenar dispensador)',
  categoria VARCHAR(100),
  ingreso DATE,
  imagen VARCHAR(255),
  no_apartado INT DEFAULT 0 COMMENT 'Número de compartimento en dispensador',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_nombre (nombre),
  KEY idx_cantidad (cantidad),
  KEY idx_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insertar productos de ejemplo
INSERT INTO productos (id, nombre, descripcion, precio, peso, cantidad, categoria, no_apartado, imagen) VALUES
(1, 'Coca Cola', 'Refresco Coca Cola 600ml', 20.00, 0.60, 50, 'Bebidas', 5, NULL),
(2, 'Vuala', 'Agua embotellada Vuala 1L', 10.00, 1.00, 100, 'Bebidas', 3, NULL),
(3, 'Skwintles', 'Dulces Skwintles sabor mixto', 15.00, 0.10, 75, 'Dulces', 2, NULL),
(4, 'Hershey', 'Chocolate Hershey con almendras', 25.00, 0.12, 40, 'Chocolates', 1, NULL),
(5, 'Doritos', 'Botanas Doritos Nacho 150g', 18.00, 0.15, 60, 'Botanas', 4, NULL);

-- =========================================
-- 4. TABLA: dispensador
-- =========================================
-- Basado en: v1/dispensador/Infrestructura/adapters/repositories/DispenserRepository.js
--
-- Queries utilizadas:
-- INSERT INTO dispensador (dispenser_id, location, status, products, last_maintenance, error_count)
-- UPDATE dispensador SET location = ?, status = ?, products = ?, last_maintenance = ?, error_count = ?
-- UPDATE dispensador SET products = ? WHERE dispenser_id = ? [Actualizar inventario]
-- SELECT * FROM dispensador
-- SELECT * FROM dispensador WHERE dispenser_id = ?
-- DELETE FROM dispensador WHERE dispenser_id = ?
--
-- NOTA: products es JSON con estructura: [{id, cantidad, apartado}]
--
CREATE TABLE IF NOT EXISTS dispensador (
  id INT NOT NULL AUTO_INCREMENT,
  dispenser_id VARCHAR(36) NOT NULL,
  location VARCHAR(255) COMMENT 'Ubicación física del dispensador',
  status VARCHAR(50) DEFAULT 'active' COMMENT 'Estado: active, inactive, maintenance',
  products JSON COMMENT 'Inventario en formato: [{id, cantidad, apartado}]',
  last_maintenance DATETIME COMMENT 'Fecha del último mantenimiento',
  error_count INT DEFAULT 0 COMMENT 'Contador de errores del dispensador',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_dispenser_id (dispenser_id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insertar dispensador por defecto
INSERT INTO dispensador (dispenser_id, location, status, products, last_maintenance, error_count) VALUES
('Dispensador_001', 'Edificio A - Planta Baja', 'active', '[]', NOW(), 0);

-- =========================================
-- 5. TABLA: orders
-- =========================================
-- Basado en: database/migrations/create_orders_table.sql
-- v1/pago/Infrestructura/adapters/repositories/Repository.js
--
-- Queries utilizadas:
-- SELECT o.* FROM orders o INNER JOIN usuario u ON o.user_id = u.id WHERE u.nfc = ?
--
CREATE TABLE IF NOT EXISTS orders (
  id INT NOT NULL AUTO_INCREMENT,
  order_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  items JSON NOT NULL COMMENT 'Array JSON con productos: [{name, price, quantity, subtotal, product_id, no_apartado}]',
  total DECIMAL(10,2) NOT NULL,
  status ENUM('pending','paid','dispensed','cancelled') NOT NULL DEFAULT 'pending',
  payment_id VARCHAR(255) NULL,
  payment_status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
  external_reference VARCHAR(255) NULL,
  created_at DATETIME NOT NULL,
  dispensed_at DATETIME NULL,
  dispenser_id VARCHAR(36),
  PRIMARY KEY (id),
  UNIQUE KEY unique_order_id (order_id),
  KEY idx_user_id (user_id),
  KEY idx_status (status),
  KEY idx_created_at (created_at),
  KEY idx_payment_status (payment_status),
  CONSTRAINT fk_orders_dispenser FOREIGN KEY (dispenser_id) REFERENCES dispensador(dispenser_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================
-- 6. TABLA: nfc_selected_orders
-- =========================================
-- Basado en: database/migrations/create_nfc_selected_orders_table.sql
--
CREATE TABLE IF NOT EXISTS nfc_selected_orders (
  id INT NOT NULL AUTO_INCREMENT,
  nfc VARCHAR(255) NOT NULL,
  order_id VARCHAR(36) NOT NULL,
  selected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dispenser_id VARCHAR(36) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_nfc (nfc),
  KEY idx_order_id (order_id),
  CONSTRAINT fk_nfc_selected_orders_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_nfc_selected_orders_dispenser FOREIGN KEY (dispenser_id) REFERENCES dispensador(dispenser_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================
-- 7. TABLA: carrito
-- =========================================
-- Basado en: v1/Carrito/Infrestructura/adapters/repositories/CarritoRepository.js
--
-- Queries utilizadas:
-- INSERT INTO carrito (iduser, idproducto, fecha, hora)
-- UPDATE carrito SET iduser = ?, idproducto = ?, fecha = ?, hora = ?
-- SELECT * FROM carrito
-- SELECT * FROM carrito WHERE id = ?
-- SELECT * FROM carrito WHERE iduser = ?
-- DELETE FROM carrito WHERE id = ?
-- DELETE FROM carrito WHERE iduser = ?
--
CREATE TABLE IF NOT EXISTS carrito (
  id INT NOT NULL AUTO_INCREMENT,
  iduser INT NOT NULL,
  idproducto INT NOT NULL,
  fecha DATE,
  hora TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_iduser (iduser),
  KEY idx_idproducto (idproducto),
  CONSTRAINT fk_carrito_usuario FOREIGN KEY (iduser) REFERENCES usuario(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_carrito_producto FOREIGN KEY (idproducto) REFERENCES productos(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================
-- 8. TABLA: pago
-- =========================================
-- Basado en: v1/pago/Infrestructura/adapters/repositories/Repository.js
--
-- Queries utilizadas:
-- INSERT INTO pago (iduser, idproducto, cantidad, codigo)
-- UPDATE pago SET iduser = ?, idproducto = ?, cantidad = ?, codigo = ?
-- SELECT * FROM pago
-- SELECT * FROM pago WHERE id = ?
-- DELETE FROM pago WHERE id = ?
--
CREATE TABLE IF NOT EXISTS pago (
  id INT NOT NULL AUTO_INCREMENT,
  iduser INT,
  idproducto INT,
  cantidad INT,
  codigo VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_iduser (iduser),
  KEY idx_idproducto (idproducto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================
-- 9. TABLA: estado
-- =========================================
-- Basado en: v1/Estado/Infrestructura/adapters/repositories/Repository.js
--
-- Queries utilizadas:
-- INSERT INTO estado (iduser, codigo, total, fecha)
-- UPDATE estado SET iduser = ?, codigo = ?, total = ?, fecha = ?
-- SELECT * FROM estado
-- SELECT * FROM estado WHERE id = ?
-- DELETE FROM estado WHERE id = ?
--
CREATE TABLE IF NOT EXISTS estado (
  id INT NOT NULL AUTO_INCREMENT,
  iduser INT,
  codigo VARCHAR(255),
  total DECIMAL(10,2),
  fecha DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_iduser (iduser)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================
-- ÍNDICES ADICIONALES PARA RENDIMIENTO
-- =========================================

-- Índices para análisis estadístico en orders
CREATE INDEX idx_orders_created_status ON orders(created_at, status);
CREATE INDEX idx_orders_total ON orders(total);

-- Índices para búsquedas de usuario
CREATE INDEX idx_usuario_nombre_completo ON usuario(nombre, apellido);

-- =========================================
-- VERIFICACIÓN DE TABLAS CREADAS
-- =========================================

SELECT 
    TABLE_NAME as 'Tabla',
    TABLE_ROWS as 'Filas',
    CREATE_TIME as 'Fecha Creación'
FROM 
    information_schema.TABLES 
WHERE 
    TABLE_SCHEMA = 'basecine'
ORDER BY 
    TABLE_NAME;

-- =========================================
-- ESTADÍSTICAS INICIALES
-- =========================================

SELECT 'Usuarios' as Tabla, COUNT(*) as Total FROM usuario
UNION ALL
SELECT 'Productos' as Tabla, COUNT(*) as Total FROM productos
UNION ALL
SELECT 'Roles' as Tabla, COUNT(*) as Total FROM roles
UNION ALL
SELECT 'Dispensadores' as Tabla, COUNT(*) as Total FROM dispensador
UNION ALL
SELECT 'Orders' as Tabla, COUNT(*) as Total FROM orders
UNION ALL
SELECT 'Carrito' as Tabla, COUNT(*) as Total FROM carrito
UNION ALL
SELECT 'Pago' as Tabla, COUNT(*) as Total FROM pago
UNION ALL
SELECT 'Estado' as Tabla, COUNT(*) as Total FROM estado;

-- =========================================
-- FIN DEL SCRIPT
-- =========================================
-- Este script fue generado analizando los archivos Repository
-- Para poblar con datos de prueba de órdenes, ejecuta:
-- SOURCE seed_orders_data.sql
-- =========================================
