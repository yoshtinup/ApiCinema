-- =========================================
-- MIGRACIÓN: Agregar cantidad al carrito
-- =========================================
-- Esta migración agrega el campo 'cantidad' a la tabla carrito
-- y crea un índice único para evitar productos duplicados

USE basecine;

-- 1. Agregar columna cantidad
ALTER TABLE carrito 
ADD COLUMN cantidad INT NOT NULL DEFAULT 1 COMMENT 'Cantidad del producto en el carrito';

-- 2. Crear índice único para evitar productos duplicados por usuario
-- Esto asegura que cada usuario solo pueda tener UNA entrada por producto
ALTER TABLE carrito
ADD UNIQUE KEY unique_user_product (iduser, idproducto);

-- 3. Agregar índice para consultas de carrito por usuario
ALTER TABLE carrito
ADD INDEX idx_carrito_user (iduser);

-- 4. Consolidar registros duplicados existentes (si los hay)
-- Esto suma las cantidades de productos duplicados y elimina los duplicados
CREATE TEMPORARY TABLE carrito_consolidado AS
SELECT 
    MIN(id) as id,
    iduser,
    idproducto,
    COUNT(*) as cantidad,
    MAX(fecha) as fecha,
    MAX(hora) as hora
FROM carrito
GROUP BY iduser, idproducto;

-- Limpiar tabla original
TRUNCATE TABLE carrito;

-- Insertar datos consolidados
INSERT INTO carrito (id, iduser, idproducto, cantidad, fecha, hora)
SELECT id, iduser, idproducto, cantidad, fecha, hora
FROM carrito_consolidado;

-- Eliminar tabla temporal
DROP TEMPORARY TABLE carrito_consolidado;

-- =========================================
-- VERIFICACIÓN
-- =========================================
SELECT 
    'carrito' as Tabla,
    COLUMN_NAME as Campo,
    COLUMN_TYPE as Tipo,
    IS_NULLABLE as Nullable,
    COLUMN_DEFAULT as Default_Value
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'basecine' 
  AND TABLE_NAME = 'carrito';

-- Ver índices creados
SHOW INDEX FROM carrito;
