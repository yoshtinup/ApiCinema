
import { RegistroCliente } from "../domain/models/RegistroCliente.js";


export class CreateClient {
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
    const { id, nombre, apellido, telefono, gmail, codigo, usuario} = clientData;
    const client = new RegistroCliente(id, nombre, apellido, telefono, gmail, codigo, usuario);

    // Guardar el cliente en el repositorio
    return await this.clientRepository.createNewClient(client);
  }
}
