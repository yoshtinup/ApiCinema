// Script para crear una cuenta de administrador
// Ejecutar con: node create-admin-account.js

const BASE_URL = 'https://apiempresacinesnack.acstree.xyz/api/v1';
// const BASE_URL = 'http://localhost:3002/api/v1'; // Para desarrollo local

async function createAdminAccount() {
  console.log('👑 Creando cuenta de administrador...\n');

  // Datos del administrador
  const adminData = {
    nombre: 'Administrador Cinema',
    email: 'admin@cinema.com',
    telefono: '+525551234567',
    password: 'admin123', // Cambiar por una contraseña segura
    nfc_id: 'ADMIN_CINEMA_001'
  };

  try {
    console.log('📝 Datos del administrador a crear:');
    console.log('Nombre:', adminData.nombre);
    console.log('Email:', adminData.email);
    console.log('Teléfono:', adminData.telefono);
    console.log('NFC ID:', adminData.nfc_id);
    console.log('');

    // Verificar si el endpoint de registro existe
    console.log('🔄 Registrando administrador...');
    
    const response = await fetch(`${BASE_URL}/client`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData)
    });

    const result = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Response:`, JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ ¡Cuenta de administrador creada exitosamente!');
      console.log('\n🔑 Credenciales de acceso:');
      console.log(`📧 Email: ${adminData.email}`);
      console.log(`🔒 Password: ${adminData.password}`);
      console.log(`💳 NFC: ${adminData.nfc_id}`);
      console.log(`📱 Teléfono: ${adminData.telefono}`);
      
      console.log('\n📝 Guarda estas credenciales en un lugar seguro!');
      
      // Si la respuesta incluye un ID, mostrarlo
      if (result.id) {
        console.log(`🆔 ID del usuario: ${result.id}`);
      }
      
    } else {
      console.log('\n❌ Error creando cuenta de administrador');
      
      if (result.error && result.error.includes('email')) {
        console.log('⚠️  Parece que ya existe un usuario con este email');
        console.log('💡 Intenta con un email diferente o usa las credenciales existentes');
      }
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('1. Verificar que el servidor esté corriendo');
    console.log('2. Verificar la URL del servidor');
    console.log('3. Verificar que el endpoint /client esté disponible');
  }
}

async function testLogin() {
  console.log('🔐 Probando login con las credenciales de admin...\n');
  
  const loginData = {
    email: 'admin@cinema.com',
    telefono: '+525551234567' // O el campo que uses para login
  };

  try {
    console.log('🔄 Intentando login...');
    
    // Probar con el endpoint de verificación de login
    const response = await fetch(`${BASE_URL}/client/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    const result = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Response:`, JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ ¡Login exitoso!');
      
      if (result.token) {
        console.log(`🎫 Token: ${result.token}`);
        console.log('💾 Guarda este token para hacer requests autenticados');
      }
    } else {
      console.log('\n❌ Error en login');
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

async function checkExistingUsers() {
  console.log('👥 Verificando usuarios existentes...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/client`);
    const users = await response.json();
    
    if (response.ok && Array.isArray(users)) {
      console.log(`✅ Encontrados ${users.length} usuarios:`);
      
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.nombre || 'Sin nombre'}`);
        console.log(`   📧 Email: ${user.email || 'Sin email'}`);
        console.log(`   📱 Teléfono: ${user.telefono || 'Sin teléfono'}`);
        console.log(`   💳 NFC: ${user.nfc_id || 'Sin NFC'}`);
        console.log(`   📅 Creado: ${user.created_at || 'Sin fecha'}`);
      });
      
      // Buscar posibles admins
      const possibleAdmins = users.filter(user => 
        user.email?.toLowerCase().includes('admin') ||
        user.nombre?.toLowerCase().includes('admin') ||
        user.nfc_id?.toLowerCase().includes('admin')
      );
      
      if (possibleAdmins.length > 0) {
        console.log('\n🔑 Posibles cuentas de admin encontradas:');
        possibleAdmins.forEach(admin => {
          console.log(`- ${admin.nombre} (${admin.email})`);
        });
      }
      
    } else {
      console.log('❌ No se pudieron obtener los usuarios');
      console.log('Response:', JSON.stringify(users, null, 2));
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

// Mostrar opciones disponibles
console.log('🎯 Gestión de Cuenta de Administrador');
console.log('=====================================');
console.log('Opciones disponibles:');
console.log('1. Crear admin: node create-admin-account.js create');
console.log('2. Probar login: node create-admin-account.js login');
console.log('3. Ver usuarios: node create-admin-account.js users');
console.log('');

const action = process.argv[2];

if (action === 'create') {
  createAdminAccount();
} else if (action === 'login') {
  testLogin();
} else if (action === 'users') {
  checkExistingUsers();
} else {
  console.log('❌ Opción inválida. Usa "create", "login" o "users"');
  console.log('\n💡 Ejemplo: node create-admin-account.js create');
}
