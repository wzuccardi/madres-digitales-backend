const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// Inicializar Prisma Client
const prisma = new PrismaClient();

const app = express();
//probando para actualizar
// CORS configuration - MEJORADO
const corsOptions = {
  origin: function (origin, callback) {
    console.log('🔍 CORS check for origin:', origin);
    
    // Lista de orígenes permitidos
    const allowedOrigins = [
      'http://localhost:3008',
      'http://localhost:3009',
      'http://localhost:3000',
      'http://localhost:54112',
      'https://madres-digitales-frontend.vercel.app',
      'https://madres-digitales.vercel.app',
      'https://madres-digitales-backend.vercel.app',
      'https://madres-digitales-backend-pp8vnv107-maildipablo22-4886s-projects.vercel.app',
      // Dominios de frontend de Vercel
      'https://madres-digitales-frontend-1bw6x2ir0.vercel.app',
      'https://madresdigitalesflutter-ncxd8av5c-maildipablo22-4886s-projects.vercel.app',
      'https://madresdigitalesflutternew.vercel.app',
      'https://madresdigitalesflutter-95hh3cvkq-maildipablo22-4886s-projects.vercel.app'
    ];

    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('✅ CORS: No origin (mobile/postman) - ALLOWED');
      return callback(null, true);
    }

    // Permitir cualquier localhost (para Flutter con puertos dinámicos)
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      console.log('✅ CORS: Localhost - ALLOWED');
      return callback(null, true);
    }

    // TEMPORAL: Permitir TODOS los dominios de Vercel para resolver el problema de URLs dinámicas
    if (origin.endsWith('.vercel.app')) {
      console.log('✅ CORS: Vercel domain - ALLOWED (temporal)');
      return callback(null, true);
    }

    // Permitir dominios específicos del proyecto
    if (origin && (
      (origin.includes('madres-digitales') && origin.includes('.vercel.app')) ||
      (origin.includes('madresdigitales') && origin.includes('.vercel.app'))
    )) {
      console.log('✅ CORS: Project domain - ALLOWED');
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ CORS: Whitelist domain - ALLOWED');
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('No permitido por CORS'));
    }
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
    'X-Requested-With'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 horas
};

app.use(cors(corsOptions));

// Middleware adicional para manejar preflight requests
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  console.log('🔄 Preflight request from:', origin);
  
  // TEMPORAL: Permitir todos los dominios de Vercel para resolver URLs dinámicas
  if (!origin || 
      origin.startsWith('http://localhost:') || 
      origin.startsWith('http://127.0.0.1:') ||
      origin.endsWith('.vercel.app')) {
    
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    
    console.log('✅ Preflight approved for:', origin);
    return res.status(200).end();
  }
  
  console.log('❌ Preflight blocked for:', origin);
  return res.status(403).end();
});

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

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  console.log('🔐 Login attempt:', { email, hasPassword: !!password });

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email y contraseña son requeridos'
    });
  }

  // Demo login - accept any credentials and return super_admin role
  // Generate a proper JWT-like token with expiration
  const tokenPayload = {
    id: 'demo-user',
    email: email,
    rol: 'super_admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  // Create a simple JWT-like token (for demo purposes)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
  const signature = Buffer.from('demo-signature').toString('base64url');
  const demoToken = `${header}.${payload}.${signature}`;

  const response = {
    success: true,
    message: 'Login exitoso',
    data: {
      usuario: {
        id: 'demo-user',
        nombre: 'Usuario Demo',
        email: email,
        rol: 'super_admin'
      },
      token: demoToken,
      refreshToken: `refresh-${Date.now()}`
    }
  };

  console.log('✅ Login successful for:', email);
  res.json(response);
});

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
app.get('/api/dashboard/estadisticas', async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas reales de la base de datos...');

    // Obtener datos reales de la base de datos
    const [
      totalGestantes,
      totalMedicos,
      totalIps,
      gestantesAltoRiesgo,
      alertasActivas,
      controlesRealizados,
      controlesHoy
    ] = await Promise.all([
      prisma.gestantes.count({ where: { activa: true } }),
      prisma.medicos.count({ where: { activo: true } }),
      prisma.ips.count({ where: { activo: true } }),
      prisma.gestantes.count({ where: { activa: true, riesgo_alto: true } }),
      prisma.alertas.count({ where: { resuelta: false } }),
      prisma.control_prenatal.count({ where: { realizado: true } }),
      prisma.control_prenatal.count({
        where: {
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
});

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

    const nuevaIPS = await prisma.ips.create({
      data: {
        id,
        nombre,
        nit,
        telefono,
        direccion,
        municipio_id,
        nivel,
        email,
        latitud: latitud ? parseFloat(latitud) : null,
        longitud: longitud ? parseFloat(longitud) : null,
        activo
      },
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

    console.log('✅ IPS creada exitosamente:', nuevaIPS.id);

    res.status(201).json({
      success: true,
      message: 'IPS creada exitosamente',
      data: {
        id: nuevaIPS.id,
        nombre: nuevaIPS.nombre,
        nit: nuevaIPS.nit,
        direccion: nuevaIPS.direccion,
        telefono: nuevaIPS.telefono,
        email: nuevaIPS.email,
        nivel: nuevaIPS.nivel,
        municipio: nuevaIPS.municipios?.nombre || null,
        medicosAsignados: nuevaIPS.medicos.length,
        gestantesAsignadas: nuevaIPS.gestantes.length,
        coordenadas: {
          latitud: nuevaIPS.latitud,
          longitud: nuevaIPS.longitud
        }
      }
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

// Gestantes endpoints - DATOS REALES
app.get('/api/gestantes', async (req, res) => {
  try {
    console.log('🤰 Obteniendo gestantes reales de la base de datos...');

    const gestantes = await prisma.gestantes.findMany({
      where: { activa: true },
      include: {
        ips_asignada: true,
        municipios: true,
        medico_tratante: true,
        control_prenatal: {
          orderBy: { fecha_control: 'desc' },
          take: 1
        }
      }
    });

    const gestantesFormateadas = (gestantes || []).map((gestante, index) => {
      try {
        // Calcular edad
        const edad = gestante.fecha_nacimiento
          ? Math.floor((new Date() - new Date(gestante.fecha_nacimiento)) / (365.25 * 24 * 60 * 60 * 1000))
          : null;

        // Calcular semanas de gestación
        let semanas = null;
        if (gestante.fecha_ultima_menstruacion) {
          const diasGestacion = Math.floor((new Date() - new Date(gestante.fecha_ultima_menstruacion)) / (24 * 60 * 60 * 1000));
          semanas = Math.floor(diasGestacion / 7);
        }

        // Último control
        const ultimoControl = gestante.control_prenatal.length > 0
          ? gestante.control_prenatal[0].fecha_control.toISOString().split('T')[0]
          : null;

        const gestanteFormateada = {
          id: gestante.id,
          nombre: gestante.nombre,
          documento: gestante.documento,
          edad,
          semanas,
          telefono: gestante.telefono,
          direccion: gestante.direccion,
          eps: gestante.eps,
          regimen_salud: gestante.regimen_salud,
          riesgo_alto: gestante.riesgo_alto,
          municipio: gestante.municipios?.nombre || null,
          ips_asignada: gestante.ips_asignada?.nombre || null,
          medico_tratante: gestante.medico_tratante?.nombre || null,
          ultimo_control: ultimoControl,
          fecha_creacion: gestante.fecha_creacion.toISOString().split('T')[0],
          // Campos adicionales requeridos por Flutter
          municipio_id: gestante.municipio_id,
          madrina_id: gestante.madrina_id,
          medico_tratante_id: gestante.medico_tratante_id,
          ips_asignada_id: gestante.ips_asignada_id,
          fecha_nacimiento: gestante.fecha_nacimiento.toISOString().split('T')[0],
          fecha_ultima_menstruacion: gestante.fecha_ultima_menstruacion ? gestante.fecha_ultima_menstruacion.toISOString().split('T')[0] : null,
          fecha_probable_parto: gestante.fecha_probable_parto ? gestante.fecha_probable_parto.toISOString().split('T')[0] : null,
          activa: gestante.activa
        };

        console.log(`🤰 [${index}] Gestante formateada:`, {
          id: gestanteFormateada.id,
          nombre: gestanteFormateada.nombre,
          tipos: {
            nombre: typeof gestanteFormateada.nombre,
            documento: typeof gestanteFormateada.documento,
            edad: typeof gestanteFormateada.edad,
            semanas: typeof gestanteFormateada.semanas,
            regimen_salud: typeof gestanteFormateada.regimen_salud,
            riesgo_alto: typeof gestanteFormateada.riesgo_alto
          }
        });

        return gestanteFormateada;
      } catch (error) {
        console.error(`❌ Error formateando gestante ${index}:`, error);
        throw error;
      }
    });

    console.log(`🤰 Encontradas ${gestantesFormateadas.length} gestantes activas`);
    console.log(`🤰 Tipo de gestantesFormateadas:`, typeof gestantesFormateadas, Array.isArray(gestantesFormateadas));

    const respuesta = {
      success: true,
      data: {
        gestantes: gestantesFormateadas,
        total: gestantesFormateadas.length
      }
    };

    console.log(`🤰 RESPUESTA FINAL:`, {
      success: respuesta.success,
      dataType: typeof respuesta.data,
      gestantesType: typeof respuesta.data.gestantes,
      gestantesIsArray: Array.isArray(respuesta.data.gestantes),
      gestantesLength: respuesta.data.gestantes.length,
      total: respuesta.data.total,
      primerGestante: respuesta.data.gestantes[0] ? {
        id: respuesta.data.gestantes[0].id,
        nombre: respuesta.data.gestantes[0].nombre,
        tipos: {
          nombre: typeof respuesta.data.gestantes[0].nombre,
          documento: typeof respuesta.data.gestantes[0].documento,
          edad: typeof respuesta.data.gestantes[0].edad,
          semanas: typeof respuesta.data.gestantes[0].semanas
        }
      } : null
    });

    res.json(respuesta);
  } catch (error) {
    console.error('❌ Error obteniendo gestantes:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo gestantes: ' + error.message,
      data: {
        gestantes: [],
        total: 0
      }
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
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const gestanteId = req.query.gestante_id;
    const medicoId = req.query.medico_id;
    const realizado = req.query.realizado;

    console.log('🩺 Obteniendo controles prenatales con filtros:', { page, limit, gestanteId, medicoId, realizado });

    // Construir filtros dinámicos
    const whereClause = {};
    if (gestanteId) whereClause.gestante_id = gestanteId;
    if (medicoId) whereClause.medico_id = medicoId;
    if (realizado !== undefined) whereClause.realizado = realizado === 'true';

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

    const hoy = new Date();
    const controlesVencidos = await prisma.control_prenatal.findMany({
      where: {
        realizado: false,
        fecha_control: {
          lt: hoy
        }
      },
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

    const hoy = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(hoy.getDate() + dias);

    const controlesPendientes = await prisma.control_prenatal.findMany({
      where: {
        realizado: false,
        fecha_control: {
          gte: hoy,
          lte: fechaLimite
        }
      },
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
    const {
      gestante_id,
      medico_id,
      fecha_control,
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
      proximo_control,
      realizado = false
    } = req.body;

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

    // En un entorno real, aquí verificarías el refresh token en la base de datos
    // Por ahora, mantenemos la funcionalidad demo pero mejorada

    // Verificar si el refresh token existe en la base de datos (demo)
    const tokenExists = refreshToken.startsWith('refresh-');

    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token inválido'
      });
    }

    // Generate a new JWT-like token
    const tokenPayload = {
      id: 'demo-user',
      email: 'demo@example.com',
      rol: 'super_admin',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
    const signature = Buffer.from('demo-signature-refreshed').toString('base64url');
    const newToken = `${header}.${payload}.${signature}`;
    const newRefreshToken = `refresh-${Date.now()}`;

    console.log('✅ Token renovado exitosamente');

    res.json({
      success: true,
      message: 'Token renovado exitosamente',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: 86400, // 24 horas en segundos
        tokenType: 'Bearer',
        user: {
          id: 'demo-user',
          nombre: 'Usuario Demo',
          email: 'demo@example.com',
          rol: 'super_admin'
        }
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

app.get('/api/reportes/descargar/estadisticas-gestantes', (req, res) => {
  res.json({
    success: true,
    message: 'Estadísticas de gestantes obtenidas exitosamente',
    data: {
      id: 'estadisticas-gestantes',
      titulo: 'Estadísticas de Gestantes',
      fechaGeneracion: new Date().toISOString(),
      datos: []
    }
  });
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
      prisma.alertas.count(),
      prisma.alertas.count({ where: { resuelta: false } }),
      prisma.medicos.count(),
      prisma.medicos.count({ where: { activo: true } }),
      prisma.ips.count(),
      prisma.ips.count({ where: { activo: true } })
    ]);

    const resumen = {
      gestantes: {
        total: totalGestantes,
        activas: gestantesActivas,
        inactivas: totalGestantes - gestantesActivas
      },
      controles: {
        total: totalControles,
        realizados: controlesRealizados,
        pendientes: totalControles - controlesRealizados
      },
      alertas: {
        total: totalAlertas,
        activas: alertasActivas,
        resueltas: totalAlertas - alertasActivas
      },
      medicos: {
        total: totalMedicos,
        activos: medicosActivos,
        inactivos: totalMedicos - medicosActivos
      },
      ips: {
        total: totalIPS,
        activas: ipsActivas,
        inactivas: totalIPS - ipsActivas
      },
      fechaGeneracion: new Date().toISOString(),
      periodo: 'Todos los registros'
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

    // Por ahora, devolver un PDF simple (en una implementación real usarías una librería como puppeteer o jsPDF)
    const pdfContent = `
      RESUMEN GENERAL DEL SISTEMA
      ===========================
      
      Fecha de generación: ${new Date().toLocaleDateString()}
      
      GESTANTES:
      - Total: ${resumenData.data.gestantes.total}
      - Activas: ${resumenData.data.gestantes.activas}
      - Inactivas: ${resumenData.data.gestantes.inactivas}
      
      CONTROLES PRENATALES:
      - Total: ${resumenData.data.controles.total}
      - Realizados: ${resumenData.data.controles.realizados}
      - Pendientes: ${resumenData.data.controles.pendientes}
      
      ALERTAS:
      - Total: ${resumenData.data.alertas.total}
      - Activas: ${resumenData.data.alertas.activas}
      - Resueltas: ${resumenData.data.alertas.resueltas}
      
      MÉDICOS:
      - Total: ${resumenData.data.medicos.total}
      - Activos: ${resumenData.data.medicos.activos}
      - Inactivos: ${resumenData.data.medicos.inactivos}
      
      IPS:
      - Total: ${resumenData.data.ips.total}
      - Activas: ${resumenData.data.ips.activas}
      - Inactivas: ${resumenData.data.ips.inactivas}
    `;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resumen-general.pdf"');
    res.send(Buffer.from(pdfContent, 'utf8'));

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

    // Por ahora, devolver un CSV simple (en una implementación real usarías una librería como exceljs)
    const csvContent = `Categoría,Total,Activos/Realizados,Inactivos/Pendientes
Gestantes,${resumenData.data.gestantes.total},${resumenData.data.gestantes.activas},${resumenData.data.gestantes.inactivas}
Controles,${resumenData.data.controles.total},${resumenData.data.controles.realizados},${resumenData.data.controles.pendientes}
Alertas,${resumenData.data.alertas.total},${resumenData.data.alertas.activas},${resumenData.data.alertas.resueltas}
Médicos,${resumenData.data.medicos.total},${resumenData.data.medicos.activos},${resumenData.data.medicos.inactivos}
IPS,${resumenData.data.ips.total},${resumenData.data.ips.activas},${resumenData.data.ips.inactivas}`;

    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader('Content-Disposition', 'attachment; filename="resumen-general.csv"');
    res.send(csvContent);

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

    const [
      totalControles,
      controlesRealizados,
      controlesPendientes,
      controlesVencidos,
      controlesPorMedico
    ] = await Promise.all([
      prisma.control_prenatal.count({ where: whereClause }),
      prisma.control_prenatal.count({ where: { ...whereClause, realizado: true } }),
      prisma.control_prenatal.count({ 
        where: { 
          ...whereClause, 
          realizado: false,
          fecha_control: { gte: new Date() }
        } 
      }),
      prisma.control_prenatal.count({ 
        where: { 
          ...whereClause, 
          realizado: false,
          fecha_control: { lt: new Date() }
        } 
      }),
      prisma.control_prenatal.groupBy({
        by: ['medico_id'],
        where: whereClause,
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

    const [
      totalAlertas,
      alertasActivas,
      alertasResueltas,
      alertasPorTipo,
      alertasPorPrioridad
    ] = await Promise.all([
      prisma.alertas.count({ where: whereClause }),
      prisma.alertas.count({ where: { ...whereClause, resuelta: false } }),
      prisma.alertas.count({ where: { ...whereClause, resuelta: true } }),
      prisma.alertas.groupBy({
        by: ['tipo_alerta'],
        where: whereClause,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      }),
      prisma.alertas.groupBy({
        by: ['nivel_prioridad'],
        where: whereClause,
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

// ==================== FIN ENDPOINTS DE REPORTES ====================

// 404 handler - NUEVO
app.use('*', (req, res) => {
  console.log(`❌ 404 - Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Start server for local development
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
}

// Export for Vercel
module.exports = app;