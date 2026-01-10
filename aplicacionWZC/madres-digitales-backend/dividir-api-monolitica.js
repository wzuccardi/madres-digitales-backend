#!/usr/bin/env node

/**
 * SCRIPT PARA DIVIDIR api/index.js EN MÓDULOS MÁS PEQUEÑOS
 * Esto reducirá drásticamente el tiempo de procesamiento en Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 DIVIDIENDO API MONOLÍTICA EN MÓDULOS');
console.log('='.repeat(60));

// Crear estructura de directorios
const directorios = [
  'api/modules',
  'api/modules/auth',
  'api/modules/gestantes',
  'api/modules/medicos',
  'api/modules/ips',
  'api/modules/alertas',
  'api/modules/controles',
  'api/modules/reportes',
  'api/modules/municipios',
  'api/middleware',
  'api/utils'
];

directorios.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Creado directorio: ${dir}`);
  }
});

// Leer el archivo monolítico
const apiIndex = fs.readFileSync('./api/index.js', 'utf8');
const lineas = apiIndex.split('\n');

console.log(`📊 Archivo original: ${lineas.length} líneas`);

// Función para extraer secciones del archivo
function extraerSeccion(inicioTag, finTag) {
  const inicio = lineas.findIndex(linea => linea.includes(inicioTag));
  const fin = lineas.findIndex(linea => linea.includes(finTag));
  
  if (inicio === -1 || fin === -1) {
    return null;
  }
  
  return lineas.slice(inicio, fin + 1).join('\n');
}

// Extraer y crear módulos
const modulos = [
  {
    nombre: 'auth',
    archivo: 'api/modules/auth/auth.routes.js',
    inicio: '// AUTH ROUTES - REAL CONTROLLORS',
    fin: 'app.post(\'/api/auth/register\', register);'
  },
  {
    nombre: 'gestantes',
    archivo: 'api/modules/gestantes/gestantes.routes.js',
    inicio: '// Gestantes - CRUD básico',
    fin: 'res.status(500).json({ success: false, error: \'Error eliminando gestante\' });'
  },
  {
    nombre: 'medicos',
    archivo: 'api/modules/medicos/medicos.routes.js',
    inicio: '// Médicos - listar y obtener detalle (API pública con CORS)',
    fin: 'res.status(500).json({ success: false, error: \'Error obteniendo médico\' });'
  },
  {
    nombre: 'ips',
    archivo: 'api/modules/ips/ips.routes.js',
    inicio: '// IPS - listar y detalle mínimo',
    fin: 'res.status(500).json({ success: false, error: \'Error obteniendo IPS\' });'
  },
  {
    nombre: 'alertas',
    archivo: 'api/modules/alertas/alertas.routes.js',
    inicio: '// Alertas endpoints - DATOS REALES',
    fin: 'res.status(500).json({ success: false, error: \'Error obteniendo alertas\' });'
  },
  {
    nombre: 'controles',
    archivo: 'api/modules/controles/controles.routes.js',
    inicio: '// Controles endpoint - REQUIRED BY FLUTTER APP',
    fin: 'res.status(500).json({ success: false, error: \'Error obteniendo controles\' });'
  },
  {
    nombre: 'reportes',
    archivo: 'api/modules/reportes/reportes.routes.js',
    inicio: '// ==================== ENDPOINTS DE REPORTES ====================',
    fin: '// ==================== FIN ENDPOINTS DE REPORTES ===================='
  }
];

// Crear archivos de módulos
modulos.forEach(modulo => {
  const contenido = extraerSeccion(modulo.inicio, modulo.fin);
  if (contenido) {
    // Agregar exports al módulo
    const moduloConExports = `
// ${modulo.nombre.toUpperCase()} MODULE
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const router = express.Router();

${contenido}

module.exports = router;
`;
    
    fs.writeFileSync(modulo.archivo, moduloConExports);
    console.log(`✅ Módulo creado: ${modulo.archivo}`);
  }
});

// Crear middleware
const middlewareContent = `
// MIDDLEWARE MODULE
const rateLimitMap = new Map();

const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!rateLimitMap.has(clientIP)) {
      rateLimitMap.set(clientIP, []);
    }

    const requests = rateLimitMap.get(clientIP);
    const recentRequests = requests.filter(timestamp => timestamp > windowStart);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    recentRequests.push(now);
    rateLimitMap.set(clientIP, recentRequests);
    next();
  };
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token de acceso requerido'
    });
  }

  // Verificar token JWT aquí
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Token inválido'
    });
  }
};

module.exports = { rateLimit, authenticateToken };
`;

fs.writeFileSync('api/middleware/index.js', middlewareContent);
console.log('✅ Middleware creado: api/middleware/index.js');

// Crear nuevo index.js optimizado
const nuevoIndex = `
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// Importar módulos
const authRoutes = require('./modules/auth/auth.routes');
const gestantesRoutes = require('./modules/gestantes/gestantes.routes');
const medicosRoutes = require('./modules/medicos/medicos.routes');
const ipsRoutes = require('./modules/ips/ips.routes');
const alertasRoutes = require('./modules/alertas/alertas.routes');
const controlesRoutes = require('./modules/controles/controles.routes');
const reportesRoutes = require('./modules/reportes/reportes.routes');
const { rateLimit } = require('./middleware');

const app = express();
const prisma = new PrismaClient();

// Configuración básica
app.use(cors());
app.use(express.json());
app.use(rateLimit(200, 15 * 60 * 1000));

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Madres Digitales API - Optimizada',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Montar rutas
app.use('/api/auth', authRoutes);
app.use('/api/gestantes', gestantesRoutes);
app.use('/api/medicos', medicosRoutes);
app.use('/api/ips', ipsRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/controles', controlesRoutes);
app.use('/api/reportes', reportesRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Export for Vercel
module.exports = app;

// Start server for local development
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(\`🚀 Server optimizado running on http://localhost:\${PORT}\`);
  });
}
`;

fs.writeFileSync('api/index.optimizado.js', nuevoIndex);
console.log('✅ Index optimizado creado: api/index.optimizado.js');

// Resumen
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN DE OPTIMIZACIÓN');
console.log('='.repeat(60));

const statsOriginal = fs.statSync('./api/index.js');
const statsOptimizado = fs.statSync('./api/index.optimizado.js');

console.log(`📄 Archivo original: ${(statsOriginal.size / 1024).toFixed(2)} KB`);
console.log(`📄 Archivo optimizado: ${(statsOptimizado.size / 1024).toFixed(2)} KB`);
console.log(`📉 Reducción: ${((1 - statsOptimizado.size / statsOriginal.size) * 100).toFixed(1)}%`);

console.log('\n🎯 PRÓXIMOS PASOS:');
console.log('1. Revisa los módulos creados en api/modules/');
console.log('2. Prueba localmente: node api/index.optimizado.js');
console.log('3. Si funciona, reemplaza api/index.js con la versión optimizada');
console.log('4. Actualiza package.json y vercel.json con las configuraciones optimizadas');

console.log('\n✅ División completada exitosamente');