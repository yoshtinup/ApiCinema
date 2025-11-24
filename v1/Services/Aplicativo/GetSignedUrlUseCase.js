/**
 * Caso de uso para obtener URL firmada temporal de un archivo
 */
export class GetSignedUrlUseCase {
  constructor(storageService) {
    this.storageService = storageService;
  }

  /**
   * Ejecutar la obtención de URL firmada
   * @param {string} fileKey - Key/path del archivo en el bucket
   * @param {number} expiresIn - Tiempo de expiración en segundos (default: 3600 = 1 hora)
   * @returns {Promise<string>} - URL firmada temporal
   */
  async execute(fileKey, expiresIn = 3600) {
    if (!fileKey) {
      throw new Error('fileKey es requerido para obtener la URL firmada');
    }

    if (expiresIn < 1 || expiresIn > 604800) { // Máximo 7 días
      throw new Error('expiresIn debe estar entre 1 segundo y 7 días (604800 segundos)');
    }

    return await this.storageService.getSignedUrl(fileKey, expiresIn);
  }
}
