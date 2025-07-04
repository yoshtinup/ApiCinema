export class UpdatClientById {
    constructor(clientRepository) {
      this.clientRepository = clientRepository; // Inyección del puerto (repositorio)
    }
  
    /**
     * Ejecutar la actualización de un cliente por su ID.
     * @param {number} id - El ID del cliente.
     * @param {Object} historyData - Los datos del cliente para actualizar.
     * @returns {Promise<Object>} - Los datos del cliente actualizado.
     */
    async execute(id, historyData) {
      return await this.clientRepository.updateClientById(id, historyData);
    }
  }
  