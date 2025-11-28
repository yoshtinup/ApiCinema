import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

export class PaymentService {
  constructor() {
    this.client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
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

      // Formatear items para MercadoPago
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

        return {
          id: String(item.idproducto || item.product_id || item.id),
          title: item.nombre || item.name || 'Producto',
          description: item.descripcion || item.description || '',
          quantity: quantity,
          unit_price: unitPrice,
          currency_id: 'MXN',
          // Información adicional del producto
          picture_url: item.imagen || item.image || null,
          category_id: item.categoria || item.category || 'general'
        };
      });

      // Calcular totales
      const subtotal = mpItems.reduce((sum, item) => 
        sum + (item.unit_price * item.quantity), 0
      );

      // Crear preferencia
      const preferenceData = {
        items: mpItems,
        payer: {
          name: 'Cliente',
          email: `user${user_id}@example.com` // En producción, usar email real
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/payment/success`,
          failure: `${process.env.FRONTEND_URL}/payment/failure`,
          pending: `${process.env.FRONTEND_URL}/payment/pending`
        },
        auto_return: 'approved',
        // Metadata para identificar la orden
        external_reference: `USER_${user_id}_${Date.now()}`,
        metadata: {
          user_id: user_id,
          nfc: nfc || null,
          items_count: items.length,
          subtotal: subtotal.toFixed(2)
        },
        notification_url: `${process.env.BACKEND_URL}/api/v1/webhooks/mercadopago`,
        statement_descriptor: 'TU_NEGOCIO', // Cambiar por el nombre de tu negocio
        payment_methods: {
          excluded_payment_types: [],
          installments: 1 // Configurar cuotas permitidas
        }
      };

      console.log('📝 Creando preferencia de MercadoPago:', {
        items: mpItems.length,
        total: subtotal,
        user_id
      });

      const preference = await this.preference.create(preferenceData);

      console.log('✅ Preferencia creada:', preference.id);

      return {
        preference_id: preference.id,
        init_point: preference.init_point, // URL para abrir checkout
        sandbox_init_point: preference.sandbox_init_point,
        items: mpItems,
        total: subtotal
      };

    } catch (error) {
      console.error('❌ Error creando preferencia de MercadoPago:', error);
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