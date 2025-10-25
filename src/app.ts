console.log('🚀 INICIANDO SERVIDOR - app.ts cargado - RESTART');
console.log('📍 Directorio actual:', process.cwd());
console.log('🔧 Argumentos:', process.argv);
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import routes from './routes/index';
import { errorHandler } from './middlewares/error.middleware';
import { generalLimiter } from './middlewares/rate-limit.middleware';

console.log('⚙️ Configurando dotenv...');
dotenv.config();
console.log('✅ dotenv configurado');

const app = express();
export const prisma = new PrismaClient();

// Middlewares
// Configurar helmet con políticas más permisivas para desarrollo
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Permitir recursos cross-origin
  crossOriginEmbedderPolicy: false, // Deshabilitar para permitir videos
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      mediaSrc: ["'self'", "http://localhost:3000", "http://localhost:3008", "http://localhost:3009", "blob:", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:3000"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
    },
  },
}));
// CORS configuration - Configuración segura con whitelist específica
app.use(cors({
  origin: function (origin, callback) {
    // Lista de orígenes permitidos
    const allowedOrigins = [
      'http://localhost:3008',  // Frontend desarrollo
      'http://localhost:3000',  // Backend desarrollo
      'http://192.168.1.60:3008',  // IP local frontend
      'http://192.168.1.60:3000',  // IP local backend
      'http://localhost:3009',  // Dashboard monitoreo
      'http://localhost:52638',  // Puerto dinámico para hot reload
      'https://madresdigitales.netlify.app',  // Dominio de producción Netlify
    ];
    
    // Agregar dominios de producción desde variables de entorno
    if (process.env.CORS_ORIGINS) {
      const productionOrigins = process.env.CORS_ORIGINS.split(',').map(origin => origin.trim());
      allowedOrigins.push(...productionOrigins);
    }
    
    // En producción, ser más permisivo si no hay origin específico
    if (process.env.NODE_ENV === 'production') {
      // Permitir dominios de Vercel, Netlify y otros dominios de producción
      const productionDomains = [
        /\.vercel\.app$/,
        /\.vercel\.dev$/,
        /\.netlify\.app$/,
        /^https:\/\/madres-digitales.*\.vercel\.app$/,
        /^https:\/\/.*\.madres-digitales\.com$/,
        /^https:\/\/madresdigitales\.netlify\.app$/
      ];
      
      if (!origin) return callback(null, true);
      
      // Verificar si coincide con algún patrón de dominio permitido
      const isAllowedDomain = allowedOrigins.includes(origin) ||
        productionDomains.some(domain => domain.test(origin));
      
      if (isAllowedDomain) {
        return callback(null, true);
      }
    } else {
      // Permitir requests sin origin (herramientas de desarrollo como Postman)
      if (!origin) return callback(null, true);
      
      // Verificar si el origen está en la lista permitida
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
    }
    
    console.log('🚨 CORS: Origen no permitido:', origin);
    return callback(new Error('No permitido por CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-HTTP-Method-Override'
  ],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Manejar preflight requests explícitamente
app.options('*', cors());

// Middleware para debugging CORS
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.get('Origin')} - Content-Type: ${req.get('Content-Type')}`);
  if (req.method === 'POST' && req.path.includes('/auth/login')) {
    console.log('🔐 LOGIN REQUEST DETECTED:', {
      method: req.method,
      path: req.path,
      headers: req.headers,
      body: req.body
    });
  }
  next();
});

app.use(express.json());

// Middleware adicional para debugging POST requests
app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log('📮 POST REQUEST:', {
      url: req.url,
      path: req.path,
      body: req.body,
      contentType: req.get('Content-Type'),
      origin: req.get('Origin')
    });
  }
  next();
});

app.use(morgan('combined'));

// Servir archivos estáticos desde la carpeta uploads
const uploadsPath = path.join(__dirname, '../uploads');
console.log('📁 Sirviendo archivos estáticos desde:', uploadsPath);

// Middleware para agregar headers CORS a archivos estáticos (videos)
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

app.use('/uploads', express.static(uploadsPath, {
  maxAge: '1d', // Cache por 1 día
  etag: true,
  lastModified: true,
  acceptRanges: true, // Permitir solicitudes de rango para videos
}));

// Rutas
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Madres Digitales API - Conectado a Base de Datos Real',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL - Datos Reales',
    endpoints: {
      auth: '/api/auth/*',
      gestantes: '/api/gestantes',
      controles: '/api/controles',
      alertas: '/api/alertas',
      ips: '/api/ips',
      contenido: '/api/contenido',
      reportes: '/api/reportes',
      uploads: '/uploads/*'
    }
  });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Madres Digitales API Docs',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Aplicar rate limiting general a todas las rutas API
app.use('/api', generalLimiter, routes);

// Manejo de errores
app.use(errorHandler);

export default app;
