import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { db } from '../../../../database/mysql.js';

export function configureGoogleAuth() {
  // Validar que las variables de entorno estén configuradas
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.REDIRECT_URI) {
    console.error('Error: Faltan variables de entorno para Google OAuth');
    console.error('CLIENT_ID:', !!process.env.CLIENT_ID);
    console.error('CLIENT_SECRET:', !!process.env.CLIENT_SECRET);
    console.error('REDIRECT_URI:', !!process.env.REDIRECT_URI);
    throw new Error('Variables de entorno de Google OAuth no configuradas');
  }

  passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.REDIRECT_URI,
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google profile received:', {
        id: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName
      });
      
      let user = await findUserByGoogleIdOrEmail(profile.id, profile.emails[0].value);
      if (!user) {
        user = await createUserFromGoogle(profile);
        console.log('New user created:', user.id);
      } else {
        console.log('Existing user found:', user.id);
      }
      return done(null, user);
    } catch (error) {
      console.error('Error in Google Strategy:', error);
      return done(error, null);
    }
  }));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await findUserById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

export async function findUserByGoogleIdOrEmail(googleId, email) {
  const sql = 'SELECT * FROM usuario WHERE google_id = ? OR gmail = ? LIMIT 1';
  const [rows] = await db.query(sql, [googleId, email]);
  return rows[0] || null;
}
export async function createUserFromGoogle(profile) {
  // Para usuarios de Google OAuth, usar un valor dummy para codigo ya que no usan contraseña
  const sql = 'INSERT INTO usuario (nombre, gmail, usuario, google_id, id_role_fk, codigo) VALUES (?, ?, ?, ?, ?, ?)';
  const params = [
    profile.displayName,
    profile.emails[0].value,
    profile.displayName.replace(/\s/g, '').toLowerCase(),
    profile.id,
    1, // id_role_fk por defecto
    'GOOGLE_OAUTH_USER' // Valor dummy para codigo, usuarios OAuth no usan contraseña
  ];
  const [result] = await db.query(sql, params);
  
  // Retornar el usuario completo desde la base de datos para incluir todos los campos
  const newUser = await findUserById(result.insertId);
  return newUser;
}
export async function findUserById(id) {
  const sql = 'SELECT * FROM usuario WHERE id = ?';
  const [rows] = await db.query(sql, [id]);
  return rows[0] || null;
}
