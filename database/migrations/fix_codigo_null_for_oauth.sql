-- =========================================
-- Migración: Permitir NULL en campo codigo
-- =========================================
-- Este script actualiza la tabla usuario para permitir
-- que el campo 'codigo' sea NULL, necesario para
-- usuarios que se registran con Google OAuth
-- =========================================

USE basecine;

-- Modificar el campo codigo para permitir NULL
ALTER TABLE usuario 
MODIFY COLUMN codigo VARCHAR(255) NULL COMMENT 'Contraseña hasheada - NULL para usuarios OAuth';

-- Verificar el cambio
DESCRIBE usuario;

-- Mensaje de éxito
SELECT '✅ Migración completada: El campo codigo ahora permite NULL' AS mensaje;

-- Verificar usuarios existentes sin codigo
SELECT 
    id,
    nombre,
    gmail,
    google_id,
    CASE 
        WHEN codigo IS NULL THEN 'NULL (OAuth)'
        WHEN codigo = 'GOOGLE_OAUTH_USER' THEN 'DUMMY (OAuth)'
        ELSE 'Hash válido'
    END as estado_codigo
FROM usuario;
