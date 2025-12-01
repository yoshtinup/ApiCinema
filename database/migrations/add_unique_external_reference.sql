-- Agregar índice único a external_reference para prevenir órdenes duplicadas
-- Esto evita que se creen múltiples órdenes con el mismo external_reference

-- Primero verificar si hay duplicados existentes
SELECT external_reference, COUNT(*) as count 
FROM orders 
WHERE external_reference IS NOT NULL 
GROUP BY external_reference 
HAVING count > 1;

-- Si hay duplicados, este comando fallará. Deberás limpiarlos manualmente primero.
-- Agregar el índice único
ALTER TABLE orders 
ADD UNIQUE KEY unique_external_reference (external_reference);
