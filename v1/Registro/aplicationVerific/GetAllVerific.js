export class GetAllVerific {
    constructor(clientRepository) {
      this.clientRepository = clientRepository; // Inyección del puerto (repositorio)
    }
  
    /**
     * Ejecutar la obtención de todos los clientes.
     * @returns {Promise<Array>} - Lista de todos los clientes registrados.
     */
    async execute() {
      return await this.clientRepository.getAllVerific();
    }
  }
  