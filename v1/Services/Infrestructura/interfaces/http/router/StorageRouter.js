import express from 'express';
import { StorageController } from '../../../adapters/Controllers/StorageController.js';

const router = express.Router();
const storageController = new StorageController();

// Configurar multer
const upload = storageController.getMulterConfig();

/**
 * @route POST /api/v1/storage/upload
 * @desc Subir una imagen a S3
 * @access Public
 * @body multipart/form-data
 *   - image: File (required) - Archivo de imagen
 *   - folder: string (optional) - Carpeta destino (productos, usuarios, etc.)
 */
router.post('/upload', upload.single('image'), (req, res) => 
  storageController.uploadImage(req, res)
);

/**
 * @route DELETE /api/v1/storage/delete
 * @desc Eliminar una imagen de S3
 * @access Public
 * @body JSON
 *   - fileKey: string (required) - Key del archivo en S3
 */
router.delete('/delete', (req, res) => 
  storageController.deleteImage(req, res)
);

/**
 * @route GET /api/v1/storage/url
 * @desc Obtener URL pública de un archivo
 * @access Public
 * @query
 *   - fileKey: string (required) - Key del archivo en S3
 */
router.get('/url', (req, res) => 
  storageController.getFileUrl(req, res)
);

/**
 * @route GET /api/v1/storage/signed-url
 * @desc Obtener URL firmada temporal de un archivo
 * @access Public
 * @query
 *   - fileKey: string (required) - Key del archivo en S3
 *   - expiresIn: number (optional) - Tiempo de expiración en segundos (default: 3600)
 */
router.get('/signed-url', (req, res) => 
  storageController.getSignedUrl(req, res)
);

export default router;
