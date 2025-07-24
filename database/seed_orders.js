/**
 * Script to generate test order data for analytics testing
 * This creates additional orders with varied dates, products, and user IDs
 */

import { db } from './mysql.js';
import signale from 'signale';

// Existing product and user IDs based on the database
const PRODUCT_IDS = [1, 2, 3, 4, 5]; // 1:Coca Cola, 2:Vuala, 3:Skwintles, 4:Hershey, 5:Doritos
const USER_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const DISPENSER_ID = 'Dispensador_001';
const STATUS_IDS = [1, 2, 3, 4]; // 1:Pendiente, 2:En proceso, 3:Completado, 4:Cancelado

/**
 * Generate a random date within a specific range
 */
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generate a random order
 */
function generateRandomOrder() {
  // Get random user and product
  const userId = USER_IDS[Math.floor(Math.random() * USER_IDS.length)].toString();
  
  // Generate a UUID for order_id
  const orderId = 'ORD-' + Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
  
  // Generate random date between Jan 2024 and July 2025
  const orderDate = randomDate(new Date(2024, 0, 1), new Date(2025, 6, 31));
  
  // Generate random quantity between 1 and 3 for each product
  const items = [];
  const productCount = Math.floor(Math.random() * 2) + 1; // 1-2 different products
  
  let total = 0;
  for (let i = 0; i < productCount; i++) {
    const productId = PRODUCT_IDS[Math.floor(Math.random() * PRODUCT_IDS.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const price = (Math.floor(Math.random() * 30) + 20);
    
    items.push({
      product_id: productId,
      quantity: quantity,
      price: price
    });
    
    total += price * quantity;
  }
  
  // Choose a status with 80% being 'dispensed'
  const statusOptions = ['pending', 'paid', 'dispensed', 'cancelled'];
  const status = Math.random() < 0.8 ? 'dispensed' : statusOptions[Math.floor(Math.random() * statusOptions.length)];
  
  return {
    orderId,
    userId,
    items: JSON.stringify(items),
    total,
    status,
    createdAt: orderDate.toISOString().slice(0, 19).replace('T', ' '), // YYYY-MM-DD HH:MM:SS format
    dispenserId: DISPENSER_ID
  };
}

/**
 * Insert generated orders into the database
 */
async function seedOrders(count) {
  signale.info(`Starting to generate ${count} orders...`);
  
  try {
    for (let i = 0; i < count; i++) {
      const order = generateRandomOrder();
      const sql = `
        INSERT INTO orders 
        (order_id, user_id, items, total, status, created_at, dispenser_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      await db.query(sql, [
        order.orderId, 
        order.userId,
        order.items,
        order.total,
        order.status,
        order.createdAt,
        order.dispenserId
      ]);
      
      if (i % 10 === 0) {
        signale.success(`Inserted ${i} orders so far...`);
      }
    }
    
    signale.success(`Successfully inserted ${count} orders!`);
  } catch (error) {
    signale.error('Error inserting orders:', error);
  }
}

// Execute the seeding function with 100 additional orders
seedOrders(100);
