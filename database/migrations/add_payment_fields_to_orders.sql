-- Migración para agregar campos de pago a la tabla orders
-- Ejecutar este SQL si no tienes estos campos en tu tabla orders

ALTER TABLE orders 
ADD COLUMN payment_id VARCHAR(255) NULL,
ADD COLUMN payment_status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
ADD COLUMN external_reference VARCHAR(255) NULL;
