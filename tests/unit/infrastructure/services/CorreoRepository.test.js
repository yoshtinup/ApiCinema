import brevo from "@getbrevo/brevo";
import { CorreoRepository } from "../../../../v1/Services/Infrestructura/adapters/Services/CorreoRepository"; // Ajusta la ruta según tu estructura de proyecto


jest.mock('@getbrevo/brevo', () => {
  return {
    TransactionalEmailsApi: jest.fn().mockImplementation(() => ({
      sendTransacEmail: jest.fn(),
      setApiKey: jest.fn()
    })),
    SendSmtpEmail: jest.fn(),
    TransactionalEmailsApiApiKeys: {
      apiKey: 'apiKey' // Simulamos la propiedad apiKey
    }
  };
});

describe('CorreoRepository', () => {
  let correoRepository;
  let mockSendTransacEmail;

  beforeEach(() => {
    // Inicializamos el repositorio y simulamos la llamada a sendTransacEmail
    correoRepository = new CorreoRepository();
    mockSendTransacEmail = correoRepository.apiInstance.sendTransacEmail;

    // Limpiar todos los mocks después de cada prueba
    jest.clearAllMocks();
  });

  it('debería enviar un correo exitosamente y retornar el messageId', async () => {
    // Simulamos que sendTransacEmail retorna un resultado exitoso
    const mockResult = { messageId: '12345' };
    mockSendTransacEmail.mockResolvedValue(mockResult);

    // Parámetros de prueba
    const to = 'destinatario@ejemplo.com';
    const body = 'Este es el contenido del mensaje';
    const subject = 'Asunto de prueba';

    const result = await correoRepository.sendCorreo(to, body, subject);

    // Verificamos que sendTransacEmail haya sido llamado correctamente
    expect(mockSendTransacEmail).toHaveBeenCalledTimes(1);
    expect(mockSendTransacEmail).toHaveBeenCalledWith(expect.objectContaining({
      subject: subject,
      to: [{ email: to, name: to }],
      htmlContent: `<html><body><p>${body}</p></body></html>`
    }));

    // Verificamos que el messageId sea el esperado
    expect(result).toBe('12345');
  });

  it('debería manejar un error al enviar el correo', async () => {
    // Simulamos un error en sendTransacEmail
    mockSendTransacEmail.mockRejectedValue(new Error('Error de envío'));

    // Parámetros de prueba
    const to = 'destinatario@ejemplo.com';
    const body = 'Este es el contenido del mensaje';

    // Verificamos que se lance el error esperado
    await expect(correoRepository.sendCorreo(to, body)).rejects.toThrow('Error al enviar el mensaje: Error de envío');

    // Verificamos que sendTransacEmail haya sido llamado
    expect(mockSendTransacEmail).toHaveBeenCalledTimes(1);
  });
});
