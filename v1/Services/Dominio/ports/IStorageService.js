/**
 * Interface para servicios de almacenamiento (S3, Google Cloud Storage, etc.)
 * Define el contrato que deben cumplir las implementaciones de almacenamiento
 */
export class IStorageService {
  /**
   * Subir un archivo al servicio de almacenamiento
   * @param {Buffer} fileBuffer - Buffer del archivo
   * @param {string} fileName - Nombre del archivo
   * @param {string} mimeType - Tipo MIME del archivo
   * @param {string} folder - Carpeta destino en el bucket
   * @returns {Promise<Object>} - Información del archivo subido
   */
  async uploadFile(fileBuffer, fileName, mimeType, folder) {
    throw new Error('Method uploadFile() must be implemented');
  }

  /**
   * Eliminar un archivo del servicio de almacenamiento
   * @param {string} fileKey - Key/path del archivo en el bucket
   * @returns {Promise<boolean>} - true si se eliminó exitosamente
   */
  async deleteFile(fileKey) {
    throw new Error('Method deleteFile() must be implemented');
  }

  /**
   * Obtener URL pública de un archivo
   * @param {string} fileKey - Key/path del archivo en el bucket
   * @returns {Promise<string>} - URL pública del archivo
   */
  async getFileUrl(fileKey) {
    throw new Error('Method getFileUrl() must be implemented');
  }

  /**
   * Obtener URL firmada (presigned) de un archivo
   * @param {string} fileKey - Key/path del archivo en el bucket
   * @param {number} expiresIn - Tiempo de expiración en segundos
   * @returns {Promise<string>} - URL firmada temporal
   */
  async getSignedUrl(fileKey, expiresIn = 3600) {
    throw new Error('Method getSignedUrl() must be implemented');
  }
}
