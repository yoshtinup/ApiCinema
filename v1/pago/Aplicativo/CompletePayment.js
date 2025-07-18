import { Order } from "../Dominio/models/Order.js";

export class CompletePayment {
  constructor(pagoRepository, carritoRepository) {
    this.pagoRepository = pagoRepository;
    this.carritoRepository = carritoRepository;
  }

  /**
   * Método para ejecutar la finalización de un pago y crear una orden.
   * @param {Object} paymentData - Datos del pago.
   * @returns {Promise<Order>} - La orden creada.
   */
  async execute(paymentData) {
    const { user_id, dispenser_id } = paymentData;
    
    try {
      // 1. Obtener los items del carrito del usuario
      const cartItems = await this.carritoRepository.getCartItemsByUserId(user_id);
      
      if (!cartItems || cartItems.length === 0) {
        throw new Error('No items in cart');
      }
      
      // 2. Calcular el total
      let total = 0;
      const items = [];
      
      for (const item of cartItems) {
        // Obtener detalles del producto
        const producto = await this.carritoRepository.getProductDetails(item.idproducto);
        
        if (producto) {
          const itemTotal = producto.precio * item.cantidad || 1;
          total += itemTotal;
          
          items.push({
            product_id: item.idproducto,
            name: producto.nombre,
            price: producto.precio,
            quantity: item.cantidad || 1,
            subtotal: itemTotal
          });
        }
      }
      
      // 3. Crear la orden
      const order = new Order(
        undefined, // Generará un UUID automáticamente
        user_id,
        items,
        total,
        'paid', // El estado es 'paid' porque estamos completando el pago
        undefined, // Usará la fecha actual
        dispenser_id
      );
      
      // 4. Guardar la orden en la base de datos
      const savedOrder = await this.pagoRepository.createOrder(order);
      
      // 5. Opcional: Limpiar el carrito del usuario después de completar el pago
      await this.carritoRepository.clearUserCart(user_id);
      
      return savedOrder;
    } catch (error) {
      console.error('Payment completion error:', error);
      throw new Error(`Error completing payment: ${error.message}`);
    }
  }
}