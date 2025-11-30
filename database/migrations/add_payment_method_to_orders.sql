-- Agregar columna payment_method a la tabla orders
-- Esta columna almacena el método de pago usado (visa, mastercard, account_money, etc.)

ALTER TABLE orders 
ADD COLUMN payment_method VARCHAR(50) DEFAULT NULL AFTER payment_status;

-- Verificar los cambios
DESCRIBE orders;
