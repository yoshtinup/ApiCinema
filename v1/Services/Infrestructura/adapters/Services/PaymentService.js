import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

export class PaymentService {
  constructor() {
    const accessToken = process.env.NODE_ENV === 'production' 
      ? process.env.MP_ACCESS_TOKEN_PROD 
      : process.env.MP_ACCESS_TOKEN;
      
    console.log('🔑 Inicializando PaymentService con token:', accessToken ? 'Token presente' : 'Token faltante');
    
    this.client = new MercadoPagoConfig({
      accessToken: accessToken,
      options: { timeout: 5000 }
    });
    this.preference = new Preference(this.client);
  }

  /**
   * Crea una preferencia de pago con los items del carrito
   * @param {Object} paymentData - Datos del pago
   * @param {string} paymentData.user_id - ID del usuario
   * @param {Array} paymentData.items - Items del carrito
   * @param {string} paymentData.nfc - Código NFC (opcional)
   * @returns {Promise<Object>} Preferencia creada
   */
  async createPreference(paymentData) {
    try {
      const { user_id, items, nfc } = paymentData;

      // Validar items
      if (!items || items.length === 0) {
        throw new Error('El carrito está vacío');
      }

      // Formatear items para MercadoPago - VERSIÓN MINIMALISTA
      const mpItems = items.map(item => {
        // Validar precio y cantidad
        const unitPrice = parseFloat(item.precio || item.price);
        const quantity = parseInt(item.cantidad || item.quantity);

        if (isNaN(unitPrice) || unitPrice <= 0) {
          throw new Error(`Precio inválido para el producto: ${item.nombre || item.name}`);
        }

        if (isNaN(quantity) || quantity <= 0) {
          throw new Error(`Cantidad inválida para el producto: ${item.nombre || item.name}`);
        }

        // SOLO campos REQUERIDOS - sin description ni id temporalmente
        return {
          title: String((item.nombre || item.name || 'Producto')
            .replace(/[^\w\s]/gi, ' ')
            .trim()
            .substring(0, 50)),
          quantity: Number(quantity),
          unit_price: Number(unitPrice),
          currency_id: 'MXN'
        };
      });

      // Calcular totales
      const subtotal = mpItems.reduce((sum, item) => 
        sum + (item.unit_price * item.quantity), 0
      );

      // Crear preferencia - ESTRUCTURA MINIMALISTA
      const preferenceData = {
        items: mpItems,
        back_urls: {
          success: 'https://cinesnacks.chuy7x.space/payment-success',
          failure: 'https://cinesnacks.chuy7x.space/payment-failure',
          pending: 'https://cinesnacks.chuy7x.space/payment-pending'
        },
        auto_return: 'approved'
      };

      console.log('📝 Creando preferencia de MercadoPago:', {
        items_count: mpItems.length,
        total: subtotal.toFixed(2),
        user_id
      });
      
      console.log('🔍 Items a enviar a MercadoPago:', JSON.stringify(mpItems, null, 2));
      console.log('🔍 PreferenceData completo:', JSON.stringify(preferenceData, null, 2));

      // Intentar llamada directa a la API REST de MercadoPago
      console.log('🔧 Intentando llamada HTTP directa a MercadoPago API...');
      const accessToken = process.env.NODE_ENV === 'production' 
        ? process.env.MP_ACCESS_TOKEN_PROD 
        : process.env.MP_ACCESS_TOKEN;
      
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': `${user_id}-${Date.now()}`
        },
        body: JSON.stringify(preferenceData)
      });

      const responseText = await response.text();
      console.log('📡 Status HTTP:', response.status);
      console.log('📡 Response body:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      const preference = JSON.parse(responseText);
      console.log('✅ Preferencia creada (API directa):', preference.id);

      return {
        preference_id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
        items: mpItems,
        total: subtotal
      };

    } catch (error) {
      console.error('❌ Error creando preferencia de MercadoPago:', error);
      console.error('❌ Error completo:', JSON.stringify(error, null, 2));
      if (error.cause) {
        console.error('❌ Causa del error:', JSON.stringify(error.cause, null, 2));
      }
      throw new Error(`Error al crear preferencia de pago: ${error.message}`);
    }
  }

  /**
   * Valida el estado de un pago
   * @param {string} paymentId - ID del pago en MercadoPago
   * @returns {Promise<Object>} Información del pago
   */
  async validatePayment(paymentId) {
    try {
      const payment = new Payment(this.client);
      const paymentInfo = await payment.get({ id: paymentId });

      return {
        id: paymentInfo.id,
        status: paymentInfo.status,
        status_detail: paymentInfo.status_detail,
        transaction_amount: paymentInfo.transaction_amount,
        currency_id: paymentInfo.currency_id,
        date_approved: paymentInfo.date_approved,
        metadata: paymentInfo.metadata,
        external_reference: paymentInfo.external_reference,
        payment_method_id: paymentInfo.payment_method_id
      };

    } catch (error) {
      console.error('❌ Error validando pago:', error);
      throw new Error(`Error al validar pago: ${error.message}`);
    }
  }
}