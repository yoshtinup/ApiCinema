-- =========================================
-- 🔄 MIGRACIÓN: Actualizar tabla dispensador
-- =========================================
-- Actualiza la estructura de la tabla dispensador
-- para que coincida con los campos que usa el código
-- =========================================

USE basecine;

-- Paso 1: Verificar si la tabla existe
SELECT 'Verificando tabla dispensador...' as 'Estado';

-- Paso 2: Respaldar datos existentes (si hay)
CREATE TABLE IF NOT EXISTS dispensador_backup AS 
SELECT * FROM dispensador;

SELECT CONCAT('✅ Respaldo creado: ', COUNT(*), ' registros') as 'Respaldo' 
FROM dispensador_backup;

-- Paso 3: Eliminar tabla antigua
DROP TABLE IF EXISTS dispensador;

-- Paso 4: Crear tabla con nueva estructura
CREATE TABLE dispensador (
  id INT NOT NULL AUTO_INCREMENT,
  dispenser_id VARCHAR(36) NOT NULL,
  location VARCHAR(255) COMMENT 'Ubicación del dispensador',
  status VARCHAR(50) DEFAULT 'active' COMMENT 'Estado: active, inactive, maintenance',
  products JSON COMMENT 'Inventario de productos en formato JSON',
  last_maintenance DATETIME COMMENT 'Fecha del último mantenimiento',
  error_count INT DEFAULT 0 COMMENT 'Contador de errores',
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_dispenser_id (dispenser_id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Paso 5: Migrar datos del respaldo a la nueva estructura
INSERT INTO dispensador (
  dispenser_id, 
  location, 
  status, 
  products, 
  last_maintenance, 
  error_count,
  created_at
)
SELECT 
  dispenser_id,
  COALESCE(ubicacion, location, 'Sin ubicación'),
  CASE 
    WHEN estado = 'activo' OR estado = 'active' THEN 'active'
    WHEN estado = 'inactivo' OR estado = 'inactive' THEN 'inactive'
    WHEN estado = 'mantenimiento' OR estado = 'maintenance' THEN 'maintenance'
    ELSE 'active'
  END,
  COALESCE(products, '[]'),
  COALESCE(last_maintenance, ultima_conexion, NOW()),
  COALESCE(error_count, 0),
  created_at
FROM dispensador_backup;

-- Paso 6: Insertar dispensador por defecto si no hay registros
INSERT INTO dispensador (dispenser_id, location, status, products, last_maintenance, error_count)
SELECT * FROM (SELECT 'Dispensador_001' as dispenser_id, 'Edificio A - Planta Baja' as location, 
               'active' as status, '[]' as products, NOW() as last_maintenance, 0 as error_count) as tmp
WHERE NOT EXISTS (SELECT 1 FROM dispensador WHERE dispenser_id = 'Dispensador_001');

-- Paso 7: Actualizar referencias en otras tablas
-- Actualizar tabla orders si existe
ALTER TABLE orders 
DROP FOREIGN KEY IF EXISTS fk_orders_dispenser;

ALTER TABLE orders
ADD CONSTRAINT fk_orders_dispenser 
FOREIGN KEY (dispenser_id) REFERENCES dispensador(dispenser_id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Actualizar tabla nfc_selected_orders si existe
ALTER TABLE nfc_selected_orders 
DROP FOREIGN KEY IF EXISTS fk_nfc_selected_orders_dispenser;

ALTER TABLE nfc_selected_orders
ADD CONSTRAINT fk_nfc_selected_orders_dispenser 
FOREIGN KEY (dispenser_id) REFERENCES dispensador(dispenser_id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Paso 8: Verificar migración
SELECT 
  '✅ Migración completada' as 'Estado',
  COUNT(*) as 'Total_Dispensadores',
  (SELECT COUNT(*) FROM dispensador WHERE status = 'active') as 'Activos',
  (SELECT COUNT(*) FROM dispensador WHERE status = 'inactive') as 'Inactivos',
  (SELECT COUNT(*) FROM dispensador WHERE status = 'maintenance') as 'Mantenimiento'
FROM dispensador;

-- Paso 9: Mostrar estructura final
SELECT 'Estructura final de la tabla:' as 'Info';
DESCRIBE dispensador;

-- Paso 10: Mostrar datos migrados
SELECT 'Datos actuales:' as 'Info';
SELECT 
  id,
  dispenser_id,
  location,
  status,
  CASE 
    WHEN JSON_LENGTH(products) > 0 THEN CONCAT(JSON_LENGTH(products), ' productos')
    ELSE 'Sin productos'
  END as inventory,
  last_maintenance,
  error_count
FROM dispensador;

-- OPCIONAL: Si todo está bien, puedes eliminar el respaldo
-- DROP TABLE IF EXISTS dispensador_backup;
-- SELECT '🗑️ Respaldo eliminado' as 'Estado';

SELECT '
===============================================
✅ MIGRACIÓN COMPLETADA EXITOSAMENTE
===============================================
La tabla dispensador ha sido actualizada con:
- dispenser_id (ID único del dispensador)
- location (ubicación)
- status (estado: active/inactive/maintenance)
- products (inventario en JSON)
- last_maintenance (último mantenimiento)
- error_count (contador de errores)

NOTA: La tabla dispensador_backup contiene tus
      datos originales por seguridad.
===============================================
' as 'RESULTADO';
