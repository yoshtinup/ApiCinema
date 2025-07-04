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
      tipo: loginData.tipo,
      nombre: loginData.nombre, // Asegurarse de que el nombre esté incluido
      // ⚠️ No incluir password por seguridad
    };
  }
}
