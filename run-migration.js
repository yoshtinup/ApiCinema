import mysql from 'mysql2/promise';
import fs from 'fs';

async function runMigration() {
  try {
    const connection = await mysql.createConnection({
      host: '54.81.156.5',
      user: 'yosh2',
      password: 'yosh1234',
      database: 'basecine'
    });

    console.log('✅ Connected to database');

    // Check current table structure
    const [columns] = await connection.execute('DESCRIBE orders');
    console.log('📋 Current orders table structure:');
    console.table(columns);

    // Check if payment_id column exists
    const hasPaymentId = columns.some(col => col.Field === 'payment_id');
    console.log('💳 Has payment_id column:', hasPaymentId);

    if (!hasPaymentId) {
      console.log('🔧 Adding payment fields to orders table...');
      
      // Read and execute migration
      const migrationSQL = fs.readFileSync('./database/migrations/add_payment_fields_to_orders.sql', 'utf8');
      
      await connection.execute(migrationSQL);
      console.log('✅ Migration executed successfully');
      
      // Check new structure
      const [newColumns] = await connection.execute('DESCRIBE orders');
      console.log('📋 Updated orders table structure:');
      console.table(newColumns);
    } else {
      console.log('✅ Payment fields already exist');
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runMigration();
