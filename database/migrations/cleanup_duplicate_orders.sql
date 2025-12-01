-- Script para limpiar órdenes duplicadas
-- EJECUTAR CON CUIDADO - Revisa los duplicados antes de borrar

-- 1. Ver duplicados por external_reference
SELECT 
    external_reference,
    COUNT(*) as cantidad,
    GROUP_CONCAT(order_id) as order_ids,
    GROUP_CONCAT(created_at) as fechas
FROM orders 
WHERE external_reference IS NOT NULL
GROUP BY external_reference 
HAVING COUNT(*) > 1
ORDER BY MAX(created_at) DESC;

-- 2. Ver duplicados por payment_id
SELECT 
    payment_id,
    COUNT(*) as cantidad,
    GROUP_CONCAT(order_id) as order_ids,
    GROUP_CONCAT(created_at) as fechas
FROM orders 
WHERE payment_id IS NOT NULL
GROUP BY payment_id 
HAVING COUNT(*) > 1
ORDER BY MAX(created_at) DESC;

-- 3. SOLO SI QUIERES LIMPIAR - Mantener solo la primera orden de cada external_reference
-- DESCOMENTA LAS SIGUIENTES LÍNEAS DESPUÉS DE REVISAR LOS DUPLICADOS:

/*
DELETE o1 FROM orders o1
INNER JOIN orders o2 
WHERE 
    o1.external_reference = o2.external_reference
    AND o1.external_reference IS NOT NULL
    AND o1.id > o2.id;  -- Mantener la orden con ID más pequeño (primera creada)
*/

-- 4. Después de limpiar, agregar el índice único:
-- ALTER TABLE orders ADD UNIQUE KEY unique_external_reference (external_reference);
