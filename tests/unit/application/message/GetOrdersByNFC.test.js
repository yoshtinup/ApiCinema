import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { GetOrdersByNFC } from '../../../../v1/pago/Aplicativo/GetOrdersByNFC.js';

// Mock del repositorio
class MockPagoRepository {
  constructor() {
    this.orders = [
      {
        id: 1,
        order_id: 'ORD-123',
        user_id: 'user-1',
        items: JSON.stringify([{ name: 'Product 1', quantity: 2 }]),
        total: 25.50,
        status: 'paid',
        created_at: new Date().toISOString(),
        dispenser_id: null
      },
      {
        id: 2,
        order_id: 'ORD-456',
        user_id: 'user-1',
        items: JSON.stringify([{ name: 'Product 2', quantity: 1 }]),
        total: 15.00,
        status: 'pending',
        created_at: new Date().toISOString(),
        dispenser_id: null
      }
    ];
  }

  async getOrdersByNFC(nfc) {
    if (nfc === 'TEST-NFC-123') {
      return this.orders.map(order => ({
        ...order,
        items: JSON.parse(order.items)
      }));
    }
    return [];
  }
}

describe('GetOrdersByNFC Use Case', () => {
  let getOrdersByNFCUseCase;
  let mockRepository;

  beforeEach(() => {
    mockRepository = new MockPagoRepository();
    getOrdersByNFCUseCase = new GetOrdersByNFC(mockRepository);
  });

  it('should return orders for valid NFC', async () => {
    const result = await getOrdersByNFCUseCase.execute('TEST-NFC-123');
    
    expect(result).toHaveLength(2);
    expect(result[0].order_id).toBe('ORD-123');
    expect(result[0].status).toBe('paid');
    expect(result[1].order_id).toBe('ORD-456');
    expect(result[1].status).toBe('pending');
  });

  it('should return empty array for non-existent NFC', async () => {
    const result = await getOrdersByNFCUseCase.execute('NON-EXISTENT-NFC');
    
    expect(result).toHaveLength(0);
  });

  it('should call repository with correct NFC parameter', async () => {
    const spy = jest.spyOn(mockRepository, 'getOrdersByNFC');
    
    await getOrdersByNFCUseCase.execute('TEST-NFC-123');
    
    expect(spy).toHaveBeenCalledWith('TEST-NFC-123');
  });
});
