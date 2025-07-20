import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_super_secreto');
    
    // Agregar datos del usuario decodificado al request
    req.user = {
      id: decoded.id,
      nombre: decoded.nombre,
      id_role_fk: decoded.id_role_fk,
      nfc: decoded.nfc || null,
      usuario: decoded.usuario || null
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
