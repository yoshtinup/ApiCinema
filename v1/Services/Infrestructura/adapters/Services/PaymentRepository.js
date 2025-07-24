
import { IExteriorService } from '../../../Dominio/ports/IExteriorService.js';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export class PaymentRepository extends IExteriorService {
  constructor() {
    super();
    // Para producción, usa el Access Token de producción
    const accessToken = process.env.NODE_ENV === 'production' 
      ? process.env.MP_ACCESS_TOKEN_PROD 
      : process.env.MP_ACCESS_TOKEN;
    
    this.mpClient = new MercadoPagoConfig({ 
      accessToken: accessToken,
      options: {
        timeout: 5000,
      }
    });
  }
  async createPayment(item, orderId = null) {
    try {
      const preference = new Preference(this.mpClient);
      
      // Generar una referencia externa única si no se proporciona orderId
      const externalReference = orderId || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
      const response = await preference.create({
        body: {
          items: [item],
          external_reference: externalReference, // Importante para rastrear la orden
          back_urls: {
            success: "https://cinesnacks.acstree.xyz/payment-success", 
            failure: "https://cinesnacks.acstree.xyz/carrito",
            pending: "https://cinesnacks.acstree.xyz/payment-pending"
          },
          auto_return: "approved",
          // Configuraciones adicionales para producción
          payment_methods: {
            excluded_payment_types: [
              // Puedes excluir métodos de pago específicos si quieres
              // { "id": "ticket" } // Por ejemplo, excluir pagos en efectivo
            ],
            installments: 12 // Máximo de cuotas permitidas
          },
          notification_url: "https://apiempresacinesnack.acstree.xyz/api/v1/payments/webhook",
          // Configuraciones adicionales para debugging
          metadata: {
            order_id: externalReference,
            created_at: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
          }
        }
      });
      
      // Para producción usar init_point, para sandbox usar sandbox_init_point
      const isProduction = process.env.NODE_ENV === 'production';
      
      console.log(`💳 Preferencia creada:`, {
        preference_id: response.id,
        external_reference: externalReference,
        environment: isProduction ? 'production' : 'sandbox'
      });
      
      return {
        init_point: isProduction ? response.init_point : response.sandbox_init_point,
        preference_id: response.id,
        external_reference: externalReference,
        environment: isProduction ? 'production' : 'sandbox'
      };
    } catch (error) {
      console.error('Error creating MercadoPago preference:', error);
      throw new Error(`Error creando preferencia de pago: ${error.message}`);
    }
  }
}
