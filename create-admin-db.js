// Script para crear admin directo en base de datos
// Ejecutar con: node create-admin-db.js

import mysql from 'mysql2/promise';

// Configuración de la base de datos
const dbConfig = {
  host: '54.81.156.5',
  user: 'yosh2',
  password: 'yosh1234',
  database: 'basecine'
};

async function createAdminDirectly() {
  console.log('👑 Creando administrador directamente en base de datos...\n');
  
  let connection;
  
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a la base de datos');

    // Datos del administrador
    const adminData = {
      nombre: 'Admin Cinema',
      email: 'admin@cinema.com',
      telefono: '+525551234567',
      nfc_id: 'ADMIN_001'
    };

    // Verificar si ya existe un usuario con este email
    const [existingUsers] = await connection.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [adminData.email]
    );

    if (existingUsers.length > 0) {
      console.log('⚠️  Ya existe un usuario con este email:');
      console.table(existingUsers);
      
      console.log('\n🔄 Actualizando usuario existente...');
      await connection.execute(
        'UPDATE usuarios SET nombre = ?, telefono = ?, nfc_id = ?, updated_at = NOW() WHERE email = ?',
        [adminData.nombre, adminData.telefono, adminData.nfc_id, adminData.email]
      );
      
      console.log('✅ Usuario actualizado exitosamente');
    } else {
      // Crear nuevo usuario
      console.log('🔄 Creando nuevo usuario administrador...');
      const [result] = await connection.execute(
        'INSERT INTO usuarios (nombre, email, telefono, nfc_id, created_at) VALUES (?, ?, ?, ?, NOW())',
        [adminData.nombre, adminData.email, adminData.telefono, adminData.nfc_id]
      );

      console.log('✅ Usuario administrador creado exitosamente');
      console.log(`🆔 ID del nuevo usuario: ${result.insertId}`);
    }

    // Mostrar el usuario creado/actualizado
    const [adminUser] = await connection.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [adminData.email]
    );

    console.log('\n👑 Datos del administrador:');
    console.table(adminUser);

    console.log('\n🔑 Credenciales para usar:');
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`📱 Teléfono: ${adminData.telefono}`);
    console.log(`💳 NFC: ${adminData.nfc_id}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

async function listAllUsers() {
  console.log('👥 Listando todos los usuarios...\n');
  
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a la base de datos');

    const [users] = await connection.execute(
      'SELECT id, nombre, email, telefono, nfc_id, created_at FROM usuarios ORDER BY created_at DESC'
    );

    if (users.length === 0) {
      console.log('❌ No hay usuarios registrados');
    } else {
      console.log(`📋 Total de usuarios: ${users.length}`);
      console.table(users);
      
      // Buscar posibles admins
      const admins = users.filter(user => 
        user.email?.toLowerCase().includes('admin') ||
        user.nombre?.toLowerCase().includes('admin') ||
        user.nfc_id?.toLowerCase().includes('admin')
      );
      
      if (admins.length > 0) {
        console.log('\n🔑 Cuentas de administrador encontradas:');
        console.table(admins);
      }
    }

    // Mostrar estadísticas
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as users_last_week,
        COUNT(CASE WHEN nfc_id IS NOT NULL THEN 1 END) as users_with_nfc
      FROM usuarios
    `);
    
    console.log('\n📊 Estadísticas:');
    console.table(stats);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function testDatabaseConnection() {
  console.log('🔌 Probando conexión a la base de datos...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión exitosa');
    
    // Verificar tabla usuarios
    const [tables] = await connection.execute('SHOW TABLES LIKE "usuarios"');
    if (tables.length > 0) {
      console.log('✅ Tabla usuarios encontrada');
      
      // Mostrar estructura de la tabla
      const [columns] = await connection.execute('DESCRIBE usuarios');
      console.log('\n📋 Estructura de la tabla usuarios:');
      console.table(columns);
    } else {
      console.log('❌ Tabla usuarios no encontrada');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

async function debugFrontendError() {
  console.log('🐛 Debugging error de frontend...\n');
  
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a la base de datos');

    // Verificar estructura de dispensador
    const [dispensadorColumns] = await connection.execute('DESCRIBE dispensador');
    console.log('\n📋 Estructura tabla dispensador:');
    console.table(dispensadorColumns);

    // Ver registros existentes
    const [dispensadores] = await connection.execute('SELECT * FROM dispensador LIMIT 5');
    console.log('\n🏪 Dispensadores existentes:');
    if (dispensadores.length > 0) {
      console.table(dispensadores);
    } else {
      console.log('❌ No hay dispensadores registrados');
    }

    // Mostrar ejemplo de datos válidos para crear dispensador
    console.log('\n💡 Ejemplo de datos válidos para crear dispensador:');
    const ejemploDispensador = {
      dispenser_id: 'DISP_001',
      location: 'Cinema Lobby',
      status: 'online',
      products: JSON.stringify([
        { id: 1, name: 'Coca Cola', price: 25.00, stock: 10 },
        { id: 2, name: 'Palomitas', price: 45.00, stock: 5 }
      ]),
      last_maintenance: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    
    console.table([ejemploDispensador]);

    console.log('\n🔍 Campos que pueden causar error de .replace():');
    console.log('- dispenser_id: debe ser string, no undefined');
    console.log('- location: debe ser string, no undefined');
    console.log('- products: debe ser JSON válido');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Mostrar opciones
console.log('🎯 Gestión de Admin - Base de Datos Directa');
console.log('==========================================');
console.log('Opciones disponibles:');
console.log('1. Crear admin: node create-admin-db.js create');
console.log('2. Listar usuarios: node create-admin-db.js list');
console.log('3. Probar conexión: node create-admin-db.js test');
console.log('4. Debug frontend error: node create-admin-db.js debug');
console.log('');

const action = process.argv[2];

if (action === 'create') {
  createAdminDirectly();
} else if (action === 'list') {
  listAllUsers();
} else if (action === 'test') {
  testDatabaseConnection();
} else if (action === 'debug') {
  debugFrontendError();
} else {
  console.log('❌ Opción inválida. Usa "create", "list", "test" o "debug"');
  console.log('\n💡 Ejemplo: node create-admin-db.js debug');
}
