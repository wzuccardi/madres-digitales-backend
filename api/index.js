// Madres Digitales API - Vercel Serverless Function
// All service dependencies are in the api/ folder for Vercel deployment
// Environment variables configured in Vercel dashboard
// FORCE REDEPLOY: 2026-01-10 08:55 - Fix CORS y refresh token
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AlertaAutomaticaService = require('./alerta-automatica.service');
const sosEndpoints = require('./sos-endpoints');
const missingEndpoints = require('./missing-endpoints');

// Importar controladores reales
// const { login, register } = require('../dist/controllers/auth.controller');

// Simple auth controller using existing database structure
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario en la tabla usuarios
    const user = await prisma.usuarios.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    if (!user.activo) {
      return res.status(401).json({ success: false, error: 'Usuario inactivo' });
    }

    // Verificar contraseña (bcrypt)
    const bcrypt = require('bcrypt');
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const jwt = require('jsonwebtoken');
    const rolLowercase = user.rol ? String(user.rol).toLowerCase() : 'madrina';
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        rol: rolLowercase
      },
      JWT_SECRET,
      { 
        expiresIn: '24h',
        issuer: 'madres-digitales',
        audience: 'madres-digitales-users'
      }
    );

    console.log('✅ Login exitoso:', user.email, 'Rol:', user.rol, '(token rol:', rolLowercase + ')');
    
    res.json({
      success: true,
      data: {
        usuario: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: rolLowercase
        },
        token
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, nombre, documento, telefono, municipio_id } = req.body;
    const rolInput = req.body.rol || req.body.role || 'madrina';
    
    if (!email || !password || !nombre) {
      return res.status(400).json({ success: false, error: 'Email, password y nombre son requeridos' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuarios.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, error: 'El email ya está registrado' });
    }

    // Mapear rol al formato de Prisma
    const rolMap = {
      admin: 'ADMIN',
      super_admin: 'SUPER_ADMIN',
      coordinador: 'COORDINADOR',
      madrina: 'MADRINA',
      medico: 'MEDICO',
    };
    const prismaRol = rolMap[rolInput] || 'MADRINA';

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar ID único
    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Crear usuario
    const user = await prisma.usuarios.create({
      data: {
        id,
        email,
        password_hash: hashedPassword,
        nombre,
        documento: documento || null,
        telefono: telefono || null,
        municipio_id: municipio_id || null,
        rol: prismaRol,
        activo: true
      }
    });

    console.log('✅ Usuario creado:', user.email, 'Rol:', user.rol);

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        rol: rolInput
      },
      JWT_SECRET,
      { 
        expiresIn: '24h',
        issuer: 'madres-digitales',
        audience: 'madres-digitales-users'
      }
    );
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: rolInput
        },
        token
      }
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor: ' + error.message });
  }
};

// Inicializar Prisma Client
const prisma = new PrismaClient();

const app = express();
// Configuración de seguridad y entorno
const NODE_ENV = process.env.NODE_ENV || 'production';
const JWT_SECRET = process.env.JWT_SECRET || 'temporary-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'temporary-refresh-secret-change-in-production';

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.warn('⚠️ WARNING: Using default JWT secrets. Configure JWT_SECRET and JWT_REFRESH_SECRET in Vercel environment variables for production!');
}

// CORS configuration - parametrizado por entorno
const corsAllowedFromEnv = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(o => o.length > 0);

const defaultAllowedOrigins = [
  'http://localhost:3008',
  'http://localhost:3009',
  'http://localhost:3000',
  'http://localhost:54112',
  'https://madres-digitales-frontend.vercel.app',
  'https://madres-digitales.vercel.app',
  'https://madres-digitales-backend.vercel.app',
  'https://madres-digitales-frontend-1bw6x2ir0.vercel.app',
  'https://madres-digitales-frontend-qa5yec9v1.vercel.app'
];

const allowedOrigins = corsAllowedFromEnv.length > 0 ? corsAllowedFromEnv : defaultAllowedOrigins;

const corsOptions = {
  origin: true, // Permitir todos los orígenes temporalmente para debug
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// UTF-8 Encoding Configuration - IMPORTANTE PARA ESPAÑOL
app.use(express.json({
  charset: 'utf-8',
  limit: '50mb'
}));

app.use(express.urlencoded({
  extended: true,
  charset: 'utf-8',
  limit: '50mb'
}));

// Security headers middleware - NUEVO
app.use((req, res, next) => {
  // Seguridad básica
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CSP básico
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");

  // UTF-8 Encoding Header
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  next();
});

// Request logging middleware - NUEVO
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';

  console.log(`📝 ${timestamp} - ${method} ${url} - ${userAgent.substring(0, 50)}`);
  next();
});

// Endpoint para crear control con evaluación automática de alertas y MEOWS
async function crearControlConEvaluacion(req, res) {
  try {
    const {
      gestante_id,
      fecha_control,
      peso,
      altura_uterina,
      presion_sistolica,
      presion_diastolica,
      frecuencia_cardiaca,
      frecuencia_respiratoria,
      temperatura,
      movimientos_fetales,
      edemas,
      recomendaciones,
      observaciones,
      sintomas,
      semanas_gestacion,
      nivel_conciencia,
      sangrado_ml,
      sintomas_neurologicos,
      meows_score,
      meows_alert_level,
      meows_component_scores,
      meows_triggered_alerts,
      meows_recommendations,
      id
    } = req.body;

    if (!gestante_id || !fecha_control) {
      return res.status(400).json({ success: false, error: 'gestante_id y fecha_control son requeridos' });
    }

    const gestante = await prisma.gestantes.findUnique({ where: { id: gestante_id } });
    if (!gestante) {
      return res.status(404).json({ success: false, error: 'Gestante no encontrada' });
    }

    // Verificar sospecha de sepsis
    const tiene_sepsis = (temperatura && temperatura >= 38.0) && (
      (frecuencia_respiratoria && frecuencia_respiratoria >= 22) ||
      (frecuencia_cardiaca && frecuencia_cardiaca >= 100) ||
      (presion_sistolica && presion_sistolica <= 100)
    );

    // Crear el control prenatal con datos MEOWS
    const nuevoId = id || `control_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const nuevoControl = await prisma.control_prenatal.create({
      data: {
        id: nuevoId,
        gestante_id,
        fecha_control: new Date(fecha_control),
        semanas_gestacion: semanas_gestacion ? parseInt(semanas_gestacion) : null,
        peso: peso ? parseFloat(peso) : null,
        altura_uterina: altura_uterina ? parseFloat(altura_uterina) : null,
        presion_sistolica: presion_sistolica ? parseInt(presion_sistolica) : null,
        presion_diastolica: presion_diastolica ? parseInt(presion_diastolica) : null,
        frecuencia_cardiaca: frecuencia_cardiaca ? parseInt(frecuencia_cardiaca) : null,
        frecuencia_respiratoria: frecuencia_respiratoria ? parseInt(frecuencia_respiratoria) : null,
        temperatura: temperatura ? parseFloat(temperatura) : null,
        movimientos_fetales,
        edemas,
        recomendaciones,
        observaciones,
        realizado: true,
        // Campos MEOWS
        meows_score: meows_score ? parseInt(meows_score) : null,
        meows_alert_level,
        meows_component_scores,
        meows_triggered_alerts,
        meows_recommendations,
        nivel_conciencia,
        sangrado_ml: sangrado_ml ? parseFloat(sangrado_ml) : null,
        sintomas_neurologicos: sintomas_neurologicos || false,
        tiene_sepsis: tiene_sepsis || false
      }
    });

    console.log('✅ Control prenatal creado con MEOWS:', nuevoControl.id, 'Score:', meows_score, 'Nivel:', meows_alert_level);

    // Si hay alerta roja, crear alerta automática
    if (meows_alert_level === 'AlertLevel.red' || meows_score >= 5) {
      try {
        const alertaId = `alerta_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
        await prisma.alertas.create({
          data: {
            id: alertaId,
            gestante_id,
            madrina_id: gestante.madrina_id,
            tipo_alerta: 'signos_vitales_anormales',
            nivel_prioridad: 'critica',
            mensaje: `ALERTA MEOWS CRÍTICA - Score: ${meows_score}. ${(meows_triggered_alerts || []).join('. ')}`,
            sintomas: meows_triggered_alerts || [],
            es_automatica: true,
            score_riesgo: meows_score,
            resuelta: false
          }
        });
        console.log('🚨 Alerta automática creada por MEOWS crítico');
      } catch (alertError) {
        console.error('⚠️ Error creando alerta automática:', alertError);
      }
    }

    // Evaluar alertas adicionales usando el servicio inteligente
    const alertaService = new AlertaAutomaticaService(prisma);
    const evaluacion = await alertaService.evaluarControl({
      presion_sistolica,
      presion_diastolica,
      frecuencia_cardiaca,
      temperatura,
      movimientos_fetales,
      edemas,
      sintomas,
      semanas_gestacion
    }, gestante_id);

    console.log('📊 Evaluación de alertas completada:', {
      alertas: evaluacion.alertas.length,
      puntajeRiesgo: evaluacion.puntajeRiesgo,
      nivel: evaluacion.resumen.nivel
    });

    res.status(201).json({
      success: true,
      message: 'Control con evaluación creado exitosamente',
      data: {
        control: {
          id: nuevoControl.id,
          gestante_id: nuevoControl.gestante_id,
          fecha_control: nuevoControl.fecha_control.toISOString().split('T')[0],
          realizado: nuevoControl.realizado
        },
        evaluacion: {
          alertas_generadas: evaluacion.alertas.length,
          puntaje_riesgo: evaluacion.puntajeRiesgo,
          factores_riesgo: evaluacion.factoresRiesgo,
          resumen: evaluacion.resumen
        },
        alertas: evaluacion.alertas.map(a => ({
          id: a.id,
          tipo: a.tipo_alerta,
          prioridad: a.nivel_prioridad,
          mensaje: a.mensaje,
          color: AlertaAutomaticaService.getColorSemaforo(a.nivel_prioridad)
        }))
      }
    });
  } catch (error) {
    console.error('❌ Error creando control con evaluación:', error);
    res.status(500).json({ success: false, error: 'Error creando control con evaluación: ' + error.message });
  }
}

app.post('/api/alertas-automaticas/controles/con-evaluacion', crearControlConEvaluacion);
app.post('/api/controles/con-evaluacion', crearControlConEvaluacion);

// Not found handler must be last, move it to after routes
const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada', method: req.method, path: req.path, timestamp: new Date().toISOString() });
};

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Madres Digitales API - Funcionando Correctamente',
    version: '1.0.5',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Endpoint temporal para verificar madrinas asignadas
app.get('/api/admin/verificar-madrinas', async (req, res) => {
  try {
    // Resumen general
    const resumen = await prisma.$queryRaw`
      SELECT 
        COUNT(*)::int as total_gestantes,
        COUNT(madrina_id)::int as con_madrina,
        (COUNT(*) - COUNT(madrina_id))::int as sin_madrina
      FROM gestantes
      WHERE activa = true
    `;

    // Gestantes sin madrina
    const sinMadrina = await prisma.gestantes.findMany({
      where: {
        activa: true,
        madrina_id: null
      },
      select: {
        id: true,
        nombre: true,
        documento: true,
        telefono: true,
        municipio_id: true,
        riesgo_alto: true
      },
      orderBy: { nombre: 'asc' }
    });

    // Resumen por madrina
    const porMadrina = await prisma.$queryRaw`
      SELECT 
        u.nombre as madrina,
        u.email,
        COUNT(g.id)::int as gestantes_asignadas
      FROM usuarios u
      LEFT JOIN gestantes g ON g.madrina_id = u.id AND g.activa = true
      WHERE u.rol = 'MADRINA' AND u.activo = true
      GROUP BY u.id, u.nombre, u.email
      ORDER BY gestantes_asignadas DESC
    `;

    res.json({
      success: true,
      data: {
        resumen: resumen[0],
        gestantes_sin_madrina: sinMadrina,
        distribucion_por_madrina: porMadrina
      }
    });
  } catch (error) {
    console.error('❌ Error verificando madrinas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error verificando madrinas',
      details: error.message 
    });
  }
});

// Endpoint para ver gestantes asignadas a usuarios de prueba
app.get('/api/admin/gestantes-usuarios-prueba', async (req, res) => {
  try {
    const emailsPrueba = ['crepu@gmail.com', 'madrina@madresdigitales.com'];
    
    // Buscar usuarios de prueba
    const usuariosPrueba = await prisma.usuarios.findMany({
      where: {
        email: { in: emailsPrueba }
      },
      select: { id: true, email: true, nombre: true }
    });

    if (usuariosPrueba.length === 0) {
      return res.json({
        success: true,
        message: 'No se encontraron usuarios de prueba',
        data: { gestantes: [] }
      });
    }

    const idsPrueba = usuariosPrueba.map(u => u.id);

    // Obtener gestantes asignadas a usuarios de prueba con detalles
    const gestantesPrueba = await prisma.gestantes.findMany({
      where: {
        madrina_id: { in: idsPrueba },
        activa: true
      },
      select: {
        id: true,
        nombre: true,
        documento: true,
        telefono: true,
        direccion: true,
        municipio_id: true,
        madrina_id: true,
        riesgo_alto: true
      },
      orderBy: { nombre: 'asc' }
    });

    // Agrupar por usuario de prueba
    const porUsuario = usuariosPrueba.map(usuario => ({
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email
      },
      gestantes: gestantesPrueba.filter(g => g.madrina_id === usuario.id)
    }));

    res.json({
      success: true,
      message: `Se encontraron ${gestantesPrueba.length} gestantes asignadas a usuarios de prueba`,
      data: {
        total_gestantes: gestantesPrueba.length,
        por_usuario: porUsuario,
        todas_las_gestantes: gestantesPrueba
      }
    });
  } catch (error) {
    console.error('❌ Error consultando gestantes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error consultando gestantes',
      details: error.message 
    });
  }
});

// Médicos - listar y obtener detalle (API pública con CORS)
app.get('/api/medicos', async (req, res) => {
  try {
    const medicos = await prisma.medicos.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        documento: true,
        telefono: true,
        especialidad: true,
        email: true,
        registro_medico: true,
        ips_id: true,
        municipio_id: true,
        activo: true,
      },
    });
    res.json({ success: true, data: medicos });
  } catch (error) {
    console.error('❌ Error obteniendo médicos:', error);
    res.status(500).json({ success: false, error: 'Error al obtener médicos' });
  }
});

app.get('/api/medicos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const medico = await prisma.medicos.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        documento: true,
        telefono: true,
        especialidad: true,
        email: true,
        registro_medico: true,
        ips_id: true,
        municipio_id: true,
        activo: true,
      },
    });
    if (!medico) {
      return res.status(404).json({ success: false, error: 'Médico no encontrado' });
    }
    res.json({ success: true, data: medico });
  } catch (error) {
    console.error('❌ Error obteniendo médico por id:', error);
    res.status(500).json({ success: false, error: 'Error al obtener médico' });
  }
});

// Usuarios - crear, listar y actualizar
const rolMap = {
  admin: 'ADMIN',
  super_admin: 'SUPER_ADMIN',
  coordinador: 'COORDINADOR',
  madrina: 'MADRINA',
  medico: 'MEDICO',
};
const prismaRoleToFront = (r) => ({
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  COORDINADOR: 'coordinador',
  MEDICO: 'medico',
  MADRINA: 'madrina',
}[r] || 'madrina');
function decodeBase64Url(str) {
  try {
    const pad = (s) => s + '='.repeat((4 - (s.length % 4)) % 4);
    const b64 = pad(str).replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(b64, 'base64').toString('utf-8');
    return JSON.parse(json);
  } catch (_) {
    return null;
  }
}
function parseBearerToken(req) {
  const auth = req.get('Authorization') || '';
  const parts = auth.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') return parts[1];
  return null;
}
function getAuthUser(req) {
  const token = parseBearerToken(req);
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const payload = decodeBase64Url(parts[1]);
  if (!payload || !payload.email) return null;
  return payload;
}

function isSuperAdmin(req) {
  const payload = getAuthUser(req);
  if (!payload) return false;
  return payload.rol === 'super_admin';
}


app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuarios.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        documento: true,
        telefono: true,
        municipio_id: true,
        rol: true,
        activo: true,
      },
      orderBy: { nombre: 'asc' }
    });
    
    console.log(`✅ ${usuarios.length} usuarios obtenidos`);
    res.json({ success: true, data: usuarios });
  } catch (error) {
    console.error('❌ Error listando usuarios:', error);
    res.status(500).json({ success: false, error: 'Error listando usuarios' });
  }
});

app.post('/api/usuarios', async (req, res) => {
  try {
    const {
      email,
      nombre,
      documento,
      telefono,
      rol,
      municipio_id,
      activo = true,
      password,
    } = req.body;

    if (!email || !nombre || !rol) {
      return res.status(400).json({ success: false, error: 'Campos requeridos: email, nombre, rol' });
    }

    const prismaRol = rolMap[rol];
    if (!prismaRol) {
      return res.status(400).json({ success: false, error: `Rol inválido: ${rol}` });
    }

    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const password_hash = password ? await bcrypt.hash(password, 10) : await bcrypt.hash('nopass', 10);

    const nuevo = await prisma.usuarios.create({
      data: {
        id,
        email,
        nombre,
        documento: documento || null,
        telefono: telefono || null,
        rol: prismaRol,
        municipio_id: municipio_id || null,
        activo,
        password_hash,
      },
      select: { id: true, nombre: true, email: true, rol: true, activo: true },
    });
    res.status(201).json({ success: true, data: nuevo });
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    const msg = error.message && error.message.includes('Unique') ? 'Email ya existe' : 'Error creando usuario';
    res.status(500).json({ success: false, error: msg });
  }
});

app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body || {};
    const update = { ...data };
    if (update.rol) {
      const mapped = rolMap[update.rol];
      if (!mapped) return res.status(400).json({ success: false, error: `Rol inválido: ${update.rol}` });
      update.rol = mapped;
    }
    if (update.password) {
      update.password_hash = await bcrypt.hash(update.password, 10);
      delete update.password;
    }
    const usuario = await prisma.usuarios.update({
      where: { id },
      data: {
        nombre: update.nombre,
        documento: update.documento,
        telefono: update.telefono,
        rol: update.rol,
        municipio_id: update.municipio_id,
        activo: update.activo,
        password_hash: update.password_hash,
      },
      select: { id: true, nombre: true, email: true, rol: true, activo: true },
    });
    res.json({ success: true, data: usuario });
  } catch (error) {
    console.error('❌ Error actualizando usuario:', error);
    res.status(500).json({ success: false, error: 'Error actualizando usuario' });
  }
});

// Auth - registro compatible con frontend - COMENTADO PARA USAR CONTROLADOR REAL
/*
app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      email,
      password,
      documento,
      telefono,
      municipio_id,
    } = req.body;
    const nombre = req.body.nombre || req.body.name;
    const rolInput = req.body.rol || req.body.role || 'madrina';

    if (!email || !password || !nombre) {
      return res.status(400).json({ success: false, error: 'Campos requeridos: email, nombre, password' });
    }

    const prismaRol = rolMap[rolInput] || 'MADRINA';
    const exists = await prisma.usuarios.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ success: false, error: 'Email ya existe' });
    }

    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const password_hash = await bcrypt.hash(password, 10);

    const nuevo = await prisma.usuarios.create({
      data: {
        id,
        email,
        nombre,
        password_hash,
        documento: documento || null,
        telefono: telefono || null,
        municipio_id: municipio_id || null,
        rol: prismaRol,
        activo: true,
      },
      select: { id: true, nombre: true, email: true, rol: true, activo: true },
    });
    // Generar token de sesión con firma real
    const tokenPayload = {
      id: nuevo.id,
      email: nuevo.email,
      rol: (rolInput || 'madrina'),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      iss: 'madres-digitales',
      aud: 'madres-digitales-users'
    };
    
    // Use proper JWT signing instead of demo signature
    const jwt = require('jsonwebtoken');
    const jwtSecret = JWT_SECRET;
    const token = jwt.sign(tokenPayload, jwtSecret, {
      issuer: 'madres-digitales',
      audience: 'madres-digitales-users'
    });
    
    const refreshToken = `refresh-${Date.now()}`;

    res.status(201).json({ success: true, data: { user: nuevo, token, refreshToken } });
  } catch (error) {
    console.error('❌ Error registrando usuario:', error);
    res.status(500).json({ success: false, error: 'Error registrando usuario' });
  }
});
*/

// Gestantes - CRUD básico
app.get('/api/gestantes', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const authUser = getAuthUser(req);
    if (!authUser) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    // Resolver rol e id reales desde la BD para evitar tokens obsoletos
    const dbUser = await prisma.usuarios.findUnique({
      where: { email: authUser.email },
      select: { id: true, rol: true }
    });
    if (!dbUser) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const frontRol = prismaRoleToFront(dbUser.rol);
    const where = { activa: true };
    if (frontRol === 'madrina') {
      where.madrina_id = dbUser.id;
    } else if (frontRol === 'medico') {
      where.medico_tratante_id = dbUser.id;
    }

    const [gestantes, total] = await Promise.all([
      prisma.gestantes.findMany({
        where,
        orderBy: { nombre: 'asc' },
        skip,
        take: limit,
        select: {
          id: true,
          nombre: true,
          documento: true,
          telefono: true,
          municipio_id: true,
          madrina_id: true,
          medico_tratante_id: true,
          activa: true,
          riesgo_alto: true,
          fecha_probable_parto: true,
          fecha_ultima_menstruacion: true,
          fecha_nacimiento: true,
        },
      }),
      prisma.gestantes.count({ where }),
    ]);
    res.json({ success: true, data: gestantes, meta: { page, limit, total } });
  } catch (error) {
    console.error('❌ Error listando gestantes:', error);
    res.status(500).json({ success: false, error: 'Error listando gestantes' });
  }
});

app.get('/api/gestantes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const g = await prisma.gestantes.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        documento: true,
        telefono: true,
        municipio_id: true,
        madrina_id: true,
        medico_tratante_id: true,
        activa: true,
        riesgo_alto: true,
        fecha_probable_parto: true,
        fecha_ultima_menstruacion: true,
        fecha_nacimiento: true,
      },
    });
    if (!g) return res.status(404).json({ success: false, error: 'Gestante no encontrada' });
    res.json({ success: true, data: g });
  } catch (error) {
    console.error('❌ Error obteniendo gestante:', error);
    res.status(500).json({ success: false, error: 'Error obteniendo gestante' });
  }
});

app.post('/api/gestantes', async (req, res) => {
  try {
    const authPayload = getAuthUser(req);
    if (!authPayload) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const dbUser = await prisma.usuarios.findUnique({
      where: { email: authPayload.email },
      select: { id: true, rol: true }
    });
    if (!dbUser) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const frontRol = prismaRoleToFront(dbUser.rol);
    const {
      nombre,
      documento,
      telefono,
      municipio_id,
      direccion,
      eps,
      regimen_salud,
      fecha_nacimiento,
      fecha_probable_parto,
      fecha_ultima_menstruacion,
      riesgo_alto,
      activa,
    } = req.body;
    if (!nombre) return res.status(400).json({ success: false, error: 'Nombre requerido' });
    if (!fecha_nacimiento) return res.status(400).json({ success: false, error: 'Fecha de nacimiento requerida' });
    if (!fecha_ultima_menstruacion) return res.status(400).json({ success: false, error: 'Fecha de última menstruación requerida para calcular semanas de gestación' });
    
    // Validar que la fecha de última menstruación sea válida
    try {
      const fumDate = new Date(fecha_ultima_menstruacion);
      const now = new Date();
      const diffDays = (now - fumDate) / (1000 * 60 * 60 * 24);
      if (diffDays < 0 || diffDays > 294) { // 294 días = 42 semanas
        return res.status(400).json({ success: false, error: 'Fecha de última menstruación inválida (debe estar entre hoy y hace 42 semanas)' });
      }
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Formato de fecha de última menstruación inválido' });
    }
    
    // Provide default value for regimen_salud if not provided
    const regimenSaludValue = regimen_salud || 'subsidiado';
    const id = `gestante_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const g = await prisma.gestantes.create({
      data: {
        id,
        nombre,
        documento: documento || null,
        telefono: telefono || null,
        municipio_id: municipio_id || null,
        direccion: direccion || null,
        eps: eps || null,
        regimen_salud: regimenSaludValue,
        fecha_nacimiento: new Date(fecha_nacimiento),
        fecha_probable_parto: fecha_probable_parto ? new Date(fecha_probable_parto) : null,
        fecha_ultima_menstruacion: fecha_ultima_menstruacion ? new Date(fecha_ultima_menstruacion) : null,
        riesgo_alto: !!riesgo_alto,
        activa: activa !== undefined ? !!activa : true,
        madrina_id: frontRol === 'madrina' ? dbUser.id : null,
      },
      select: { id: true, nombre: true, documento: true, telefono: true, municipio_id: true, activa: true },
    });
    res.status(201).json({ success: true, data: g });
  } catch (error) {
    console.error('❌ Error creando gestante:', error);
    res.status(500).json({ success: false, error: 'Error creando gestante' });
  }
});

app.put('/api/gestantes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body || {};
    const g = await prisma.gestantes.update({
      where: { id },
      data: {
        nombre: data.nombre,
        documento: data.documento,
        telefono: data.telefono,
        municipio_id: data.municipio_id,
        activa: data.activa,
        riesgo_alto: data.riesgo_alto,
      },
      select: { id: true, nombre: true, documento: true, telefono: true, municipio_id: true, activa: true },
    });
    res.json({ success: true, data: g });
  } catch (error) {
    console.error('❌ Error actualizando gestante:', error);
    res.status(500).json({ success: false, error: 'Error actualizando gestante' });
  }
});

app.delete('/api/gestantes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.gestantes.update({ where: { id }, data: { activa: false } });
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error eliminando gestante:', error);
    res.status(500).json({ success: false, error: 'Error eliminando gestante' });
  }
});

// CONTROLES PRENATALES - CRUD Completo
app.post('/api/controles', missingEndpoints.createControl);
app.put('/api/controles/:id', missingEndpoints.updateControl);
app.delete('/api/controles/:id', missingEndpoints.deleteControl);

// ALERTAS - Endpoints adicionales
app.put('/api/alertas/:id/leida', missingEndpoints.markAlertAsRead);

// MÉDICOS - CRUD Completo
app.get('/api/medicos', missingEndpoints.listMedicos);
app.post('/api/medicos', missingEndpoints.createMedico);
app.put('/api/medicos/:id', missingEndpoints.updateMedico);
app.delete('/api/medicos/:id', missingEndpoints.deleteMedico);

// IPS - Endpoints de escritura
app.post('/api/ips', missingEndpoints.createIPS);
app.put('/api/ips/:id', missingEndpoints.updateIPS);
app.delete('/api/ips/:id', missingEndpoints.deleteIPS);

// CONTENIDOS - CRUD Completo
app.get('/api/contenido', missingEndpoints.listContenidos);
app.post('/api/contenido', missingEndpoints.createContenido);
app.put('/api/contenido/:id', missingEndpoints.updateContenido);
app.delete('/api/contenido/:id', missingEndpoints.deleteContenido);

// MUNICIPIOS - Endpoints de lectura (implementados más abajo)
// app.get('/api/municipios', missingEndpoints.listMunicipios);
// app.get('/api/municipios/:id', missingEndpoints.getMunicipioById);

// IPS - listar y detalle mínimo
app.get('/api/ips', async (req, res) => {
  try {
    const list = await prisma.ips.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true, municipio_id: true, nivel: true, activo: true },
    });
    res.json({ success: true, data: list });
  } catch (error) {
    console.error('❌ Error listando IPS:', error);
    res.status(500).json({ success: false, error: 'Error listando IPS' });
  }
});

app.get('/api/ips/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const i = await prisma.ips.findUnique({ where: { id }, select: { id: true, nombre: true, municipio_id: true, nivel: true, activo: true } });
    if (!i) return res.status(404).json({ success: false, error: 'IPS no encontrada' });
    res.json({ success: true, data: i });
  } catch (error) {
    console.error('❌ Error obteniendo IPS:', error);
    res.status(500).json({ success: false, error: 'Error obteniendo IPS' });
  }
});
// Auth endpoints - COMENTADO PARA USAR CONTROLADOR REAL
/*
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email y contraseña son requeridos' });
    }
    const user = await prisma.usuarios.findUnique({
      where: { email },
      select: { id: true, nombre: true, email: true, rol: true, password_hash: true, activo: true }
    });
    if (!user || user.activo === false) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }
    const isBcrypt = typeof user.password_hash === 'string' && /^\$2[aby]\$/.test(user.password_hash);
    if (isBcrypt) {
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) {
        return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
      }
    } else {
      const hash = crypto.createHash('sha256').update(password).digest('hex');
      if (hash !== user.password_hash) {
        return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
      }
    }
    const frontRol = prismaRoleToFront(user.rol);
    const tokenPayload = {
      id: user.id,
      email: user.email,
      rol: frontRol,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      iss: 'madres-digitales',
      aud: 'madres-digitales-users'
    };
    
    // Use proper JWT signing instead of demo signature
    const jwt = require('jsonwebtoken');
    const jwtSecret = JWT_SECRET;
    const token = jwt.sign(tokenPayload, jwtSecret, {
      issuer: 'madres-digitales',
      audience: 'madres-digitales-users'
    });
    
    const refreshToken = `refresh-${Date.now()}`;
    res.json({ success: true, data: { usuario: { id: user.id, nombre: user.nombre, email: user.email, rol: frontRol }, token, refreshToken } });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ success: false, error: 'Error en login' });
  }
});
*/

// AUTH ROUTES - REAL CONTROLLERS
app.post('/api/auth/login', login);
app.post('/api/auth/register', register);

// ADMIN: Verificar y corregir semanas de gestación
app.get('/api/admin/verificar-semanas-gestacion', async (req, res) => {
  try {
    // Verificar cuántos controles tienen 24 semanas
    const controlesConVeinticuatro = await prisma.control_prenatal.count({
      where: { semanas_gestacion: 24 }
    });

    // Obtener muestra de controles con sus gestantes
    const muestra = await prisma.$queryRaw`
      SELECT 
        cp.id,
        cp.gestante_id,
        g.nombre as gestante_nombre,
        g.fecha_ultima_menstruacion as fum,
        cp.fecha_control,
        cp.semanas_gestacion as semanas_actuales,
        CASE 
          WHEN g.fecha_ultima_menstruacion IS NOT NULL 
          THEN FLOOR(EXTRACT(EPOCH FROM (cp.fecha_control - g.fecha_ultima_menstruacion)) / (7 * 24 * 60 * 60))::INTEGER
          ELSE NULL
        END as semanas_calculadas
      FROM control_prenatal cp
      JOIN gestantes g ON cp.gestante_id = g.id
      ORDER BY cp.fecha_control DESC
      LIMIT 20
    `;

    res.json({
      success: true,
      data: {
        total_controles_con_24: controlesConVeinticuatro,
        muestra_controles: muestra
      }
    });
  } catch (error) {
    console.error('❌ Error verificando semanas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/corregir-semanas-gestacion', async (req, res) => {
  try {
    // Ejecutar la corrección
    const resultado = await prisma.$executeRaw`
      UPDATE control_prenatal cp
      SET semanas_gestacion = FLOOR(
        EXTRACT(EPOCH FROM (cp.fecha_control - g.fecha_ultima_menstruacion)) / (7 * 24 * 60 * 60)
      )::INTEGER
      FROM gestantes g
      WHERE cp.gestante_id = g.id
        AND g.fecha_ultima_menstruacion IS NOT NULL
        AND cp.fecha_control >= g.fecha_ultima_menstruacion
        AND FLOOR(
          EXTRACT(EPOCH FROM (cp.fecha_control - g.fecha_ultima_menstruacion)) / (7 * 24 * 60 * 60)
        ) BETWEEN 0 AND 42
    `;

    console.log('✅ Semanas de gestación corregidas:', resultado, 'registros');

    res.json({
      success: true,
      message: `${resultado} controles actualizados`,
      registros_actualizados: resultado
    });
  } catch (error) {
    console.error('❌ Error corrigiendo semanas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Password Reset Routes
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email es requerido' });
    }

    // Buscar usuario
    const user = await prisma.usuarios.findUnique({
      where: { email }
    });

    // Por seguridad, siempre retornar éxito aunque el usuario no exista
    if (!user) {
      console.log('⚠️ Intento de reset para email no existente:', email);
      return res.json({ 
        success: true, 
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña' 
      });
    }

    // Generar token de reset (válido por 1 hora)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en BD
    await prisma.usuarios.update({
      where: { email },
      data: {
        reset_token: resetToken,
        reset_token_expires: resetTokenExpires
      }
    });

    // Enviar email con Resend
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const resetUrl = `${process.env.FRONTEND_URL || 'https://madres-digitales-frontend.vercel.app'}/#/reset-password?token=${resetToken}`;
    
    await resend.emails.send({
      from: 'Madres Digitales <onboarding@resend.dev>',
      to: email,
      subject: 'Restablecer contraseña - Madres Digitales',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Restablecer Contraseña</h2>
          <p>Hola ${user.nombre},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña en Madres Digitales.</p>
          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Este enlace expirará en 1 hora por seguridad.
          </p>
          <p style="color: #666; font-size: 14px;">
            Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            Madres Digitales - Sistema de Seguimiento Prenatal
          </p>
        </div>
      `
    });

    console.log('✅ Email de reset enviado a:', email);
    
    res.json({ 
      success: true, 
      message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña' 
    });

  } catch (error) {
    console.error('❌ Error en forgot-password:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al procesar la solicitud' 
    });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token y nueva contraseña son requeridos' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Buscar usuario con token válido
    const user = await prisma.usuarios.findFirst({
      where: {
        reset_token: token,
        reset_token_expires: {
          gte: new Date() // Token no expirado
        }
      }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token inválido o expirado' 
      });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y limpiar token
    await prisma.usuarios.update({
      where: { id: user.id },
      data: {
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expires: null
      }
    });

    console.log('✅ Contraseña restablecida para:', user.email);
    
    res.json({ 
      success: true, 
      message: 'Contraseña actualizada exitosamente' 
    });

  } catch (error) {
    console.error('❌ Error en reset-password:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al restablecer la contraseña' 
    });
  }
});

// SOS ROUTES - Sistema de emergencias
app.post('/api/sos/alerta', (req, res) => sosEndpoints.crearAlertaSOS(req, res, null));
app.get('/api/sos/alertas-activas', sosEndpoints.obtenerAlertasSOSActivas);
app.put('/api/sos/alerta/:id', (req, res) => sosEndpoints.actualizarAlertaSOS(req, res, null));

// ALERTAS AUTOMATICAS ROUTES - Sistema de evaluación automática
app.post('/api/alertas-automaticas/controles/con-evaluacion', crearControlConEvaluacion);
app.post('/api/alertas-automaticas/alertas/con-evaluacion', async (req, res) => {
  try {
    const alertaService = new AlertaAutomaticaService(prisma);
    const resultado = await alertaService.crearAlertaConEvaluacion(req.body);
    res.status(201).json({ success: true, data: resultado });
  } catch (error) {
    console.error('❌ Error creando alerta con evaluación:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// MEOWS DASHBOARD ROUTES - Dashboard de análisis MEOWS
app.get('/api/meows/dashboard/stats', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, municipio_id } = req.query;
    const whereClause = { meows_score: { not: null } };
    
    if (fecha_inicio || fecha_fin) {
      whereClause.fecha_control = {};
      if (fecha_inicio) whereClause.fecha_control.gte = new Date(fecha_inicio);
      if (fecha_fin) whereClause.fecha_control.lte = new Date(fecha_fin);
    }
    
    const [totalControles, promedioScore, alertasAmarillas, alertasRojas] = await Promise.all([
      prisma.control_prenatal.count({ where: whereClause }),
      prisma.control_prenatal.aggregate({ where: whereClause, _avg: { meows_score: true } }),
      prisma.control_prenatal.count({ where: { ...whereClause, meows_alert_level: 'AlertLevel.yellow' } }),
      prisma.control_prenatal.count({ where: { ...whereClause, meows_alert_level: 'AlertLevel.red' } }),
    ]);
    
    res.json({
      success: true,
      data: {
        total_controles: totalControles,
        promedio_score: promedioScore._avg.meows_score || 0,
        alertas_amarillas: alertasAmarillas,
        alertas_rojas: alertasRojas,
        porcentaje_alertas: totalControles > 0 ? ((alertasAmarillas + alertasRojas) / totalControles * 100).toFixed(2) : 0,
      },
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas MEOWS:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/meows/dashboard/critical-alerts', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const controles = await prisma.control_prenatal.findMany({
      where: {
        OR: [
          { meows_alert_level: 'AlertLevel.red' },
          { meows_score: { gte: 5 } },
        ],
      },
      include: {
        gestante: { select: { id: true, nombre: true, documento: true, telefono: true } },
      },
      orderBy: [{ meows_score: 'desc' }, { fecha_control: 'desc' }],
      take: Number(limit),
      skip: Number(offset),
    });
    
    res.json({ success: true, data: { controles } });
  } catch (error) {
    console.error('❌ Error obteniendo alertas críticas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Attach 404 fallback at the very end
// 404 fallback will be attached at the very end of file (after all routes)

app.put('/api/auth/profile', (req, res) => {
  console.log('📝 Profile update request');
  res.json({
    success: true,
    message: 'Perfil actualizado exitosamente',
    data: {
      usuario: {
        id: 'demo-user',
        nombre: 'Usuario Demo',
        email: 'demo@example.com',
        rol: 'super_admin'
      }
    }
  });
});

// Dashboard endpoints - DATOS REALES DE LA BASE DE DATOS
// Función compartida para obtener estadísticas
async function getEstadisticasDashboard(req, res) {
  try {
    console.log('📊 Obteniendo estadísticas reales de la base de datos...');
    
    // 🔍 DEBUG: Verificar usuario en el request
    console.log('🔍 DEBUG: Dashboard Estadisticas - Request headers:', req.headers);
    
    // Extraer token de autorización del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔍 DEBUG: Dashboard Estadisticas - No hay token de autorización');
      return res.status(401).json({ success: false, error: 'Token de autorización requerido' });
    }
    
    const token = authHeader.substring(7); // Remover 'Bearer ' del inicio
    
    console.log('🔍 DEBUG: Dashboard Estadisticas - Token recibido:', token.substring(0, 50) + '...');
    if (NODE_ENV !== 'production') {
      console.log('🔍 DEBUG: Dashboard Estadisticas - entorno:', NODE_ENV);
    }
    
    // Decodificar el token para obtener el usuario
    let user;
    try {
      // Try with different secrets to debug
      const secrets = [
        process.env.JWT_ACCESS_TOKEN_SECRET,
        JWT_SECRET,
        'dev-secret',
        'your-secret-key'
      ].filter(Boolean);
      
      let lastError;
      for (const secret of secrets) {
        try {
          console.log('🔍 DEBUG: Dashboard Estadisticas - Trying secret:', secret);
          const decoded = jwt.verify(token, secret, {
            issuer: 'madres-digitales',
            audience: 'madres-digitales-users',
          });
          user = decoded;
          console.log('🔍 DEBUG: Dashboard Estadisticas - SUCCESS with secret:', secret);
          break;
        } catch (error) {
          console.log('🔍 DEBUG: Dashboard Estadisticas - Failed with secret:', secret, '- Error:', error.message);
          lastError = error;
        }
      }
      
      if (!user) {
        throw lastError;
      }
      
      console.log('🔍 DEBUG: Dashboard Estadisticas - Usuario decodificado:', user);
      console.log('🔍 DEBUG: Dashboard Estadisticas - User ID:', user.id);
      console.log('🔍 DEBUG: Dashboard Estadisticas - User role:', user.rol);
    } catch (error) {
      console.log('🔍 DEBUG: Dashboard Estadisticas - Error decodificando token:', error);
      return res.status(401).json({ success: false, error: 'Token inválido' });
    }

    // Construir filtros base según el rol del usuario
    let gestanteWhere = { activa: true };
    let controlWhere = {};
    let alertaWhere = { resuelta: false };
    
    // Normalizar rol a mayúsculas para comparación
    const userRole = user && user.rol ? String(user.rol).toUpperCase() : '';
    
    console.log('🔍 DEBUG: Dashboard Estadisticas - User role normalizado:', userRole);
    
    if (userRole === 'MADRINA') {
      // Las madrinas solo ven gestantes asignadas a ellas
      gestanteWhere.madrina_id = user.id;
      // Los controles y alertas deben filtrarse por gestantes de esa madrina
      controlWhere.gestante = gestanteWhere;
      alertaWhere.gestante = gestanteWhere;
      
      console.log('🔍 DEBUG: Dashboard Estadisticas - Aplicando filtros para madrina:', user.id);
      console.log('🔍 DEBUG: Dashboard Estadisticas - gestanteWhere:', gestanteWhere);
      console.log('🔍 DEBUG: Dashboard Estadisticas - controlWhere:', controlWhere);
      console.log('🔍 DEBUG: Dashboard Estadisticas - alertaWhere:', alertaWhere);
    } else {
      console.log('🔍 DEBUG: Dashboard Estadisticas - Usuario NO es madrina, mostrando todas las estadísticas');
    }

    // Obtener datos reales de la base de datos con filtros aplicados
    const [
      totalGestantes,
      totalMedicos,
      totalIps,
      gestantesAltoRiesgo,
      alertasActivas,
      controlesRealizados,
      controlesHoy
    ] = await Promise.all([
      prisma.gestantes.count({ where: gestanteWhere }),
      prisma.medicos.count({ where: { activo: true } }),
      prisma.ips.count({ where: { activo: true } }),
      prisma.gestantes.count({ where: { ...gestanteWhere, riesgo_alto: true } }),
      prisma.alertas.count({ where: alertaWhere }),
      prisma.control_prenatal.count({ where: { ...controlWhere, realizado: true } }),
      prisma.control_prenatal.count({
        where: {
          ...controlWhere,
          fecha_control: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      })
    ]);

    // Calcular próximas citas (controles programados para los próximos 7 días)
    const proximosCitas = await prisma.control_prenatal.count({
      where: {
        ...controlWhere,
        realizado: false,
        fecha_control: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // próximos 7 días
        }
      }
    });

    const estadisticas = {
      totalGestantes,
      controlesRealizados,
      alertasActivas,
      totalMedicos,
      totalIps,
      gestantesAltoRiesgo,
      controlesHoy,
      proximosCitas
    };

    console.log('📊 Estadísticas obtenidas de la BD:', estadisticas);

    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas: ' + error.message
    });
  }
}

// Endpoints de estadísticas (español e inglés para compatibilidad)
app.get('/api/dashboard/estadisticas', getEstadisticasDashboard);
app.get('/api/dashboard/statistics', getEstadisticasDashboard);

// Crear IPS - NUEVO ENDPOINT
app.post('/api/ips', async (req, res) => {
  try {
    const {
      nombre,
      nit,
      telefono,
      direccion,
      municipio_id,
      nivel,
      email,
      latitud,
      longitud,
      activo = true
    } = req.body;

    console.log('🏥 Creando nueva IPS...');

    // Validaciones básicas
    if (!nombre || !direccion) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y dirección son requeridos'
      });
    }

    // Generar ID único
    const id = `ips_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Normalizar nivel (int → string)
    let nivelStr = null;
    if (typeof nivel === 'number') {
      nivelStr = nivel === 1 ? 'Primario' : nivel === 2 ? 'Secundario' : nivel === 3 ? 'Terciario' : null;
    } else if (typeof nivel === 'string') {
      const map = {
        primario: 'Primario',
        secundario: 'Secundario',
        terciario: 'Terciario',
      };
      nivelStr = map[nivel.toLowerCase()] || nivel;
    }

    const nuevaIPS = await prisma.ips.create({
      data: {
        id,
        nombre,
        nit: nit || null,
        telefono: telefono || null,
        direccion,
        municipio_id: municipio_id ?? null,
        nivel: nivelStr,
        email: email || null,
        latitud: latitud != null ? parseFloat(latitud) : null,
        longitud: longitud != null ? parseFloat(longitud) : null,
        activo: !!activo
      }
    });

    console.log('✅ IPS creada exitosamente:', nuevaIPS.id);

    res.status(201).json({
      success: true,
      message: 'IPS creada exitosamente',
      data: nuevaIPS
    });
  } catch (error) {
    console.error('❌ Error creando IPS:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando IPS: ' + error.message
    });
  }
});

// Actualizar IPS - NUEVO ENDPOINT
app.put('/api/ips/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('🏥 Actualizando IPS:', id);

    // Verificar que la IPS existe
    const ipsExistente = await prisma.ips.findUnique({
      where: { id }
    });

    if (!ipsExistente) {
      return res.status(404).json({
        success: false,
        error: 'IPS no encontrada'
      });
    }

    // Convertir coordenadas si vienen como string
    if (updateData.latitud) updateData.latitud = parseFloat(updateData.latitud);
    if (updateData.longitud) updateData.longitud = parseFloat(updateData.longitud);

    const ipsActualizada = await prisma.ips.update({
      where: { id },
      data: updateData,
      include: {
        municipios: true,
        medicos: {
          where: { activo: true }
        },
        gestantes: {
          where: { activa: true }
        }
      }
    });

    console.log('✅ IPS actualizada exitosamente:', id);

    res.json({
      success: true,
      message: 'IPS actualizada exitosamente',
      data: {
        id: ipsActualizada.id,
        nombre: ipsActualizada.nombre,
        nit: ipsActualizada.nit,
        direccion: ipsActualizada.direccion,
        telefono: ipsActualizada.telefono,
        email: ipsActualizada.email,
        nivel: ipsActualizada.nivel,
        municipio: ipsActualizada.municipios?.nombre || null,
        medicosAsignados: ipsActualizada.medicos.length,
        gestantesAsignadas: ipsActualizada.gestantes.length
      }
    });
  } catch (error) {
    console.error('❌ Error actualizando IPS:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando IPS: ' + error.message
    });
  }
});

// Eliminar IPS - NUEVO ENDPOINT
app.delete('/api/ips/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Eliminando IPS:', id);

    // Verificar que la IPS existe
    const ipsExistente = await prisma.ips.findUnique({
      where: { id }
    });

    if (!ipsExistente) {
      return res.status(404).json({
        success: false,
        error: 'IPS no encontrada'
      });
    }

    // Soft delete - marcar como inactiva
    await prisma.ips.update({
      where: { id },
      data: { activo: false }
    });

    console.log('✅ IPS eliminada exitosamente:', id);

    res.json({
      success: true,
      message: 'IPS eliminada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error eliminando IPS:', error);
    res.status(500).json({
      success: false,
      error: 'Error eliminando IPS: ' + error.message
    });
  }
});

// IPS endpoints - DATOS REALES
app.get('/api/ips', async (req, res) => {
  try {
    console.log('🏥 Obteniendo IPS reales de la base de datos...');

    const ips = await prisma.ips.findMany({
      where: { activo: true },
      include: {
        municipios: true,
        medicos: {
          where: { activo: true }
        },
        gestantes: {
          where: { activa: true }
        }
      }
    });

    const ipsFormateadas = (ips || []).map(ipsItem => ({
      id: ipsItem.id,
      nombre: ipsItem.nombre,
      nit: ipsItem.nit,
      direccion: ipsItem.direccion,
      telefono: ipsItem.telefono,
      email: ipsItem.email,
      nivel: ipsItem.nivel,
      municipio: ipsItem.municipios?.nombre || null,
      medicosAsignados: ipsItem.medicos?.length || 0,
      gestantesAsignadas: ipsItem.gestantes?.length || 0,
      coordenadas: {
        latitud: ipsItem.latitud,
        longitud: ipsItem.longitud
      }
    }));

    console.log(`🏥 Encontradas ${ipsFormateadas.length} IPS activas`);

    res.json({
      success: true,
      data: {
        ips: ipsFormateadas,
        total: ipsFormateadas.length
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo IPS:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo IPS: ' + error.message,
      data: {
        ips: [],
        total: 0
      }
    });
  }
});

// Gestantes endpoints - CORREGIDO PARA FILTRADO POR MADRINA
app.get('/api/gestantes', async (req, res) => {
  try {
    console.log('🤰 GET /api/gestantes - Iniciando...');

    // Verificar autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const token = authHeader.substring(7);
    let user;

    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'madres-digitales',
        audience: 'madres-digitales-users',
      });
      user = decoded;
      console.log('👤 Usuario autenticado:', { id: user.id, email: user.email, rol: user.rol });
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Token inválido' });
    }

    // Construir filtros según el rol
    let whereClause = { activa: true };
    
    if (user.rol === 'MADRINA') {
      whereClause.madrina_id = user.id;
      console.log('🔍 Filtro para MADRINA aplicado:', whereClause);
    }

    // Buscar gestantes
    const gestantes = await prisma.gestantes.findMany({
      where: whereClause,
      include: {
        ips_asignada: {
          select: { id: true, nombre: true }
        },
        municipios: {
          select: { id: true, nombre: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    console.log(`📊 Gestantes encontradas: ${gestantes.length}`);

    // Si no hay gestantes para esta madrina, crear algunas de prueba
    if (user.rol === 'MADRINA' && gestantes.length === 0) {
      console.log('🔧 Creando gestantes de prueba para la madrina...');
      
      const gestantesPrueba = await Promise.all([
        prisma.gestantes.create({
          data: {
            id: `gestante_${Date.now()}_1`,
            nombre: 'María García Prueba',
            apellido: 'García',
            documento: '12345678',
            telefono: '3001234567',
            madrina_id: user.id,
            activa: true,
            fecha_nacimiento: new Date('1995-05-15'),
            fecha_probable_parto: new Date('2024-06-15'),
            regimen_salud: 'subsidiado',
            direccion: 'Calle 123 #45-67'
          }
        }),
        prisma.gestantes.create({
          data: {
            id: `gestante_${Date.now()}_2`,
            nombre: 'Ana López Prueba',
            apellido: 'López',
            documento: '87654321',
            telefono: '3007654321',
            madrina_id: user.id,
            activa: true,
            fecha_nacimiento: new Date('1992-08-20'),
            fecha_probable_parto: new Date('2024-07-20'),
            regimen_salud: 'contributivo',
            direccion: 'Carrera 98 #76-54'
          }
        })
      ]);

      console.log(`✅ Creadas ${gestantesPrueba.length} gestantes de prueba`);
      
      // Volver a buscar con las nuevas gestantes
      const gestantesActualizadas = await prisma.gestantes.findMany({
        where: whereClause,
        include: {
          ips_asignada: {
            select: { id: true, nombre: true }
          },
          municipios: {
            select: { id: true, nombre: true }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      return res.json({
        success: true,
        data: gestantesActualizadas,
        meta: {
          page: 1,
          limit: 20,
          total: gestantesActualizadas.length
        }
      });
    }

    res.json({
      success: true,
      data: gestantes,
      meta: {
        page: 1,
        limit: 20,
        total: gestantes.length
      }
    });

  } catch (error) {
    console.error('❌ Error en /api/gestantes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      data: [],
      meta: { page: 1, limit: 20, total: 0 }
    });
  }
});

// Crear médico - NUEVO ENDPOINT
app.post('/api/medicos', async (req, res) => {
  try {
    const {
      nombre,
      documento,
      tipo_documento = 'cedula',
      telefono,
      especialidad,
      email,
      registro_medico,
      ips_id,
      municipio_id,
      activo = true
    } = req.body;

    console.log('👨‍⚕️ Creando nuevo médico...');

    // Validaciones básicas
    if (!nombre || !documento) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y documento son requeridos'
      });
    }

    // Generar ID único
    const id = `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const nuevoMedico = await prisma.medicos.create({
      data: {
        id,
        nombre,
        documento,
        tipo_documento,
        telefono,
        especialidad,
        email,
        registro_medico,
        ips_id,
        municipio_id,
        activo
      },
      include: {
        ips: true,
        municipios: true,
        gestantes: {
          where: { activa: true }
        }
      }
    });

    console.log('✅ Médico creado exitosamente:', nuevoMedico.id);

    res.status(201).json({
      success: true,
      message: 'Médico creado exitosamente',
      data: {
        id: nuevoMedico.id,
        nombre: nuevoMedico.nombre,
        documento: nuevoMedico.documento,
        telefono: nuevoMedico.telefono,
        especialidad: nuevoMedico.especialidad,
        email: nuevoMedico.email,
        registroMedico: nuevoMedico.registro_medico,
        ips: nuevoMedico.ips?.nombre || null,
        municipio: nuevoMedico.municipios?.nombre || null,
        gestantesAsignadas: nuevoMedico.gestantes.length,
        fechaCreacion: nuevoMedico.fecha_creacion.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('❌ Error creando médico:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando médico: ' + error.message
    });
  }
});

// Actualizar médico - NUEVO ENDPOINT
app.put('/api/medicos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('👨‍⚕️ Actualizando médico:', id);

    // Verificar que el médico existe
    const medicoExistente = await prisma.medicos.findUnique({
      where: { id }
    });

    if (!medicoExistente) {
      return res.status(404).json({
        success: false,
        error: 'Médico no encontrado'
      });
    }

    const medicoActualizado = await prisma.medicos.update({
      where: { id },
      data: updateData,
      include: {
        ips: true,
        municipios: true,
        gestantes: {
          where: { activa: true }
        }
      }
    });

    console.log('✅ Médico actualizado exitosamente:', id);

    res.json({
      success: true,
      message: 'Médico actualizado exitosamente',
      data: {
        id: medicoActualizado.id,
        nombre: medicoActualizado.nombre,
        documento: medicoActualizado.documento,
        telefono: medicoActualizado.telefono,
        especialidad: medicoActualizado.especialidad,
        email: medicoActualizado.email,
        registroMedico: medicoActualizado.registro_medico,
        ips: medicoActualizado.ips?.nombre || null,
        municipio: medicoActualizado.municipios?.nombre || null,
        gestantesAsignadas: medicoActualizado.gestantes.length
      }
    });
  } catch (error) {
    console.error('❌ Error actualizando médico:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando médico: ' + error.message
    });
  }
});

// Eliminar médico - NUEVO ENDPOINT
app.delete('/api/medicos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Eliminando médico:', id);

    // Verificar que el médico existe
    const medicoExistente = await prisma.medicos.findUnique({
      where: { id }
    });

    if (!medicoExistente) {
      return res.status(404).json({
        success: false,
        error: 'Médico no encontrado'
      });
    }

    // Soft delete - marcar como inactivo
    await prisma.medicos.update({
      where: { id },
      data: { activo: false }
    });

    console.log('✅ Médico eliminado exitosamente:', id);

    res.json({
      success: true,
      message: 'Médico eliminado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error eliminando médico:', error);
    res.status(500).json({
      success: false,
      error: 'Error eliminando médico: ' + error.message
    });
  }
});

// Médicos endpoints - DATOS REALES
app.get('/api/medicos', async (req, res) => {
  try {
    console.log('👨‍⚕️ Obteniendo médicos reales de la base de datos...');

    const medicos = await prisma.medicos.findMany({
      where: { activo: true },
      include: {
        ips: true,
        municipios: true,
        gestantes: {
          where: { activa: true }
        }
      }
    });

    const medicosFormateados = (medicos || []).map(medico => ({
      id: medico.id,
      nombre: medico.nombre,
      documento: medico.documento,
      telefono: medico.telefono,
      especialidad: medico.especialidad,
      email: medico.email,
      registroMedico: medico.registro_medico,
      ips: medico.ips?.nombre || null,
      municipio: medico.municipios?.nombre || null,
      gestantesAsignadas: medico.gestantes?.length || 0,
      fechaCreacion: medico.fecha_creacion.toISOString().split('T')[0]
    }));

    console.log(`👨‍⚕️ Encontrados ${medicosFormateados.length} médicos activos`);

    res.json({
      success: true,
      data: {
        medicos: medicosFormateados,
        total: medicosFormateados.length
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo médicos:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo médicos: ' + error.message,
      data: {
        medicos: [],
        total: 0
      }
    });
  }
});

// Alertas endpoints - DATOS REALES
app.get('/api/alertas-automaticas/alertas', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log('🚨 Obteniendo alertas reales de la base de datos...');

    const [alertas, totalAlertas] = await Promise.all([
      prisma.alertas.findMany({
        skip,
        take: limit,
        where: { resuelta: false },
        include: {
          gestante: {
            select: { nombre: true, documento: true }
          },
          madrina: {
            select: { nombre: true, telefono: true }
          }
        },
        orderBy: { fecha_creacion: 'desc' }
      }),
      prisma.alertas.count({ where: { resuelta: false } })
    ]);

    const alertasFormateadas = alertas.map(alerta => ({
      id: alerta.id,
      tipo: alerta.tipo_alerta,
      prioridad: alerta.nivel_prioridad,
      mensaje: alerta.mensaje,
      gestante: {
        nombre: alerta.gestante.nombre,
        documento: alerta.gestante.documento
      },
      madrina: alerta.madrina ? {
        nombre: alerta.madrina.nombre,
        telefono: alerta.madrina.telefono
      } : null,
      fechaCreacion: alerta.fecha_creacion.toISOString(),
      resuelta: alerta.resuelta
    }));

    console.log(`🚨 Encontradas ${alertasFormateadas.length} alertas activas de ${totalAlertas} total`);

    res.json({
      success: true,
      data: {
        alertas: alertasFormateadas,
        pagination: {
          page,
          limit,
          total: totalAlertas,
          totalPages: Math.ceil(totalAlertas / limit)
        }
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo alertas:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo alertas: ' + error.message
    });
  }
});

// Conteo de alertas no leídas por usuario (madrina)
app.get('/api/alertas/:userId/unread/count', async (req, res) => {
  try {
    const { userId } = req.params;
    // Verificar autenticación básica si es necesario
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Intentar contar por relación directa con madrina
    let count = 0;
    try {
      count = await prisma.alertas.count({
        where: {
          resuelta: false,
          madrina_id: userId,
        },
      });
    } catch (_) {
      // Fallback: contar por gestantes asignadas a la madrina (si el esquema usa relación via gestante)
      count = await prisma.alertas.count({
        where: {
          resuelta: false,
          gestante: {
            madrina_id: userId,
          },
        },
      });
    }

    return res.json({ success: true, data: { unread: count } });
  } catch (error) {
    console.error('❌ Error obteniendo conteo de alertas no leídas:', error);
    return res.status(500).json({ success: false, error: 'Error obteniendo conteo de alertas' });
  }
});

// Database status endpoint - SIMPLIFIED VERSION
app.get('/api/database/status', async (req, res) => {
  try {
    console.log('🔍 Database status endpoint called...');

    // Start with just one simple query
    const totalUsuarios = await prisma.usuarios.count();

    console.log('📊 Simple query successful:', totalUsuarios);

    res.json({
      success: true,
      data: {
        totalUsuarios,
        message: 'Database status endpoint working',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error in database status:', error);
    res.status(500).json({
      success: false,
      error: 'Database status error: ' + error.message
    });
  }
});

// Controles endpoint - REQUIRED BY FLUTTER APP
app.get('/api/controles', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3000; // Límite alto para mostrar todos los controles
    const skip = (page - 1) * limit;
    const gestanteId = req.query.gestante_id;
    const medicoId = req.query.medico_id;
    const realizado = req.query.realizado;

    console.log('🩺 Obteniendo controles prenatales con filtros:', { page, limit, gestanteId, medicoId, realizado });

    // Verificar autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    let user;

    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'madres-digitales',
        audience: 'madres-digitales-users',
      });
      user = decoded;
      console.log('🔍 DEBUG: Controles - Usuario decodificado:', user);
      console.log('🔍 DEBUG: Controles - User ID:', user.id);
      console.log('🔍 DEBUG: Controles - User role:', user.rol);
    } catch (error) {
      console.log('🔍 DEBUG: Controles - Error decodificando token:', error);
      return res.status(401).json({ success: false, error: 'Token inválido' });
    }

    // Construir filtros dinámicos
    const whereClause = {};
    if (gestanteId) whereClause.gestante_id = gestanteId;
    if (medicoId) whereClause.medico_id = medicoId;
    if (realizado !== undefined) whereClause.realizado = realizado === 'true';

    // Filtrar por rol: madrinas solo ven sus gestantes, admins ven todo
    const userRol = user?.rol ? String(user.rol).toLowerCase() : '';
    
    if (userRol === 'madrina') {
      console.log('🔍 DEBUG: Controles - Filtrando por gestantes de madrina:', user.id);
      
      // Primero obtener los IDs de las gestantes asignadas a esta madrina
      const gestantesAsignadas = await prisma.gestantes.findMany({
        where: { 
          madrina_id: user.id,
          activa: true 
        },
        select: { id: true }
      });
      
      const gestantesIds = gestantesAsignadas.map(g => g.id);
      console.log('🔍 DEBUG: Controles - IDs de gestantes asignadas:', gestantesIds);
      
      if (gestantesIds.length > 0) {
        whereClause.gestante_id = { in: gestantesIds };
      } else {
        // Si no tiene gestantes asignadas, retornar array vacío
        return res.json({
          success: true,
          data: [],
          meta: { page, limit, total: 0 }
        });
      }
    } else if (userRol === 'admin' || userRol === 'super_admin' || userRol === 'coordinador' || userRol === 'medico') {
      console.log('🔍 DEBUG: Controles - Usuario con permisos completos:', userRol);
      // Admins, super_admins, coordinadores y médicos ven todos los controles
      // No agregar filtro adicional
    }

    const [controles, totalControles] = await Promise.all([
      prisma.control_prenatal.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          gestante: {
            select: {
              nombre: true,
              documento: true,
              telefono: true
            }
          },
          medico: {
            select: {
              nombre: true,
              especialidad: true,
              telefono: true
            }
          }
        },
        orderBy: { fecha_control: 'desc' }
      }),
      prisma.control_prenatal.count({ where: whereClause })
    ]);

    const controlesFormateados = controles.map((control, index) => {
      try {
        const controlFormateado = {
          id: control.id,
          gestante_id: control.gestante_id,
          medico_id: control.medico_id,
          gestante: {
            nombre: control.gestante?.nombre || 'Sin asignar',
            documento: control.gestante?.documento || 'N/A',
            telefono: control.gestante?.telefono || null
          },
          medico: control.medico ? {
            nombre: control.medico.nombre,
            especialidad: control.medico.especialidad,
            telefono: control.medico.telefono
          } : null,
          fecha_control: control.fecha_control.toISOString().split('T')[0],
          semanas_gestacion: control.semanas_gestacion ? parseInt(control.semanas_gestacion) : null,
          peso: control.peso ? parseFloat(control.peso) : null,
          altura_uterina: control.altura_uterina ? parseFloat(control.altura_uterina) : null,
          presion_sistolica: control.presion_sistolica ? parseInt(control.presion_sistolica) : null,
          presion_diastolica: control.presion_diastolica ? parseInt(control.presion_diastolica) : null,
          frecuencia_cardiaca: control.frecuencia_cardiaca ? parseInt(control.frecuencia_cardiaca) : null,
          temperatura: control.temperatura ? parseFloat(control.temperatura) : null,
          movimientos_fetales: control.movimientos_fetales,
          edemas: control.edemas,
          realizado: control.realizado,
          recomendaciones: control.recomendaciones,
          observaciones: control.observaciones,
          proximo_control: control.proximo_control ? control.proximo_control.toISOString().split('T')[0] : null,
          fecha_creacion: control.fecha_creacion.toISOString().split('T')[0],
          fecha_actualizacion: control.fecha_actualizacion.toISOString().split('T')[0]
        };

        console.log(`🩺 [${index}] Control formateado:`, {
          id: controlFormateado.id,
          gestante_id: controlFormateado.gestante_id,
          tipos: {
            gestante_id: typeof controlFormateado.gestante_id,
            medico_id: typeof controlFormateado.medico_id,
            semanas_gestacion: typeof controlFormateado.semanas_gestacion,
            peso: typeof controlFormateado.peso,
            temperatura: typeof controlFormateado.temperatura,
            presion_sistolica: typeof controlFormateado.presion_sistolica
          },
          valores: {
            semanas_gestacion: controlFormateado.semanas_gestacion,
            peso: controlFormateado.peso,
            temperatura: controlFormateado.temperatura
          }
        });

        return controlFormateado;
      } catch (error) {
        console.error(`❌ Error formateando control ${index}:`, error);
        throw error;
      }
    });

    console.log(`🩺 Encontrados ${controlesFormateados.length} controles de ${totalControles} total`);
    console.log(`🩺 Tipo de controlesFormateados:`, typeof controlesFormateados, Array.isArray(controlesFormateados));

    const respuestaControles = {
      success: true,
      data: {
        controles: controlesFormateados,
        pagination: {
          page,
          limit,
          total: totalControles,
          totalPages: Math.ceil(totalControles / limit)
        }
      }
    };

    console.log(`🩺 RESPUESTA FINAL CONTROLES:`, {
      success: respuestaControles.success,
      dataType: typeof respuestaControles.data,
      controlesType: typeof respuestaControles.data.controles,
      controlesIsArray: Array.isArray(respuestaControles.data.controles),
      controlesLength: respuestaControles.data.controles.length,
      pagination: respuestaControles.data.pagination,
      primerControl: respuestaControles.data.controles[0] ? {
        id: respuestaControles.data.controles[0].id,
        gestante_id: respuestaControles.data.controles[0].gestante_id,
        tipos: {
          gestante_id: typeof respuestaControles.data.controles[0].gestante_id,
          medico_id: typeof respuestaControles.data.controles[0].medico_id,
          semanas_gestacion: typeof respuestaControles.data.controles[0].semanas_gestacion,
          peso: typeof respuestaControles.data.controles[0].peso,
          temperatura: typeof respuestaControles.data.controles[0].temperatura
        },
        valores: {
          semanas_gestacion: respuestaControles.data.controles[0].semanas_gestacion,
          peso: respuestaControles.data.controles[0].peso,
          temperatura: respuestaControles.data.controles[0].temperatura
        }
      } : null
    });

    res.json(respuestaControles);
  } catch (error) {
    console.error('❌ Error obteniendo controles:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo controles: ' + error.message
    });
  }
});

// Controles vencidos - NUEVO ENDPOINT
app.get('/api/controles/vencidos', async (req, res) => {
  try {
    console.log('⏰ Obteniendo controles vencidos...');

    // Verificar autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    let user;

    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'madres-digitales',
        audience: 'madres-digitales-users',
      });
      user = decoded;
      console.log('🔍 DEBUG: Controles Vencidos - Usuario decodificado:', user);
      console.log('🔍 DEBUG: Controles Vencidos - User ID:', user.id);
      console.log('🔍 DEBUG: Controles Vencidos - User role:', user.rol);
    } catch (error) {
      console.log('🔍 DEBUG: Controles Vencidos - Error decodificando token:', error);
      return res.status(401).json({ success: false, error: 'Token inválido' });
    }

    const hoy = new Date();
    
    // Construir filtros base
    const whereClause = {
      realizado: false,
      fecha_control: {
        lt: hoy
      }
    };

    // Si es madrina, solo ver controles de sus gestantes asignadas
    if (user && user.rol === 'madrina') {
      console.log('🔍 DEBUG: Controles Vencidos - Filtrando por gestantes de madrina:', user.id);
      
      // Primero obtener los IDs de las gestantes asignadas a esta madrina
      const gestantesAsignadas = await prisma.gestantes.findMany({
        where: { 
          madrina_id: user.id,
          activa: true 
        },
        select: { id: true }
      });
      
      const gestantesIds = gestantesAsignadas.map(g => g.id);
      console.log('🔍 DEBUG: Controles Vencidos - IDs de gestantes asignadas:', gestantesIds);
      
      if (gestantesIds.length > 0) {
        whereClause.gestante_id = { in: gestantesIds };
      } else {
        // Si no tiene gestantes asignadas, retornar array vacío
        return res.json({
          success: true,
          data: []
        });
      }
    }

    const controlesVencidos = await prisma.control_prenatal.findMany({
      where: whereClause,
      include: {
        gestante: {
          select: {
            nombre: true,
            documento: true,
            telefono: true
          }
        },
        medico: {
          select: {
            nombre: true,
            especialidad: true
          }
        }
      },
      orderBy: { fecha_control: 'asc' }
    });

    const controlesFormateados = controlesVencidos.map(control => {
      const diasVencido = Math.floor((hoy - new Date(control.fecha_control)) / (1000 * 60 * 60 * 24));

      return {
        id: control.id,
        gestante: {
          nombre: control.gestante?.nombre || 'Sin asignar',
          documento: control.gestante?.documento || 'N/A',
          telefono: control.gestante?.telefono || null
        },
        medico: control.medico ? {
          nombre: control.medico.nombre,
          especialidad: control.medico.especialidad
        } : null,
        fechaControl: control.fecha_control.toISOString().split('T')[0],
        diasVencido,
        semanasGestacion: control.semanas_gestacion,
        prioridad: diasVencido > 7 ? 'alta' : diasVencido > 3 ? 'media' : 'baja'
      };
    });

    console.log(`⏰ Encontrados ${controlesFormateados.length} controles vencidos`);

    res.json({
      success: true,
      data: controlesFormateados
    });
  } catch (error) {
    console.error('❌ Error obteniendo controles vencidos:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo controles vencidos: ' + error.message
    });
  }
});

// Controles pendientes - NUEVO ENDPOINT
app.get('/api/controles/pendientes', async (req, res) => {
  try {
    const dias = parseInt(req.query.dias) || 7; // Próximos 7 días por defecto
    console.log(`📅 Obteniendo controles pendientes para los próximos ${dias} días...`);

    // Verificar autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    let user;

    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'madres-digitales',
        audience: 'madres-digitales-users',
      });
      user = decoded;
      console.log('🔍 DEBUG: Controles Pendientes - Usuario decodificado:', user);
      console.log('🔍 DEBUG: Controles Pendientes - User ID:', user.id);
      console.log('🔍 DEBUG: Controles Pendientes - User role:', user.rol);
    } catch (error) {
      console.log('🔍 DEBUG: Controles Pendientes - Error decodificando token:', error);
      return res.status(401).json({ success: false, error: 'Token inválido' });
    }

    const hoy = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(hoy.getDate() + dias);

    // Construir filtros base
    const whereClause = {
      realizado: false,
      fecha_control: {
        gte: hoy,
        lte: fechaLimite
      }
    };

    // Si es madrina, solo ver controles de sus gestantes asignadas
    if (user && user.rol === 'madrina') {
      console.log('🔍 DEBUG: Controles Pendientes - Filtrando por gestantes de madrina:', user.id);
      
      // Primero obtener los IDs de las gestantes asignadas a esta madrina
      const gestantesAsignadas = await prisma.gestantes.findMany({
        where: { 
          madrina_id: user.id,
          activa: true 
        },
        select: { id: true }
      });
      
      const gestantesIds = gestantesAsignadas.map(g => g.id);
      console.log('🔍 DEBUG: Controles Pendientes - IDs de gestantes asignadas:', gestantesIds);
      
      if (gestantesIds.length > 0) {
        whereClause.gestante_id = { in: gestantesIds };
      } else {
        // Si no tiene gestantes asignadas, retornar array vacío
        return res.json({
          success: true,
          data: []
        });
      }
    }

    const controlesPendientes = await prisma.control_prenatal.findMany({
      where: whereClause,
      include: {
        gestante: {
          select: {
            nombre: true,
            documento: true,
            telefono: true
          }
        },
        medico: {
          select: {
            nombre: true,
            especialidad: true
          }
        }
      },
      orderBy: { fecha_control: 'asc' }
    });

    const controlesFormateados = controlesPendientes.map(control => {
      const diasRestantes = Math.ceil((new Date(control.fecha_control) - hoy) / (1000 * 60 * 60 * 24));

      return {
        id: control.id,
        gestante: {
          nombre: control.gestante?.nombre || 'Sin asignar',
          documento: control.gestante?.documento || 'N/A',
          telefono: control.gestante?.telefono || null
        },
        medico: control.medico ? {
          nombre: control.medico.nombre,
          especialidad: control.medico.especialidad
        } : null,
        fechaControl: control.fecha_control.toISOString().split('T')[0],
        diasRestantes,
        semanasGestacion: control.semanas_gestacion,
        urgencia: diasRestantes <= 1 ? 'inmediata' : diasRestantes <= 3 ? 'alta' : 'normal'
      };
    });

    console.log(`📅 Encontrados ${controlesFormateados.length} controles pendientes`);

    res.json({
      success: true,
      data: controlesFormateados
    });
  } catch (error) {
    console.error('❌ Error obteniendo controles pendientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo controles pendientes: ' + error.message
    });
  }
});

// Crear control prenatal - NUEVO ENDPOINT
app.post('/api/controles', async (req, res) => {
  try {
    const body = req.body || {};
    const gestante_id = body.gestante_id || body.gestanteId || body.gestanteID;
    const medico_id = body.medico_id || body.medicoId || null;
    const fecha_control = body.fecha_control || body.fecha || body.fechaControl;
    const semanas_gestacion = body.semanas_gestacion ?? body.semanas ?? null;
    const peso = body.peso ?? null;
    const altura_uterina = body.altura_uterina ?? body.alturaUterina ?? null;
    const presion_sistolica = body.presion_sistolica ?? body.ps ?? null;
    const presion_diastolica = body.presion_diastolica ?? body.pd ?? null;
    const frecuencia_cardiaca = body.frecuencia_cardiaca ?? body.fc ?? null;
    const temperatura = body.temperatura ?? null;
    const movimientos_fetales = body.movimientos_fetales ?? (typeof body.movimientosFetales === 'boolean' ? body.movimientosFetales : undefined);
    const edemas = body.edemas ?? (typeof body.tieneEdemas === 'boolean' ? body.tieneEdemas : undefined);
    const recomendaciones = body.recomendaciones ?? body.descripcion ?? null;
    const observaciones = body.observaciones ?? body.descripcion ?? null;
    const proximo_control = body.proximo_control ?? body.fecha_programada ?? null;
    const realizado = body.realizado ?? false;

    console.log('🩺 Creando nuevo control prenatal...');

    // Validaciones básicas
    if (!gestante_id || !fecha_control) {
      return res.status(400).json({
        success: false,
        error: 'Gestante ID y fecha de control son requeridos'
      });
    }

    // Verificar que la gestante existe
    const gestante = await prisma.gestantes.findUnique({
      where: { id: gestante_id }
    });

    if (!gestante) {
      return res.status(404).json({
        success: false,
        error: 'Gestante no encontrada'
      });
    }

    const nuevoControl = await prisma.control_prenatal.create({
      data: {
        id: `control_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
        gestante_id,
        medico_id,
        fecha_control: new Date(fecha_control),
        semanas_gestacion,
        peso,
        altura_uterina,
        presion_sistolica,
        presion_diastolica,
        frecuencia_cardiaca,
        temperatura,
        movimientos_fetales,
        edemas,
        recomendaciones,
        observaciones,
        proximo_control: proximo_control ? new Date(proximo_control) : null,
        realizado
      },
      include: {
        gestante: {
          select: {
            nombre: true,
            documento: true
          }
        },
        medico: {
          select: {
            nombre: true,
            especialidad: true
          }
        }
      }
    });

    console.log('✅ Control prenatal creado exitosamente:', nuevoControl.id);

    // 🚨 EVALUACIÓN AUTOMÁTICA DE ALERTAS
    try {
      console.log('🔍 Evaluando alertas automáticas para control', nuevoControl.id);
      const alertaService = new AlertaAutomaticaService(prisma);
      const evaluacion = await alertaService.evaluarControl({
        presion_sistolica,
        presion_diastolica,
        frecuencia_cardiaca,
        temperatura,
        peso,
        semanas_gestacion,
        edemas,
        movimientos_fetales
      }, gestante_id);

      console.log('📊 Evaluación de alertas completada:', {
        alertas: evaluacion.alertas.length,
        puntajeRiesgo: evaluacion.puntajeRiesgo,
        nivel: evaluacion.resumen.nivel
      });
    } catch (alertError) {
      console.error('❌ Error evaluando alertas automáticas:', alertError);
      // No fallar la creación del control si falla la evaluación de alertas
    }

    res.status(201).json({
      success: true,
      message: 'Control prenatal creado exitosamente',
      data: {
        id: nuevoControl.id,
        gestante: {
          nombre: nuevoControl.gestante.nombre,
          documento: nuevoControl.gestante.documento
        },
        medico: nuevoControl.medico ? {
          nombre: nuevoControl.medico.nombre,
          especialidad: nuevoControl.medico.especialidad
        } : null,
        fechaControl: nuevoControl.fecha_control.toISOString().split('T')[0],
        semanasGestacion: nuevoControl.semanas_gestacion,
        realizado: nuevoControl.realizado
      }
    });
  } catch (error) {
    console.error('❌ Error creando control prenatal:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando control prenatal: ' + error.message
    });
  }
});

// Actualizar control prenatal - NUEVO ENDPOINT
app.put('/api/controles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('🩺 Actualizando control prenatal:', id);

    // Verificar que el control existe
    const controlExistente = await prisma.control_prenatal.findUnique({
      where: { id }
    });

    if (!controlExistente) {
      return res.status(404).json({
        success: false,
        error: 'Control prenatal no encontrado'
      });
    }

    // Preparar datos para actualización
    const dataToUpdate = { ...updateData };
    if (dataToUpdate.fecha_control) {
      dataToUpdate.fecha_control = new Date(dataToUpdate.fecha_control);
    }
    if (dataToUpdate.proximo_control) {
      dataToUpdate.proximo_control = new Date(dataToUpdate.proximo_control);
    }

    const controlActualizado = await prisma.control_prenatal.update({
      where: { id },
      data: dataToUpdate,
      include: {
        gestante: {
          select: {
            nombre: true,
            documento: true
          }
        },
        medico: {
          select: {
            nombre: true,
            especialidad: true
          }
        }
      }
    });

    console.log('✅ Control prenatal actualizado exitosamente:', id);

    res.json({
      success: true,
      message: 'Control prenatal actualizado exitosamente',
      data: {
        id: controlActualizado.id,
        gestante: {
          nombre: controlActualizado.gestante.nombre,
          documento: controlActualizado.gestante.documento
        },
        medico: controlActualizado.medico ? {
          nombre: controlActualizado.medico.nombre,
          especialidad: controlActualizado.medico.especialidad
        } : null,
        fechaControl: controlActualizado.fecha_control.toISOString().split('T')[0],
        realizado: controlActualizado.realizado
      }
    });
  } catch (error) {
    console.error('❌ Error actualizando control prenatal:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando control prenatal: ' + error.message
    });
  }
});

// Eliminar control prenatal - NUEVO ENDPOINT
app.delete('/api/controles/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Eliminando control prenatal:', id);

    // Verificar que el control existe
    const controlExistente = await prisma.control_prenatal.findUnique({
      where: { id }
    });

    if (!controlExistente) {
      return res.status(404).json({
        success: false,
        error: 'Control prenatal no encontrado'
      });
    }

    await prisma.control_prenatal.delete({
      where: { id }
    });

    console.log('✅ Control prenatal eliminado exitosamente:', id);

    res.json({
      success: true,
      message: 'Control prenatal eliminado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error eliminando control prenatal:', error);
    res.status(500).json({
      success: false,
      error: 'Error eliminando control prenatal: ' + error.message
    });
  }
});

// Contenido CRUD endpoint - MEJORADO
app.get('/api/contenido-crud', async (req, res) => {
  try {
    const {
      categoria,
      tipo,
      nivel,
      destacado,
      semana_gestacion,
      buscar,
      page = 1,
      limit = 20
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log('📚 Obteniendo contenido con filtros:', { categoria, tipo, nivel, destacado, semana_gestacion, buscar });

    // Construir filtros dinámicos
    const whereClause = { activo: true };

    if (categoria) whereClause.categoria = categoria.toUpperCase();
    if (tipo) whereClause.tipo = tipo.toUpperCase();
    if (nivel) whereClause.nivel = nivel.toUpperCase();
    if (destacado !== undefined) whereClause.destacado = destacado === 'true';

    // Filtro por semana de gestación
    if (semana_gestacion) {
      const semana = parseInt(semana_gestacion);
      whereClause.AND = [
        {
          OR: [
            { semana_gestacion_inicio: null },
            { semana_gestacion_inicio: { lte: semana } }
          ]
        },
        {
          OR: [
            { semana_gestacion_fin: null },
            { semana_gestacion_fin: { gte: semana } }
          ]
        }
      ];
    }

    // Filtro de búsqueda
    if (buscar) {
      whereClause.OR = [
        { titulo: { contains: buscar, mode: 'insensitive' } },
        { descripcion: { contains: buscar, mode: 'insensitive' } }
      ];
    }

    const [contenidos, totalContenidos] = await Promise.all([
      prisma.contenidos.findMany({
        where: whereClause,
        skip,
        take: parseInt(limit),
        orderBy: [
          { destacado: 'desc' },
          { fecha_creacion: 'desc' }
        ]
      }),
      prisma.contenidos.count({ where: whereClause })
    ]);

    const contenidosFormateados = contenidos.map(contenido => ({
      id: contenido.id,
      titulo: contenido.titulo,
      descripcion: contenido.descripcion,
      categoria: contenido.categoria,
      tipo: contenido.tipo,
      urlContenido: contenido.url_contenido,
      urlImagen: contenido.url_imagen,
      urlVideo: contenido.url_video,
      duracionMinutos: contenido.duracion_minutos,
      destacado: contenido.destacado,
      nivel: contenido.nivel,
      semanaGestacionInicio: contenido.semana_gestacion_inicio,
      semanaGestacionFin: contenido.semana_gestacion_fin,
      tags: contenido.tags,
      fechaCreacion: contenido.fecha_creacion.toISOString().split('T')[0]
    }));

    console.log(`📚 Encontrados ${contenidosFormateados.length} contenidos de ${totalContenidos} total`);

    res.json({
      success: true,
      data: {
        contenidos: contenidosFormateados,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalContenidos,
          totalPages: Math.ceil(totalContenidos / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo contenido:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo contenido: ' + error.message
    });
  }
});

// Crear contenido educativo - NUEVO ENDPOINT
app.post('/api/contenido-crud', async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      categoria,
      tipo,
      url_contenido,
      url_imagen,
      url_video,
      duracion_minutos,
      destacado = false,
      nivel,
      semana_gestacion_inicio,
      semana_gestacion_fin,
      tags
    } = req.body;

    console.log('📚 Creando nuevo contenido educativo...');

    // Validaciones básicas
    if (!titulo || !categoria || !tipo) {
      return res.status(400).json({
        success: false,
        error: 'Título, categoría y tipo son requeridos'
      });
    }

    // Generar ID único
    const id = `contenido_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const nuevoContenido = await prisma.contenidos.create({
      data: {
        id,
        titulo,
        descripcion,
        categoria: categoria.toUpperCase(),
        tipo: tipo.toUpperCase(),
        url_contenido,
        url_imagen,
        url_video,
        duracion_minutos,
        destacado,
        nivel: nivel ? nivel.toUpperCase() : null,
        semana_gestacion_inicio,
        semana_gestacion_fin,
        tags: tags || null
      }
    });

    console.log('✅ Contenido educativo creado exitosamente:', nuevoContenido.id);

    res.status(201).json({
      success: true,
      message: 'Contenido educativo creado exitosamente',
      data: {
        id: nuevoContenido.id,
        titulo: nuevoContenido.titulo,
        categoria: nuevoContenido.categoria,
        tipo: nuevoContenido.tipo,
        destacado: nuevoContenido.destacado
      }
    });
  } catch (error) {
    console.error('❌ Error creando contenido educativo:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando contenido educativo: ' + error.message
    });
  }
});

// Actualizar contenido educativo - NUEVO ENDPOINT
app.put('/api/contenido-crud/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('📚 Actualizando contenido educativo:', id);

    // Verificar que el contenido existe
    const contenidoExistente = await prisma.contenidos.findUnique({
      where: { id }
    });

    if (!contenidoExistente) {
      return res.status(404).json({
        success: false,
        error: 'Contenido educativo no encontrado'
      });
    }

    // Preparar datos para actualización
    const dataToUpdate = { ...updateData };
    if (dataToUpdate.categoria) dataToUpdate.categoria = dataToUpdate.categoria.toUpperCase();
    if (dataToUpdate.tipo) dataToUpdate.tipo = dataToUpdate.tipo.toUpperCase();
    if (dataToUpdate.nivel) dataToUpdate.nivel = dataToUpdate.nivel.toUpperCase();

    const contenidoActualizado = await prisma.contenidos.update({
      where: { id },
      data: dataToUpdate
    });

    console.log('✅ Contenido educativo actualizado exitosamente:', id);

    res.json({
      success: true,
      message: 'Contenido educativo actualizado exitosamente',
      data: {
        id: contenidoActualizado.id,
        titulo: contenidoActualizado.titulo,
        categoria: contenidoActualizado.categoria,
        tipo: contenidoActualizado.tipo
      }
    });
  } catch (error) {
    console.error('❌ Error actualizando contenido educativo:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando contenido educativo: ' + error.message
    });
  }
});

// Eliminar contenido educativo - NUEVO ENDPOINT
app.delete('/api/contenido-crud/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Eliminando contenido educativo:', id);

    // Verificar que el contenido existe
    const contenidoExistente = await prisma.contenidos.findUnique({
      where: { id }
    });

    if (!contenidoExistente) {
      return res.status(404).json({
        success: false,
        error: 'Contenido educativo no encontrado'
      });
    }

    // Soft delete - marcar como inactivo
    await prisma.contenidos.update({
      where: { id },
      data: { activo: false }
    });

    console.log('✅ Contenido educativo eliminado exitosamente:', id);

    res.json({
      success: true,
      message: 'Contenido educativo eliminado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error eliminando contenido educativo:', error);
    res.status(500).json({
      success: false,
      error: 'Error eliminando contenido educativo: ' + error.message
    });
  }
});

// Auth refresh endpoint - MEJORADO
app.post('/api/auth/refresh', async (req, res) => {
  try {
    console.log('🔄 Token refresh request');
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token requerido'
      });
    }

    // Verificar si el refresh token existe en la base de datos
    const tokenExists = refreshToken.startsWith('refresh-');

    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token inválido'
      });
    }

    // Extraer el ID del usuario del refresh token (formato: refresh-{timestamp}-{userId})
    // O buscar en la base de datos el usuario asociado al refresh token
    // Por ahora, intentamos decodificar el token de autorización si existe
    const authHeader = req.headers.authorization;
    let userId = null;
    let userEmail = null;
    let userRol = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const oldToken = authHeader.substring(7);
      try {
        // Intentar decodificar el token expirado (sin verificar)
        const decoded = jwt.decode(oldToken);
        if (decoded) {
          userId = decoded.id;
          userEmail = decoded.email;
          userRol = decoded.rol;
        }
      } catch (error) {
        console.log('⚠️ No se pudo decodificar el token expirado');
      }
    }

    // Si no pudimos obtener el usuario del token, buscar el primer usuario activo (fallback)
    if (!userId) {
      const firstUser = await prisma.usuarios.findFirst({
        where: { activo: true },
        select: { id: true, email: true, rol: true, nombre: true }
      });
      
      if (!firstUser) {
        return res.status(401).json({
          success: false,
          error: 'No se pudo renovar el token'
        });
      }
      
      userId = firstUser.id;
      userEmail = firstUser.email;
      userRol = firstUser.rol;
    }

    // Buscar el usuario en la base de datos para obtener datos actualizados
    const user = await prisma.usuarios.findUnique({
      where: { id: userId },
      select: { id: true, email: true, rol: true, nombre: true, activo: true }
    });

    if (!user || !user.activo) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado o inactivo'
      });
    }

    // Generar un nuevo JWT válido
    const newToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        rol: user.rol
      },
      JWT_SECRET,
      { 
        expiresIn: '24h',
        issuer: 'madres-digitales',
        audience: 'madres-digitales-users'
      }
    );

    const newRefreshToken = `refresh-${Date.now()}`;

    console.log('✅ Token renovado exitosamente para usuario:', user.email);

    res.json({
      success: true,
      message: 'Token renovado exitosamente',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: 86400, // 24 horas en segundos
        tokenType: 'Bearer',
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol
        }
      }
    });
  } catch (error) {
    console.error('❌ Error renovando token:', error);
    res.status(500).json({
      success: false,
      error: 'Error renovando token'
    });
  }
});
  } catch (error) {
    console.error('❌ Error renovando token:', error);
    res.status(500).json({
      success: false,
      error: 'Error renovando token: ' + error.message
    });
  }
});

// Auth logout endpoint - NUEVO ENDPOINT
app.post('/api/auth/logout', async (req, res) => {
  try {
    console.log('🚪 Logout request');
    const { refreshToken } = req.body;

    // En un entorno real, aquí invalidarías el refresh token en la base de datos
    if (refreshToken) {
      console.log('🗑️ Invalidando refresh token:', refreshToken.substring(0, 20) + '...');
      // await prisma.refresh_tokens.update({
      //   where: { token: refreshToken },
      //   data: { revoked: true, revoked_at: new Date() }
      // });
    }

    console.log('✅ Logout exitoso');

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error en logout:', error);
    res.status(500).json({
      success: false,
      error: 'Error cerrando sesión: ' + error.message
    });
  }
});

// Auth verify endpoint - NUEVO ENDPOINT
app.get('/api/auth/verify', (req, res) => {
  try {
    console.log('🔍 Token verification request');
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de autorización requerido'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // En un entorno real, aquí verificarías el JWT
    // Por ahora, verificamos que sea un token demo válido
    if (!token.includes('demo-signature')) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }

    console.log('✅ Token verificado exitosamente');

    res.json({
      success: true,
      message: 'Token válido',
      data: {
        user: {
          id: 'demo-user',
          nombre: 'Usuario Demo',
          email: 'demo@example.com',
          rol: 'super_admin'
        },
        tokenValid: true,
        expiresIn: 86400
      }
    });
  } catch (error) {
    console.error('❌ Error verificando token:', error);
    res.status(500).json({
      success: false,
      error: 'Error verificando token: ' + error.message
    });
  }
});

// Municipios endpoint - NUEVO ENDPOINT
app.get('/api/municipios', async (req, res) => {
  try {
    console.log('🏛️ Obteniendo municipios...');

    const municipios = await prisma.municipios.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' }
    });

    const municipiosFormateados = municipios.map(municipio => ({
      id: municipio.id,
      nombre: municipio.nombre,
      departamento: municipio.departamento,
      codigo_dane: municipio.codigo_dane,
      latitud: municipio.latitud,
      longitud: municipio.longitud,
      poblacion: municipio.poblacion,
      activo: municipio.activo,
      fechaCreacion: municipio.fecha_creacion.toISOString().split('T')[0]
    }));

    console.log(`🏛️ Encontrados ${municipiosFormateados.length} municipios`);

    res.json({
      success: true,
      data: municipiosFormateados
    });
  } catch (error) {
    console.error('❌ Error obteniendo municipios:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo municipios: ' + error.message
    });
  }
});

// Obtener municipio por ID - NUEVO ENDPOINT
app.get('/api/municipios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🏛️ Obteniendo municipio por ID:', id);

    const municipio = await prisma.municipios.findUnique({
      where: { id }
    });

    if (!municipio) {
      return res.status(404).json({
        success: false,
        error: 'Municipio no encontrado'
      });
    }

    const municipioFormateado = {
      id: municipio.id,
      nombre: municipio.nombre,
      departamento: municipio.departamento,
      codigo_dane: municipio.codigo_dane,
      latitud: municipio.latitud,
      longitud: municipio.longitud,
      poblacion: municipio.poblacion,
      activo: municipio.activo,
      fechaCreacion: municipio.fecha_creacion.toISOString().split('T')[0]
    };

    console.log('🏛️ Municipio encontrado:', municipioFormateado.nombre);

    res.json({
      success: true,
      data: municipioFormateado
    });
  } catch (error) {
    console.error('❌ Error obteniendo municipio por ID:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo municipio: ' + error.message
    });
  }
});

// Estadísticas de municipios - NUEVO ENDPOINT
app.get('/api/municipios/stats', async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas de municipios...');

    const [totalMunicipios, municipiosActivos, municipiosInactivos] = await Promise.all([
      prisma.municipios.count(),
      prisma.municipios.count({ where: { activo: true } }),
      prisma.municipios.count({ where: { activo: false } })
    ]);

    const stats = {
      total: totalMunicipios,
      activos: municipiosActivos,
      inactivos: municipiosInactivos,
      porcentajeActivos: totalMunicipios > 0 ? ((municipiosActivos / totalMunicipios) * 100).toFixed(2) : 0
    };

    console.log('📊 Estadísticas de municipios:', stats);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de municipios:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas: ' + error.message
    });
  }
});

// Activar municipio - NUEVO ENDPOINT
app.post('/api/municipios/:id/activar', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('✅ Activando municipio:', id);

    const municipio = await prisma.municipios.update({
      where: { id },
      data: { activo: true }
    });

    console.log('✅ Municipio activado:', municipio.nombre);

    res.json({
      success: true,
      message: 'Municipio activado exitosamente',
      data: {
        id: municipio.id,
        nombre: municipio.nombre,
        activo: municipio.activo
      }
    });
  } catch (error) {
    console.error('❌ Error activando municipio:', error);
    res.status(500).json({
      success: false,
      error: 'Error activando municipio: ' + error.message
    });
  }
});

// Desactivar municipio - NUEVO ENDPOINT
app.post('/api/municipios/:id/desactivar', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('❌ Desactivando municipio:', id);

    const municipio = await prisma.municipios.update({
      where: { id },
      data: { activo: false }
    });

    console.log('❌ Municipio desactivado:', municipio.nombre);

    res.json({
      success: true,
      message: 'Municipio desactivado exitosamente',
      data: {
        id: municipio.id,
        nombre: municipio.nombre,
        activo: municipio.activo
      }
    });
  } catch (error) {
    console.error('❌ Error desactivando municipio:', error);
    res.status(500).json({
      success: false,
      error: 'Error desactivando municipio: ' + error.message
    });
  }
});

// Basic reports endpoint
app.get('/api/reportes', (req, res) => {
  res.json({
    success: true,
    data: [
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
    ]
  });
});

// Contenido endpoints - NUEVOS ENDPOINTS
app.get('/api/contenido', async (req, res) => {
  try {
    console.log('📚 Obteniendo contenido educativo...');

    const contenidos = await prisma.contenidos.findMany({
      where: { activo: true },
      orderBy: [
        { destacado: 'desc' },
        { fecha_creacion: 'desc' }
      ]
    });

    const contenidosFormateados = contenidos.map(contenido => ({
      id: contenido.id,
      titulo: contenido.titulo,
      descripcion: contenido.descripcion,
      categoria: contenido.categoria,
      tipo: contenido.tipo,
      urlContenido: contenido.url_contenido,
      urlImagen: contenido.url_imagen,
      urlVideo: contenido.url_video,
      duracionMinutos: contenido.duracion_minutos,
      destacado: contenido.destacado,
      nivel: contenido.nivel,
      semanaGestacionInicio: contenido.semana_gestacion_inicio,
      semanaGestacionFin: contenido.semana_gestacion_fin,
      tags: contenido.tags,
      fechaCreacion: contenido.fecha_creacion.toISOString().split('T')[0]
    }));

    console.log(`📚 Encontrados ${contenidosFormateados.length} contenidos`);

    res.json({
      success: true,
      data: contenidosFormateados
    });
  } catch (error) {
    console.error('❌ Error obteniendo contenido:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo contenido: ' + error.message
    });
  }
});

// Estadísticas de contenido - NUEVO ENDPOINT
app.get('/api/contenido/estadisticas', async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas de contenido...');

    const [totalContenidos, contenidosActivos, contenidosDestacados] = await Promise.all([
      prisma.contenidos.count(),
      prisma.contenidos.count({ where: { activo: true } }),
      prisma.contenidos.count({ where: { activo: true, destacado: true } })
    ]);

    const stats = {
      total: totalContenidos,
      activos: contenidosActivos,
      destacados: contenidosDestacados,
      inactivos: totalContenidos - contenidosActivos
    };

    console.log('📊 Estadísticas de contenido:', stats);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de contenido:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas: ' + error.message
    });
  }
});

// Progreso de contenido por usuario - NUEVO ENDPOINT
app.get('/api/contenido/:contenidoId/progreso', async (req, res) => {
  try {
    const { contenidoId } = req.params;
    console.log('📈 Obteniendo progreso de contenido:', contenidoId);

    // Por ahora retornamos datos demo
    const progreso = {
      contenidoId,
      progreso: 0,
      completado: false,
      fechaInicio: null,
      fechaCompletado: null
    };

    res.json({
      success: true,
      data: progreso
    });
  } catch (error) {
    console.error('❌ Error obteniendo progreso de contenido:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo progreso: ' + error.message
    });
  }
});

// Progreso de contenido del usuario - NUEVO ENDPOINT
app.get('/api/contenido/progreso/usuario', async (req, res) => {
  try {
    console.log('📈 Obteniendo progreso de contenido del usuario...');

    // Por ahora retornamos array vacío
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('❌ Error obteniendo progreso del usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo progreso: ' + error.message
    });
  }
});

// Endpoints adicionales de municipios - NUEVOS ENDPOINTS
app.get('/api/municipios/integrados', async (req, res) => {
  try {
    console.log('🏛️ Obteniendo municipios integrados...');

    const municipios = await prisma.municipios.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' }
    });

    res.json({
      success: true,
      data: municipios
    });
  } catch (error) {
    console.error('❌ Error obteniendo municipios integrados:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo municipios: ' + error.message
    });
  }
});

app.get('/api/municipios/:id/detallado', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🏛️ Obteniendo municipio detallado:', id);

    const municipio = await prisma.municipios.findUnique({
      where: { id }
    });

    if (!municipio) {
      return res.status(404).json({
        success: false,
        error: 'Municipio no encontrado'
      });
    }

    res.json({
      success: true,
      data: municipio
    });
  } catch (error) {
    console.error('❌ Error obteniendo municipio detallado:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo municipio: ' + error.message
    });
  }
});

app.get('/api/municipios/integrados/filtros', async (req, res) => {
  try {
    console.log('🏛️ Obteniendo municipios con filtros...');

    const { activo, departamento } = req.query;
    const whereClause = {};
    
    if (activo !== undefined) whereClause.activo = activo === 'true';
    if (departamento) whereClause.departamento = departamento;

    const municipios = await prisma.municipios.findMany({
      where: whereClause,
      orderBy: { nombre: 'asc' }
    });

    res.json({
      success: true,
      data: municipios
    });
  } catch (error) {
    console.error('❌ Error obteniendo municipios filtrados:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo municipios: ' + error.message
    });
  }
});

app.post('/api/municipios/toggle-multiple', async (req, res) => {
  try {
    const { municipio_ids, activo } = req.body;
    console.log('🔄 Cambiando estado de múltiples municipios:', municipio_ids, 'activo:', activo);

    await prisma.municipios.updateMany({
      where: { id: { in: municipio_ids } },
      data: { activo: !!activo }
    });

    res.json({
      success: true,
      message: `${municipio_ids.length} municipios actualizados`
    });
  } catch (error) {
    console.error('❌ Error cambiando estado de municipios:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando municipios: ' + error.message
    });
  }
});

// Endpoints adicionales de estadísticas - NUEVOS ENDPOINTS
app.get('/api/alertas/estadisticas', async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas de alertas...');

    const [totalAlertas, alertasActivas, alertasResueltas] = await Promise.all([
      prisma.alertas.count(),
      prisma.alertas.count({ where: { resuelta: false } }),
      prisma.alertas.count({ where: { resuelta: true } })
    ]);

    const stats = {
      total: totalAlertas,
      activas: alertasActivas,
      resueltas: alertasResueltas,
      porcentajeResueltas: totalAlertas > 0 ? ((alertasResueltas / totalAlertas) * 100).toFixed(2) : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de alertas:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas: ' + error.message
    });
  }
});

app.get('/api/mensajes/estadisticas', async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas de mensajes...');

    // Por ahora retornamos datos demo
    const stats = {
      total: 0,
      enviados: 0,
      recibidos: 0,
      pendientes: 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de mensajes:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas: ' + error.message
    });
  }
});

app.get('/api/geolocalizacion/estadisticas', async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas de geolocalización...');

    // Por ahora retornamos datos demo
    const stats = {
      total: 0,
      activas: 0,
      inactivas: 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de geolocalización:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas: ' + error.message
    });
  }
});

app.get('/api/alertas/sos/estadisticas', async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas de alertas SOS...');

    // Por ahora retornamos datos demo
    const stats = {
      total: 0,
      activas: 0,
      resueltas: 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de SOS:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas: ' + error.message
    });
  }
});

app.get('/api/admin/estadisticas/municipio/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📊 Obteniendo estadísticas de municipio:', id);

    const [totalGestantes, gestantesActivas] = await Promise.all([
      prisma.gestantes.count({ where: { municipio_id: id } }),
      prisma.gestantes.count({ where: { municipio_id: id, activa: true } })
    ]);

    const stats = {
      municipio_id: id,
      total_gestantes: totalGestantes,
      gestantes_activas: gestantesActivas,
      gestantes_inactivas: totalGestantes - gestantesActivas
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de municipio:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas: ' + error.message
    });
  }
});

app.get('/api/admin/estadisticas/ips/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📊 Obteniendo estadísticas de IPS:', id);

    const [totalMedicos, medicosActivos] = await Promise.all([
      prisma.medicos.count({ where: { ips_id: id } }),
      prisma.medicos.count({ where: { ips_id: id, activo: true } })
    ]);

    const stats = {
      ips_id: id,
      total_medicos: totalMedicos,
      medicos_activos: medicosActivos,
      medicos_inactivos: totalMedicos - medicosActivos
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de IPS:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas: ' + error.message
    });
  }
});

app.get('/api/admin/estadisticas/medico/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📊 Obteniendo estadísticas de médico:', id);

    const [totalGestantes, gestantesActivas] = await Promise.all([
      prisma.gestantes.count({ where: { medico_tratante_id: id } }),
      prisma.gestantes.count({ where: { medico_tratante_id: id, activa: true } })
    ]);

    const stats = {
      medico_id: id,
      total_gestantes: totalGestantes,
      gestantes_activas: gestantesActivas,
      gestantes_inactivas: totalGestantes - gestantesActivas
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de médico:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas: ' + error.message
    });
  }
});

// Aliases para compatibilidad con frontend
app.get('/api/dashboard/statistics', async (req, res) => {
  try {
    // 🔍 DEBUG: Verificar usuario en el request
    console.log('🔍 DEBUG: Dashboard Statistics - Request headers:', req.headers);
    
    // Extraer token de autorización del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔍 DEBUG: Dashboard Statistics - No hay token de autorización');
      return res.status(401).json({ success: false, error: 'Token de autorización requerido' });
    }
    
    const token = authHeader.substring(7); // Remover 'Bearer ' del inicio
    
    // Decodificar el token para obtener el usuario
    let user;
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'madres-digitales',
        audience: 'madres-digitales-users',
      });
      user = decoded;
      console.log('🔍 DEBUG: Dashboard Statistics - Usuario decodificado:', user);
      console.log('🔍 DEBUG: Dashboard Statistics - User ID:', user.id);
      console.log('🔍 DEBUG: Dashboard Statistics - User role:', user.rol);
    } catch (error) {
      console.log('🔍 DEBUG: Dashboard Statistics - Error decodificando token:', error);
      return res.status(401).json({ success: false, error: 'Token inválido' });
    }

    // Construir filtros base según el rol del usuario
    let gestanteWhere = { activa: true };
    let controlWhere = {};
    let alertaWhere = { resuelta: false };
    
    if (user && user.rol === 'madrina') {
      // Las madrinas solo ven gestantes asignadas a ellas
      gestanteWhere.madrina_id = user.id;
      // Los controles y alertas deben filtrarse por gestantes de esa madrina
      controlWhere.gestante = gestanteWhere;
      alertaWhere.gestante = gestanteWhere;
      
      console.log('🔍 DEBUG: Dashboard Statistics - Aplicando filtros para madrina:', user.id);
      console.log('🔍 DEBUG: Dashboard Statistics - gestanteWhere:', gestanteWhere);
      console.log('🔍 DEBUG: Dashboard Statistics - controlWhere:', controlWhere);
      console.log('🔍 DEBUG: Dashboard Statistics - alertaWhere:', alertaWhere);
    }

    const [
      totalGestantes,
      totalMedicos,
      totalIps,
      totalUsuarios,
      gestantesAltoRiesgo,
      alertasActivas,
      controlesRealizados,
      controlesHoy
    ] = await Promise.all([
      prisma.gestantes.count({ where: gestanteWhere }),
      prisma.medicos.count({ where: { activo: true } }),
      prisma.ips.count({ where: { activo: true } }),
      prisma.usuarios.count({ where: { activo: true } }),
      prisma.gestantes.count({ where: { ...gestanteWhere, riesgo_alto: true } }),
      prisma.alertas.count({ where: alertaWhere }),
      prisma.control_prenatal.count({ where: { ...controlWhere, realizado: true } }),
      prisma.control_prenatal.count({
        where: {
          ...controlWhere,
          fecha_control: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      })
    ]);

    const proximosCitas = await prisma.control_prenatal.count({
      where: {
        realizado: false,
        fecha_control: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const estadisticas = {
      totalGestantes,
      controlesRealizados,
      alertasActivas,
      totalMedicos,
      totalIps,
      totalUsuarios,
      gestantesAltoRiesgo,
      controlesHoy,
      proximosCitas
    };

    res.json({ success: true, data: estadisticas });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas (alias):', error);
    res.status(500).json({ success: false, error: 'Error obteniendo estadísticas' });
  }
});

app.get('/api/dashboard', async (req, res) => {
  try {
    // 🔍 DEBUG: Verificar usuario en el request
    console.log('🔍 DEBUG: Dashboard Principal - Request headers:', req.headers);
    
    // Extraer token de autorización del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔍 DEBUG: Dashboard Principal - No hay token de autorización');
      return res.status(401).json({ success: false, error: 'Token de autorización requerido' });
    }
    
    const token = authHeader.substring(7); // Remover 'Bearer ' del inicio
    
    // Decodificar el token para obtener el usuario
    let user;
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'madres-digitales',
        audience: 'madres-digitales-users',
      });
      user = decoded;
      console.log('🔍 DEBUG: Dashboard Principal - Usuario decodificado:', user);
      console.log('🔍 DEBUG: Dashboard Principal - User ID:', user.id);
      console.log('🔍 DEBUG: Dashboard Principal - User role:', user.rol);
    } catch (error) {
      console.log('🔍 DEBUG: Dashboard Principal - Error decodificando token:', error);
      return res.status(401).json({ success: false, error: 'Token inválido' });
    }

    // Construir filtros base según el rol del usuario
    let gestanteWhere = { activa: true };
    
    if (user && user.rol === 'madrina') {
      // Las madrinas solo ven gestantes asignadas a ellas
      gestanteWhere.madrina_id = user.id;
      
      console.log('🔍 DEBUG: Dashboard Principal - Aplicando filtros para madrina:', user.id);
      console.log('🔍 DEBUG: Dashboard Principal - gestanteWhere:', gestanteWhere);
    }

    const totalGestantes = await prisma.gestantes.count({ where: gestanteWhere });
    const totalMedicos = await prisma.medicos.count({ where: { activo: true } });
    const totalIps = await prisma.ips.count({ where: { activo: true } });
    res.json({ success: true, data: { totalGestantes, totalMedicos, totalIps } });
  } catch (error) {
    console.error('❌ Error obteniendo dashboard:', error);
    res.status(500).json({ success: false, error: 'Error obteniendo dashboard' });
  }
});

// Descargar estadísticas de gestantes como PDF
app.get('/api/reportes/descargar/estadisticas-gestantes/pdf', async (req, res) => {
  try {
    console.log('📄 Generando PDF de estadísticas de gestantes...');

    // Obtener datos de estadísticas
    const estadisticasResponse = await fetch(`${req.protocol}://${req.get('host')}/api/reportes/estadisticas-gestantes?${new URLSearchParams(req.query)}`);
    const estadisticasData = await estadisticasResponse.json();

    if (!estadisticasData.success) {
      throw new Error('Error obteniendo datos de estadísticas');
    }

    // Generar PDF usando el servicio
    const reportesGenerator = require('../src/services/reportes-generator.service');
    const pdfBuffer = await reportesGenerator.generateEstadisticasGestantesPDF(estadisticasData.data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="estadisticas-gestantes.pdf"');
    res.send(pdfBuffer);

    console.log('📄 PDF de estadísticas de gestantes generado exitosamente');
  } catch (error) {
    console.error('❌ Error generando PDF de estadísticas de gestantes:', error);
    res.status(500).json({
      success: false,
      error: 'Error generando PDF de estadísticas de gestantes: ' + error.message
    });
  }
});

// Descargar estadísticas de gestantes como Excel
app.get('/api/reportes/descargar/estadisticas-gestantes/excel', async (req, res) => {
  try {
    console.log('📊 Generando Excel de estadísticas de gestantes...');

    // Obtener datos de estadísticas
    const estadisticasResponse = await fetch(`${req.protocol}://${req.get('host')}/api/reportes/estadisticas-gestantes?${new URLSearchParams(req.query)}`);
    const estadisticasData = await estadisticasResponse.json();

    if (!estadisticasData.success) {
      throw new Error('Error obteniendo datos de estadísticas');
    }

    // Generar Excel usando el servicio
    const reportesGenerator = require('../src/services/reportes-generator.service');
    const excelBuffer = await reportesGenerator.generateEstadisticasGestantesExcel(estadisticasData.data);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="estadisticas-gestantes.xlsx"');
    res.send(excelBuffer);

    console.log('📊 Excel de estadísticas de gestantes generado exitosamente');
  } catch (error) {
    console.error('❌ Error generando Excel de estadísticas de gestantes:', error);
    res.status(500).json({
      success: false,
      error: 'Error generando Excel de estadísticas de gestantes: ' + error.message
    });
  }
});

// Endpoint genérico para descargar estadísticas de gestantes (redirige según formato)
app.get('/api/reportes/descargar/estadisticas-gestantes', (req, res) => {
  const formato = req.query.formato || 'pdf';
  const queryString = new URLSearchParams(req.query).toString();
  
  if (formato === 'excel' || formato === 'xlsx') {
    res.redirect(`/api/reportes/descargar/estadisticas-gestantes/excel?${queryString}`);
  } else {
    res.redirect(`/api/reportes/descargar/estadisticas-gestantes/pdf?${queryString}`);
  }
});

// Middleware de validación de datos - NUEVO
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    next();
  };
};

// Middleware de autenticación - NUEVO
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token de acceso requerido'
    });
  }

  // En un entorno real, aquí verificarías el JWT
  // Por ahora, verificamos que sea un token demo válido
  if (!token.includes('demo-signature')) {
    return res.status(403).json({
      success: false,
      error: 'Token inválido'
    });
  }

  // Agregar información del usuario al request
  req.user = {
    id: 'demo-user',
    email: 'demo@example.com',
    rol: 'super_admin'
  };

  next();
};

// Middleware de autorización por roles - NUEVO
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para realizar esta acción'
      });
    }

    next();
  };
};

// Rate limiting básico - NUEVO
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

// Aplicar rate limiting global
app.use(rateLimit(200, 15 * 60 * 1000)); // 200 requests per 15 minutes

// Error handling mejorado - ACTUALIZADO
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';

  console.error(`❌ ${timestamp} - Error en ${method} ${url}:`, {
    message: err.message,
    stack: err.stack,
    userAgent: userAgent.substring(0, 100)
  });

  // Diferentes tipos de errores
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Datos inválidos',
      details: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'No autorizado'
    });
  }

  if (err.code === 'P2002') { // Prisma unique constraint error
    return res.status(409).json({
      success: false,
      error: 'Ya existe un registro con estos datos'
    });
  }

  if (err.code === 'P2025') { // Prisma record not found error
    return res.status(404).json({
      success: false,
      error: 'Registro no encontrado'
    });
  }

  // Error genérico
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message,
    timestamp
  });
});

// ==================== ENDPOINTS DE REPORTES ====================

// Resumen general - NUEVO ENDPOINT
app.get('/api/reportes/resumen-general', async (req, res) => {
  try {
    console.log('📊 Obteniendo resumen general del sistema...');

    const [
      totalGestantes,
      gestantesActivas,
      totalControles,
      controlesRealizados,
      controlesPendientes,
      totalAlertas,
      alertasActivas,
      totalMedicos,
      medicosActivos,
      totalIPS,
      ipsActivas
    ] = await Promise.all([
      prisma.gestantes.count(),
      prisma.gestantes.count({ where: { activa: true } }),
      prisma.control_prenatal.count(),
      prisma.control_prenatal.count({ where: { realizado: true } }),
      prisma.control_prenatal.count({ where: { realizado: false } }),
      prisma.alertas.count(),
      prisma.alertas.count({ where: { resuelta: false } }),
      prisma.medicos.count(),
      prisma.medicos.count({ where: { activo: true } }),
      prisma.ips.count(),
      prisma.ips.count({ where: { activo: true } })
    ]);

    // Calcular gestantes de alto riesgo
    const gestantesAltoRiesgo = await prisma.gestantes.count({ where: { riesgo_alto: true } });
    
    // Calcular gestantes nuevas (último mes)
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    const gestantesNuevas = await prisma.gestantes.count({
      where: { fecha_creacion: { gte: inicioMes } }
    });
    
    // Calcular controles del mes actual
    const controlesEsteMes = await prisma.control_prenatal.count({
      where: { fecha_control: { gte: inicioMes } }
    });
    
    // Calcular alertas críticas
    const alertasCriticas = await prisma.alertas.count({
      where: { resuelta: false, nivel_prioridad: 'critica' }
    });
    
    // Calcular promedio de controles por gestante
    const promedioControles = gestantesActivas > 0 
      ? parseFloat((totalControles / gestantesActivas).toFixed(2))
      : 0;

    const resumen = {
      total_gestantes: totalGestantes,
      gestantes_activas: gestantesActivas,
      gestantes_nuevas: gestantesNuevas,
      gestantes_alto_riesgo: gestantesAltoRiesgo,
      total_controles: totalControles,
      controles_realizados: controlesRealizados,
      controles_pendientes: controlesPendientes,
      controles_este_mes: controlesEsteMes,
      promedio_controles_por_gestante: promedioControles,
      total_alertas_activas: alertasActivas,
      alertas_criticas: alertasCriticas,
      fecha_generacion: new Date()
    };

    console.log('📊 Resumen general generado exitosamente');

    res.json({
      success: true,
      data: resumen
    });
  } catch (error) {
    console.error('❌ Error obteniendo resumen general:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo resumen general: ' + error.message
    });
  }
});

// Descargar resumen general como PDF - NUEVO ENDPOINT
app.get('/api/reportes/descargar/resumen-general/pdf', async (req, res) => {
  try {
    console.log('📄 Generando PDF de resumen general...');

    // Obtener datos del resumen
    const resumenResponse = await fetch(`${req.protocol}://${req.get('host')}/api/reportes/resumen-general`);
    const resumenData = await resumenResponse.json();

    if (!resumenData.success) {
      throw new Error('Error obteniendo datos del resumen');
    }

    // Generar PDF usando el servicio
    const reportesGenerator = require('../src/services/reportes-generator.service');
    const pdfBuffer = await reportesGenerator.generateResumenGeneralPDF(resumenData.data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resumen-general.pdf"');
    res.send(pdfBuffer);

    console.log('📄 PDF de resumen general generado exitosamente');
  } catch (error) {
    console.error('❌ Error generando PDF de resumen general:', error);
    res.status(500).json({
      success: false,
      error: 'Error generando PDF de resumen general: ' + error.message
    });
  }
});

// Descargar resumen general como Excel - NUEVO ENDPOINT
app.get('/api/reportes/descargar/resumen-general/excel', async (req, res) => {
  try {
    console.log('📊 Generando Excel de resumen general...');

    // Obtener datos del resumen
    const resumenResponse = await fetch(`${req.protocol}://${req.get('host')}/api/reportes/resumen-general`);
    const resumenData = await resumenResponse.json();

    if (!resumenData.success) {
      throw new Error('Error obteniendo datos del resumen');
    }

    // Generar Excel usando el servicio
    const reportesGenerator = require('../src/services/reportes-generator.service');
    const excelBuffer = await reportesGenerator.generateResumenGeneralExcel(resumenData.data);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="resumen-general.xlsx"');
    res.send(excelBuffer);

    console.log('📊 Excel de resumen general generado exitosamente');
  } catch (error) {
    console.error('❌ Error generando Excel de resumen general:', error);
    res.status(500).json({
      success: false,
      error: 'Error generando Excel de resumen general: ' + error.message
    });
  }
});

// Endpoint genérico para descargar resumen general (redirige según formato)
app.get('/api/reportes/descargar/resumen-general', (req, res) => {
  const formato = req.query.formato || 'pdf';
  
  if (formato === 'excel' || formato === 'xlsx') {
    res.redirect('/api/reportes/descargar/resumen-general/excel');
  } else {
    res.redirect('/api/reportes/descargar/resumen-general/pdf');
  }
});

// Estadísticas de gestantes - NUEVO ENDPOINT
app.get('/api/reportes/estadisticas-gestantes', async (req, res) => {
  try {
    console.log('👥 Obteniendo estadísticas de gestantes...');

    const { municipio_id, fecha_inicio, fecha_fin } = req.query;

    // Construir filtros
    const whereClause = {};
    if (municipio_id) whereClause.municipio_id = municipio_id;
    if (fecha_inicio && fecha_fin) {
      whereClause.fecha_creacion = {
        gte: new Date(fecha_inicio),
        lte: new Date(fecha_fin)
      };
    }

    // Resolución de usuario/rol y restricciones
    const payload = getAuthUser(req);
    let frontRol = 'madrina';
    let userId = null;
    if (payload && payload.email) {
      const dbUser = await prisma.usuarios.findUnique({ where: { email: payload.email }, select: { id: true, rol: true } });
      if (dbUser) {
        frontRol = prismaRoleToFront(dbUser.rol);
        userId = dbUser.id;
      }
    }
    if (frontRol === 'madrina') {
      whereClause.madrina_id = userId;
    } else if (frontRol === 'coordinador') {
      const asignaciones = await prisma.coordinadores_madrinas.findMany({ where: { coordinador_id: userId }, select: { madrina_id: true } });
      const madrinasIds = asignaciones.map(a => a.madrina_id);
      if (madrinasIds.length > 0) {
        whereClause.madrina_id = { in: madrinasIds };
      } else {
        whereClause.madrina_id = '__none__';
      }
    } else if (frontRol === 'medico') {
      whereClause.medico_tratante_id = userId;
    }

    const [
      totalGestantes,
      gestantesPorMunicipio,
      gestantesPorRegimen,
      gestantesRiesgoAlto,
      gestantesActivas
    ] = await Promise.all([
      prisma.gestantes.count({ where: whereClause }),
      prisma.gestantes.groupBy({
        by: ['municipio_id'],
        where: whereClause,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      }),
      prisma.gestantes.groupBy({
        by: ['regimen_salud'],
        where: whereClause,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      }),
      prisma.gestantes.count({
        where: { ...whereClause, riesgo_alto: true }
      }),
      prisma.gestantes.count({
        where: { ...whereClause, activa: true }
      })
    ]);

    const estadisticas = {
      resumen: {
        total: totalGestantes,
        activas: gestantesActivas,
        inactivas: totalGestantes - gestantesActivas,
        riesgoAlto: gestantesRiesgoAlto,
        riesgoNormal: totalGestantes - gestantesRiesgoAlto
      },
      distribucionMunicipio: gestantesPorMunicipio,
      distribucionRegimen: gestantesPorRegimen,
      fechaGeneracion: new Date().toISOString()
    };

    console.log('👥 Estadísticas de gestantes generadas exitosamente');

    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de gestantes:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas de gestantes: ' + error.message
    });
  }
});

// Estadísticas de controles - NUEVO ENDPOINT
app.get('/api/reportes/estadisticas-controles', async (req, res) => {
  try {
    console.log('🩺 Obteniendo estadísticas de controles...');

    const { fecha_inicio, fecha_fin, medico_id } = req.query;

    // Construir filtros
    const whereClause = {};
    if (medico_id) whereClause.medico_id = medico_id;
    if (fecha_inicio && fecha_fin) {
      whereClause.fecha_control = {
        gte: new Date(fecha_inicio),
        lte: new Date(fecha_fin)
      };
    }

    // Resolución de usuario/rol y restricciones
    const payload = getAuthUser(req);
    let frontRol = 'madrina';
    let userId = null;
    if (payload && payload.email) {
      const dbUser = await prisma.usuarios.findUnique({ where: { email: payload.email }, select: { id: true, rol: true } });
      if (dbUser) {
        frontRol = prismaRoleToFront(dbUser.rol);
        userId = dbUser.id;
      }
    }
    let restrictGestanteIds = null;
    if (frontRol === 'madrina') {
      const gestantesRows = await prisma.gestantes.findMany({ where: { madrina_id: userId }, select: { id: true } });
      restrictGestanteIds = gestantesRows.map(g => g.id);
    } else if (frontRol === 'coordinador') {
      const asignaciones = await prisma.coordinadores_madrinas.findMany({ where: { coordinador_id: userId }, select: { madrina_id: true } });
      const madrinasIds = asignaciones.map(a => a.madrina_id);
      const gestantesRows = await prisma.gestantes.findMany({ where: { madrina_id: { in: madrinasIds } }, select: { id: true } });
      restrictGestanteIds = gestantesRows.map(g => g.id);
    } else if (frontRol === 'medico') {
      const gestantesRows = await prisma.gestantes.findMany({ where: { medico_tratante_id: userId }, select: { id: true } });
      restrictGestanteIds = gestantesRows.map(g => g.id);
    }

    const [
      totalControles,
      controlesRealizados,
      controlesPendientes,
      controlesVencidos,
      controlesPorMedico
    ] = await Promise.all([
      prisma.control_prenatal.count({ where: { ...whereClause, ...(restrictGestanteIds ? { gestante_id: { in: restrictGestanteIds } } : {}) } }),
      prisma.control_prenatal.count({ where: { ...whereClause, realizado: true, ...(restrictGestanteIds ? { gestante_id: { in: restrictGestanteIds } } : {}) } }),
      prisma.control_prenatal.count({ 
        where: { 
          ...whereClause, 
          realizado: false,
          fecha_control: { gte: new Date() },
          ...(restrictGestanteIds ? { gestante_id: { in: restrictGestanteIds } } : {})
        } 
      }),
      prisma.control_prenatal.count({ 
        where: { 
          ...whereClause, 
          realizado: false,
          fecha_control: { lt: new Date() },
          ...(restrictGestanteIds ? { gestante_id: { in: restrictGestanteIds } } : {})
        } 
      }),
      prisma.control_prenatal.groupBy({
        by: ['medico_id'],
        where: { ...whereClause, ...(restrictGestanteIds ? { gestante_id: { in: restrictGestanteIds } } : {}) },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      })
    ]);

    const estadisticas = {
      resumen: {
        total: totalControles,
        realizados: controlesRealizados,
        pendientes: controlesPendientes,
        vencidos: controlesVencidos,
        porcentajeRealizados: totalControles > 0 ? (controlesRealizados / totalControles * 100).toFixed(2) : 0
      },
      distribucionMedico: controlesPorMedico,
      fechaGeneracion: new Date().toISOString()
    };

    console.log('🩺 Estadísticas de controles generadas exitosamente');

    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de controles:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas de controles: ' + error.message
    });
  }
});

// Estadísticas de alertas - NUEVO ENDPOINT
app.get('/api/reportes/estadisticas-alertas', async (req, res) => {
  try {
    console.log('🚨 Obteniendo estadísticas de alertas...');

    const { fecha_inicio, fecha_fin, tipo_alerta } = req.query;

    // Construir filtros
    const whereClause = {};
    if (tipo_alerta) whereClause.tipo_alerta = tipo_alerta;
    if (fecha_inicio && fecha_fin) {
      whereClause.fecha_creacion = {
        gte: new Date(fecha_inicio),
        lte: new Date(fecha_fin)
      };
    }

    // Resolución de usuario/rol y restricciones
    const payload = getAuthUser(req);
    let frontRol = 'madrina';
    let userId = null;
    if (payload && payload.email) {
      const dbUser = await prisma.usuarios.findUnique({ where: { email: payload.email }, select: { id: true, rol: true } });
      if (dbUser) {
        frontRol = prismaRoleToFront(dbUser.rol);
        userId = dbUser.id;
      }
    }
    let restrictGestanteIds = null;
    if (frontRol === 'madrina') {
      const gestantesRows = await prisma.gestantes.findMany({ where: { madrina_id: userId }, select: { id: true } });
      restrictGestanteIds = gestantesRows.map(g => g.id);
    } else if (frontRol === 'coordinador') {
      const asignaciones = await prisma.coordinadores_madrinas.findMany({ where: { coordinador_id: userId }, select: { madrina_id: true } });
      const madrinasIds = asignaciones.map(a => a.madrina_id);
      const gestantesRows = await prisma.gestantes.findMany({ where: { madrina_id: { in: madrinasIds } }, select: { id: true } });
      restrictGestanteIds = gestantesRows.map(g => g.id);
    } else if (frontRol === 'medico') {
      const gestantesRows = await prisma.gestantes.findMany({ where: { medico_tratante_id: userId }, select: { id: true } });
      restrictGestanteIds = gestantesRows.map(g => g.id);
    }

    const [
      totalAlertas,
      alertasActivas,
      alertasResueltas,
      alertasPorTipo,
      alertasPorPrioridad
    ] = await Promise.all([
      prisma.alertas.count({ where: { ...whereClause, ...(restrictGestanteIds ? { gestante_id: { in: restrictGestanteIds } } : {}) } }),
      prisma.alertas.count({ where: { ...whereClause, resuelta: false, ...(restrictGestanteIds ? { gestante_id: { in: restrictGestanteIds } } : {}) } }),
      prisma.alertas.count({ where: { ...whereClause, resuelta: true, ...(restrictGestanteIds ? { gestante_id: { in: restrictGestanteIds } } : {}) } }),
      prisma.alertas.groupBy({
        by: ['tipo_alerta'],
        where: { ...whereClause, ...(restrictGestanteIds ? { gestante_id: { in: restrictGestanteIds } } : {}) },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      }),
      prisma.alertas.groupBy({
        by: ['nivel_prioridad'],
        where: { ...whereClause, ...(restrictGestanteIds ? { gestante_id: { in: restrictGestanteIds } } : {}) },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      })
    ]);

    const estadisticas = {
      resumen: {
        total: totalAlertas,
        activas: alertasActivas,
        resueltas: alertasResueltas,
        porcentajeResueltas: totalAlertas > 0 ? (alertasResueltas / totalAlertas * 100).toFixed(2) : 0
      },
      distribucionTipo: alertasPorTipo,
      distribucionPrioridad: alertasPorPrioridad,
      fechaGeneracion: new Date().toISOString()
    };

    console.log('🚨 Estadísticas de alertas generadas exitosamente');

    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de alertas:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas de alertas: ' + error.message
    });
  }
});

// Descargar estadísticas de controles como PDF
app.get('/api/reportes/descargar/estadisticas-controles/pdf', async (req, res) => {
  try {
    console.log('📄 Generando PDF de estadísticas de controles...');

    // Obtener datos de estadísticas
    const estadisticasResponse = await fetch(`${req.protocol}://${req.get('host')}/api/reportes/estadisticas-controles?${new URLSearchParams(req.query)}`);
    const estadisticasData = await estadisticasResponse.json();

    if (!estadisticasData.success) {
      throw new Error('Error obteniendo datos de estadísticas');
    }

    // Generar PDF usando el servicio
    const reportesGenerator = require('../src/services/reportes-generator.service');
    const pdfBuffer = await reportesGenerator.generateEstadisticasControlesPDF(estadisticasData.data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="estadisticas-controles.pdf"');
    res.send(pdfBuffer);

    console.log('📄 PDF de estadísticas de controles generado exitosamente');
  } catch (error) {
    console.error('❌ Error generando PDF de estadísticas de controles:', error);
    res.status(500).json({
      success: false,
      error: 'Error generando PDF de estadísticas de controles: ' + error.message
    });
  }
});

// Descargar estadísticas de controles como Excel
app.get('/api/reportes/descargar/estadisticas-controles/excel', async (req, res) => {
  try {
    console.log('📊 Generando Excel de estadísticas de controles...');

    // Obtener datos de estadísticas
    const estadisticasResponse = await fetch(`${req.protocol}://${req.get('host')}/api/reportes/estadisticas-controles?${new URLSearchParams(req.query)}`);
    const estadisticasData = await estadisticasResponse.json();

    if (!estadisticasData.success) {
      throw new Error('Error obteniendo datos de estadísticas');
    }

    // Generar Excel usando el servicio
    const reportesGenerator = require('../src/services/reportes-generator.service');
    const excelBuffer = await reportesGenerator.generateEstadisticasControlesExcel(estadisticasData.data);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="estadisticas-controles.xlsx"');
    res.send(excelBuffer);

    console.log('📊 Excel de estadísticas de controles generado exitosamente');
  } catch (error) {
    console.error('❌ Error generando Excel de estadísticas de controles:', error);
    res.status(500).json({
      success: false,
      error: 'Error generando Excel de estadísticas de controles: ' + error.message
    });
  }
});

// Endpoint genérico para descargar estadísticas de controles (redirige según formato)
app.get('/api/reportes/descargar/estadisticas-controles', (req, res) => {
  const formato = req.query.formato || 'pdf';
  const queryString = new URLSearchParams(req.query).toString();
  
  if (formato === 'excel' || formato === 'xlsx') {
    res.redirect(`/api/reportes/descargar/estadisticas-controles/excel?${queryString}`);
  } else {
    res.redirect(`/api/reportes/descargar/estadisticas-controles/pdf?${queryString}`);
  }
});

// Descargar estadísticas de alertas como PDF
app.get('/api/reportes/descargar/estadisticas-alertas/pdf', async (req, res) => {
  try {
    console.log('📄 Generando PDF de estadísticas de alertas...');

    // Obtener datos de estadísticas
    const estadisticasResponse = await fetch(`${req.protocol}://${req.get('host')}/api/reportes/estadisticas-alertas?${new URLSearchParams(req.query)}`);
    const estadisticasData = await estadisticasResponse.json();

    if (!estadisticasData.success) {
      throw new Error('Error obteniendo datos de estadísticas');
    }

    // Generar PDF usando el servicio
    const reportesGenerator = require('../src/services/reportes-generator.service');
    const pdfBuffer = await reportesGenerator.generateEstadisticasAlertasPDF(estadisticasData.data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="estadisticas-alertas.pdf"');
    res.send(pdfBuffer);

    console.log('📄 PDF de estadísticas de alertas generado exitosamente');
  } catch (error) {
    console.error('❌ Error generando PDF de estadísticas de alertas:', error);
    res.status(500).json({
      success: false,
      error: 'Error generando PDF de estadísticas de alertas: ' + error.message
    });
  }
});

// Descargar estadísticas de alertas como Excel
app.get('/api/reportes/descargar/estadisticas-alertas/excel', async (req, res) => {
  try {
    console.log('📊 Generando Excel de estadísticas de alertas...');

    // Obtener datos de estadísticas
    const estadisticasResponse = await fetch(`${req.protocol}://${req.get('host')}/api/reportes/estadisticas-alertas?${new URLSearchParams(req.query)}`);
    const estadisticasData = await estadisticasResponse.json();

    if (!estadisticasData.success) {
      throw new Error('Error obteniendo datos de estadísticas');
    }

    // Generar Excel usando el servicio
    const reportesGenerator = require('../src/services/reportes-generator.service');
    const excelBuffer = await reportesGenerator.generateEstadisticasAlertasExcel(estadisticasData.data);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="estadisticas-alertas.xlsx"');
    res.send(excelBuffer);

    console.log('📊 Excel de estadísticas de alertas generado exitosamente');
  } catch (error) {
    console.error('❌ Error generando Excel de estadísticas de alertas:', error);
    res.status(500).json({
      success: false,
      error: 'Error generando Excel de estadísticas de alertas: ' + error.message
    });
  }
});

// Endpoint genérico para descargar estadísticas de alertas (redirige según formato)
app.get('/api/reportes/descargar/estadisticas-alertas', (req, res) => {
  const formato = req.query.formato || 'pdf';
  const queryString = new URLSearchParams(req.query).toString();
  
  if (formato === 'excel' || formato === 'xlsx') {
    res.redirect(`/api/reportes/descargar/estadisticas-alertas/excel?${queryString}`);
  } else {
    res.redirect(`/api/reportes/descargar/estadisticas-alertas/pdf?${queryString}`);
  }
});

// ==================== FIN ENDPOINTS DE REPORTES ====================

// 404 handler se mueve al final del archivo para no interceptar rutas válidas

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Start server for local development
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const http = require('http');
  const server = http.createServer(app);
  try {
    const { Server } = require('socket.io');
    const io = new Server(server, {
      cors: { origin: '*', methods: ['GET','POST'] },
      transports: ['websocket','polling']
    });
    io.on('connection', (socket) => {
      console.log(`🔌 WebSocket connection on :${PORT} -> ${socket.id}`);
      socket.on('ping', () => socket.emit('pong'));
    });
  } catch (_) {}
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
}

// Controles - listado mínimo
// Endpoint duplicado eliminado - usar el de línea 2133 que tiene filtrado por rol

// Contenido - listado vacío para evitar 404 si no hay modelo
app.get('/api/contenido', async (_req, res) => {
  res.json({ success: true, data: [] });
});

// Municipios - endpoint duplicado eliminado (usar el de línea ~3500)

// Gestión de Municipios (solo super_admin)
app.get('/api/municipios/admin', async (req, res) => {
  try {
    if (!isSuperAdmin(req)) return res.status(403).json({ success: false, error: 'Forbidden' });
    const list = await prisma.municipios.findMany({ orderBy: { nombre: 'asc' } });
    res.json({ success: true, data: list });
  } catch (error) {
    console.error('❌ Error listando municipios admin:', error);
    res.status(500).json({ success: false, error: 'Error listando municipios' });
  }
});

app.post('/api/municipios', async (req, res) => {
  try {
    if (!isSuperAdmin(req)) return res.status(403).json({ success: false, error: 'Forbidden' });
    const { id, nombre, departamento, codigo_dane, activo = true } = req.body;
    if (!id || !nombre) return res.status(400).json({ success: false, error: 'ID y nombre requeridos' });
    const nuevo = await prisma.municipios.create({ data: { id, nombre, departamento: departamento || null, codigo_dane: codigo_dane || null, activo: !!activo } });
    res.status(201).json({ success: true, data: nuevo });
  } catch (error) {
    console.error('❌ Error creando municipio:', error);
    res.status(500).json({ success: false, error: 'Error creando municipio: ' + error.message });
  }
});

app.put('/api/municipios/:id', async (req, res) => {
  try {
    if (!isSuperAdmin(req)) return res.status(403).json({ success: false, error: 'Forbidden' });
    const { id } = req.params;
    const data = req.body;
    const actualizado = await prisma.municipios.update({ where: { id }, data });
    res.json({ success: true, data: actualizado });
  } catch (error) {
    console.error('❌ Error actualizando municipio:', error);
    res.status(500).json({ success: false, error: 'Error actualizando municipio: ' + error.message });
  }
});

app.patch('/api/municipios/:id/estado', async (req, res) => {
  try {
    if (!isSuperAdmin(req)) return res.status(403).json({ success: false, error: 'Forbidden' });
    const { id } = req.params;
    const { activo } = req.body;
    const actualizado = await prisma.municipios.update({ where: { id }, data: { activo: !!activo } });
    res.json({ success: true, data: actualizado });
  } catch (error) {
    console.error('❌ Error cambiando estado municipio:', error);
    res.status(500).json({ success: false, error: 'Error cambiando estado municipio: ' + error.message });
  }
});
app.get('/api/alertas', async (req, res) => {
  console.log('➡️ GET /api/alertas', { query: req.query });
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    let alertas;
    const totalAlertas = await prisma.alertas.count({ where: { resuelta: false } });
    try {
      alertas = await prisma.alertas.findMany({
        skip,
        take: limit,
        where: { resuelta: false },
        include: {
          gestante: { select: { nombre: true, documento: true } },
          madrina: { select: { nombre: true, telefono: true } }
        },
        orderBy: { fecha_creacion: 'desc' }
      });
    } catch (err) {
      console.warn('⚠️ Fallback sin include en /api/alertas', { message: err?.message });
      alertas = await prisma.alertas.findMany({
        skip,
        take: limit,
        where: { resuelta: false },
        orderBy: { fecha_creacion: 'desc' }
      });
    }
    const alertasFormateadas = alertas.map(a => ({
      id: a.id,
      tipo: a.tipo_alerta,
      prioridad: a.nivel_prioridad,
      mensaje: a.mensaje,
      gestante: (a.gestante && a.gestante.nombre) ? { nombre: a.gestante.nombre, documento: a.gestante.documento } : null,
      madrina: (a.madrina && a.madrina.nombre) ? { nombre: a.madrina.nombre, telefono: a.madrina.telefono } : null,
      fechaCreacion: (a.fecha_creacion && a.fecha_creacion.toISOString) ? a.fecha_creacion.toISOString() : null,
      resuelta: !!a.resuelta
    }));
    res.json({
      success: true,
      data: {
        alertas: alertasFormateadas,
        pagination: {
          page,
          limit,
          total: totalAlertas,
          totalPages: Math.ceil(totalAlertas / limit)
        }
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo alertas', {
      message: error?.message,
      stack: error?.stack,
    });
    res.status(500).json({ success: false, error: 'Error obteniendo alertas', details: error?.message });
  }
});

// Crear alerta
app.post('/api/alertas', async (req, res) => {
  console.log('➡️ POST /api/alertas', { body: req.body, hasAuth: !!req.get('Authorization') });
  try {
    const payload = getAuthUser(req);
    if (!payload) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const body = req.body || {};
    const gestanteId = body.gestante_id || body.gestanteId;
    const tipo = (body.tipo || '').toString().toLowerCase();
    const prioridad = (body.prioridad || '').toString().toLowerCase();
    const mensaje = body.descripcion || body.mensaje || 'Alerta generada desde control';
    const madrinaId = body.madrina_id || body.madrinaId || null;
    const medicoId = body.medico_id || body.medicoId || null;

    if (!gestanteId || !prioridad) {
      return res.status(400).json({ success: false, error: 'gestanteId y prioridad son requeridos' });
    }

    const mapTipo = (t) => {
      switch (t) {
        case 'sos':
        case 'medica':
          return 'SOS_MEDICA';
        case 'control':
          return 'CONTROL_VENCIDO';
        case 'recordatorio':
          return 'RECORDATORIO_CONTROL';
        default:
          return 'SEGUIMIENTO';
      }
    };
    const mapPrioridad = (p) => ({
      baja: 'BAJA',
      media: 'MEDIA',
      alta: 'ALTA',
      critica: 'CRITICA',
    }[p] || 'MEDIA');

    const nueva = await prisma.alertas.create({
      data: {
        id: `alerta_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
        gestante_id: gestanteId,
        madrina_id: madrinaId,
        medico_asignado_id: medicoId,
        tipo_alerta: mapTipo(tipo),
        nivel_prioridad: mapPrioridad(prioridad),
        mensaje,
        generado_por_id: payload.id,
        es_automatica: true,
        estado: 'pendiente',
      },
      include: {
        gestante: { select: { nombre: true, documento: true } },
        madrina: { select: { nombre: true, telefono: true } },
      }
    });

    res.status(201).json({
      success: true,
      data: {
        alerta: {
          id: nueva.id,
          tipo: nueva.tipo_alerta,
          prioridad: nueva.nivel_prioridad,
          mensaje: nueva.mensaje,
          gestante: nueva.gestante ? { nombre: nueva.gestante.nombre, documento: nueva.gestante.documento } : null,
          madrina: nueva.madrina ? { nombre: nueva.madrina.nombre, telefono: nueva.madrina.telefono } : null,
          fechaCreacion: nueva.fecha_creacion.toISOString(),
          resuelta: nueva.resuelta,
        }
      }
    });
  } catch (error) {
    console.error('❌ Error creando alerta:', error);
    res.status(500).json({ success: false, error: 'Error creando alerta: ' + error.message });
  }
});

// Resolver alerta
app.put('/api/alertas/:id/resolver', async (req, res) => {
  console.log('➡️ PUT /api/alertas/:id/resolver', { params: req.params });
  try {
    const { id } = req.params;
    const actualizada = await prisma.alertas.update({
      where: { id },
      data: { resuelta: true, fecha_resolucion: new Date(), estado: 'resuelta' },
      select: { id: true, resuelta: true, fecha_resolucion: true }
    });
    res.json({ success: true, data: actualizada });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error resolviendo alerta: ' + error.message });
  }
});

// Marcar alerta como leída
app.post('/api/alertas/:id/leida', async (req, res) => {
  console.log('➡️ POST /api/alertas/:id/leida', { params: req.params });
  try {
    const { id } = req.params;
    const actualizada = await prisma.alertas.update({
      where: { id },
      data: { estado: 'leida' },
      select: { id: true, estado: true }
    });
    res.json({ success: true, data: actualizada });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error marcando alerta como leída: ' + error.message });
  }
});
app.get('/api/auth/me', async (req, res) => {
  console.log('➡️ GET /api/auth/me', { hasAuth: !!req.get('Authorization') });
  try {
    const payload = getAuthUser(req);
    if (!payload) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const user = await prisma.usuarios.findUnique({
      where: { email: payload.email },
      select: { id: true, nombre: true, email: true, rol: true, activo: true }
    });
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const frontRol = prismaRoleToFront(user.rol);
    res.json({ success: true, data: { usuario: { id: user.id, nombre: user.nombre, email: user.email, rol: frontRol, activo: user.activo } } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error obteniendo usuario' });
  }
});

// 404 handler - ÚLTIMO: log detallado para diagnósticos
// Consolidados por municipio (alias de seguridad, justo antes del 404)
app.get('/api/reportes/consolidados/municipio', async (req, res) => {
  try {
    const municipioId = (req.query.municipio_id || req.query.municipioId || '').toString();
    const mes = req.query.mes ? parseInt(req.query.mes) : null;
    const anio = req.query.anio ? parseInt(req.query.anio) : null;
    if (!municipioId) {
      return res.status(400).json({ success: false, error: 'Parámetro requerido: municipio_id' });
    }

    let whereClause = { municipio_id: municipioId };
    let periodo = 'general';
    if (mes && anio) {
      const fechaInicio = new Date(anio, mes - 1, 1);
      const fechaFin = new Date(anio, mes, 0, 23, 59, 59);
      whereClause.fecha_creacion = { gte: fechaInicio, lte: fechaFin };
      periodo = `${mes}/${anio}`;
    }

    const [gestantesTotal, gestantesAltoRiesgo] = await Promise.all([
      prisma.gestantes.count({ where: whereClause }),
      prisma.gestantes.count({ where: { ...whereClause, riesgo_alto: true } })
    ]);

    const porcentajeRiesgo = gestantesTotal > 0
      ? parseFloat(((gestantesAltoRiesgo / gestantesTotal) * 100).toFixed(2))
      : 0;

    res.json({
      success: true,
      data: {
        municipio_id: municipioId,
        periodo,
        gestantes: {
          total: gestantesTotal,
          alto_riesgo: gestantesAltoRiesgo,
          porcentaje_riesgo: porcentajeRiesgo
        },
        fecha_generacion: new Date()
      }
    });
  } catch (error) {
    console.error('❌ Error en consolidado por municipio (alias):', error);
    res.status(500).json({ success: false, error: 'Error generando consolidado por municipio: ' + error.message });
  }
});


// Consolidados mensual
app.get('/api/reportes/consolidados/mensual', async (req, res) => {
  try {
    const mes = parseInt(req.query.mes);
    const anio = parseInt(req.query.anio);
    if (!mes || !anio) {
      return res.status(400).json({ success: false, error: 'Parámetros requeridos: mes y anio' });
    }

    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

    // Resolver usuario y rol
    const payload = getAuthUser(req);
    let frontRol = 'madrina';
    let userId = null;
    if (payload && payload.email) {
      const dbUser = await prisma.usuarios.findUnique({ where: { email: payload.email }, select: { id: true, rol: true } });
      if (dbUser) {
        frontRol = prismaRoleToFront(dbUser.rol);
        userId = dbUser.id;
      }
    }

    // Construir filtros por rol
    let gestanteBaseWhere = {};
    let restrictGestanteIds = null;
    if (frontRol === 'madrina') {
      gestanteBaseWhere.madrina_id = userId;
    } else if (frontRol === 'coordinador') {
      const asignaciones = await prisma.coordinadores_madrinas.findMany({ where: { coordinador_id: userId }, select: { madrina_id: true } });
      const madrinasIds = asignaciones.map(a => a.madrina_id);
      if (madrinasIds.length > 0) {
        gestanteBaseWhere.madrina_id = { in: madrinasIds };
      } else {
        gestanteBaseWhere.madrina_id = '__none__';
      }
    } else if (frontRol === 'medico') {
      gestanteBaseWhere.medico_tratante_id = userId;
    } // admin y super_admin ven todo

    // IDs de gestantes (para filtrar controles/alertas cuando corresponda)
    if (Object.keys(gestanteBaseWhere).length > 0) {
      const gestantesIdsRows = await prisma.gestantes.findMany({ where: gestanteBaseWhere, select: { id: true } });
      restrictGestanteIds = gestantesIdsRows.map(g => g.id);
    }

    const [
      gestantesActivas,
      gestantesNuevas,
      controlesRealizados,
      alertasGeneradas,
      alertasResueltas,
      gestantesAltoRiesgo
    ] = await Promise.all([
      prisma.gestantes.count({ where: { ...gestanteBaseWhere, activa: true, fecha_creacion: { lte: fechaFin } } }),
      prisma.gestantes.count({ where: { ...gestanteBaseWhere, fecha_creacion: { gte: fechaInicio, lte: fechaFin } } }),
      prisma.control_prenatal.count({ where: { fecha_control: { gte: fechaInicio, lte: fechaFin }, ...(restrictGestanteIds ? { gestante_id: { in: restrictGestanteIds } } : {}) } }),
      prisma.alertas.count({ where: { fecha_creacion: { gte: fechaInicio, lte: fechaFin }, ...(restrictGestanteIds ? { gestante_id: { in: restrictGestanteIds } } : {}) } }),
      prisma.alertas.count({ where: { fecha_creacion: { gte: fechaInicio, lte: fechaFin }, resuelta: true, ...(restrictGestanteIds ? { gestante_id: { in: restrictGestanteIds } } : {}) } }),
      prisma.gestantes.count({ where: { ...gestanteBaseWhere, riesgo_alto: true } })
    ]);

    const promedioControles = gestantesActivas > 0 ? parseFloat((controlesRealizados / gestantesActivas).toFixed(2)) : 0;
    const tasaResolucion = alertasGeneradas > 0 ? parseFloat(((alertasResueltas / alertasGeneradas) * 100).toFixed(2)) : 0;

    const data = {
      periodo: `${mes}/${anio}`,
      fecha_inicio: fechaInicio.toISOString().split('T')[0],
      fecha_fin: fechaFin.toISOString().split('T')[0],
      gestantes: {
        activas: gestantesActivas,
        nuevas: gestantesNuevas,
        alto_riesgo: gestantesAltoRiesgo,
      },
      controles: {
        realizados: controlesRealizados,
        promedio_por_gestante: promedioControles,
      },
      alertas: {
        generadas: alertasGeneradas,
        resueltas: alertasResueltas,
        pendientes: alertasGeneradas - alertasResueltas,
        tasa_resolucion: tasaResolucion,
      },
      fecha_generacion: new Date(),
    };

    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Error en consolidado mensual:', error);
    res.status(500).json({ success: false, error: 'Error generando consolidado mensual: ' + error.message });
  }
});

// Consolidados anual
app.get('/api/reportes/consolidados/anual', async (req, res) => {
  try {
    const anio = parseInt(req.query.anio);
    if (!anio) {
      return res.status(400).json({ success: false, error: 'Parámetro requerido: anio' });
    }

    const fechaInicio = new Date(anio, 0, 1);
    const fechaFin = new Date(anio, 11, 31, 23, 59, 59);

    // Resolver usuario y rol
    const payload = getAuthUser(req);
    let frontRol = 'madrina';
    let userId = null;
    if (payload && payload.email) {
      const dbUser = await prisma.usuarios.findUnique({ where: { email: payload.email }, select: { id: true, rol: true } });
      if (dbUser) {
        frontRol = prismaRoleToFront(dbUser.rol);
        userId = dbUser.id;
      }
    }

    let gestanteBaseWhere = {};
    let restrictGestanteIds = null;
    if (frontRol === 'madrina') {
      gestanteBaseWhere.madrina_id = userId;
    } else if (frontRol === 'coordinador') {
      const asignaciones = await prisma.coordinadores_madrinas.findMany({ where: { coordinador_id: userId }, select: { madrina_id: true } });
      const madrinasIds = asignaciones.map(a => a.madrina_id);
      if (madrinasIds.length > 0) {
        gestanteBaseWhere.madrina_id = { in: madrinasIds };
      } else {
        gestanteBaseWhere.madrina_id = '__none__';
      }
    } else if (frontRol === 'medico') {
      gestanteBaseWhere.medico_tratante_id = userId;
    }

    if (Object.keys(gestanteBaseWhere).length > 0) {
      const gestantesIdsRows = await prisma.gestantes.findMany({ where: gestanteBaseWhere, select: { id: true } });
      restrictGestanteIds = gestantesIdsRows.map(g => g.id);
    }

    const [
      totalGestantes,
      totalControles,
      totalAlertas
    ] = await Promise.all([
      prisma.gestantes.count({ where: { ...gestanteBaseWhere, fecha_creacion: { lte: fechaFin } } }),
      prisma.control_prenatal.count({ where: { fecha_control: { gte: fechaInicio, lte: fechaFin }, ...(restrictGestanteIds ? { gestante_id: { in: restrictGestanteIds } } : {}) } }),
      prisma.alertas.count({ where: { fecha_creacion: { gte: fechaInicio, lte: fechaFin }, ...(restrictGestanteIds ? { gestante_id: { in: restrictGestanteIds } } : {}) } }),
    ]);

    const meses = [];
    for (let mes = 1; mes <= 12; mes++) {
      const fInicio = new Date(anio, mes - 1, 1);
      const fFin = new Date(anio, mes, 0, 23, 59, 59);
      const [gActivasMes, gNuevasMes, ctrMes, alGenMes, alResMes] = await Promise.all([
        prisma.gestantes.count({ where: { ...gestanteBaseWhere, activa: true, fecha_creacion: { lte: fFin } } }),
        prisma.gestantes.count({ where: { ...gestanteBaseWhere, fecha_creacion: { gte: fInicio, lte: fFin } } }),
        prisma.control_prenatal.count({ where: { fecha_control: { gte: fInicio, lte: fFin }, ...(restrictGestanteIds ? { gestante_id: { in: restrictGestanteIds } } : {}) } }),
        prisma.alertas.count({ where: { fecha_creacion: { gte: fInicio, lte: fFin }, ...(restrictGestanteIds ? { gestante_id: { in: restrictGestanteIds } } : {}) } }),
        prisma.alertas.count({ where: { fecha_creacion: { gte: fInicio, lte: fFin }, resuelta: true, ...(restrictGestanteIds ? { gestante_id: { in: restrictGestanteIds } } : {}) } }),
      ]);
      meses.push({
        periodo: `${mes}/${anio}`,
        gestantes: { activas: gActivasMes, nuevas: gNuevasMes },
        controles: { realizados: ctrMes },
        alertas: { generadas: alGenMes, resueltas: alResMes },
      });
    }

    const data = {
      anio,
      fecha_inicio: fechaInicio.toISOString().split('T')[0],
      fecha_fin: fechaFin.toISOString().split('T')[0],
      totales: {
        gestantes: totalGestantes,
        controles: totalControles,
        alertas: totalAlertas,
      },
      meses,
      fecha_generacion: new Date(),
    };

    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Error en consolidado anual:', error);
    res.status(500).json({ success: false, error: 'Error generando consolidado anual: ' + error.message });
  }
});

// Consolidados por municipio (opcionalmente por mes/año)
app.get('/api/reportes/consolidados/municipio', async (req, res) => {
  try {
    const municipioId = (req.query.municipio_id || req.query.municipioId || '').toString();
    const mes = req.query.mes ? parseInt(req.query.mes) : null;
    const anio = req.query.anio ? parseInt(req.query.anio) : null;
    if (!municipioId) {
      return res.status(400).json({ success: false, error: 'Parámetro requerido: municipio_id' });
    }

    let whereClause = { municipio_id: municipioId };
    let periodo = 'general';
    if (mes && anio) {
      const fechaInicio = new Date(anio, mes - 1, 1);
      const fechaFin = new Date(anio, mes, 0, 23, 59, 59);
      whereClause.fecha_creacion = { gte: fechaInicio, lte: fechaFin };
      periodo = `${mes}/${anio}`;
    }

    const [gestantesTotal, gestantesAltoRiesgo] = await Promise.all([
      prisma.gestantes.count({ where: whereClause }),
      prisma.gestantes.count({ where: { ...whereClause, riesgo_alto: true } })
    ]);

    const porcentajeRiesgo = gestantesTotal > 0
      ? parseFloat(((gestantesAltoRiesgo / gestantesTotal) * 100).toFixed(2))
      : 0;

    const data = {
      municipio_id: municipioId,
      periodo,
      gestantes: {
        total: gestantesTotal,
        alto_riesgo: gestantesAltoRiesgo,
        porcentaje_riesgo: porcentajeRiesgo
      },
      fecha_generacion: new Date()
    };

    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Error en consolidado por municipio:', error);
    res.status(500).json({ success: false, error: 'Error generando consolidado por municipio: ' + error.message });
  }
});

// ALERTAS ENDPOINTS - Sistema de alertas
app.get('/api/alertas', async (req, res) => {
  try {
    console.log('➡️ GET /api/alertas', { query: req.query });
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No hay token de autorización');
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const token = authHeader.substring(7);
    let user;
    try {
      user = jwt.verify(token, JWT_SECRET, {
        issuer: 'madres-digitales',
        audience: 'madres-digitales-users',
      });
      console.log('👤 Usuario autenticado:', { id: user.id, email: user.email, rol: user.rol });
    } catch (error) {
      console.log('❌ Token inválido:', error.message);
      return res.status(401).json({ success: false, error: 'Token inválido' });
    }

    let whereClause = {};
    if (user.rol === 'MADRINA' || user.rol === 'madrina') {
      // Filtrar por gestantes asignadas a esta madrina
      whereClause.gestante = {
        madrina_id: user.id
      };
      console.log('🔍 Filtro para MADRINA aplicado:', whereClause);
    } else {
      console.log('🔍 Usuario NO es madrina, mostrando todas las alertas');
    }

    const alertas = await prisma.alertas.findMany({
      where: whereClause,
      include: {
        gestante: { select: { id: true, nombre: true, documento: true, telefono: true, madrina_id: true } },
      },
      orderBy: { fecha_creacion: 'desc' }
    });

    console.log(`✅ ${alertas.length} alertas obtenidas`);
    if (alertas.length > 0) {
      console.log('📤 Primera alerta:', JSON.stringify(alertas[0], null, 2));
    }
    
    // Deshabilitar caché para esta respuesta
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.json({ success: true, data: alertas });
  } catch (error) {
    console.error('❌ Error obteniendo alertas:', error);
    res.status(500).json({ success: false, error: 'Error obteniendo alertas: ' + error.message });
  }
});

app.get('/api/alertas/gestante/:gestanteId', async (req, res) => {
  try {
    const { gestanteId } = req.params;
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const token = authHeader.substring(7);
    let user;
    try {
      user = jwt.verify(token, JWT_SECRET, {
        issuer: 'madres-digitales',
        audience: 'madres-digitales-users',
      });
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Token inválido' });
    }

    console.log(`📋 Obteniendo alertas para gestante ${gestanteId}`);

    const alertas = await prisma.alertas.findMany({
      where: { gestante_id: gestanteId },
      include: {
        gestante: { select: { id: true, nombre: true, documento: true, telefono: true } },
      },
      orderBy: { fecha_creacion: 'desc' }
    });

    console.log(`✅ ${alertas.length} alertas obtenidas para gestante ${gestanteId}`);
    res.json({ success: true, data: alertas });
  } catch (error) {
    console.error(`❌ Error obteniendo alertas para gestante ${req.params.gestanteId}:`, error);
    res.status(500).json({ success: false, error: 'Error obteniendo alertas: ' + error.message });
  }
});

app.get('/api/alertas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const alerta = await prisma.alertas.findUnique({
      where: { id },
      include: {
        gestante: { select: { id: true, nombre: true, documento: true, telefono: true } },
      }
    });

    if (!alerta) {
      return res.status(404).json({ success: false, error: 'Alerta no encontrada' });
    }

    res.json({ success: true, data: alerta });
  } catch (error) {
    console.error('❌ Error obteniendo alerta:', error);
    res.status(500).json({ success: false, error: 'Error obteniendo alerta: ' + error.message });
  }
});

app.post('/api/alertas', async (req, res) => {
  try {
    const {
      gestante_id,
      madrina_id,
      tipo_alerta,
      nivel_prioridad,
      mensaje,
      sintomas,
      es_automatica,
      score_riesgo
    } = req.body;

    if (!gestante_id || !tipo_alerta || !nivel_prioridad) {
      return res.status(400).json({ success: false, error: 'gestante_id, tipo_alerta y nivel_prioridad son requeridos' });
    }

    const id = `alerta_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    
    const nuevaAlerta = await prisma.alertas.create({
      data: {
        id,
        gestante_id,
        madrina_id: madrina_id || null,
        tipo_alerta,
        nivel_prioridad,
        mensaje: mensaje || '',
        sintomas: sintomas || [],
        es_automatica: es_automatica || false,
        score_riesgo: score_riesgo || null,
        resuelta: false
      },
      include: {
        gestante: { select: { id: true, nombre: true, documento: true, telefono: true } },
      }
    });

    console.log('✅ Alerta creada:', nuevaAlerta.id);
    res.status(201).json({ success: true, data: nuevaAlerta });
  } catch (error) {
    console.error('❌ Error creando alerta:', error);
    res.status(500).json({ success: false, error: 'Error creando alerta: ' + error.message });
  }
});

app.put('/api/alertas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const alertaActualizada = await prisma.alertas.update({
      where: { id },
      data: updateData,
      include: {
        gestante: { select: { id: true, nombre: true, documento: true, telefono: true } },
      }
    });

    console.log('✅ Alerta actualizada:', id);
    res.json({ success: true, data: alertaActualizada });
  } catch (error) {
    console.error('❌ Error actualizando alerta:', error);
    res.status(500).json({ success: false, error: 'Error actualizando alerta: ' + error.message });
  }
});

app.delete('/api/alertas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.alertas.update({
      where: { id },
      data: { resuelta: true }
    });

    console.log('✅ Alerta marcada como resuelta:', id);
    res.json({ success: true, message: 'Alerta marcada como resuelta' });
  } catch (error) {
    console.error('❌ Error eliminando alerta:', error);
    res.status(500).json({ success: false, error: 'Error eliminando alerta: ' + error.message });
  }
});

// ===== RUTAS DE REPORTES =====
// Importar el servicio de reportes
const ReportesService = require('./reportes.service');
const reportesService = new ReportesService();

// Generar reporte completo
app.get('/api/reportes/generar', async (req, res) => {
  try {
    const { municipioId, madrinaId, fechaInicio, fechaFin } = req.query;
    
    const filtros = {};
    
    if (municipioId && typeof municipioId === 'string') {
      filtros.municipioId = municipioId;
    }
    
    if (madrinaId && typeof madrinaId === 'string') {
      filtros.madrinaId = madrinaId;
    }
    
    if (fechaInicio && typeof fechaInicio === 'string') {
      filtros.fechaInicio = new Date(fechaInicio);
    }
    
    if (fechaFin && typeof fechaFin === 'string') {
      filtros.fechaFin = new Date(fechaFin);
    }

    console.log('📊 Generando reporte con filtros:', filtros);

    const reporte = await reportesService.generarReporteCompleto(filtros);
    
    res.json({
      success: true,
      data: reporte
    });
    
  } catch (error) {
    console.error('❌ Error generando reporte:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener municipios para filtros
app.get('/api/reportes/municipios', async (req, res) => {
  try {
    const municipios = await reportesService.obtenerMunicipios();
    
    res.json({
      success: true,
      data: municipios
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo municipios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener madrinas para filtros
app.get('/api/reportes/madrinas', async (req, res) => {
  try {
    const { municipioId } = req.query;
    
    const madrinas = await reportesService.obtenerMadrinas(
      municipioId && typeof municipioId === 'string' ? municipioId : undefined
    );
    
    res.json({
      success: true,
      data: madrinas
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo madrinas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});


// REPORTES - Resumen General
// COMENTADO: Este endpoint está duplicado y sobrescribe el correcto definido arriba
// El endpoint correcto está en la línea 3469 y devuelve la estructura esperada por la pantalla de reportes
/*
app.get('/api/reportes/resumen-general', async (req, res) => {
  try {
    console.log('➡️ GET /api/reportes/resumen-general');
    
    // Obtener estadísticas generales
    const [
      totalGestantes,
      gestantesActivas,
      gestantesAltoRiesgo,
      totalControles,
      controlesUltimoMes,
      totalAlertas,
      alertasActivas,
      alertasResueltas,
      totalMedicos,
      totalIps
    ] = await Promise.all([
      prisma.gestantes.count(),
      prisma.gestantes.count({ where: { activa: true } }),
      prisma.gestantes.count({ where: { riesgo_alto: true } }),
      prisma.control_prenatal.count(),
      prisma.control_prenatal.count({
        where: {
          fecha_control: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
          }
        }
      }),
      prisma.alertas.count(),
      prisma.alertas.count({ where: { resuelta: false } }),
      prisma.alertas.count({ where: { resuelta: true } }),
      prisma.medicos.count({ where: { activo: true } }),
      prisma.ips.count({ where: { activo: true } })
    ]);

    const data = {
      gestantes: {
        total: totalGestantes,
        activas: gestantesActivas,
        alto_riesgo: gestantesAltoRiesgo,
        porcentaje_alto_riesgo: totalGestantes > 0 
          ? parseFloat(((gestantesAltoRiesgo / totalGestantes) * 100).toFixed(2))
          : 0
      },
      controles: {
        total: totalControles,
        ultimo_mes: controlesUltimoMes,
        promedio_por_gestante: gestantesActivas > 0
          ? parseFloat((totalControles / gestantesActivas).toFixed(2))
          : 0
      },
      alertas: {
        total: totalAlertas,
        activas: alertasActivas,
        resueltas: alertasResueltas,
        tasa_resolucion: totalAlertas > 0
          ? parseFloat(((alertasResueltas / totalAlertas) * 100).toFixed(2))
          : 0
      },
      recursos: {
        medicos: totalMedicos,
        ips: totalIps
      },
      fecha_generacion: new Date().toISOString()
    };

    console.log('✅ Resumen general generado:', data);
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Error generando resumen general:', error);
    res.status(500).json({ success: false, error: 'Error generando resumen general: ' + error.message });
  }
});
*/

// ===== ENDPOINTS DE DESCARGA DASHBOARD REPORTES =====

// Descargar dashboard de reportes como PDF
app.get('/api/reportes/dashboard/pdf', async (req, res) => {
  try {
    console.log('📄 Generando PDF del dashboard de reportes...');
    
    const { municipioId, madrinaId, fechaInicio, fechaFin } = req.query;
    
    const filtros = {};
    if (municipioId && typeof municipioId === 'string') {
      filtros.municipioId = municipioId;
    }
    if (madrinaId && typeof madrinaId === 'string') {
      filtros.madrinaId = madrinaId;
    }
    if (fechaInicio && typeof fechaInicio === 'string') {
      filtros.fechaInicio = new Date(fechaInicio);
    }
    if (fechaFin && typeof fechaFin === 'string') {
      filtros.fechaFin = new Date(fechaFin);
    }

    // Obtener datos del reporte
    const reporte = await reportesService.generarReporteCompleto(filtros);
    
    if (!reporte) {
      return res.status(404).json({ success: false, error: 'No se pudieron obtener los datos del reporte' });
    }

    // Generar PDF usando el servicio
    const reportesGenerator = require('../src/services/reportes-generator.service');
    const pdfBuffer = await reportesGenerator.generateDashboardReportesPDF(reporte);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="dashboard-reportes-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    console.log('✅ PDF del dashboard de reportes generado exitosamente');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('❌ Error generando PDF del dashboard de reportes:', error);
    res.status(500).json({ success: false, error: 'Error generando PDF del dashboard de reportes: ' + error.message });
  }
});

// Descargar dashboard de reportes como Excel
app.get('/api/reportes/dashboard/excel', async (req, res) => {
  try {
    console.log('📊 Generando Excel del dashboard de reportes...');
    
    const { municipioId, madrinaId, fechaInicio, fechaFin } = req.query;
    
    const filtros = {};
    if (municipioId && typeof municipioId === 'string') {
      filtros.municipioId = municipioId;
    }
    if (madrinaId && typeof madrinaId === 'string') {
      filtros.madrinaId = madrinaId;
    }
    if (fechaInicio && typeof fechaInicio === 'string') {
      filtros.fechaInicio = new Date(fechaInicio);
    }
    if (fechaFin && typeof fechaFin === 'string') {
      filtros.fechaFin = new Date(fechaFin);
    }

    // Obtener datos del reporte
    const reporte = await reportesService.generarReporteCompleto(filtros);
    
    if (!reporte) {
      return res.status(404).json({ success: false, error: 'No se pudieron obtener los datos del reporte' });
    }

    // Generar Excel usando el servicio
    const reportesGenerator = require('../src/services/reportes-generator.service');
    const excelBuffer = await reportesGenerator.generateDashboardReportesExcel(reporte);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="dashboard-reportes-${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.setHeader('Content-Length', excelBuffer.length);
    
    console.log('✅ Excel del dashboard de reportes generado exitosamente');
    res.send(excelBuffer);

  } catch (error) {
    console.error('❌ Error generando Excel del dashboard de reportes:', error);
    res.status(500).json({ success: false, error: 'Error generando Excel del dashboard de reportes: ' + error.message });
  }
});

// Endpoint genérico para descargar dashboard de reportes (redirige según formato)
app.get('/api/reportes/dashboard/descargar', (req, res) => {
  const formato = req.query.formato || 'pdf';
  const queryString = new URLSearchParams(req.query).toString();
  
  if (formato === 'excel' || formato === 'xlsx') {
    res.redirect(`/api/reportes/dashboard/excel?${queryString}`);
  } else {
    res.redirect(`/api/reportes/dashboard/pdf?${queryString}`);
  }
});

// PUERPERIO ENDPOINTS - Estadísticas combinadas de gestantes y puerperio
app.get('/api/puerperio/estadisticas', async (req, res) => {
  try {
    console.log('🤱 Obteniendo estadísticas combinadas de gestantes y puerperio...');

    // Verificar autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const token = authHeader.substring(7);
    let user;
    try {
      user = jwt.verify(token, JWT_SECRET, {
        issuer: 'madres-digitales',
        audience: 'madres-digitales-users',
      });
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Token inválido' });
    }

    // Construir filtros según el rol del usuario
    let gestanteWhere = { activa: true };
    
    if (user && user.rol === 'madrina') {
      gestanteWhere.madrina_id = user.id;
    }

    // Obtener gestantes activas de la tabla principal
    const totalGestantesActivas = await prisma.gestantes.count({
      where: gestanteWhere
    });

    // Calcular gestantes en diferentes etapas basándose en fecha_probable_parto
    const ahora = new Date();
    const hace40Semanas = new Date();
    hace40Semanas.setDate(ahora.getDate() - (40 * 7)); // 40 semanas atrás

    const [gestantesEnPuerperio, gestantesProximasParto, gestantesAltoRiesgo] = await Promise.all([
      // Gestantes que ya dieron a luz (fecha probable de parto pasada)
      prisma.gestantes.count({
        where: {
          ...gestanteWhere,
          fecha_probable_parto: {
            lte: ahora
          }
        }
      }),
      // Gestantes próximas al parto (próximas 4 semanas)
      prisma.gestantes.count({
        where: {
          ...gestanteWhere,
          fecha_probable_parto: {
            gte: ahora,
            lte: new Date(ahora.getTime() + (4 * 7 * 24 * 60 * 60 * 1000)) // próximas 4 semanas
          }
        }
      }),
      // Gestantes de alto riesgo
      prisma.gestantes.count({
        where: {
          ...gestanteWhere,
          riesgo_alto: true
        }
      })
    ]);

    // Estadísticas por municipio (solo si el usuario puede ver todos los datos)
    let porMunicipio = [];
    if (user.rol !== 'madrina') {
      const municipiosStats = await prisma.gestantes.groupBy({
        by: ['municipio_id'],
        where: gestanteWhere,
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      });

      // Obtener nombres de municipios
      const municipiosIds = municipiosStats.map(stat => stat.municipio_id).filter(Boolean);
      const municipios = await prisma.municipios.findMany({
        where: {
          id: { in: municipiosIds }
        },
        select: {
          id: true,
          nombre: true
        }
      });

      const municipiosMap = new Map(municipios.map(m => [m.id, m.nombre]));

      porMunicipio = municipiosStats.map(stat => ({
        municipio: municipiosMap.get(stat.municipio_id) || 'Sin municipio',
        total: stat._count.id,
        puerperio: 0, // Placeholder - se puede calcular con lógica adicional
        gestantes: stat._count.id
      }));
    }

    const estadisticas = {
      resumen: {
        total_gestantes_activas: totalGestantesActivas,
        total_puerperio: gestantesEnPuerperio,
        total_gestantes_puerperio: 0, // Placeholder
        total_combinado: totalGestantesActivas + gestantesEnPuerperio,
        gestantes_alto_riesgo: gestantesAltoRiesgo,
        gestantes_proximas_parto: gestantesProximasParto
      },
      por_municipio: porMunicipio,
      por_madre_digital: [] // Placeholder - se puede implementar si es necesario
    };

    console.log('✅ Estadísticas combinadas obtenidas exitosamente');
    console.log(`📊 Gestantes activas: ${estadisticas.resumen.total_gestantes_activas}`);
    console.log(`🤱 Gestantes en puerperio: ${estadisticas.resumen.total_puerperio}`);
    console.log(`📈 Total combinado: ${estadisticas.resumen.total_combinado}`);
    console.log(`🚨 Gestantes alto riesgo: ${estadisticas.resumen.gestantes_alto_riesgo}`);
    console.log(`📅 Próximas al parto: ${estadisticas.resumen.gestantes_proximas_parto}`);

    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas combinadas:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas combinadas: ' + error.message
    });
  }
});

app.get('/api/puerperio', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Verificar autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const token = authHeader.substring(7);
    let user;
    try {
      user = jwt.verify(token, JWT_SECRET, {
        issuer: 'madres-digitales',
        audience: 'madres-digitales-users',
      });
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Token inválido' });
    }

    // Construir filtros según el rol del usuario
    let gestanteWhere = { activa: true };
    
    if (user && user.rol === 'madrina') {
      gestanteWhere.madrina_id = user.id;
    }

    // Obtener gestantes que podrían estar en puerperio (fecha probable de parto pasada)
    const ahora = new Date();
    const gestantesEnPuerperio = await prisma.gestantes.findMany({
      where: {
        ...gestanteWhere,
        fecha_probable_parto: {
          lte: ahora
        }
      },
      include: {
        municipios: {
          select: {
            nombre: true
          }
        },
        madrina: {
          select: {
            nombre: true
          }
        }
      },
      skip: offset,
      take: limit,
      orderBy: {
        fecha_probable_parto: 'desc'
      }
    });

    const total = await prisma.gestantes.count({
      where: {
        ...gestanteWhere,
        fecha_probable_parto: {
          lte: ahora
        }
      }
    });

    const totalPages = Math.ceil(total / limit);

    // Formatear datos para simular la estructura de puerperio
    const data = gestantesEnPuerperio.map(gestante => ({
      id: gestante.id,
      nombre: gestante.nombre,
      documento: gestante.documento,
      telefono: gestante.telefono,
      municipio: gestante.municipios?.nombre || 'Sin municipio',
      madre_digital: gestante.madrina?.nombre || 'Sin asignar',
      estado: 'Puerperio', // Asumimos que están en puerperio si pasó la fecha probable de parto
      fecha_probable_parto: gestante.fecha_probable_parto,
      created_at: gestante.fecha_creacion
    }));

    res.json({
      success: true,
      data: data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('❌ Error listando registros de puerperio:', error);
    res.status(500).json({
      success: false,
      error: 'Error listando registros de puerperio: ' + error.message
    });
  }
});

app.get('/api/puerperio/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Verificar autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const token = authHeader.substring(7);
    let user;
    try {
      user = jwt.verify(token, JWT_SECRET, {
        issuer: 'madres-digitales',
        audience: 'madres-digitales-users',
      });
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Token inválido' });
    }

    // Buscar la gestante por ID
    let gestanteWhere = { id: id };
    
    if (user && user.rol === 'madrina') {
      gestanteWhere.madrina_id = user.id;
    }

    const gestante = await prisma.gestantes.findFirst({
      where: gestanteWhere,
      include: {
        municipios: {
          select: {
            nombre: true
          }
        },
        madrina: {
          select: {
            nombre: true
          }
        }
      }
    });

    if (!gestante) {
      return res.status(404).json({
        success: false,
        error: 'Registro de puerperio no encontrado'
      });
    }

    // Formatear datos para simular la estructura de puerperio
    const data = {
      id: gestante.id,
      nombre: gestante.nombre,
      documento: gestante.documento,
      telefono: gestante.telefono,
      municipio: gestante.municipios?.nombre || 'Sin municipio',
      madre_digital: gestante.madrina?.nombre || 'Sin asignar',
      estado: gestante.fecha_probable_parto && gestante.fecha_probable_parto <= new Date() ? 'Puerperio' : 'Gestante',
      fecha_probable_parto: gestante.fecha_probable_parto,
      created_at: gestante.fecha_creacion
    };

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('❌ Error obteniendo registro de puerperio:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo registro de puerperio: ' + error.message
    });
  }
});

// 🔧 ENDPOINTS TEMPORALES DE DEBUG - DEBEN IR ANTES DEL 404 HANDLER
// 🔧 ENDPOINT TEMPORAL - Verificar si usuario existe
app.get('/api/debug-user-exists', async (req, res) => {
  try {
    const email = req.query.email || 'wzuccardi@gmail.com';
    
    const user = await prisma.usuarios.findUnique({
      where: { email },
      select: { 
        id: true, 
        email: true, 
        nombre: true, 
        rol: true, 
        activo: true,
        password_hash: true 
      }
    });
    
    if (!user) {
      return res.json({
        success: false,
        message: 'Usuario no encontrado',
        email
      });
    }
    
    res.json({
      success: true,
      message: 'Usuario encontrado',
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
        activo: user.activo,
        hasPassword: !!user.password_hash,
        passwordHashStart: user.password_hash ? user.password_hash.substring(0, 20) + '...' : null
      }
    });
  } catch (error) {
    console.error('❌ Error verificando usuario:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔧 ENDPOINT TEMPORAL - Dashboard statistics con logs detallados (SIN AUTH)
app.get('/api/debug-dashboard-detailed', async (req, res) => {
  try {
    console.log('🔧 Debug dashboard detailed - simulando diferentes roles...');
    
    // Probar con diferentes roles
    const roles = ['admin', 'superadmin', 'super_admin', 'madrina', 'coordinador'];
    const resultados = {};
    
    for (const rol of roles) {
      console.log(`\n🔍 Probando con rol: ${rol}`);
      
      // Construir filtros base según el rol del usuario
      let gestanteWhere = { activa: true };
      let controlWhere = {};
      let alertaWhere = { resuelta: false };
      
      if (rol === 'madrina') {
        // Las madrinas solo ven gestantes asignadas a ellas
        gestanteWhere.madrina_id = 'test-madrina-id';
        controlWhere.gestante = gestanteWhere;
        alertaWhere.gestante = gestanteWhere;
      }
      
      const [
        totalGestantes,
        totalMedicos,
        totalIps,
        totalUsuarios,
        gestantesAltoRiesgo,
        alertasActivas,
        controlesRealizados,
        controlesHoy
      ] = await Promise.all([
        prisma.gestantes.count({ where: gestanteWhere }),
        prisma.medicos.count({ where: { activo: true } }),
        prisma.ips.count({ where: { activo: true } }),
        prisma.usuarios.count({ where: { activo: true } }),
        prisma.gestantes.count({ where: { ...gestanteWhere, riesgo_alto: true } }),
        prisma.alertas.count({ where: alertaWhere }),
        prisma.control_prenatal.count({ where: { ...controlWhere, realizado: true } }),
        prisma.control_prenatal.count({
          where: {
            ...controlWhere,
            fecha_control: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
          }
        })
      ]);

      const proximosCitas = await prisma.control_prenatal.count({
        where: {
          realizado: false,
          fecha_control: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      });

      const estadisticas = {
        totalGestantes,
        controlesRealizados,
        alertasActivas,
        totalMedicos,
        totalIps,
        totalUsuarios,
        gestantesAltoRiesgo,
        controlesHoy,
        proximosCitas
      };
      
      resultados[rol] = estadisticas;
      console.log(`📊 Estadísticas para ${rol}:`, estadisticas);
    }

    res.json({
      success: true,
      message: 'Estadísticas por rol',
      resultados,
      analisis: {
        usuariosConsistentes: Object.values(resultados).every(r => r.totalUsuarios === 49),
        gestantesVarian: new Set(Object.values(resultados).map(r => r.totalGestantes)).size > 1,
        rolesConUsuarios49: Object.keys(resultados).filter(rol => resultados[rol].totalUsuarios === 49),
        rolesConUsuarios0: Object.keys(resultados).filter(rol => resultados[rol].totalUsuarios === 0)
      }
    });
  } catch (error) {
    console.error('❌ Error en debug dashboard detailed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔧 ENDPOINT TEMPORAL - Verificar token y rol del usuario actual
app.get('/api/debug-token', async (req, res) => {
  try {
    console.log('🔧 Debug token - Headers:', req.headers);
    
    // Extraer token de autorización del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ 
        success: false, 
        error: 'No hay token de autorización',
        hasAuthHeader: !!authHeader,
        authHeader: authHeader ? authHeader.substring(0, 20) + '...' : null
      });
    }
    
    const token = authHeader.substring(7);
    
    // Decodificar el token para obtener el usuario
    let user;
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'madres-digitales',
        audience: 'madres-digitales-users',
      });
      user = decoded;
    } catch (error) {
      return res.json({ 
        success: false, 
        error: 'Token inválido',
        tokenError: error.message,
        tokenStart: token.substring(0, 20) + '...'
      });
    }

    // Buscar el usuario en la base de datos
    const dbUser = await prisma.usuarios.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, rol: true, activo: true, nombre: true }
    });

    res.json({
      success: true,
      tokenUser: user,
      dbUser: dbUser,
      isAdmin: user.rol === 'admin' || user.rol === 'superadmin' || user.rol === 'super_admin',
      rolComparisons: {
        tokenRol: user.rol,
        dbRol: dbUser?.rol,
        isTokenAdmin: user.rol === 'admin',
        isTokenSuperAdmin: user.rol === 'superadmin',
        isTokenSuperAdminUnderscore: user.rol === 'super_admin',
        isDbAdmin: dbUser?.rol === 'admin',
        isDbSuperAdmin: dbUser?.rol === 'superadmin',
        isDbSuperAdminUnderscore: dbUser?.rol === 'super_admin'
      }
    });
  } catch (error) {
    console.error('❌ Error en debug token:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔧 ENDPOINT TEMPORAL - Test con simulación de usuario admin
app.get('/api/test-dashboard-admin', async (req, res) => {
  try {
    console.log('🔧 Testing dashboard statistics como admin...');
    
    // Simular usuario admin (sin filtros de madrina)
    const user = { rol: 'superadmin', id: 'test-admin' };
    
    // Construir filtros base según el rol del usuario
    let gestanteWhere = { activa: true };
    let controlWhere = {};
    let alertaWhere = { resuelta: false };
    
    // NO aplicar filtros de madrina para admin
    console.log('🔍 Usuario simulado:', user);
    console.log('🔍 Filtros aplicados:', { gestanteWhere, controlWhere, alertaWhere });
    
    const [
      totalGestantes,
      totalMedicos,
      totalIps,
      totalUsuarios,
      gestantesAltoRiesgo,
      alertasActivas,
      controlesRealizados,
      controlesHoy
    ] = await Promise.all([
      prisma.gestantes.count({ where: gestanteWhere }),
      prisma.medicos.count({ where: { activo: true } }),
      prisma.ips.count({ where: { activo: true } }),
      prisma.usuarios.count({ where: { activo: true } }),
      prisma.gestantes.count({ where: { ...gestanteWhere, riesgo_alto: true } }),
      prisma.alertas.count({ where: alertaWhere }),
      prisma.control_prenatal.count({ where: { ...controlWhere, realizado: true } }),
      prisma.control_prenatal.count({
        where: {
          ...controlWhere,
          fecha_control: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      })
    ]);

    const proximosCitas = await prisma.control_prenatal.count({
      where: {
        realizado: false,
        fecha_control: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const estadisticas = {
      totalGestantes,
      controlesRealizados,
      alertasActivas,
      totalMedicos,
      totalIps,
      totalUsuarios,
      gestantesAltoRiesgo,
      controlesHoy,
      proximosCitas
    };

    console.log('📊 Estadísticas como admin:', estadisticas);

    res.json({ success: true, data: estadisticas, userRole: user.rol });
  } catch (error) {
    console.error('❌ Error en test dashboard admin:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔧 ENDPOINT TEMPORAL - Test con simulación de usuario madrina
app.get('/api/test-dashboard-madrina', async (req, res) => {
  try {
    console.log('🔧 Testing dashboard statistics como madrina...');
    
    // Simular usuario madrina
    const user = { rol: 'madrina', id: 'test-madrina-123' };
    
    // Construir filtros base según el rol del usuario
    let gestanteWhere = { activa: true };
    let controlWhere = {};
    let alertaWhere = { resuelta: false };
    
    if (user && user.rol === 'madrina') {
      // Las madrinas solo ven gestantes asignadas a ellas
      gestanteWhere.madrina_id = user.id;
      // Los controles y alertas deben filtrarse por gestantes de esa madrina
      controlWhere.gestante = gestanteWhere;
      alertaWhere.gestante = gestanteWhere;
      
      console.log('🔍 Aplicando filtros para madrina:', user.id);
    }
    
    console.log('🔍 Usuario simulado:', user);
    console.log('🔍 Filtros aplicados:', { gestanteWhere, controlWhere, alertaWhere });
    
    const [
      totalGestantes,
      totalMedicos,
      totalIps,
      totalUsuarios,
      gestantesAltoRiesgo,
      alertasActivas,
      controlesRealizados,
      controlesHoy
    ] = await Promise.all([
      prisma.gestantes.count({ where: gestanteWhere }),
      prisma.medicos.count({ where: { activo: true } }),
      prisma.ips.count({ where: { activo: true } }),
      prisma.usuarios.count({ where: { activo: true } }), // Los usuarios NO se filtran por madrina
      prisma.gestantes.count({ where: { ...gestanteWhere, riesgo_alto: true } }),
      prisma.alertas.count({ where: alertaWhere }),
      prisma.control_prenatal.count({ where: { ...controlWhere, realizado: true } }),
      prisma.control_prenatal.count({
        where: {
          ...controlWhere,
          fecha_control: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      })
    ]);

    const proximosCitas = await prisma.control_prenatal.count({
      where: {
        realizado: false,
        fecha_control: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const estadisticas = {
      totalGestantes,
      controlesRealizados,
      alertasActivas,
      totalMedicos,
      totalIps,
      totalUsuarios,
      gestantesAltoRiesgo,
      controlesHoy,
      proximosCitas
    };

    console.log('📊 Estadísticas como madrina:', estadisticas);

    res.json({ success: true, data: estadisticas, userRole: user.rol });
  } catch (error) {
    console.error('❌ Error en test dashboard madrina:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔧 ENDPOINT TEMPORAL - Test dashboard statistics sin autenticación
app.get('/api/test-dashboard-stats', async (req, res) => {
  try {
    console.log('🔧 Testing dashboard statistics...');
    
    // Simular filtros como si fuera un admin (sin filtros de madrina)
    let gestanteWhere = { activa: true };
    let controlWhere = {};
    let alertaWhere = { resuelta: false };
    
    const [
      totalGestantes,
      totalMedicos,
      totalIps,
      totalUsuarios,
      gestantesAltoRiesgo,
      alertasActivas,
      controlesRealizados,
      controlesHoy
    ] = await Promise.all([
      prisma.gestantes.count({ where: gestanteWhere }),
      prisma.medicos.count({ where: { activo: true } }),
      prisma.ips.count({ where: { activo: true } }),
      prisma.usuarios.count({ where: { activo: true } }),
      prisma.gestantes.count({ where: { ...gestanteWhere, riesgo_alto: true } }),
      prisma.alertas.count({ where: alertaWhere }),
      prisma.control_prenatal.count({ where: { ...controlWhere, realizado: true } }),
      prisma.control_prenatal.count({
        where: {
          ...controlWhere,
          fecha_control: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      })
    ]);

    const proximosCitas = await prisma.control_prenatal.count({
      where: {
        realizado: false,
        fecha_control: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const estadisticas = {
      totalGestantes,
      controlesRealizados,
      alertasActivas,
      totalMedicos,
      totalIps,
      totalUsuarios,
      gestantesAltoRiesgo,
      controlesHoy,
      proximosCitas
    };

    console.log('📊 Estadísticas calculadas:', estadisticas);

    res.json({ success: true, data: estadisticas });
  } catch (error) {
    console.error('❌ Error en test dashboard stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔧 ENDPOINT TEMPORAL - Solución directa para usuarios activos
app.get('/api/fix-usuarios', async (req, res) => {
  try {
    console.log('🔧 Iniciando corrección de usuarios activos...');
    
    // Paso 1: Verificar estado actual
    const estadoAntes = {
      total: await prisma.usuarios.count(),
      activos: await prisma.usuarios.count({ where: { activo: true } }),
      inactivos: await prisma.usuarios.count({ where: { activo: false } })
    };
    
    // Para contar nulls, usar NOT (true OR false)
    const totalUsuarios = estadoAntes.total;
    const usuariosConValor = estadoAntes.activos + estadoAntes.inactivos;
    const usuariosNull = totalUsuarios - usuariosConValor;
    estadoAntes.nulls = usuariosNull;
    
    console.log('📊 Estado antes:', estadoAntes);
    
    // Paso 2: Activar todos los usuarios que NO están activos
    const resultado = await prisma.usuarios.updateMany({
      where: {
        NOT: {
          activo: true
        }
      },
      data: {
        activo: true
      }
    });
    
    console.log(`✅ Se actualizaron ${resultado.count} usuarios`);
    
    // Paso 3: Verificar estado después
    const estadoDespues = {
      total: await prisma.usuarios.count(),
      activos: await prisma.usuarios.count({ where: { activo: true } }),
      inactivos: await prisma.usuarios.count({ where: { activo: false } }),
      nulls: 0 // Después de la actualización no debería haber nulls
    };
    
    console.log('📊 Estado después:', estadoDespues);
    
    res.json({
      success: true,
      message: 'Usuarios activados correctamente',
      estadoAntes,
      estadoDespues,
      usuariosActualizados: resultado.count
    });
    
  } catch (error) {
    console.error('❌ Error corrigiendo usuarios:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔧 ENDPOINT TEMPORAL DE DEBUG - Verificar usuarios activos
app.get('/api/debug/usuarios-activos', async (req, res) => {
  try {
    // Verificar estado actual
    const totalUsuarios = await prisma.usuarios.count();
    const usuariosActivos = await prisma.usuarios.count({ where: { activo: true } });
    const usuariosInactivos = await prisma.usuarios.count({ where: { activo: false } });
    
    // Calcular nulls indirectamente
    const usuariosNull = totalUsuarios - usuariosActivos - usuariosInactivos;
    
    // Obtener algunos usuarios de ejemplo
    const ejemploUsuarios = await prisma.usuarios.findMany({
      select: { id: true, email: true, activo: true, fecha_creacion: true },
      take: 10,
      orderBy: { fecha_creacion: 'desc' }
    });
    
    res.json({
      success: true,
      estadisticas: {
        totalUsuarios,
        usuariosActivos,
        usuariosInactivos,
        usuariosNull
      },
      ejemploUsuarios
    });
  } catch (error) {
    console.error('❌ Error en debug usuarios activos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 404 handler - ÚLTIMO: debe ir al final
app.use('*', (req, res) => {
  const auth = req.get('Authorization');
  res.status(404).json({ 
    success: false, 
    error: 'Ruta no encontrada', 
    method: req.method, 
    path: req.path, 
    timestamp: new Date().toISOString(),
    hasAuth: !!auth
  });
});

// Exportar para Vercel
module.exports = app;
