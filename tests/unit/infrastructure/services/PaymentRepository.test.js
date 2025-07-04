import { PaymentRepository } from '../../../../v1/Services/Infrestructura/adapters/Services/PaymentRepository';
import { MercadoPagoConfig, Preference } from 'mercadopago';
jest.mock('mercadopago');

describe('PaymentRepository', () => {
  let paymentRepository;
  let mockPreference;

  beforeEach(() => {
    mockPreference = {
      create: jest.fn()
    };
    Preference.mockImplementation(() => mockPreference);
    MercadoPagoConfig.mockImplementation(() => ({}));

    paymentRepository = new PaymentRepository();
  });

  describe('createPaymentPreference', () => {
    it('debería crear una preferencia de pago exitosamente', async () => {
      const item = {
        title: 'Producto de prueba',
        quantity: 1,
        price: 100
      };

      const mockResponse = {
        init_point: 'https://www.mercadopago.com/init',
        sandbox_init_point: 'https://sandbox.mercadopago.com/init'
      };

      mockPreference.create.mockResolvedValue(mockResponse);

      const result = await paymentRepository.createPaymentPreference(item);

      expect(mockPreference.create).toHaveBeenCalledWith({
        body: {
          items: [item],
          back_urls: {
            success: 'https://www.tu-sitio.com/success',
            failure: 'https://www.tu-sitio.com/failure',
            pending: 'https://www.tu-sitio.com/pending'
          },
          auto_return: 'approved'
        }
      });

      expect(result).toEqual({
        init_point: mockResponse.init_point,
        sandbox_init_point: mockResponse.sandbox_init_point
      });
    });

    it('debería lanzar un error cuando falle la creación de la preferencia de pago', async () => {
      const item = {
        title: 'Producto de prueba',
        quantity: 1,
        price: 100
      };

      const errorMessage = 'Error al crear preferencia de pago';
      mockPreference.create.mockRejectedValue(new Error(errorMessage));

      await expect(paymentRepository.createPaymentPreference(item)).rejects.toThrow(
        `Error creando preferencia de pago: ${errorMessage}`
      );
    });
  });
});