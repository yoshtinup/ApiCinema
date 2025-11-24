import { CreateOrderBase } from "./CreateOrderBase.js";
import { PaymentRepository } from "../../Services/Infrestructura/adapters/Services/PaymentRepository.js";

export class CompletePayment {
  constructor(pagoRepository, carritoRepository) {
    this.pagoRepository = pagoRepository;
    this.carritoRepository = carritoRepository;
    this.createOrderBase = new CreateOrderBase(pagoRepository);
    this.paymentRepository = new PaymentRepository();
  }

  /**
   * Método para ejecutar la finalización de un pago y crear una orden.
   * IMPORTANTE: Solo crea la orden si el pago en MercadoPago está APROBADO.
   * @param {Object} paymentData - Datos del pago.
   * @param {string} paymentData.user_id - ID del usuario.
   * @param {string} paymentData.dispenser_id - ID del dispensador (opcional).
   * @param {string} paymentData.nfc - Código NFC del usuario (opcional).
   * @param {string} paymentData.payment_id - ID del pago en MercadoPago (REQUERIDO).
   * @returns {Promise<Order>} - La orden creada.
   */
  async execute(paymentData) {
    const { user_id, dispenser_id, nfc, payment_id } = paymentData;
    
    try {
      // 0. VALIDAR QUE EL PAGO FUE EXITOSO EN MERCADOPAGO
      if (!payment_id) {
        throw new Error('payment_id es requerido para completar el pago');
      }

      console.log(`🔍 Validando pago ${payment_id} en MercadoPago...`);
      const paymentInfo = await this.paymentRepository.validatePayment(payment_id);
      
      // Verificar que el pago esté aprobado
      if (paymentInfo.status !== 'approved') {
        const statusMessages = {
          'pending': 'El pago está pendiente de confirmación. Por favor espera.',
          'in_process': 'El pago está en proceso. Por favor espera.',
          'rejected': 'El pago fue rechazado. Por favor intenta con otro método de pago.',
          'cancelled': 'El pago fue cancelado.',
          'refunded': 'El pago fue reembolsado.',
          'charged_back': 'El pago fue contracargado.'
        };
        
        const message = statusMessages[paymentInfo.status] || 
          `El pago no está aprobado (estado: ${paymentInfo.status})`;
        
        console.error(`❌ Pago no aprobado:`, {
          payment_id,
          status: paymentInfo.status,
          status_detail: paymentInfo.status_detail
        });
        
        throw new Error(message);
      }

      console.log(`✅ Pago ${payment_id} validado exitosamente (status: ${paymentInfo.status})`);
      
      // 1. Obtener los items del carrito del usuario
      const cartItems = await this.carritoRepository.getCartItemsByUserId(user_id);
      
      if (!cartItems || cartItems.length === 0) {
        throw new Error('No items in cart');
      }
      
      // 2. Calcular el total y preparar items
      let total = 0;
      const items = [];
      
      for (const item of cartItems) {
        const producto = await this.carritoRepository.getProductDetails(item.idproducto);
        
        if (producto) {
          const itemTotal = producto.precio * item.cantidad || 1;
          total += itemTotal;
          
          items.push({
            product_id: item.idproducto,
            name: producto.nombre,
            price: producto.precio,
            quantity: item.cantidad || 1,
            subtotal: itemTotal,
            no_apartado: producto.no_apartado || 0 // Agregar no_apartado del producto
          });
        }
      }
      
      // 3. Crear la orden usando el caso de uso base
      const orderData = {
        user_id,
        items,
        total,
        status: 'paid', // Solo se llega aquí si el pago está aprobado
        payment_id: payment_id, // Guardar el ID del pago de MercadoPago
        payment_status: 'approved', // Estado del pago en MercadoPago
        dispenser_id,
        nfc
      };
      
      const savedOrder = await this.createOrderBase.execute(orderData);
      
      // 4. Limpiar el carrito del usuario
      await this.carritoRepository.clearUserCart(user_id);
      
      return savedOrder;
    } catch (error) {
      console.error('Payment completion error:', error);
      throw new Error(`Error completing payment: ${error.message}`);
    }
  }
}