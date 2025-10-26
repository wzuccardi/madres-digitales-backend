const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// Inicializar Prisma Client
const prisma = new PrismaClient();

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3008',
    'https://madres-digitales-frontend.vercel.app',
    'https://madres-digitales.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization'
  ]
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Madres Digitales API - Funcionando Correctamente',
    version: '1.0.0',
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
      token: 'demo-jwt-token'
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

    const ipsFormateadas = ips.map(ipsItem => ({
      id: ipsItem.id,
      nombre: ipsItem.nombre,
      nit: ipsItem.nit,
      direccion: ipsItem.direccion,
      telefono: ipsItem.telefono,
      email: ipsItem.email,
      nivel: ipsItem.nivel,
      municipio: ipsItem.municipios?.nombre || null,
      medicosAsignados: ipsItem.medicos.length,
      gestantesAsignadas: ipsItem.gestantes.length,
      coordenadas: {
        latitud: ipsItem.latitud,
        longitud: ipsItem.longitud
      }
    }));

    console.log(`🏥 Encontradas ${ipsFormateadas.length} IPS activas`);

    res.json({
      success: true,
      data: ipsFormateadas
    });
  } catch (error) {
    console.error('❌ Error obteniendo IPS:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo IPS: ' + error.message
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

    const gestantesFormateadas = gestantes.map(gestante => {
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

      return {
        id: gestante.id,
        nombre: gestante.nombre,
        documento: gestante.documento,
        edad,
        semanas,
        telefono: gestante.telefono,
        direccion: gestante.direccion,
        eps: gestante.eps,
        regimenSalud: gestante.regimen_salud,
        riesgoAlto: gestante.riesgo_alto,
        municipio: gestante.municipios?.nombre || null,
        ipsAsignada: gestante.ips_asignada?.nombre || null,
        medicoTratante: gestante.medico_tratante?.nombre || null,
        ultimoControl,
        fechaCreacion: gestante.fecha_creacion.toISOString().split('T')[0]
      };
    });

    console.log(`🤰 Encontradas ${gestantesFormateadas.length} gestantes activas`);

    res.json({
      success: true,
      data: gestantesFormateadas
    });
  } catch (error) {
    console.error('❌ Error obteniendo gestantes:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo gestantes: ' + error.message
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

    const medicosFormateados = medicos.map(medico => ({
      id: medico.id,
      nombre: medico.nombre,
      documento: medico.documento,
      telefono: medico.telefono,
      especialidad: medico.especialidad,
      email: medico.email,
      registroMedico: medico.registro_medico,
      ips: medico.ips?.nombre || null,
      municipio: medico.municipios?.nombre || null,
      gestantesAsignadas: medico.gestantes.length,
      fechaCreacion: medico.fecha_creacion.toISOString().split('T')[0]
    }));

    console.log(`👨‍⚕️ Encontrados ${medicosFormateados.length} médicos activos`);

    res.json({
      success: true,
      data: medicosFormateados
    });
  } catch (error) {
    console.error('❌ Error obteniendo médicos:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo médicos: ' + error.message
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

// Database status endpoint
app.get('/api/database/status', async (req, res) => {
  try {
    console.log('🔍 Obteniendo estado de la base de datos...');
    
    const [
      totalUsuarios,
      totalMunicipios,
      totalIps,
      totalMedicos,
      totalGestantes,
      totalAlertas,
      totalControles,
      gestantesActivas,
      controlesRealizados,
      alertasActivas
    ] = await Promise.all([
      prisma.usuarios.count(),
      prisma.municipios.count(),
      prisma.ips.count(),
      prisma.medicos.count(),
      prisma.gestantes.count(),
      prisma.alertas.count(),
      prisma.control_prenatal.count(),
      prisma.gestantes.count({ where: { activa: true } }),
      prisma.control_prenatal.count({ where: { realizado: true } }),
      prisma.alertas.count({ where: { resuelta: false } })
    ]);

    const databaseStatus = {
      totalUsuarios,
      totalMunicipios,
      totalIps,
      totalMedicos,
      totalGestantes,
      totalAlertas,
      totalControles,
      gestantesActivas,
      controlesRealizados,
      alertasActivas,
      timestamp: new Date().toISOString()
    };

    console.log('📊 Estado de la BD obtenido:', databaseStatus);

    res.json({
      success: true,
      data: databaseStatus
    });
  } catch (error) {
    console.error('❌ Error obteniendo estado de la BD:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estado de la base de datos: ' + error.message
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

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Export for Vercel
module.exports = app;