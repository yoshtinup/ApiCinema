
import { GetProductoById } from "../../../Aplicativo/GetProductoById.js";
import { GetAllProducto } from "../../../Aplicativo/GetAllProducto.js";
import { CreateProducto } from "../../../Aplicativo/CreateProducto.js";
import { UpdateProductoById } from "../../../Aplicativo/UpdateProductoById.js";
import { DeleteProductoById } from "../../../Aplicativo/DeleteProductoById.js";
import { UpdateApartadoById } from "../../../Aplicativo/UpdateApartadoById.js";
import { S3StorageRepository } from "../../../../Services/Infrestructura/adapters/Services/S3StorageRepository.js";
import { UploadImageUseCase } from "../../../../Services/Aplicativo/UploadImageUseCase.js";
import { DeleteImageUseCase } from "../../../../Services/Aplicativo/DeleteImageUseCase.js";
import multer from 'multer';

export class ProductoController {
  constructor(productoRepository) {
    this.getHistoryByIdUseCase = new GetProductoById(productoRepository);
    this.getAllHistoryUseCase = new GetAllProducto(productoRepository);
    this.createBoletoUseCase = new CreateProducto(productoRepository);
    this.updateHistoryByIdUseCase = new UpdateProductoById(productoRepository);
    this.deleteHistoryByIdUseCase = new DeleteProductoById(productoRepository);
    this.updateApartadoByIdUseCase = new UpdateApartadoById(productoRepository);
    
    // Inicializar servicio S3
    this.storageRepository = new S3StorageRepository();
    this.uploadImageUseCase = new UploadImageUseCase(this.storageRepository);
    this.deleteImageUseCase = new DeleteImageUseCase(this.storageRepository);
  }
  
  /**
   * Configurar multer para manejo de archivos en memoria
   */
  getMulterConfig() {
    const storage = multer.memoryStorage();
    
    const fileFilter = (req, file, cb) => {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
      ];

      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Tipo de archivo no permitido. Solo imágenes: JPEG, PNG, GIF, WEBP'), false);
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
      }
    });
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
  
      // Validar que los datos estén presentes y no sean undefined o vacíos (no_apartado es opcional)
      if ( !productoData.nombre || !productoData.descripcion || !productoData.precio || !productoData.peso || !productoData.cantidad || !productoData.categoria || !productoData.ingreso) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      // Asegurar que no_apartado tenga un valor por defecto si no se proporciona
      if (productoData.no_apartado === undefined || productoData.no_apartado === null) {
        productoData.no_apartado = 0;
      }
      
      // Si se envió un archivo de imagen, subirlo a S3
      if (req.file) {
        console.log('📤 Subiendo nueva imagen a AWS S3...');
        const uploadResult = await this.uploadImageUseCase.execute(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          'productos'
        );
        productoData.imagen = uploadResult.fileUrl;
        console.log('✅ Nueva imagen subida:', productoData.imagen);
      }

      // Ejecutar el caso de uso para actualizar el producto
      const updatedProducto = await this.updateHistoryByIdUseCase.execute(id, productoData);

      // Verificar si el producto fue actualizado correctamente
      if (!updatedProducto) {
        return res.status(404).json({ message: 'Producto not found' });
      }
  
      res.status(200).json({ message: 'Producto updated successfully', updatedProducto });
    } catch (error) {
      // Manejo de errores
      console.error('❌ Error actualizando producto:', error);
      res.status(500).json({ message: error.message });
    }
  }
  
  async createProducto(req, res) {
    try {
      // Extraer los campos del cuerpo de la solicitud (body)
      const { nombre, descripcion, precio, peso, cantidad, categoria, ingreso, no_apartado} = req.body;
      let imagenUrl = req.body.imagen || ''; // URL por defecto si no se sube imagen

      // Si se envió un archivo de imagen, subirlo a S3
      if (req.file) {
        console.log('📤 Subiendo imagen a AWS S3...');
        const uploadResult = await this.uploadImageUseCase.execute(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          'productos' // Carpeta en S3
        );
        imagenUrl = uploadResult.fileUrl; // Usar la URL de S3
        console.log('✅ Imagen subida:', imagenUrl);
      }

      // Crear el objeto que será pasado al caso de uso para crear el producto
      const productoData = {
        nombre: nombre || '',
        descripcion: descripcion || '',
        precio: precio || '0',
        peso: peso || '0',  // Asegurar que peso no esté vacío
        cantidad: cantidad || '0',
        categoria: categoria || '',
        ingreso: ingreso || '',
        imagen: imagenUrl, // URL de S3 o URL proporcionada
        no_apartado: no_apartado || '0'
      };
  
      // Ejecutar el caso de uso para crear el producto
      const newBoleto = await this.createBoletoUseCase.execute(productoData);
  
      // Enviar la respuesta con el producto creado
      res.status(201).json(newBoleto);
    } catch (error) {
      // En caso de error, responder con el mensaje de error
      console.error('❌ Error creando producto:', error);
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

  // Endpoint para actualizar solo el campo no_apartado
  async updateApartado(req, res) {
    try {
      const { id } = req.params;
      const { no_apartado } = req.body;
      
      if (no_apartado === undefined || no_apartado === null) {
        return res.status(400).json({ message: 'El campo no_apartado es requerido' });
      }
      
      const updatedProduct = await this.updateApartadoByIdUseCase.execute(id, no_apartado);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Producto not found' });
      }
      
      res.status(200).json({ 
        message: 'Apartado actualizado correctamente', 
        producto: updatedProduct 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

}

