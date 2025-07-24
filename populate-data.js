import { db } from './database/mysql.js';
import fs from 'fs';
import signale from 'signale';

async function insertTestData() {
  try {
    signale.info('🔄 Iniciando inserción de datos de prueba...');
    
    // Leer el archivo SQL
    const sqlScript = fs.readFileSync('./database/seed_orders_data.sql', 'utf8');
    
    // Dividir en statements individuales (separados por ;)
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('SELECT'))
      .filter(stmt => stmt.toUpperCase().startsWith('INSERT'));

    signale.info(`📊 Encontrados ${statements.length} statements de inserción`);

    // Ejecutar cada INSERT individualmente
    let insertedRows = 0;
    for (const statement of statements) {
      try {
        const result = await db.query(statement + ';');
        insertedRows += result[0].affectedRows || 1;
      } catch (error) {
        console.warn(`⚠️ Error en statement (puede ser duplicado):`, error.message.substring(0, 100));
      }
    }

    signale.success(`✅ Inserción completada: ${insertedRows} órdenes insertadas`);

    // Verificar la inserción
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM orders');
    const [statsResult] = await db.query(`
      SELECT 
        MIN(created_at) as fecha_minima,
        MAX(created_at) as fecha_maxima,
        AVG(total) as promedio_total,
        SUM(total) as ingresos_totales,
        COUNT(DISTINCT user_id) as usuarios_unicos
      FROM orders
    `);

    signale.info('📈 Estadísticas de la base de datos:');
    console.log(`   • Total órdenes: ${countResult[0].total}`);
    console.log(`   • Fecha mínima: ${statsResult[0].fecha_minima}`);
    console.log(`   • Fecha máxima: ${statsResult[0].fecha_maxima}`);
    console.log(`   • Promedio por orden: $${parseFloat(statsResult[0].promedio_total).toFixed(2)}`);
    console.log(`   • Ingresos totales: $${parseFloat(statsResult[0].ingresos_totales).toFixed(2)}`);
    console.log(`   • Usuarios únicos: ${statsResult[0].usuarios_unicos}`);

    signale.success('🎯 Base de datos poblada exitosamente para analytics!');
    signale.info('📊 Puedes probar tu API en: GET /api/v1/statistics/dashboard?period=month');

    process.exit(0);

  } catch (error) {
    signale.error('❌ Error durante la inserción:', error);
    process.exit(1);
  }
}

// Ejecutar el script
insertTestData();
