import { db } from './database/mysql.js';

console.log('🔄 Testing improved database connection...');

async function simpleTest() {
    try {
        // Test 1: Simple count query
        console.log('📊 Test 1: Count orders...');
        const result = await db.query('SELECT COUNT(*) as count FROM orders');
        console.log('✅ Total orders:', result[0][0].count);
        
        // Test 2: Query with parameters
        console.log('📋 Test 2: Query with parameters...');
        const paramResult = await db.query('SELECT COUNT(*) as count FROM orders WHERE status = ?', ['dispensed']);
        console.log('✅ Dispensed orders:', paramResult[0][0].count);
        
        // Test 3: Analytics-style query
        console.log('🔬 Test 3: Analytics query...');
        const analyticsResult = await db.query(`
            SELECT 
                o.order_id as id,
                o.total as amount,
                COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o.items, '$[0].quantity')), 1) as quantity
            FROM orders o 
            WHERE o.status = ? 
            LIMIT 2
        `, ['dispensed']);
        
        console.log('✅ Analytics results:');
        analyticsResult[0].forEach(row => {
            console.log(`  - ${row.id}: $${row.amount} (qty: ${row.quantity})`);
        });
        
        console.log('🎉 All tests passed!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('📋 Error details:', error);
        process.exit(1);
    }
}

simpleTest();
