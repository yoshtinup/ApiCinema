import { MessageRepository } from '../../../../v1/Services/Infrestructura/adapters/Services/MessageRepository';
import twilio from 'twilio';

// Mockear la librería Twilio
jest.mock('twilio', () => {
  return jest.fn(() => ({
    messages: {
      create: jest.fn()
    }
  }));
});

describe('MessageRepository', () => {
  let servicesRepository;

  beforeEach(() => {
    servicesRepository = new MessageRepository();
  });

  describe('sendMessage', () => {
    it('debería enviar un mensaje exitosamente', async () => {
      // Mockear que la función messages.create resuelva correctamente
      const mockMessageSid = 'MSG123';
      servicesRepository.twilioClient.messages.create.mockResolvedValue({
        sid: mockMessageSid,
        body: 'Mensaje de prueba'
      });

      const to = '+529618513478';
      const body = 'Mensaje de prueba';

      const result = await servicesRepository.sendMessage(to, body);
      expect(result).toBe(mockMessageSid);
    });

    it('debería lanzar un error cuando falla el envío del mensaje', async () => {
      // Mockear que la función messages.create arroje un error
      const errorMessage = 'Error de Twilio';
      servicesRepository.twilioClient.messages.create.mockRejectedValue(new Error(errorMessage));

      const to = '+529618513478';
      const body = 'Mensaje de prueba';

      // Esperar que la promesa se rechace
      await expect(servicesRepository.sendMessage(to, body)).rejects.toThrow(
        `Error al enviar el mensaje: ${errorMessage}`
      );
    });
  });
});