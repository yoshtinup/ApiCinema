import { db } from './database/mysql.js';

async function testDatabase() {
    try {
        console.log('🔍 Testing database connection and data...');
        
        // Test basic connection
        const result = await db.query('SELECT COUNT(*) as count FROM orders', []);
        console.log('📊 Total orders:', result[0][0].count);
        
        // Test orders with dispensed status
        const dispensedResult = await db.query('SELECT COUNT(*) as count FROM orders WHERE status = ?', ['dispensed']);
        console.log('✅ Dispensed orders:', dispensedResult[0][0].count);
        
        // Test sample data
        const sampleResult = await db.query('SELECT order_id, total, status, created_at FROM orders LIMIT 5', []);
        console.log('📋 Sample orders:');
        sampleResult[0].forEach(order => {
            console.log(`  - ${order.order_id}: $${order.total} (${order.status}) - ${order.created_at}`);
        });
        
        // Test the analytics query
        const analyticsQuery = `
          SELECT 
            o.order_id as id,
            o.total as amount,
            COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o.items, '$[0].quantity')), 1) as quantity,
            o.status,
            o.created_at,
            o.user_id,
            JSON_UNQUOTE(JSON_EXTRACT(o.items, '$[0].name')) as product_name
          FROM orders o
          WHERE o.status = 'dispensed'
          LIMIT 3
        `;
        
        const analyticsResult = await db.query(analyticsQuery, []);
        console.log('🔬 Analytics query test:');
        analyticsResult[0].forEach(row => {
            console.log(`  - ID: ${row.id}, Amount: ${row.amount}, Qty: ${row.quantity}, Product: ${row.product_name}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        process.exit(1);
    }
}

testDatabase();
