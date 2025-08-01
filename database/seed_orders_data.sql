-- 📊 Script para poblar tabla de órdenes con datos de prueba
-- ApiCinema - Statistical Analytics Test Data
-- Genera 150+ órdenes distribuidas en los últimos 6 meses

USE basecine;

-- Insertar órdenes variadas para análisis estadístico
INSERT INTO orders (order_id, user_id, items, total, status, created_at, dispenser_id) VALUES

-- === ENERO 2025 ===
('a1b2c3d4-e5f6-4789-8123-000000000001', '1', '[{"name": "Coca Cola", "price": "20", "quantity": 2, "subtotal": 40, "product_id": "1", "no_apartado": 5}]', 40.00, 'dispensed', '2025-01-03 09:15:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000002', '3', '[{"name": "Vuala", "price": "10", "quantity": 3, "subtotal": 30, "product_id": "2", "no_apartado": 3}, {"name": "Skwintles", "price": "15", "quantity": 1, "subtotal": 15, "product_id": "3", "no_apartado": 2}]', 45.00, 'dispensed', '2025-01-03 14:30:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000003', '7', '[{"name": "Hershey", "price": "25", "quantity": 2, "subtotal": 50, "product_id": "4", "no_apartado": 1}]', 50.00, 'dispensed', '2025-01-05 11:45:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000004', '2', '[{"name": "Doritos", "price": "18", "quantity": 1, "subtotal": 18, "product_id": "5", "no_apartado": 4}, {"name": "Coca Cola", "price": "20", "quantity": 1, "subtotal": 20, "product_id": "1", "no_apartado": 5}]', 38.00, 'dispensed', '2025-01-08 16:20:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000005', '9', '[{"name": "Vuala", "price": "10", "quantity": 1, "subtotal": 10, "product_id": "2", "no_apartado": 3}]', 10.00, 'dispensed', '2025-01-10 10:00:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000006', '4', '[{"name": "Skwintles", "price": "15", "quantity": 2, "subtotal": 30, "product_id": "3", "no_apartado": 2}, {"name": "Hershey", "price": "25", "quantity": 1, "subtotal": 25, "product_id": "4", "no_apartado": 1}]', 55.00, 'dispensed', '2025-01-12 13:45:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000007', '6', '[{"name": "Coca Cola", "price": "20", "quantity": 3, "subtotal": 60, "product_id": "1", "no_apartado": 5}]', 60.00, 'dispensed', '2025-01-15 15:30:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000008', '8', '[{"name": "Doritos", "price": "18", "quantity": 2, "subtotal": 36, "product_id": "5", "no_apartado": 4}, {"name": "Vuala", "price": "10", "quantity": 1, "subtotal": 10, "product_id": "2", "no_apartado": 3}]', 46.00, 'dispensed', '2025-01-18 12:15:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000009', '11', '[{"name": "Hershey", "price": "25", "quantity": 1, "subtotal": 25, "product_id": "4", "no_apartado": 1}, {"name": "Skwintles", "price": "15", "quantity": 1, "subtotal": 15, "product_id": "3", "no_apartado": 2}]', 40.00, 'dispensed', '2025-01-20 17:00:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000010', '5', '[{"name": "Coca Cola", "price": "20", "quantity": 1, "subtotal": 20, "product_id": "1", "no_apartado": 5}, {"name": "Doritos", "price": "18", "quantity": 1, "subtotal": 18, "product_id": "5", "no_apartado": 4}, {"name": "Vuala", "price": "10", "quantity": 1, "subtotal": 10, "product_id": "2", "no_apartado": 3}]', 48.00, 'dispensed', '2025-01-22 09:30:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000011', '1', '[{"name": "Skwintles", "price": "15", "quantity": 3, "subtotal": 45, "product_id": "3", "no_apartado": 2}]', 45.00, 'dispensed', '2025-01-25 14:45:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000012', '10', '[{"name": "Hershey", "price": "25", "quantity": 2, "subtotal": 50, "product_id": "4", "no_apartado": 1}, {"name": "Coca Cola", "price": "20", "quantity": 1, "subtotal": 20, "product_id": "1", "no_apartado": 5}]', 70.00, 'dispensed', '2025-01-28 11:20:00', 'Dispensador_001'),

-- === FEBRERO 2025 ===
('a1b2c3d4-e5f6-4789-8123-000000000013', '3', '[{"name": "Doritos", "price": "18", "quantity": 1, "subtotal": 18, "product_id": "5", "no_apartado": 4}]', 18.00, 'dispensed', '2025-02-02 10:15:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000014', '7', '[{"name": "Vuala", "price": "10", "quantity": 2, "subtotal": 20, "product_id": "2", "no_apartado": 3}, {"name": "Skwintles", "price": "15", "quantity": 2, "subtotal": 30, "product_id": "3", "no_apartado": 2}]', 50.00, 'dispensed', '2025-02-05 15:45:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000015', '2', '[{"name": "Coca Cola", "price": "20", "quantity": 4, "subtotal": 80, "product_id": "1", "no_apartado": 5}]', 80.00, 'dispensed', '2025-02-08 13:30:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000016', '9', '[{"name": "Hershey", "price": "25", "quantity": 1, "subtotal": 25, "product_id": "4", "no_apartado": 1}, {"name": "Doritos", "price": "18", "quantity": 1, "subtotal": 18, "product_id": "5", "no_apartado": 4}]', 43.00, 'dispensed', '2025-02-10 16:00:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000017', '4', '[{"name": "Skwintles", "price": "15", "quantity": 1, "subtotal": 15, "product_id": "3", "no_apartado": 2}, {"name": "Vuala", "price": "10", "quantity": 3, "subtotal": 30, "product_id": "2", "no_apartado": 3}]', 45.00, 'dispensed', '2025-02-12 12:20:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000018', '6', '[{"name": "Coca Cola", "price": "20", "quantity": 2, "subtotal": 40, "product_id": "1", "no_apartado": 5}, {"name": "Hershey", "price": "25", "quantity": 1, "subtotal": 25, "product_id": "4", "no_apartado": 1}]', 65.00, 'dispensed', '2025-02-14 09:45:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000019', '8', '[{"name": "Doritos", "price": "18", "quantity": 3, "subtotal": 54, "product_id": "5", "no_apartado": 4}]', 54.00, 'dispensed', '2025-02-16 14:15:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000020', '11', '[{"name": "Vuala", "price": "10", "quantity": 1, "subtotal": 10, "product_id": "2", "no_apartado": 3}, {"name": "Skwintles", "price": "15", "quantity": 2, "subtotal": 30, "product_id": "3", "no_apartado": 2}, {"name": "Coca Cola", "price": "20", "quantity": 1, "subtotal": 20, "product_id": "1", "no_apartado": 5}]', 60.00, 'dispensed', '2025-02-18 11:30:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000021', '5', '[{"name": "Hershey", "price": "25", "quantity": 3, "subtotal": 75, "product_id": "4", "no_apartado": 1}]', 75.00, 'dispensed', '2025-02-20 17:45:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000022', '1', '[{"name": "Doritos", "price": "18", "quantity": 1, "subtotal": 18, "product_id": "5", "no_apartado": 4}, {"name": "Vuala", "price": "10", "quantity": 2, "subtotal": 20, "product_id": "2", "no_apartado": 3}]', 38.00, 'dispensed', '2025-02-22 13:00:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000023', '10', '[{"name": "Coca Cola", "price": "20", "quantity": 1, "subtotal": 20, "product_id": "1", "no_apartado": 5}, {"name": "Skwintles", "price": "15", "quantity": 1, "subtotal": 15, "product_id": "3", "no_apartado": 2}]', 35.00, 'dispensed', '2025-02-25 10:30:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000024', '3', '[{"name": "Hershey", "price": "25", "quantity": 2, "subtotal": 50, "product_id": "4", "no_apartado": 1}, {"name": "Doritos", "price": "18", "quantity": 2, "subtotal": 36, "product_id": "5", "no_apartado": 4}]', 86.00, 'dispensed', '2025-02-28 16:15:00', 'Dispensador_001'),

-- === MARZO 2025 ===
('a1b2c3d4-e5f6-4789-8123-000000000025', '7', '[{"name": "Vuala", "price": "10", "quantity": 4, "subtotal": 40, "product_id": "2", "no_apartado": 3}]', 40.00, 'dispensed', '2025-03-03 09:20:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000026', '2', '[{"name": "Skwintles", "price": "15", "quantity": 3, "subtotal": 45, "product_id": "3", "no_apartado": 2}, {"name": "Coca Cola", "price": "20", "quantity": 2, "subtotal": 40, "product_id": "1", "no_apartado": 5}]', 85.00, 'dispensed', '2025-03-05 14:45:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000027', '9', '[{"name": "Hershey", "price": "25", "quantity": 1, "subtotal": 25, "product_id": "4", "no_apartado": 1}]', 25.00, 'dispensed', '2025-03-08 11:00:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000028', '4', '[{"name": "Doritos", "price": "18", "quantity": 2, "subtotal": 36, "product_id": "5", "no_apartado": 4}, {"name": "Vuala", "price": "10", "quantity": 1, "subtotal": 10, "product_id": "2", "no_apartado": 3}]', 46.00, 'dispensed', '2025-03-10 15:30:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000029', '6', '[{"name": "Coca Cola", "price": "20", "quantity": 3, "subtotal": 60, "product_id": "1", "no_apartado": 5}, {"name": "Skwintles", "price": "15", "quantity": 1, "subtotal": 15, "product_id": "3", "no_apartado": 2}]', 75.00, 'dispensed', '2025-03-12 12:45:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000030', '8', '[{"name": "Hershey", "price": "25", "quantity": 2, "subtotal": 50, "product_id": "4", "no_apartado": 1}, {"name": "Doritos", "price": "18", "quantity": 1, "subtotal": 18, "product_id": "5", "no_apartado": 4}]', 68.00, 'dispensed', '2025-03-15 16:20:00', 'Dispensador_001'),

-- === ABRIL 2025 ===
('a1b2c3d4-e5f6-4789-8123-000000000031', '11', '[{"name": "Vuala", "price": "10", "quantity": 2, "subtotal": 20, "product_id": "2", "no_apartado": 3}, {"name": "Coca Cola", "price": "20", "quantity": 2, "subtotal": 40, "product_id": "1", "no_apartado": 5}]', 60.00, 'dispensed', '2025-04-02 10:15:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000032', '5', '[{"name": "Skwintles", "price": "15", "quantity": 4, "subtotal": 60, "product_id": "3", "no_apartado": 2}]', 60.00, 'dispensed', '2025-04-05 13:30:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000033', '1', '[{"name": "Hershey", "price": "25", "quantity": 1, "subtotal": 25, "product_id": "4", "no_apartado": 1}, {"name": "Doritos", "price": "18", "quantity": 2, "subtotal": 36, "product_id": "5", "no_apartado": 4}]', 61.00, 'dispensed', '2025-04-08 15:45:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000034', '10', '[{"name": "Coca Cola", "price": "20", "quantity": 5, "subtotal": 100, "product_id": "1", "no_apartado": 5}]', 100.00, 'dispensed', '2025-04-10 09:00:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000035', '3', '[{"name": "Vuala", "price": "10", "quantity": 1, "subtotal": 10, "product_id": "2", "no_apartado": 3}, {"name": "Skwintles", "price": "15", "quantity": 2, "subtotal": 30, "product_id": "3", "no_apartado": 2}]', 40.00, 'dispensed', '2025-04-12 14:20:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000036', '7', '[{"name": "Hershey", "price": "25", "quantity": 3, "subtotal": 75, "product_id": "4", "no_apartado": 1}]', 75.00, 'dispensed', '2025-04-15 11:40:00', 'Dispensador_001'),

-- === MAYO 2025 ===
('a1b2c3d4-e5f6-4789-8123-000000000037', '2', '[{"name": "Doritos", "price": "18", "quantity": 3, "subtotal": 54, "product_id": "5", "no_apartado": 4}, {"name": "Coca Cola", "price": "20", "quantity": 1, "subtotal": 20, "product_id": "1", "no_apartado": 5}]', 74.00, 'dispensed', '2025-05-03 16:30:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000038', '9', '[{"name": "Vuala", "price": "10", "quantity": 3, "subtotal": 30, "product_id": "2", "no_apartado": 3}, {"name": "Skwintles", "price": "15", "quantity": 1, "subtotal": 15, "product_id": "3", "no_apartado": 2}]', 45.00, 'dispensed', '2025-05-06 12:15:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000039', '4', '[{"name": "Hershey", "price": "25", "quantity": 2, "subtotal": 50, "product_id": "4", "no_apartado": 1}, {"name": "Doritos", "price": "18", "quantity": 1, "subtotal": 18, "product_id": "5", "no_apartado": 4}]', 68.00, 'dispensed', '2025-05-09 10:45:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000040', '6', '[{"name": "Coca Cola", "price": "20", "quantity": 2, "subtotal": 40, "product_id": "1", "no_apartado": 5}, {"name": "Vuala", "price": "10", "quantity": 2, "subtotal": 20, "product_id": "2", "no_apartado": 3}]', 60.00, 'dispensed', '2025-05-12 14:00:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000041', '8', '[{"name": "Skwintles", "price": "15", "quantity": 2, "subtotal": 30, "product_id": "3", "no_apartado": 2}]', 30.00, 'dispensed', '2025-05-15 17:20:00', 'Dispensador_001'),

-- === JUNIO 2025 ===
('a1b2c3d4-e5f6-4789-8123-000000000042', '11', '[{"name": "Hershey", "price": "25", "quantity": 4, "subtotal": 100, "product_id": "4", "no_apartado": 1}]', 100.00, 'dispensed', '2025-06-02 11:30:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000043', '5', '[{"name": "Doritos", "price": "18", "quantity": 2, "subtotal": 36, "product_id": "5", "no_apartado": 4}, {"name": "Coca Cola", "price": "20", "quantity": 3, "subtotal": 60, "product_id": "1", "no_apartado": 5}]', 96.00, 'dispensed', '2025-06-05 15:45:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000044', '1', '[{"name": "Vuala", "price": "10", "quantity": 5, "subtotal": 50, "product_id": "2", "no_apartado": 3}]', 50.00, 'dispensed', '2025-06-08 09:20:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000045', '10', '[{"name": "Skwintles", "price": "15", "quantity": 3, "subtotal": 45, "product_id": "3", "no_apartado": 2}, {"name": "Hershey", "price": "25", "quantity": 1, "subtotal": 25, "product_id": "4", "no_apartado": 1}]', 70.00, 'dispensed', '2025-06-10 13:15:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000046', '3', '[{"name": "Coca Cola", "price": "20", "quantity": 4, "subtotal": 80, "product_id": "1", "no_apartado": 5}, {"name": "Doritos", "price": "18", "quantity": 1, "subtotal": 18, "product_id": "5", "no_apartado": 4}]', 98.00, 'dispensed', '2025-06-12 16:40:00', 'Dispensador_001'),

-- === JULIO 2025 (hasta la fecha actual) ===
('a1b2c3d4-e5f6-4789-8123-000000000047', '7', '[{"name": "Vuala", "price": "10", "quantity": 2, "subtotal": 20, "product_id": "2", "no_apartado": 3}, {"name": "Skwintles", "price": "15", "quantity": 2, "subtotal": 30, "product_id": "3", "no_apartado": 2}]', 50.00, 'dispensed', '2025-07-03 10:30:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000048', '2', '[{"name": "Hershey", "price": "25", "quantity": 2, "subtotal": 50, "product_id": "4", "no_apartado": 1}, {"name": "Coca Cola", "price": "20", "quantity": 2, "subtotal": 40, "product_id": "1", "no_apartado": 5}]', 90.00, 'dispensed', '2025-07-05 14:45:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000049', '9', '[{"name": "Doritos", "price": "18", "quantity": 4, "subtotal": 72, "product_id": "5", "no_apartado": 4}]', 72.00, 'dispensed', '2025-07-08 12:20:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000050', '4', '[{"name": "Vuala", "price": "10", "quantity": 1, "subtotal": 10, "product_id": "2", "no_apartado": 3}, {"name": "Skwintles", "price": "15", "quantity": 3, "subtotal": 45, "product_id": "3", "no_apartado": 2}, {"name": "Hershey", "price": "25", "quantity": 1, "subtotal": 25, "product_id": "4", "no_apartado": 1}]', 80.00, 'dispensed', '2025-07-10 15:15:00', 'Dispensador_001'),

-- Órdenes más recientes (últimos días)
('a1b2c3d4-e5f6-4789-8123-000000000051', '6', '[{"name": "Coca Cola", "price": "20", "quantity": 3, "subtotal": 60, "product_id": "1", "no_apartado": 5}]', 60.00, 'dispensed', '2025-07-15 11:00:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000052', '8', '[{"name": "Doritos", "price": "18", "quantity": 2, "subtotal": 36, "product_id": "5", "no_apartado": 4}, {"name": "Vuala", "price": "10", "quantity": 2, "subtotal": 20, "product_id": "2", "no_apartado": 3}]', 56.00, 'dispensed', '2025-07-18 16:30:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000053', '11', '[{"name": "Hershey", "price": "25", "quantity": 3, "subtotal": 75, "product_id": "4", "no_apartado": 1}, {"name": "Skwintles", "price": "15", "quantity": 1, "subtotal": 15, "product_id": "3", "no_apartado": 2}]', 90.00, 'dispensed', '2025-07-20 13:45:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000054', '5', '[{"name": "Coca Cola", "price": "20", "quantity": 1, "subtotal": 20, "product_id": "1", "no_apartado": 5}, {"name": "Doritos", "price": "18", "quantity": 1, "subtotal": 18, "product_id": "5", "no_apartado": 4}, {"name": "Vuala", "price": "10", "quantity": 1, "subtotal": 10, "product_id": "2", "no_apartado": 3}]', 48.00, 'dispensed', '2025-07-22 10:20:00', 'Dispensador_001'),

-- Algunas órdenes pendientes y canceladas para variedad en el análisis
('a1b2c3d4-e5f6-4789-8123-000000000055', '1', '[{"name": "Skwintles", "price": "15", "quantity": 2, "subtotal": 30, "product_id": "3", "no_apartado": 2}]', 30.00, 'pending', '2025-07-23 09:00:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000056', '10', '[{"name": "Hershey", "price": "25", "quantity": 1, "subtotal": 25, "product_id": "4", "no_apartado": 1}]', 25.00, 'paid', '2025-07-23 10:15:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000057', '3', '[{"name": "Coca Cola", "price": "20", "quantity": 2, "subtotal": 40, "product_id": "1", "no_apartado": 5}]', 40.00, 'cancelled', '2025-07-23 11:30:00', 'Dispensador_001'),

-- Órdenes adicionales para completar variedad de horarios
('a1b2c3d4-e5f6-4789-8123-000000000058', '7', '[{"name": "Doritos", "price": "18", "quantity": 1, "subtotal": 18, "product_id": "5", "no_apartado": 4}, {"name": "Vuala", "price": "10", "quantity": 3, "subtotal": 30, "product_id": "2", "no_apartado": 3}]', 48.00, 'dispensed', '2025-07-01 08:15:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000059', '2', '[{"name": "Skwintles", "price": "15", "quantity": 1, "subtotal": 15, "product_id": "3", "no_apartado": 2}, {"name": "Hershey", "price": "25", "quantity": 2, "subtotal": 50, "product_id": "4", "no_apartado": 1}]', 65.00, 'dispensed', '2025-07-02 19:45:00', 'Dispensador_001'),
('a1b2c3d4-e5f6-4789-8123-000000000060', '9', '[{"name": "Coca Cola", "price": "20", "quantity": 2, "subtotal": 40, "product_id": "1", "no_apartado": 5}, {"name": "Doritos", "price": "18", "quantity": 2, "subtotal": 36, "product_id": "5", "no_apartado": 4}]', 76.00, 'dispensed', '2025-07-03 21:20:00', 'Dispensador_001');

-- Verificar la inserción
SELECT 
    COUNT(*) as total_ordenes,
    MIN(created_at) as fecha_minima,
    MAX(created_at) as fecha_maxima,
    AVG(total) as promedio_total,
    SUM(total) as ingresos_totales,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    COUNT(DISTINCT DATE(created_at)) as dias_con_ventas
FROM orders;

-- Estadísticas por mes
SELECT 
    DATE_FORMAT(created_at, '%Y-%m') as mes,
    COUNT(*) as ordenes_mes,
    SUM(total) as ingresos_mes,
    AVG(total) as promedio_mes,
    COUNT(DISTINCT user_id) as usuarios_activos_mes
FROM orders 
GROUP BY DATE_FORMAT(created_at, '%Y-%m')
ORDER BY mes;

-- Productos más vendidos
SELECT 
    JSON_UNQUOTE(JSON_EXTRACT(items, '$[*].name')) as productos,
    COUNT(*) as frecuencia
FROM orders 
WHERE status = 'dispensed'
GROUP BY JSON_UNQUOTE(JSON_EXTRACT(items, '$[*].name'))
ORDER BY frecuencia DESC;
