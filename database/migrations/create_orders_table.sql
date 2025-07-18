CREATE TABLE IF NOT EXISTS orders (
  id INT NOT NULL AUTO_INCREMENT,
  order_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  items JSON NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('pending','paid','dispensed','cancelled') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL,
  dispenser_id VARCHAR(36),
  PRIMARY KEY (id),
  UNIQUE KEY order_id (order_id),
  CONSTRAINT fk_orders_dispenser FOREIGN KEY (dispenser_id) REFERENCES dispensador(dispenser_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
