/**
 * Caso de uso para eliminar imágenes del servicio de almacenamiento
 */
export class DeleteImageUseCase {
  constructor(storageService) {
    this.storageService = storageService;
  }

  /**
   * Ejecutar la eliminación de imagen
   * @param {string} fileKey - Key/path del archivo en el bucket
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async execute(fileKey) {
    if (!fileKey) {
      throw new Error('fileKey es requerido para eliminar el archivo');
    }

    return await this.storageService.deleteFile(fileKey);
  }
}
