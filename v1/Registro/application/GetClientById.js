export class GetClientById {
    constructor(clientRepository) {
      this.clientRepository = clientRepository; // Inyección del puerto (repositorio)
    }
  
    /**
     * Ejecutar la obtención de un cliente por su ID.
     * @param {number} id - El ID del cliente.
     * @returns {Promise<Object>} - Los datos del cliente encontrado.
     */
    async execute(id) {
      return await this.clientRepository.getClientById(id);
    }
  }
  