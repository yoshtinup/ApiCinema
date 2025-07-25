
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
  async createPayment(item, orderId = null, payerInfo = null) {
    try {
      const preference = new Preference(this.mpClient);
      
      // Generar una referencia externa única si no se proporciona orderId
      const externalReference = orderId || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Información del comprador con valores por defecto si no se proporciona
      const defaultPayer = {
        first_name: "Cliente",
        last_name: "CineSnacks",
        email: "cliente@cinesnacks.com",
        phone: {
          area_code: "55",
          number: "1234567890"
        },
        identification: {
          type: "RFC",
          number: "XAXX010101000"
        },
        address: {
          street_name: "Calle Principal",
          street_number: 123,
          zip_code: "01000"
        }
      };

      // Usar información del comprador proporcionada o valores por defecto
      const payer = payerInfo ? {
        first_name: payerInfo.first_name || defaultPayer.first_name,
        last_name: payerInfo.last_name || defaultPayer.last_name,
        email: payerInfo.email || defaultPayer.email,
        phone: payerInfo.phone || defaultPayer.phone,
        identification: payerInfo.identification || defaultPayer.identification,
        address: payerInfo.address || defaultPayer.address
      } : defaultPayer;

      // Crear item completo con información requerida por MercadoPago
      const enhancedItem = {
        id: `product_${Date.now()}`, // Campo requerido: items.id
        title: item.title,
        description: item.description || `${item.title} - Producto de CineSnacks`, // Campo requerido: items.description
        category_id: item.category_id || "food", // Campo requerido: items.category_id (para snacks/comida)
        quantity: item.quantity || 1,
        currency_id: "MXN", // Peso mexicano
        unit_price: Number(item.unit_price)
      };

      const response = await preference.create({
        body: {
          items: [enhancedItem],
          external_reference: externalReference, // Importante para rastrear la orden
          
          // Campo para evitar contracargos - aparece en estado de cuenta
          statement_descriptor: "CINESNACKS", // Máximo 22 caracteres
          
          // Información del comprador (requerida para mejor aprobación)
          payer: payer,
          
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
            environment: process.env.NODE_ENV || 'development',
            store: "CineSnacks"
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
