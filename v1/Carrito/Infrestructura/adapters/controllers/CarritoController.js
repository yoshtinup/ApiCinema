import { GetCarritoById } from "../../../Aplicativo/GetCarritoById.js";
import { GetAllCarrito } from "../../../Aplicativo/GetAllCarrito.js";
import { CreateCarrito} from "../../../Aplicativo/CreateCarrito.js";
import { UpdateCarritoById } from "../../../Aplicativo/UpdateCarritoById.js";
import { DeleteCarritoById } from "../../../Aplicativo/DeleteCarritoById.js";


export class CarritoController {
  constructor(productoRepository) {
    this.repository = productoRepository;
    this.getHistoryByIdUseCase = new GetCarritoById(productoRepository);
    this.getAllHistoryUseCase = new GetAllCarrito(productoRepository);
    this.createBoletoUseCase = new CreateCarrito(productoRepository);
    this.updateHistoryByIdUseCase = new UpdateCarritoById(productoRepository);
    this.deleteHistoryByIdUseCase = new DeleteCarritoById(productoRepository);
  }
  // Método para manejar la solicitud HTTP POST /clients
  async deleteProductoById(req, res) {
    try {
      const { id } = req.params;
      const deleted = await this.deleteHistoryByIdUseCase.execute(id);
      if (deleted) {
        res.status(200).json({ message: 'Client deleted successfully' });
      } else {
        res.status(404).json({ message: 'Client not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async updateProductoById(req, res) {
    try {
      const { id } = req.params;
      const productoData = req.body;
  
      // Validar que los datos estén presentes y no sean undefined o vacíos
      if ( !productoData.iduser || !productoData.idproducto || !productoData.fecha || !productoData.hora) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      // Opcional: puedes agregar validaciones adicionales, por ejemplo, verificar longitud o formato del código, etc.

      // Ejecutar el caso de uso para actualizar el producto
      const updatedProducto = await this.updateHistoryByIdUseCase.execute(id, productoData);

      // Verificar si el producto fue actualizado correctamente
      if (!updatedProducto) {
        return res.status(404).json({ message: 'Producto not found' });
      }
  
      res.status(200).json({ message: 'Producto updated successfully', updatedProducto });
    } catch (error) {
      // Manejo de errores
      res.status(500).json({ message: error.message });
    }
  }
  
  async createProducto(req, res) {
    try {
      // Extraer los campos del cuerpo de la solicitud (body)
      const { iduser, idproducto, fecha, hora } = req.body;

      // Crear el objeto que será pasado al caso de uso para crear el boleto
      const productoData = {
        iduser: iduser,
        idproducto: idproducto,
        fecha: fecha,
        hora: hora
      };
  
      // Ejecutar el caso de uso para crear el boleto
      const newBoleto = await this.createBoletoUseCase.execute(productoData);
  
      // Enviar la respuesta con el boleto creado
      res.status(201).json(newBoleto);
    } catch (error) {
      // En caso de error, responder con el mensaje de error
      res.status(500).json({ message: error.message });
    }
  }
  

  async getProductoById(req, res) {
    try {
      const { id } = req.params;
      const client = await this.getHistoryByIdUseCase.execute(id);
      if (client) {
        res.status(200).json(client);
      } else {
        res.status(404).json({ message: 'Client not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async getAllProducto(req, res) {
    try {
      const history = await this.getAllHistoryUseCase.execute();
      res.status(200).json(history);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Obtener carrito completo de un usuario con detalles de productos
  async getCartByUserId(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ 
          success: false,
          message: 'userId es requerido' 
        });
      }

      const cartItems = await this.repository.getCartItemsByUserId(userId);
      
      // Calcular total del carrito
      const total = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
      
      res.status(200).json({
        success: true,
        data: {
          items: cartItems,
          total: total.toFixed(2),
          itemCount: cartItems.length,
          totalQuantity: cartItems.reduce((sum, item) => sum + item.cantidad, 0)
        }
      });
    } catch (error) {
      console.error('Error getting cart:', error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  // Incrementar cantidad de un producto
  async incrementQuantity(req, res) {
    try {
      const { userId, productId } = req.params;
      
      if (!userId || !productId) {
        return res.status(400).json({ 
          success: false,
          message: 'userId y productId son requeridos' 
        });
      }

      const result = await this.repository.incrementQuantity(userId, productId);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error incrementing quantity:', error);
      
      if (error.message === 'Cart item not found') {
        return res.status(404).json({ 
          success: false,
          message: 'Producto no encontrado en el carrito' 
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  // Decrementar cantidad de un producto
  async decrementQuantity(req, res) {
    try {
      const { userId, productId } = req.params;
      
      if (!userId || !productId) {
        return res.status(400).json({ 
          success: false,
          message: 'userId y productId son requeridos' 
        });
      }

      const result = await this.repository.decrementQuantity(userId, productId);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error decrementing quantity:', error);
      
      if (error.message === 'Cart item not found') {
        return res.status(404).json({ 
          success: false,
          message: 'Producto no encontrado en el carrito' 
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  // Actualizar cantidad directamente
  async updateQuantity(req, res) {
    try {
      const { userId, productId } = req.params;
      const { cantidad } = req.body;
      
      if (!userId || !productId) {
        return res.status(400).json({ 
          success: false,
          message: 'userId y productId son requeridos' 
        });
      }

      if (cantidad === undefined || cantidad < 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Cantidad inválida' 
        });
      }

      const result = await this.repository.updateQuantity(userId, productId, cantidad);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error updating quantity:', error);
      
      if (error.message === 'Cart item not found') {
        return res.status(404).json({ 
          success: false,
          message: 'Producto no encontrado en el carrito' 
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }

}

