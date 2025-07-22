import { UpdateOrderStatusByNFC } from '../../../Aplicativo/UpdateOrderStatusByNFC.js';

// Mock del repositorio para testing
class MockPagoRepository {
  constructor() {
    this.mockOrder = {
      id: 1,
      order_id: '550e8400-e29b-41d4-a716-446655440000',
      user_id: 'user123',
      total: 150.75,
      status: 'paid',
      nfc: 'ABC123',
      items: [{ id: 1, quantity: 2 }],
      created_at: new Date().toISOString()
    };
  }

  async findOrderByNFC(nfc) {
    if (nfc === 'ABC123') {
      return this.mockOrder;
    }
    return null;
  }

  async updateOrderStatus(orderId, newStatus) {
    if (orderId === this.mockOrder.order_id) {
      return { ...this.mockOrder, status: newStatus };
    }
    throw new Error('Order not found');
  }
}

// Función de test simple
async function testUpdateOrderStatusByNFC() {
  console.log('🧪 Testing UpdateOrderStatusByNFC...\n');

  const mockRepository = new MockPagoRepository();
  const useCase = new UpdateOrderStatusByNFC(mockRepository);

  try {
    // Test 1: Actualización exitosa
    console.log('✅ Test 1: Actualización de paid -> dispensed');
    const result1 = await useCase.execute('ABC123', 'dispensed');
    console.log('Result:', JSON.stringify(result1, null, 2));
    console.log('');

    // Test 2: NFC no encontrado
    console.log('❌ Test 2: NFC no encontrado');
    try {
      await useCase.execute('INVALID_NFC', 'dispensed');
    } catch (error) {
      console.log('Expected error:', error.message);
    }
    console.log('');

    // Test 3: Status inválido
    console.log('❌ Test 3: Status inválido');
    try {
      await useCase.execute('ABC123', 'invalid_status');
    } catch (error) {
      console.log('Expected error:', error.message);
    }
    console.log('');

    // Test 4: Transición de estado inválida
    console.log('❌ Test 4: Transición de estado inválida (dispensed -> pending)');
    try {
      // Cambiar el status mock a dispensed primero
      mockRepository.mockOrder.status = 'dispensed';
      await useCase.execute('ABC123', 'pending');
    } catch (error) {
      console.log('Expected error:', error.message);
    }

    console.log('\n✅ Todos los tests completados');

  } catch (error) {
    console.error('❌ Error en test:', error.message);
  }
}

// Ejecutar test si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testUpdateOrderStatusByNFC();
}

export { testUpdateOrderStatusByNFC };
