import { SendMessageUseCase } from "../../../../v1/Services/Aplicativo/SendMessageUseCase";

describe('SendMessageUseCase', () => {
  let mockMessageService;
  let sendMessageUseCase;

  beforeEach(() => {
    mockMessageService = {
      sendMessage: jest.fn(),
    };
    sendMessageUseCase = new SendMessageUseCase(mockMessageService);
  });

  it('debería ejecutar el servicio de mensajes con los parámetros correctos', async () => {
    const to = '+1234567890';
    const body = 'Este es un mensaje de prueba';
    mockMessageService.sendMessage.mockResolvedValue('SM1234567890');

    const messageId = await sendMessageUseCase.execute(to, body);

    expect(mockMessageService.sendMessage).toHaveBeenCalledWith(to, body);
    expect(messageId).toBe('SM1234567890');
  });

  it('debería lanzar un error si el servicio de mensajes falla', async () => {
    mockMessageService.sendMessage.mockRejectedValue(new Error('Error del servicio de mensajes'));

    const to = '+1234567890';
    const body = 'Este es un mensaje de prueba';

    await expect(sendMessageUseCase.execute(to, body)).rejects.toThrow('Error del servicio de mensajes');
  });
});
