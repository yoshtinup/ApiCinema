-- =========================================
-- Script para crear usuario ADMINISTRADOR
-- =========================================
-- Este script crea un usuario con rol de administrador
-- La contraseña está hasheada con bcrypt
-- =========================================

USE basecine;

-- =========================================
-- CREAR USUARIO ADMINISTRADOR
-- =========================================

-- Datos del usuario administrador:
-- Email: admin@apicinema.com
-- Usuario: admin
-- Contraseña: admin123 (hasheada con bcrypt)
-- Rol: 2 (admin)

INSERT INTO usuario (nombre, apellido, telefono, gmail, codigo, usuario, id_role_fk, nfc) 
VALUES (
  'Administrador',
  'Sistema',
  '9999999999',
  'admin@apicinema.com',
  '$2a$10$8ZFQq3Q3Z6JQ9X7Q3Q3Q3u3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q3O', -- Contraseña: admin123
  'admin',
  2, -- Role 2 = admin
  NULL -- Sin NFC por defecto
);

-- Verificar que se creó correctamente
SELECT id, nombre, apellido, gmail, usuario, id_role_fk, created_at 
FROM usuario 
WHERE gmail = 'admin@apicinema.com';

-- =========================================
-- NOTA IMPORTANTE SOBRE LA CONTRASEÑA
-- =========================================
-- La contraseña hasheada arriba es solo un ejemplo
-- Para generar el hash correcto de tu contraseña, ejecuta esto en Node.js:
--
-- const bcrypt = require('bcryptjs');
-- const salt = bcrypt.genSaltSync(10);
-- const hash = bcrypt.hashSync('tu_contraseña_aqui', salt);
-- console.log(hash);
--
-- Luego reemplaza el valor en el INSERT arriba
-- =========================================

-- =========================================
-- OPCIÓN 2: Usar el script de Node.js
-- =========================================
-- En lugar de este SQL, puedes usar:
-- node create-admin-user.js
-- =========================================
