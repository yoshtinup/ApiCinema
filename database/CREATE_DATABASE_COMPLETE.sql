-- =========================================
-- 🎬 API CINEMA - BASE DE DATOS COMPLETA
-- =========================================
-- Script de creación completa de la base de datos
-- Autor: ApiCinema Team
-- Fecha: Noviembre 2025
-- =========================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS basecine;
USE basecine;

-- =========================================
-- 1. TABLA: roles
-- =========================================
-- Tabla para gestionar roles de usuario
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
-- 2. TABLA: usuario (clientes/usuarios)
-- =========================================
-- Tabla principal de usuarios del sistema
CREATE TABLE IF NOT EXISTS usuario (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  telefono VARCHAR(20),
  gmail VARCHAR(255) NOT NULL,
  codigo VARCHAR(255) NULL COMMENT 'Contraseña hasheada - NULL para usuarios OAuth',
  usuario VARCHAR(50) NOT NULL,
  id_role_fk INT DEFAULT 1,
  nfc VARCHAR(255),
  google_id VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_gmail (gmail),
  UNIQUE KEY unique_usuario (usuario),
  UNIQUE KEY unique_nfc (nfc),
  KEY idx_id_role (id_role_fk),
  KEY idx_gmail (gmail),
  KEY idx_nfc (nfc),
  CONSTRAINT fk_usuario_role FOREIGN KEY (id_role_fk) REFERENCES roles(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla auxiliar para mantener compatibilidad con código que usa 'usuarios'
CREATE OR REPLACE VIEW usuarios AS SELECT * FROM usuario;

-- =========================================
-- 3. TABLA: productos
-- =========================================
-- Catálogo de productos disponibles
CREATE TABLE IF NOT EXISTS productos (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  imagen VARCHAR(255),
  no_apartado INT DEFAULT 0 COMMENT 'Número de compartimento en el dispensador',
  stock INT DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_nombre (nombre),
  KEY idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insertar productos de ejemplo
INSERT INTO productos (id, nombre, descripcion, precio, no_apartado, stock, activo) VALUES
(1, 'Coca Cola', 'Refresco Coca Cola 600ml', 20.00, 5, 50, TRUE),
(2, 'Vuala', 'Agua embotellada Vuala 1L', 10.00, 3, 100, TRUE),
(3, 'Skwintles', 'Dulces Skwintles sabor mixto', 15.00, 2, 75, TRUE),
(4, 'Hershey', 'Chocolate Hershey con almendras', 25.00, 1, 40, TRUE),
(5, 'Doritos', 'Botanas Doritos Nacho 150g', 18.00, 4, 60, TRUE);

-- =========================================
-- 4. TABLA: dispensador
-- =========================================
-- Dispositivos dispensadores del sistema
CREATE TABLE IF NOT EXISTS dispensador (
  id INT NOT NULL AUTO_INCREMENT,
  dispenser_id VARCHAR(36) NOT NULL,
  location VARCHAR(255) COMMENT 'Ubicación del dispensador',
  status VARCHAR(50) DEFAULT 'active' COMMENT 'Estado del dispensador: active, inactive, maintenance',
  products JSON COMMENT 'Inventario de productos en el dispensador',
  last_maintenance DATETIME COMMENT 'Fecha del último mantenimiento',
  error_count INT DEFAULT 0 COMMENT 'Contador de errores',
  ip_address VARCHAR(50),
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
-- 5. TABLA: orders (órdenes/pedidos)
-- =========================================
-- Registro de todas las órdenes del sistema
CREATE TABLE IF NOT EXISTS orders (
  id INT NOT NULL AUTO_INCREMENT,
  order_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  items JSON NOT NULL COMMENT 'Array JSON con productos de la orden',
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
-- Órdenes seleccionadas por cada NFC para dispensar
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
-- Carrito de compras de usuarios
CREATE TABLE IF NOT EXISTS carrito (
  id INT NOT NULL AUTO_INCREMENT,
  iduser INT NOT NULL,
  idproducto INT NOT NULL,
  fecha DATE,
  hora TIME,
  cantidad INT DEFAULT 1,
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
-- Registro de pagos y transacciones
CREATE TABLE IF NOT EXISTS pago (
  id INT NOT NULL AUTO_INCREMENT,
  order_id VARCHAR(36) NOT NULL,
  user_id INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  metodo_pago ENUM('efectivo','tarjeta','mercadopago','otro') DEFAULT 'mercadopago',
  estado ENUM('pendiente','aprobado','rechazado','cancelado') DEFAULT 'pendiente',
  referencia_externa VARCHAR(255),
  payment_id VARCHAR(255),
  fecha_pago DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_id (order_id),
  KEY idx_user_id (user_id),
  KEY idx_estado (estado),
  CONSTRAINT fk_pago_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pago_usuario FOREIGN KEY (user_id) REFERENCES usuario(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================
-- 9. TABLA: estado
-- =========================================
-- Estados del sistema (órdenes, dispensadores, etc.)
CREATE TABLE IF NOT EXISTS estado (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  tipo ENUM('orden','dispensador','pago','sistema') DEFAULT 'sistema',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tipo (tipo),
  KEY idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insertar estados por defecto
INSERT INTO estado (nombre, descripcion, tipo) VALUES
('Pendiente', 'Orden creada pero sin pagar', 'orden'),
('Pagado', 'Orden pagada exitosamente', 'orden'),
('Dispensado', 'Orden dispensada al cliente', 'orden'),
('Cancelado', 'Orden cancelada', 'orden'),
('Activo', 'Dispensador operativo', 'dispensador'),
('Inactivo', 'Dispensador desconectado', 'dispensador'),
('Mantenimiento', 'Dispensador en mantenimiento', 'dispensador');

-- =========================================
-- 10. ÍNDICES ADICIONALES PARA RENDIMIENTO
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
    CREATE_TIME as 'Fecha Creación',
    TABLE_COMMENT as 'Comentario'
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
SELECT 'Estados' as Tabla, COUNT(*) as Total FROM estado;

-- =========================================
-- FIN DEL SCRIPT
-- =========================================
-- Para poblar con datos de prueba, ejecuta:
-- SOURCE seed_orders_data.sql
-- =========================================
