import express from 'express';
import passport from 'passport';
import { GoogleAuthController } from '../../../adapters/controllers/GoogleAuthController.js';

const googleAuthController = new GoogleAuthController();
export const GoogleAuthRouter = express.Router();

// Ruta para iniciar autenticación con Google
GoogleAuthRouter.get('/auth/google', (req, res, next) => {
  console.log('Google OAuth endpoint hit');
  console.log('Redirect URI configurada:', process.env.REDIRECT_URI);
  next();
}, passport.authenticate('google', { 
  scope: ['profile', 'email'],
  accessType: 'offline',
  prompt: 'consent'
}));

// Ruta de callback después de autenticación con Google
GoogleAuthRouter.get('/auth/google/callback',
  (req, res, next) => {
    console.log('Google callback hit');
    console.log('Query params:', req.query);
    if (req.query.error) {
      console.error('Google OAuth Error:', req.query.error);
      return res.status(400).json({ 
        error: 'Google OAuth Error', 
        details: req.query.error 
      });
    }
    next();
  },
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false // Cambiamos a false para usar JWT en lugar de sesiones
  }),
  (req, res) => googleAuthController.handleCallback(req, res)
);
