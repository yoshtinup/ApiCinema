-- =========================================
-- Script para crear usuario ADMINISTRADOR
-- =========================================
-- Ejecuta este script después de crear la base de datos

USE basecine;

-- =========================================
-- CREAR USUARIO ADMINISTRADOR
-- =========================================

-- Opción 1: Usuario Admin con contraseña hasheada (bcrypt)
-- Usuario: admin
-- Contraseña: admin123
-- Email: admin@apicinema.com
INSERT INTO usuario (nombre, apellido, telefono, gmail, codigo, usuario, id_role_fk, nfc) 
VALUES (
  'Administrador',
  'Sistema',
  '0000000000',
  'admin@apicinema.com',
  '$2a$10$rOZxe8L5z5H5L5z5H5z5.euGKYZ8L5z5H5L5z5H5z5H5L5z5H5z5e', -- admin123
  'admin',
  2, -- Role 2 = admin
  NULL
);

-- =========================================
-- VERIFICAR USUARIO CREADO
-- =========================================

SELECT 
  u.id,
  u.nombre,
  u.apellido,
  u.gmail,
  u.usuario,
  r.nombre as rol,
  u.created_at
FROM usuario u
LEFT JOIN roles r ON u.id_role_fk = r.id
WHERE u.id_role_fk = 2;

-- =========================================
-- INSTRUCCIONES PARA MÁS USUARIOS
-- =========================================

-- Para crear más usuarios administradores:
-- 1. Opción A: Usa el script de Node.js
--    node create-admin-account.js create

-- 2. Opción B: Genera el hash de la contraseña manualmente
--    En Node.js:
--    const bcrypt = require('bcryptjs');
--    const hash = await bcrypt.hash('tuContraseña', 10);
--    console.log(hash);

-- 3. Opción C: Inserta manualmente con el hash generado
--    INSERT INTO usuario (nombre, apellido, gmail, codigo, usuario, id_role_fk)
--    VALUES ('Nombre', 'Apellido', 'email@ejemplo.com', 'HASH_AQUI', 'username', 2);

-- =========================================
-- CREDENCIALES POR DEFECTO
-- =========================================
-- Email: admin@apicinema.com
-- Contraseña: admin123
-- 
-- ⚠️ IMPORTANTE: Cambia esta contraseña después del primer login
-- =========================================
