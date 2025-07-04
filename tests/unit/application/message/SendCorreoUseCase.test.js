import { SendCorreoUseCase } from "../../../../v1/Services/Aplicativo/SendCorreoUseCase";

describe('SendCorreoUseCase', () => {
  let mockServicesRepository;
  let sendCorreoUseCase;

  // Se ejecuta antes de cada prueba para inicializar los mocks y la clase a probar
  beforeEach(() => {
    // Crear un mock para el repositorio
    mockServicesRepository = {
      sendCorreo: jest.fn() // mock de la función sendCorreo
    };
    // Crear una instancia de SendCorreoUseCase con el mock del repositorio
    sendCorreoUseCase = new SendCorreoUseCase(mockServicesRepository);
  });

  it('debería enviar un correo con los parámetros correctos', async () => {
    // Datos de prueba
    const to = 'correo@ejemplo.com';
    const body = 'Este es el cuerpo del mensaje';

    // Simular el retorno de sendCorreo en el mock
    mockServicesRepository.sendCorreo.mockResolvedValue('message-id-123');

    // Ejecutar el caso de uso
    const result = await sendCorreoUseCase.execute(to, body);

    // Verificar que el método sendCorreo haya sido llamado con los parámetros correctos
    expect(mockServicesRepository.sendCorreo).toHaveBeenCalledWith(to, body);

    // Verificar que el resultado sea el esperado
    expect(result).toBe('message-id-123');
  });

  it('debería lanzar un error si sendCorreo falla', async () => {
    // Datos de prueba
    const to = 'correo@ejemplo.com';
    const body = 'Este es el cuerpo del mensaje';

    // Simular un error en el mock
    mockServicesRepository.sendCorreo.mockRejectedValue(new Error('Error al enviar el correo'));

    // Verificar que la ejecución de la función lanza el error esperado
    await expect(sendCorreoUseCase.execute(to, body)).rejects.toThrow('Error al enviar el correo');
  });
});
