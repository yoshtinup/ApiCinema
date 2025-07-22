// Test script para probar el endpoint de actualización de status por NFC
// Ejecutar con: node test-endpoint.js

const BASE_URL = 'https://apiempresacinesnack.acstree.xyz/api/v1';
// const BASE_URL = 'http://localhost:3002/api/v1'; // Para desarrollo local

async function testEndpoint() {
  console.log('🧪 Probando endpoint de actualización de status por NFC...\n');

  // Test 1: Actualizar a dispensed
  console.log('✅ Test 1: Actualizar orden a "dispensed"');
  await makeRequest('ABC123', 'dispensed');

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Actualizar a cancelled
  console.log('✅ Test 2: Actualizar orden a "cancelled"');
  await makeRequest('ABC123', 'cancelled');

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: NFC no encontrado
  console.log('❌ Test 3: NFC no encontrado');
  await makeRequest('INVALID_NFC', 'dispensed');

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Status inválido
  console.log('❌ Test 4: Status inválido');
  await makeRequest('ABC123', 'invalid_status');

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 5: Sin body
  console.log('❌ Test 5: Sin status en body');
  await makeRequest('ABC123', null);
}

async function makeRequest(nfc, status) {
  try {
    const url = `${BASE_URL}/pago/nfc/${nfc}/status`;
    const body = status ? { status } : {};
    
    console.log(`🔄 Request: PUT ${url}`);
    console.log(`📝 Body:`, JSON.stringify(body, null, 2));

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Response:`, JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Request exitoso');
    } else {
      console.log('❌ Request falló (esperado en algunos casos)');
    }

  } catch (error) {
    console.error('💥 Error en request:', error.message);
  }
}

// Ejecutar tests
testEndpoint().catch(console.error);
