import { CreatePaymentUseCase } from "../../../../v1/Services/Aplicativo/CreatePaymentUseCase";

describe('CreatePaymentUseCase', () => {
  let servicesRepositoryMock;
  let createPaymentUseCase;

  beforeEach(() => {
    // Crear un mock del repositorio de servicios
    servicesRepositoryMock = {
      createPaymentPreference: jest.fn()
    };

    // Crear una instancia del caso de uso con el mock del repositorio
    createPaymentUseCase = new CreatePaymentUseCase(servicesRepositoryMock);
  });

  it('debería crear una preferencia de pago exitosamente', async () => {
    // Datos de prueba
    const item = {
      title: 'Producto de prueba',
      quantity: 1,
      price: 100
    };

    const paymentPreferenceResponse = {
      id: 'pref123',
      init_point: 'https://www.mercadopago.com/init'
    };

    // Mockear que el método createPaymentPreference resuelva correctamente
    servicesRepositoryMock.createPaymentPreference.mockResolvedValue(paymentPreferenceResponse);

    // Ejecutar el caso de uso
    const result = await createPaymentUseCase.execute(item);

    // Verificar que se llamó al método createPaymentPreference con el argumento correcto
    expect(servicesRepositoryMock.createPaymentPreference).toHaveBeenCalledWith(item);

    // Verificar que el resultado es el esperado
    expect(result).toEqual(paymentPreferenceResponse);
  });

  it('debería lanzar un error cuando falle la creación de la preferencia de pago', async () => {
    // Datos de prueba
    const item = {
      title: 'Producto de prueba',
      quantity: 1,
      price: 100
    };

    const errorMessage = 'Error al crear la preferencia de pago';

    // Mockear que el método createPaymentPreference rechace con un error
    servicesRepositoryMock.createPaymentPreference.mockRejectedValue(new Error(errorMessage));

    // Esperar que la promesa se rechace
    await expect(createPaymentUseCase.execute(item)).rejects.toThrow(errorMessage);
  });
});
