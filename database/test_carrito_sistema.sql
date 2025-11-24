-- =========================================
-- SCRIPT DE PRUEBA - Sistema de Carrito
-- =========================================

USE basecine;

-- 1. Ejecutar la migración si aún no se ha ejecutado
-- (ejecuta el archivo add_cantidad_to_carrito.sql primero)

-- 2. Insertar usuario de prueba
INSERT INTO usuario (nombre, apellido, telefono, gmail, codigo, usuario, id_role_fk) 
VALUES ('Test', 'User', '+529611111111', 'test@test.com', '$2a$10$testpassword', 'testuser', 1)
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);

SET @test_user_id = LAST_INSERT_ID();

-- 3. Ver productos disponibles
SELECT id, nombre, precio, cantidad as stock FROM productos;

-- 4. Agregar productos al carrito (simula POST /carrito)
-- Esto debería crear o incrementar la cantidad
INSERT INTO carrito (iduser, idproducto, cantidad, fecha, hora)
VALUES (@test_user_id, 1, 1, CURDATE(), CURTIME())
ON DUPLICATE KEY UPDATE cantidad = cantidad + 1;

INSERT INTO carrito (iduser, idproducto, cantidad, fecha, hora)
VALUES (@test_user_id, 2, 2, CURDATE(), CURTIME())
ON DUPLICATE KEY UPDATE cantidad = cantidad + 2;

-- 5. Ver carrito del usuario (simula GET /carrito/user/:userId)
SELECT 
    c.id,
    c.iduser,
    c.idproducto,
    c.cantidad,
    c.fecha,
    c.hora,
    p.nombre,
    p.descripcion,
    p.precio,
    p.peso,
    p.categoria,
    p.imagen,
    p.cantidad as stock_disponible,
    (c.cantidad * p.precio) as subtotal
FROM carrito c
INNER JOIN productos p ON c.idproducto = p.id
WHERE c.iduser = @test_user_id;

-- 6. Calcular total del carrito
SELECT 
    COUNT(*) as items,
    SUM(c.cantidad) as total_productos,
    SUM(c.cantidad * p.precio) as total_a_pagar
FROM carrito c
INNER JOIN productos p ON c.idproducto = p.id
WHERE c.iduser = @test_user_id;

-- 7. Incrementar cantidad (simula POST /carrito/:userId/increment/:productId)
UPDATE carrito 
SET cantidad = cantidad + 1 
WHERE iduser = @test_user_id AND idproducto = 1;

-- Ver resultado
SELECT * FROM carrito WHERE iduser = @test_user_id AND idproducto = 1;

-- 8. Decrementar cantidad (simula POST /carrito/:userId/decrement/:productId)
UPDATE carrito 
SET cantidad = cantidad - 1 
WHERE iduser = @test_user_id AND idproducto = 2;

-- Ver resultado
SELECT * FROM carrito WHERE iduser = @test_user_id AND idproducto = 2;

-- 9. Actualizar cantidad directamente (simula PUT /carrito/:userId/quantity/:productId)
UPDATE carrito 
SET cantidad = 5 
WHERE iduser = @test_user_id AND idproducto = 1;

-- Ver resultado
SELECT * FROM carrito WHERE iduser = @test_user_id;

-- 10. Eliminar producto del carrito (cuando cantidad = 0)
DELETE FROM carrito 
WHERE iduser = @test_user_id AND idproducto = 2;

-- 11. Limpiar carrito completo
DELETE FROM carrito WHERE iduser = @test_user_id;

-- Verificar que está vacío
SELECT * FROM carrito WHERE iduser = @test_user_id;

-- =========================================
-- PRUEBAS DE INTEGRIDAD
-- =========================================

-- Intentar agregar producto que no existe (debería fallar por foreign key)
-- INSERT INTO carrito (iduser, idproducto, cantidad) VALUES (@test_user_id, 9999, 1);

-- Intentar duplicar producto (debería fallar por unique constraint)
-- INSERT INTO carrito (iduser, idproducto, cantidad) VALUES (@test_user_id, 1, 1);
-- INSERT INTO carrito (iduser, idproducto, cantidad) VALUES (@test_user_id, 1, 1);

PRINT 'Pruebas completadas exitosamente!';
