import { UploadImageUseCase } from '../../../Aplicativo/UploadImageUseCase.js';
import { DeleteImageUseCase } from '../../../Aplicativo/DeleteImageUseCase.js';
import { GetFileUrlUseCase } from '../../../Aplicativo/GetFileUrlUseCase.js';
import { GetSignedUrlUseCase } from '../../../Aplicativo/GetSignedUrlUseCase.js';
import { S3StorageRepository } from '../Services/S3StorageRepository.js';
import multer from 'multer';

/**
 * Controlador para manejar operaciones de almacenamiento de archivos
 */
export class StorageController {
  constructor() {
    // Inicializar repositorio S3
    this.storageRepository = new S3StorageRepository();
    
    // Inicializar casos de uso
    this.uploadImageUseCase = new UploadImageUseCase(this.storageRepository);
    this.deleteImageUseCase = new DeleteImageUseCase(this.storageRepository);
    this.getFileUrlUseCase = new GetFileUrlUseCase(this.storageRepository);
    this.getSignedUrlUseCase = new GetSignedUrlUseCase(this.storageRepository);
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

  /**
   * Subir una imagen
   * POST /api/v1/storage/upload
   */
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se proporcionó ningún archivo',
          message: 'Debes enviar un archivo en el campo "image"'
        });
      }

      const folder = req.body.folder || 'general';

      const result = await this.uploadImageUseCase.execute(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        folder
      );

      res.status(200).json({
        success: true,
        message: 'Imagen subida exitosamente',
        data: result
      });
    } catch (error) {
      console.error('❌ Error en uploadImage:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Eliminar una imagen
   * DELETE /api/v1/storage/delete
   */
  async deleteImage(req, res) {
    try {
      const { fileKey } = req.body;

      if (!fileKey) {
        return res.status(400).json({
          success: false,
          error: 'fileKey es requerido',
          message: 'Debes proporcionar el fileKey del archivo a eliminar'
        });
      }

      const result = await this.deleteImageUseCase.execute(fileKey);

      res.status(200).json({
        success: true,
        message: 'Imagen eliminada exitosamente',
        data: result
      });
    } catch (error) {
      console.error('❌ Error en deleteImage:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtener URL pública de un archivo
   * GET /api/v1/storage/url
   */
  async getFileUrl(req, res) {
    try {
      const { fileKey } = req.query;

      if (!fileKey) {
        return res.status(400).json({
          success: false,
          error: 'fileKey es requerido',
          message: 'Debes proporcionar el fileKey en los query params'
        });
      }

      const url = await this.getFileUrlUseCase.execute(fileKey);

      res.status(200).json({
        success: true,
        data: {
          fileKey,
          url
        }
      });
    } catch (error) {
      console.error('❌ Error en getFileUrl:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtener URL firmada temporal
   * GET /api/v1/storage/signed-url
   */
  async getSignedUrl(req, res) {
    try {
      const { fileKey, expiresIn } = req.query;

      if (!fileKey) {
        return res.status(400).json({
          success: false,
          error: 'fileKey es requerido',
          message: 'Debes proporcionar el fileKey en los query params'
        });
      }

      const expires = expiresIn ? parseInt(expiresIn) : 3600;
      const signedUrl = await this.getSignedUrlUseCase.execute(fileKey, expires);

      res.status(200).json({
        success: true,
        data: {
          fileKey,
          signedUrl,
          expiresIn: expires
        }
      });
    } catch (error) {
      console.error('❌ Error en getSignedUrl:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
