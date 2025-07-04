import jwt from 'jsonwebtoken';

export const VerifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    // Separar el Bearer del token real (formato típico: "Bearer <token>")
    const bearerToken = token.split(' ')[1];

    // Verificar el token con la clave secreta
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET || 'tu_secreto_super_secreto');
    
    // Adjuntar la información decodificada (usuario) a la solicitud
    req.user = decoded;

    // Continuar al siguiente middleware o ruta
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized, invalid token' });
  }
};
