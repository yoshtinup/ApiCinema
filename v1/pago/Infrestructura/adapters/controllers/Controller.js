import { GetById } from "../../../Aplicativo/GetById.js";
import { GetAll } from "../../../Aplicativo/GetAll.js";
import { Create} from "../../../Aplicativo/Create.js";
import { UpdateById } from "../../../Aplicativo/UpdateById.js";
import { DeleteById } from "../../../Aplicativo/DeleteById.js";
import { GetOrdersByNFC } from "../../../Aplicativo/GetOrdersByNFC.js";


export class Controller {
  constructor(productoRepository) {
    this.getHistoryByIdUseCase = new GetById(productoRepository);
    this.getAllHistoryUseCase = new GetAll(productoRepository);
    this.createBoletoUseCase = new Create(productoRepository);
    this.updateHistoryByIdUseCase = new UpdateById(productoRepository);
    this.deleteHistoryByIdUseCase = new DeleteById(productoRepository);
    this.getOrdersByNFCUseCase = new GetOrdersByNFC(productoRepository);
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
      if ( !productoData.iduser || !productoData.codigo || !productoData.idproducto || !productoData.cantidad) {
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
      const { iduser, idproducto, cantidad, codigo } = req.body;

      // Crear el objeto que será pasado al caso de uso para crear el boleto
      const productoData = {
        iduser: iduser,
        idproducto: idproducto,
        cantidad: cantidad,
        codigo: codigo
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

  async getOrdersByNFC(req, res) {
    try {
      const { nfc } = req.params;
      
      // Validar que el NFC esté presente
      if (!nfc) {
        return res.status(400).json({ message: 'NFC parameter is required' });
      }

      // Ejecutar el caso de uso para obtener las órdenes por NFC
      const orders = await this.getOrdersByNFCUseCase.execute(nfc);
      
      // Si no se encuentran órdenes, devolver un array vacío con mensaje informativo
      if (!orders || orders.length === 0) {
        return res.status(200).json({ 
          message: 'No orders found for this NFC', 
          orders: [] 
        });
      }

      // Devolver las órdenes encontradas
      res.status(200).json({
        message: `Found ${orders.length} order(s) for NFC: ${nfc}`,
        orders: orders
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

}

