import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Configurar dotenv
dotenv.config();

const app = express();
const PORT = process.env.PORT || 54113;
const prisma = new PrismaClient();

// Middlewares básicos
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      mediaSrc: ["'self'", "http://localhost:3000", "http://localhost:3008", "http://localhost:3009", "blob:", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:3000"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      baseSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"],
      scriptSrcAttr: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  originAgentCluster: true,
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3008',
      'http://localhost:3000',
      'https://madres-digitales.vercel.app',
      'https://madres-digitales-frontend.vercel.app'
    ];
    
    if (process.env.CORS_ORIGINS) {
      const productionOrigins = process.env.CORS_ORIGINS.split(',').map(origin => origin.trim());
      allowedOrigins.push(...productionOrigins);
    }
    
    if (process.env.NODE_ENV === 'production') {
      const productionDomains = [
        /\.vercel\.app$/,
        /\.vercel\.dev$/,
        /\.netlify\.app$/,
      ];
      
      if (!origin) return callback(null, true);
      
      const isAllowedDomain = allowedOrigins.includes(origin) ||
        productionDomains.some(domain => domain.test(origin));
      
      if (isAllowedDomain) {
        return callback(null, true);
      }
    } else {
      if (!origin) return callback(null, true);
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
    'Pragma',
    'Expires',
    'X-API-Key',
    'X-Device-ID',
    'X-User-Agent',
    'X-Forwarded-For',
    'X-Real-IP'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Per-Page',
    'Link'
  ]
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas básicas
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Madres Digitales API - Versión Mínima',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Ruta básica de autenticación
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario en la base de datos
    const usuario = await prisma.usuarios.findUnique({
      where: { email },
      include: {
        municipios: true
      }
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // En producción, aquí verificarías la contraseña con bcrypt
    // Por ahora, aceptamos cualquier contraseña para el demo
    
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          municipio: usuario.municipios?.nombre
        },
        token: 'demo-token-' + Date.now()
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Ruta de reportes con datos reales
app.get('/api/reportes', async (req, res) => {
  try {
    const reportes = [
      {
        id: 'resumen-general',
        titulo: 'Resumen General',
        descripcion: 'Resumen general del sistema',
        url: '/api/reportes/resumen-general',
        fecha: new Date().toISOString().split('T')[0]
      },
      {
        id: 'estadisticas-gestantes',
        titulo: 'Estadísticas de Gestantes',
        descripcion: 'Estadísticas de gestantes por municipio',
        url: '/api/reportes/estadisticas-gestantes',
        fecha: new Date().toISOString().split('T')[0]
      }
    ];

    res.json({
      success: true,
      data: reportes
    });
  } catch (error) {
    console.error('Error en reportes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener reportes'
    });
  }
});

app.get('/api/reportes/descargar/estadisticas-gestantes', async (req, res) => {
  try {
    // Obtener estadísticas reales de la base de datos
    const totalGestantes = await prisma.gestantes.count();
    const gestantesAltoRiesgo = await prisma.gestantes.count({
      where: { riesgo_alto: true }
    });
    
    const gestantesPorMunicipio = await prisma.gestantes.groupBy({
      by: ['municipio_id'],
      _count: {
        id: true
      }
    });

    res.json({
      success: true,
      message: 'Estadísticas de gestantes obtenidas exitosamente',
      data: {
        id: 'estadisticas-gestantes',
        tipo: 'estadisticas-gestantes',
        titulo: 'Estadísticas de Gestantes por Municipio',
        descripcion: 'Estadísticas detalladas de gestantes agrupadas por municipio',
        datos: {
          totalGestantes,
          gestantesAltoRiesgo,
          gestantesPorMunicipio
        },
        fechaGeneracion: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error en estadísticas gestantes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
});

// Manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Solo iniciar el servidor si no estamos en Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor mínimo corriendo en puerto ${PORT}`);
    console.log(`📱 Acceso: http://localhost:${PORT}`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Exportar la app para Vercel
module.exports = app;