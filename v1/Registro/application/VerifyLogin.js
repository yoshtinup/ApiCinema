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

    // Validar si hay un error específico
    if (loginData && loginData.error) {
      if (loginData.error === 'USER_NOT_FOUND') {
        const error = new Error('No existe una cuenta con este correo electrónico');
        error.code = 'USER_NOT_FOUND';
        throw error;
      }
      if (loginData.error === 'INVALID_PASSWORD') {
        const error = new Error('La contraseña es incorrecta');
        error.code = 'INVALID_PASSWORD';
        throw error;
      }
    }

    // Si loginData es null o undefined (no debería pasar, pero por seguridad)
    if (!loginData) {
      const error = new Error('Credenciales inválidas');
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    return {
      id: loginData.id,
      gmail: loginData.gmail,
      nombre: loginData.nombre,
      apellido: loginData.apellido,
      telefono: loginData.telefono,
      usuario: loginData.usuario,
      id_role_fk: loginData.id_role_fk,
      nfc: loginData.nfc ?? null
      // No incluir password/codigo
    };
  }
}
