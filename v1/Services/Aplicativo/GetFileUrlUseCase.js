/**
 * Caso de uso para obtener URL pública de un archivo
 */
export class GetFileUrlUseCase {
  constructor(storageService) {
    this.storageService = storageService;
  }

  /**
   * Ejecutar la obtención de URL
   * @param {string} fileKey - Key/path del archivo en el bucket
   * @returns {Promise<string>} - URL pública del archivo
   */
  async execute(fileKey) {
    if (!fileKey) {
      throw new Error('fileKey es requerido para obtener la URL');
    }

    return await this.storageService.getFileUrl(fileKey);
  }
}
