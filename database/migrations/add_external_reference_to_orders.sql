-- Agregar campo external_reference a la tabla orders
-- Este campo se usa para tracking de pagos de MercadoPago

ALTER TABLE orders 
ADD COLUMN external_reference VARCHAR(255) DEFAULT NULL,
ADD INDEX idx_external_reference (external_reference);
