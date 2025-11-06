import jwt from 'jsonwebtoken';

export class GoogleAuthController {
  // Maneja el callback de Google y responde con JWT
  async handleCallback(req, res) {
    try {
      console.log('HandleCallback called');
      console.log('User from req:', {
        id: req.user.id,
        gmail: req.user.gmail,
        nombre: req.user.nombre,
        nfc: req.user.nfc
      });
      
      if (!req.user) {
        console.error('No user in request');
        return res.status(401).json({ 
          error: 'Google authentication failed',
          message: 'No user data received from Google'
        });
      }

      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET not configured');
        return res.status(500).json({ 
          error: 'Server configuration error',
          message: 'JWT secret not configured'
        });
      }

      const token = jwt.sign({
        id: req.user.id,
        gmail: req.user.gmail,
        nombre: req.user.nombre ?? '',
        apellido: req.user.apellido ?? '',
        telefono: req.user.telefono ?? '',
        usuario: req.user.usuario ?? '',
        id_role_fk: req.user.id_role_fk,
        imagen: req.user.imagen ?? req.user.picture ?? '',
        nfc: req.user.nfc ?? null // Incluir el NFC como en el login convencional
      }, process.env.JWT_SECRET, { expiresIn: '1h' });

      console.log('Token generated successfully for user:', req.user.id);
      console.log('User NFC:', req.user.nfc);
      console.log('User role:', req.user.id_role_fk);
      
      // Crear URL con múltiples parámetros para que el frontend los pueda procesar
      const redirectUrl = `https://www.chuy7x.space/dispenser-selector?token=${token}&userId=${req.user.id}&nfc=${req.user.nfc || ''}&role=${req.user.id_role_fk}`;
      console.log('Redirecting to:', redirectUrl);
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Error in handleCallback:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Error processing Google authentication',
        details: error.message
      });
    }
  }
}
