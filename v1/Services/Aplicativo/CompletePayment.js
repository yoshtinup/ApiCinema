export class CompletePayment {
  constructor(pagoRepository, carritoRepository, paymentService) {
    this.pagoRepository = pagoRepository;
    this.carritoRepository = carritoRepository;
    this.paymentService = paymentService;
  }

  /**
   * Completa un pago después de validar con MercadoPago
   * @param {Object} paymentData - Datos del pago
   * @param {string} paymentData.payment_id - ID del pago en MercadoPago (REQUERIDO)
   * @param {string} paymentData.user_id - ID del usuario
   * @param {string} paymentData.nfc - Código NFC (opcional)
   * @returns {Promise<Object>} Orden creada
   */
  async execute(paymentData) {
    const { payment_id, user_id, nfc } = paymentData;

    try {
      // 1. VALIDAR PARÁMETROS
      if (!payment_id) {
        throw new Error('payment_id es requerido');
      }

      if (!user_id) {
        throw new Error('user_id es requerido');
      }

      console.log(`💳 Procesando pago ${payment_id} para usuario ${user_id}`);

      // 2. VALIDAR PAGO EN MERCADOPAGO
      console.log('🔍 Validando pago en MercadoPago...');
      const paymentInfo = await this.paymentService.validatePayment(payment_id);

      // Verificar que el pago esté aprobado
      if (paymentInfo.status !== 'approved') {
        const statusMessages = {
          'pending': 'El pago está pendiente de confirmación',
          'in_process': 'El pago está en proceso',
          'rejected': 'El pago fue rechazado',
          'cancelled': 'El pago fue cancelado',
          'refunded': 'El pago fue reembolsado',
          'charged_back': 'El pago fue contracargado'
        };

        throw new Error(
          statusMessages[paymentInfo.status] || 
          `El pago no está aprobado (estado: ${paymentInfo.status})`
        );
      }

      console.log('✅ Pago validado y aprobado');

      // 3. VERIFICAR QUE NO EXISTA YA UNA ORDEN CON ESTE PAYMENT_ID
      console.log('🔍 Verificando si ya existe orden con payment_id:', payment_id);
      const existingOrder = await this.pagoRepository.findOrderByPaymentId(payment_id);
      if (existingOrder) {
        console.log('⚠️⚠️⚠️ DUPLICADO DETECTADO - Ya existe una orden para este pago');
        console.log('   Order ID existente:', existingOrder.order_id);
        console.log('   Payment ID:', payment_id);
        console.log('   Timestamp:', new Date().toISOString());
        console.log('🛡️ BLOQUEANDO creación de orden duplicada');
        return {
          order: existingOrder,
          message: 'Esta orden ya fue procesada anteriormente',
          duplicate: true
        };
      }

      console.log('✅ No hay orden duplicada, continuando...');

      // 4. OBTENER ITEMS DEL CARRITO
      console.log('🛒 Obteniendo items del carrito...');
      const cartItems = await this.carritoRepository.getCartItemsByUserId(user_id);

      if (!cartItems || cartItems.length === 0) {
        throw new Error('El carrito está vacío');
      }

      // 5. VALIDAR QUE EL MONTO DEL PAGO COINCIDA CON EL TOTAL DEL CARRITO
      const cartTotal = cartItems.reduce((sum, item) => 
        sum + (parseFloat(item.precio) * parseInt(item.cantidad)), 0
      );

      const paymentAmount = parseFloat(paymentInfo.transaction_amount);
      const tolerance = 0.01; // Tolerancia de 1 centavo por redondeos

      if (Math.abs(paymentAmount - cartTotal) > tolerance) {
        console.error('❌ Monto del pago no coincide:', {
          payment_amount: paymentAmount,
          cart_total: cartTotal,
          difference: Math.abs(paymentAmount - cartTotal)
        });
        throw new Error(
          `El monto del pago ($${paymentAmount}) no coincide con el total del carrito ($${cartTotal.toFixed(2)})`
        );
      }

      console.log('✅ Monto validado correctamente');

      // 6. PREPARAR ITEMS PARA LA ORDEN
      const orderItems = cartItems.map(item => ({
        product_id: item.idproducto,
        name: item.nombre,
        price: parseFloat(item.precio),
        quantity: parseInt(item.cantidad),
        subtotal: parseFloat(item.precio) * parseInt(item.cantidad),
        no_apartado: item.no_apartado || 0
      }));

      // 7. CREAR LA ORDEN
      console.log('📝 Creando orden...');
      const orderData = {
        user_id,
        items: orderItems,
        total: cartTotal,
        status: 'paid',
        payment_id: payment_id,
        payment_status: 'approved',
        payment_method: paymentInfo.payment_method_id || 'mercadopago',
        external_reference: paymentInfo.external_reference || null,
        nfc: nfc || null
      };

      const savedOrder = await this.pagoRepository.createOrder(orderData);

      console.log('✅ Orden creada:', savedOrder.order_id);

      // 8. LIMPIAR EL CARRITO
      console.log('🧹 Limpiando carrito...');
      await this.carritoRepository.clearUserCart(user_id);

      console.log('✅ Pago completado exitosamente');

      return {
        order: savedOrder,
        message: 'Pago procesado y orden creada exitosamente',
        duplicate: false
      };

    } catch (error) {
      console.error('❌ Error en CompletePayment:', error);
      throw error;
    }
  }
}