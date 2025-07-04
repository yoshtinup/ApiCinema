
import { RegistroVerific } from "../domain/models/RegistroVerific.js";

export class CreateVerific {
  constructor(clientRepository) {
    this.clientRepository = clientRepository; // Inyección del puerto (repositorio)
  }

  /**
   * Método para ejecutar la creación de un nuevo cliente.
   * @param {Object} clientData - Datos del cliente.
   * @returns {Promise<RegistroCliente>} - El cliente creado.
   */
  async execute(clientData) {
    // Crear una instancia de la entidad RegistroCliente (aplica validaciones)
    const { id, codigo} = clientData;
    const client = new RegistroVerific(id, codigo);

    // Guardar el cliente en el repositorio
    return await this.clientRepository.createNewVerific(client);
  }
}
