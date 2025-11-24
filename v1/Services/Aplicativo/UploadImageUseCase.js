/**
 * Caso de uso para subir imágenes al servicio de almacenamiento
 */
export class UploadImageUseCase {
  constructor(storageService) {
    this.storageService = storageService;
  }

  /**
   * Ejecutar la subida de imagen
   * @param {Buffer} fileBuffer - Buffer del archivo
   * @param {string} fileName - Nombre del archivo
   * @param {string} mimeType - Tipo MIME del archivo
   * @param {string} folder - Carpeta destino (productos, usuarios, etc.)
   * @returns {Promise<Object>} - Información del archivo subido
   */
  async execute(fileBuffer, fileName, mimeType, folder = 'general') {
    // Validar que el archivo sea una imagen
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (!allowedMimeTypes.includes(mimeType)) {
      throw new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, GIF, WEBP)');
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileBuffer.length > maxSize) {
      throw new Error(`El archivo es demasiado grande. Tamaño máximo: ${maxSize / (1024 * 1024)}MB`);
    }

    // Subir el archivo
    return await this.storageService.uploadFile(fileBuffer, fileName, mimeType, folder);
  }
}
