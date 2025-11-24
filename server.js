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
import { ReportsRouter } from './v1/pago/Infrestructura/interfaces/http/ReportsRouter.js';
import { AnalyticsRouter as GaussianAnalyticsRouter } from './v1/pago/Infrestructura/interfaces/http/AnalyticsRouter.js';
import { AnalyticsRouter as StatisticalAnalyticsRouter } from "./v1/StatisticalAnalytics/Infrestructura/interfaces/http/router/AnalyticsRouter.js";
import { StatisticalAnalyticsModule } from "./v1/StatisticalAnalytics/index.js";
import { CorreoRouter } from "./v1/Services/Infrestructura/interfaces/http/router/CorreoRouter.js";
import StorageRouter from "./v1/Services/Infrestructura/interfaces/http/router/StorageRouter.js";
import { db } from "./database/mysql.js";
// import { swaggerUi, specs } from './swagger.js';

const app = express();
app.use(express.static('public'));

// Configuración del rate limiting
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar módulo de análisis estadístico
let statisticalAnalytics;

// Initialize analytics module asynchronously
async function initializeAnalytics() {
  try {
    statisticalAnalytics = new StatisticalAnalyticsModule(db);
    await statisticalAnalytics.initialize();
    return statisticalAnalytics;
  } catch (error) {
    signale.error('Error inicializando Analytics:', error.message);
    // Return a mock module for graceful degradation
    return {
      healthCheck: async () => ({ status: 'error', error: error.message }),
      validateModule: async () => ({ status: 'error', hasData: false, sampleSize: 0 }),
      getRouter: () => express.Router()
    };
  }
}

app.use(cors());
app.use(express.json());

// --- Google OAuth2.0 Integration ---

app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
configureGoogleAuth();

// Rutas de autenticación Google
app.use('/api/v1', GoogleAuthRouter);
app.use('/api/v1', CorreoRouter);
app.use('/api/v1/storage', StorageRouter);

// --- Tus rutas API existentes ---
app.use("/api/v1", clientRouter);
app.use("/api/v1", ProductoRouter);
app.use("/api/v1", clientVerific);
app.use("/api/v1", StatisticalAnalyticsRouter);
app.use("/api/v1", CarritoRouter);
app.use("/api/v1", PaymentRouter);
app.use("/api/v1", EstadoRouter);
app.use("/api/v1", PagoRouter);
app.use("/api/v1", DispenserRouter);
app.use("/api/v1/analytics", AnalyticsRouter);
app.use("/api/v1/reports", ReportsRouter);
app.use("/api/v1/gaussian", GaussianAnalyticsRouter);

// Statistics routes will be added after initialization

// --- Swagger Documentation ---
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
//   explorer: true,
//   customCss: '.swagger-ui .topbar { display: none }',
//   customSiteTitle: "ApiCinema - Dispensador API Documentation"
// }));

app.get('/mostrar-html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🔍 Endpoint de validación rápida para desarrollo
app.get('/api/v1/analytics/health', async (req, res) => {
  try {
    if (!statisticalAnalytics) {
      return res.status(503).json({
        success: false,
        status: 'initializing',
        error: 'Statistical Analytics module is still initializing'
      });
    }
    
    const health = await statisticalAnalytics.healthCheck();
    const validation = await statisticalAnalytics.validateModule();
    
    res.json({
      success: true,
      status: health.status,
      module: 'StatisticalAnalytics',
      version: '1.0.0',
      database: health.status === 'healthy' ? 'connected' : 'disconnected',
      validation: validation.status,
      sampleSize: validation.sampleSize || 0,
      hasData: validation.hasData || false,
      timestamp: new Date().toISOString(),
      endpoints: {
        dashboard: '/api/v1/statistics/dashboard',
        descriptive: '/api/v1/statistics/descriptive',
        probability: '/api/v1/statistics/probability',
        insights: '/api/v1/statistics/business-insights',
        export: '/api/v1/statistics/export'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      status: 'error'
    });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, async () => {
  signale.success(`Server online on port ${PORT}`);
  
  // Wait a moment for database pool to stabilize
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Initialize statistical analytics module after server start
  signale.info('🔄 Initializing Statistical Analytics Module...');
  try {
    statisticalAnalytics = await initializeAnalytics();
    
    // Add statistics routes after successful initialization
    app.use("/api/v1/statistics", statisticalAnalytics.getRouter());
    
    const health = await statisticalAnalytics.healthCheck();
    if (health.status === 'healthy') {
      signale.success('📊 Statistical Analytics Module: READY');
    } else {
      signale.warn('⚠️ Statistical Analytics Module: INITIALIZED WITH WARNINGS');
      signale.warn(`⚠️ Status: ${health.status}`);
    }
  } catch (error) {
    signale.error('❌ Statistical Analytics Module: FAILED TO INITIALIZE');
    signale.error(`❌ Error: ${error.message}`);
    
    // Provide a fallback router for statistics endpoints
    const fallbackRouter = express.Router();
    fallbackRouter.use('*', (req, res) => {
      res.status(503).json({
        success: false,
        error: 'Statistical Analytics module is not available',
        status: 'service_unavailable'
      });
    });
    app.use("/api/v1/statistics", fallbackRouter);
  }
});

