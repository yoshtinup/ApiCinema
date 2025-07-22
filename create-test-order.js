// Script para crear una orden de prueba con NFC
// Ejecutar con: node create-test-order.js

const BASE_URL = 'https://apiempresacinesnack.acstree.xyz/api/v1';
// const BASE_URL = 'http://localhost:3002/api/v1'; // Para desarrollo local

async function createTestOrder() {
  console.log('🔧 Creando orden de prueba con NFC...\n');

  try {
    // Primero, obtener algunos productos para la orden
    console.log('📦 Obteniendo productos disponibles...');
    const productsResponse = await fetch(`${BASE_URL}/producto`);
    const products = await productsResponse.json();
    
    if (!products || products.length === 0) {
      console.log('❌ No hay productos disponibles');
      return;
    }

    console.log(`✅ Encontrados ${products.length} productos`);
    
    // Tomar el primer producto disponible
    const testProduct = products[0];
    console.log(`📝 Usando producto: ${testProduct.nombre} (ID: ${testProduct.id})`);

    // Crear una orden de prueba
    const orderData = {
      user_id: 'test_user_123',
      items: [
        {
          id: testProduct.id,
          nombre: testProduct.nombre,
          precio: testProduct.precio,
          cantidad: 2
        }
      ],
      total: testProduct.precio * 2,
      nfc: 'TEST_NFC_123' // NFC para testing
    };

    console.log('\n🔄 Creando orden...');
    console.log('📝 Datos de la orden:', JSON.stringify(orderData, null, 2));

    // Crear la orden (necesitarás ajustar esto según tu endpoint de creación)
    const createResponse = await fetch(`${BASE_URL}/pago`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    const result = await createResponse.json();
    
    if (createResponse.ok) {
      console.log('✅ Orden creada exitosamente');
      console.log('📋 Respuesta:', JSON.stringify(result, null, 2));
      console.log('\n🎯 Ahora puedes probar el endpoint de actualización con:');
      console.log(`   NFC: TEST_NFC_123`);
      console.log(`   URL: PUT ${BASE_URL}/pago/nfc/TEST_NFC_123/status`);
      console.log(`   Body: {"status": "dispensed"}`);
    } else {
      console.log('❌ Error creando orden:', JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

// Función para probar el endpoint con la orden creada
async function testUpdateStatus() {
  console.log('\n🧪 Probando actualización de status...\n');
  
  const nfc = 'TEST_NFC_123';
  const newStatus = 'dispensed';
  
  try {
    const response = await fetch(`${BASE_URL}/pago/nfc/${nfc}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus })
    });

    const result = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Response:`, JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Status actualizado exitosamente');
    } else {
      console.log('❌ Error actualizando status');
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

// Ejecutar
console.log('Selecciona una opción:');
console.log('1. Crear orden de prueba: node create-test-order.js create');
console.log('2. Probar actualización: node create-test-order.js test');

const action = process.argv[2];

if (action === 'create') {
  createTestOrder();
} else if (action === 'test') {
  testUpdateStatus();
} else {
  console.log('❌ Opción inválida. Usa "create" o "test"');
}
