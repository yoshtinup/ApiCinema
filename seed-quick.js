// seed-quick.js - Simple database seeder
import { db } from './database/mysql.js';
import signale from 'signale';

// Generate a random date between start and end
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate a test order
function generateTestOrder(index) {
  const statuses = ['pending', 'paid', 'dispensed', 'cancelled'];
  const status = Math.random() < 0.8 ? 'dispensed' : statuses[Math.floor(Math.random() * statuses.length)];
  
  const orderDate = randomDate(new Date(2024, 0, 1), new Date(2025, 6, 31));
  const userId = (Math.floor(Math.random() * 11) + 1).toString();
  const orderId = `ORD-TEST-${index}-${Date.now()}`;
  
  // Create 1-2 items
  const items = [
    {
      product_id: Math.floor(Math.random() * 5) + 1,
      quantity: Math.floor(Math.random() * 3) + 1,
      price: Math.floor(Math.random() * 30) + 20
    }
  ];
  
  // Maybe add a second item
  if (Math.random() > 0.5) {
    items.push({
      product_id: Math.floor(Math.random() * 5) + 1,
      quantity: Math.floor(Math.random() * 3) + 1,
      price: Math.floor(Math.random() * 30) + 20
    });
  }
  
  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return {
    order_id: orderId,
    user_id: userId,
    items: JSON.stringify(items),
    total,
    status,
    created_at: orderDate.toISOString().slice(0, 19).replace('T', ' '),
    dispenser_id: 'Dispensador_001'
  };
}

// Insert orders into database
async function seedDatabase(count = 50) {
  try {
    signale.info(`Starting to seed ${count} test orders...`);
    
    for (let i = 0; i < count; i++) {
      const order = generateTestOrder(i);
      
      const sql = `
        INSERT INTO orders 
        (order_id, user_id, items, total, status, created_at, dispenser_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      await db.query(sql, [
        order.order_id,
        order.user_id,
        order.items,
        order.total,
        order.status,
        order.created_at,
        order.dispenser_id
      ]);
      
      if (i % 10 === 0) {
        signale.success(`Added ${i} orders`);
      }
    }
    
    signale.success(`Successfully added ${count} test orders`);
  } catch (error) {
    signale.error(`Error seeding database: ${error.message}`);
  }
}

// Run the seeder
seedDatabase(100);
