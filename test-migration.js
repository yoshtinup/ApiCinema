import mysql from 'mysql2/promise';

async function testDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: '54.81.156.5',
      user: 'yosh2',
      password: 'yosh1234',
      database: 'basecine'
    });

    console.log('✅ Connected to database');

    // Check if payment_id column exists now
    const [columns] = await connection.execute('DESCRIBE orders');
    const hasPaymentId = columns.some(col => col.Field === 'payment_id');
    const hasPaymentStatus = columns.some(col => col.Field === 'payment_status');
    const hasExternalRef = columns.some(col => col.Field === 'external_reference');

    console.log('💳 Payment fields status:');
    console.log('  - payment_id:', hasPaymentId ? '✅' : '❌');
    console.log('  - payment_status:', hasPaymentStatus ? '✅' : '❌');
    console.log('  - external_reference:', hasExternalRef ? '✅' : '❌');

    if (!hasPaymentId) {
      console.log('🔧 Trying to add payment_id column...');
      await connection.execute('ALTER TABLE orders ADD COLUMN payment_id VARCHAR(255) NULL');
      console.log('✅ Added payment_id column');
    }

    if (!hasPaymentStatus) {
      console.log('🔧 Trying to add payment_status column...');
      await connection.execute("ALTER TABLE orders ADD COLUMN payment_status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending'");
      console.log('✅ Added payment_status column');
    }

    if (!hasExternalRef) {
      console.log('🔧 Trying to add external_reference column...');
      await connection.execute('ALTER TABLE orders ADD COLUMN external_reference VARCHAR(255) NULL');
      console.log('✅ Added external_reference column');
    }

    // Final check
    const [finalColumns] = await connection.execute('DESCRIBE orders');
    console.log('📋 Final orders table structure:');
    console.table(finalColumns);

    await connection.end();
    console.log('✅ Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDatabase();
