-- Tabla para almacenar las órdenes seleccionadas por cada NFC
-- Esto permite que cada usuario tenga una orden "cargada" en su NFC

CREATE TABLE IF NOT EXISTS nfc_selected_orders (
  id INT NOT NULL AUTO_INCREMENT,
  nfc VARCHAR(255) NOT NULL,
  order_id VARCHAR(36) NOT NULL,
  selected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dispenser_id VARCHAR(36) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_nfc (nfc),
  KEY idx_order_id (order_id),
  CONSTRAINT fk_nfc_selected_orders_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_nfc_selected_orders_dispenser FOREIGN KEY (dispenser_id) REFERENCES dispensador(dispenser_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
