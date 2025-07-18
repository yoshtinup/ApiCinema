export class VerifyLogin {
  constructor(loginRepository) {
    this.loginRepository = loginRepository; // Inyección del repositorio
  }

  /**
   * Ejecutar la verificación del login de un cliente.
   * @param {string} gmail - El correo del usuario.
   * @param {string} password - La contraseña proporcionada.
   * @param {string} tipo 
   * - El tipo de usuario (opcional).
   * @param {string} nombre
   * - El nombre del usuario (opcional).
   * @returns {Promise<Object>} - Información del usuario si las credenciales son correctas.
   */
  async execute(gmail, password, tipo, nombre) {
    const loginData = await this.loginRepository.findLoginByCredentials(gmail, password, tipo, nombre);

    if (!loginData) {
      throw new Error('Invalid email or password');
    }

    return {
      id: loginData.id,
      gmail: loginData.gmail,
      nombre: loginData.nombre,
      apellido: loginData.apellido,
      telefono: loginData.telefono,
      usuario: loginData.usuario,
      id_role_fk: loginData.id_role_fk
      // No incluir password/codigo
    };
  }
}
