import { CreateOrderBase } from "./CreateOrderBase.js";

export class CompletePayment {
  constructor(pagoRepository, carritoRepository) {
    this.pagoRepository = pagoRepository;
    this.carritoRepository = carritoRepository;
    this.createOrderBase = new CreateOrderBase(pagoRepository);
  }

  /**
   * Método para ejecutar la finalización de un pago y crear una orden.
   * @param {Object} paymentData - Datos del pago.
   * @returns {Promise<Order>} - La orden creada.
   */
  async execute(paymentData) {
    const { user_id, dispenser_id, nfc } = paymentData;
    
    try {
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
        status: 'paid',
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