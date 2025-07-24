-- Migración para agregar campos de pago a la tabla orders
-- Ejecutar este SQL si no tienes estos campos en tu tabla orders

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS payment_status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS external_reference VARCHAR(255) NULL,
ADD INDEX idx_payment_id (payment_id),
ADD INDEX idx_payment_status (payment_status),
ADD INDEX idx_external_reference (external_reference);
