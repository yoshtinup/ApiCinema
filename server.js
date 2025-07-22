import dotenv from 'dotenv';
// IMPORTANTE: Cargar variables de entorno ANTES que cualquier otro import
dotenv.config();

import express from "express";
import signale from "signale";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import passport from 'passport';
import session from 'express-session';
import { configureGoogleAuth } from './v1/Auth/Infrestructura/adapters/googleAuth.js';
import { GoogleAuthRouter } from './v1/Auth/Infrestructura/interfaces/http/router/GoogleAuthRouter.js';
import { clientRouter } from "./v1/Registro/Infrestructura/interfaces/http/router/RegistroRouter.js";
import { ProductoRouter } from "./v1/Producto/Infrestructura/interfaces/http/router/ProductoRouter.js";
import { clientVerific } from "./v1/Registro/Infrestructura/interfaces/http/router/VericadorRouter.js";
import { CarritoRouter } from "./v1/Carrito/Infrestructura/interfaces/http/router/CarritoRouter.js";
import { PaymentRouter } from "./v1/Services/Infrestructura/interfaces/http/router/PaymentRouter.js";
import { EstadoRouter } from "./v1/Estado/Infrestructura/interfaces/http/router/EstadoRouter.js";
import { PagoRouter } from "./v1/pago/Infrestructura/interfaces/http/router/PagoRouter.js";
import DispenserRouter from "./v1/dispensador/Infrestructura/interfaces/http/dispenserRoutes.js";
import { AnalyticsRouter } from "./v1/Analytics/Infrestructura/interfaces/http/router/AnalyticsRouter.js";
import { swaggerUi, specs } from './swagger.js';

const app = express();
app.use(express.static('public'));

// Configuración del rate limiting
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// --- Google OAuth2.0 Integration ---

app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
configureGoogleAuth();

// Rutas de autenticación Google
app.use('/api/v1', GoogleAuthRouter);

// --- Tus rutas API existentes ---
app.use("/api/v1", clientRouter);
app.use("/api/v1", ProductoRouter);
app.use("/api/v1", clientVerific);
app.use("/api/v1", CarritoRouter);
app.use("/api/v1", PaymentRouter);
app.use("/api/v1", EstadoRouter);
app.use("/api/v1", PagoRouter);
app.use("/api/v1", DispenserRouter);
app.use("/api/v1/analytics", AnalyticsRouter);

// --- Swagger Documentation ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "ApiCinema - Dispensador API Documentation"
}));

app.get('/mostrar-html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  signale.success(`Server online on port ${PORT}`);
});

