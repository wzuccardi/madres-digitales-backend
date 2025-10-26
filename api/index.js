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
    message: 'Madres Digitales API - Versión Mínima',
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
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email y contraseña son requeridos'
    });
  }

  // Demo login - accept any credentials and return super_admin role
  res.json({
    success: true,
    message: 'Login exitoso',
    data: {
      usuario: {
        id: 'demo-user',
        nombre: 'Usuario Demo',
        email: email,
        rol: 'super_admin'
      },
      token: 'demo-token-' + Date.now(),
      refreshToken: 'refresh-token-' + Date.now()
    }
  });
});

app.put('/api/auth/profile', (req, res) => {
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

// Dashboard endpoints
app.get('/api/dashboard/estadisticas', async (req, res) => {
  try {
    console.log('🔍 Obteniendo estadísticas reales de la base de datos...');
    
    // Consultas paralelas para obtener todas las estadísticas
    const [
      totalGestantes,
      gestantesActivas,
      gestantesAltoRiesgo,
      totalMedicos,
      medicosActivos,
      totalIps,
      ipsActivas,
      alertasActivas,
      alertasTotal,
      controlesRealizados,
      controlesHoy,
      proximosCitas,
      totalUsuarios,
      usuariosActivos
    ] = await Promise.all([
      // Gestantes
      prisma.gestantes.count(),
      prisma.gestantes.count({ where: { activa: true } }),
      prisma.gestantes.count({ where: { riesgo_alto: true, activa: true } }),
      
      // Médicos
      prisma.medicos.count(),
      prisma.medicos.count({ where: { activo: true } }),
      
      // IPS
      prisma.ips.count(),
      prisma.ips.count({ where: { activo: true } }),
      
      // Alertas
      prisma.alertas.count({ where: { resuelta: false } }),
      prisma.alertas.count(),
      
      // Controles
      prisma.controles.count({ where: { realizado: true } }),
      prisma.controles.count({
        where: {
          fecha_control: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          },
          realizado: true
        }
      }),
      prisma.controles.count({
        where: {
          proximo_control: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // próximos 7 días
          },
          realizado: false
        }
      }),
      
      // Usuarios
      prisma.usuarios.count(),
      prisma.usuarios.count({ where: { activo: true } })
    ]);

    console.log('📊 Estadísticas obtenidas:');
    console.log(`   - Total gestantes: ${totalGestantes}`);
    console.log(`   - Gestantes activas: ${gestantesActivas}`);
    console.log(`   - Gestantes alto riesgo: ${gestantesAltoRiesgo}`);
    console.log(`   - Total médicos: ${totalMedicos}`);
    console.log(`   - Médicos activos: ${medicosActivos}`);
    console.log(`   - Total IPS: ${totalIps}`);
    console.log(`   - IPS activas: ${ipsActivas}`);
    console.log(`   - Alertas activas: ${alertasActivas}`);
    console.log(`   - Total alertas: ${alertasTotal}`);
    console.log(`   - Controles realizados: ${controlesRealizados}`);
    console.log(`   - Controles hoy: ${controlesHoy}`);
    console.log(`   - Próximas citas: ${proximosCitas}`);
    console.log(`   - Total usuarios: ${totalUsuarios}`);
    console.log(`   - Usuarios activos: ${usuariosActivos}`);

    res.json({
      success: true,
      data: {
        totalGestantes: gestantesActivas,
        controlesRealizados: controlesRealizados,
        alertasActivas: alertasActivas,
        totalMedicos: medicosActivos,
        totalIps: ipsActivas,
        gestantesAltoRiesgo: gestantesAltoRiesgo,
        controlesHoy: controlesHoy,
        proximosCitas: proximosCitas,
        // Estadísticas adicionales
        totalUsuarios: usuariosActivos,
        alertasTotal: alertasTotal,
        gestantesTotales: totalGestantes,
        medicosTotales: totalMedicos,
        ipsTotales: totalIps
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener estadísticas',
      details: error.message
    });
  }
});

// IPS endpoints
app.get('/api/ips', async (req, res) => {
  try {
    console.log('🏥 Obteniendo IPS de la base de datos...');
    
    const ips = await prisma.ips.findMany({
      include: {
        municipios: {
          select: {
            nombre: true
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    console.log(`📊 Se encontraron ${ips.length} IPS`);

    const ipsFormatted = ips.map(ip => ({
      id: ip.id,
      nombre: ip.nombre,
      nit: ip.nit,
      direccion: ip.direccion,
      telefono: ip.telefono,
      email: ip.email,
      municipio: ip.municipios?.nombre || 'Sin municipio',
      nivel: ip.nivel,
      estado: ip.activo ? 'activo' : 'inactivo',
      latitud: ip.latitud ? parseFloat(ip.latitud) : null,
      longitud: ip.longitud ? parseFloat(ip.longitud) : null,
      fechaCreacion: ip.fecha_creacion,
      fechaActualizacion: ip.fecha_actualizacion
    }));

    res.json({
      success: true,
      data: ipsFormatted,
      total: ips.length
    });
  } catch (error) {
    console.error('❌ Error obteniendo IPS:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener IPS',
      details: error.message
    });
  }
});

// Gestantes endpoints
app.get('/api/gestantes', async (req, res) => {
  try {
    console.log('🤰 Obteniendo gestantes de la base de datos...');
    
    const gestantes = await prisma.gestantes.findMany({
      include: {
        municipios: {
          select: {
            nombre: true
          }
        },
        ips_asignada: {
          select: {
            nombre: true
          }
        },
        madrina: {
          select: {
            nombre: true
          }
        },
        medico_tratante: {
          select: {
            nombre: true
          }
        },
        controles: {
          orderBy: {
            fecha_control: 'desc'
          },
          take: 1
        }
      },
      where: {
        activa: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    console.log(`📊 Se encontraron ${gestantes.length} gestantes activas`);

    const gestantesFormatted = gestantes.map(gestante => {
      // Calcular edad
      const edad = gestante.fecha_nacimiento 
        ? Math.floor((new Date() - new Date(gestante.fecha_nacimiento)) / (365.25 * 24 * 60 * 60 * 1000))
        : null;

      // Calcular semanas de gestación
      let semanasGestacion = null;
      if (gestante.fecha_ultima_menstruacion) {
        const diasGestacion = Math.floor((new Date() - new Date(gestante.fecha_ultima_menstruacion)) / (24 * 60 * 60 * 1000));
        semanasGestacion = Math.floor(diasGestacion / 7);
      }

      // Último control
      const ultimoControl = gestante.controles.length > 0 
        ? gestante.controles[0].fecha_control 
        : null;

      return {
        id: gestante.id,
        nombre: gestante.nombre,
        documento: gestante.documento,
        tipoDocumento: gestante.tipo_documento,
        edad: edad,
        telefono: gestante.telefono,
        direccion: gestante.direccion,
        fechaNacimiento: gestante.fecha_nacimiento,
        fechaUltimaMenstruacion: gestante.fecha_ultima_menstruacion,
        fechaProbableParto: gestante.fecha_probable_parto,
        semanasGestacion: semanasGestacion,
        eps: gestante.eps,
        regimenSalud: gestante.regimen_salud,
        riesgo: gestante.riesgo_alto ? 'alto' : 'bajo',
        municipio: gestante.municipios?.nombre || 'Sin municipio',
        ips: gestante.ips_asignada?.nombre || 'Sin IPS asignada',
        madrina: gestante.madrina?.nombre || 'Sin madrina',
        medicoTratante: gestante.medico_tratante?.nombre || 'Sin médico',
        ultimoControl: ultimoControl,
        activa: gestante.activa,
        fechaCreacion: gestante.fecha_creacion,
        fechaActualizacion: gestante.fecha_actualizacion
      };
    });

    res.json({
      success: true,
      data: gestantesFormatted,
      total: gestantes.length
    });
  } catch (error) {
    console.error('❌ Error obteniendo gestantes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener gestantes',
      details: error.message
    });
  }
});

// Médicos endpoints
app.get('/api/medicos', async (req, res) => {
  try {
    console.log('👨‍⚕️ Obteniendo médicos de la base de datos...');
    
    const medicos = await prisma.medicos.findMany({
      include: {
        ips: {
          select: {
            nombre: true
          }
        },
        municipios: {
          select: {
            nombre: true
          }
        },
        gestantes: {
          where: {
            activa: true
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    console.log(`📊 Se encontraron ${medicos.length} médicos`);

    const medicosFormatted = medicos.map(medico => ({
      id: medico.id,
      nombre: medico.nombre,
      documento: medico.documento,
      tipoDocumento: medico.tipo_documento,
      telefono: medico.telefono,
      email: medico.email,
      especialidad: medico.especialidad,
      registroMedico: medico.registro_medico,
      ips: medico.ips?.nombre || 'Sin IPS asignada',
      municipio: medico.municipios?.nombre || 'Sin municipio',
      estado: medico.activo ? 'activo' : 'inactivo',
      gestantesAsignadas: medico.gestantes.length,
      fechaCreacion: medico.fecha_creacion,
      fechaActualizacion: medico.fecha_actualizacion
    }));

    res.json({
      success: true,
      data: medicosFormatted,
      total: medicos.length
    });
  } catch (error) {
    console.error('❌ Error obteniendo médicos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener médicos',
      details: error.message
    });
  }
});

// Alertas endpoints
app.get('/api/alertas-automaticas/alertas', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    console.log(`🚨 Obteniendo alertas - Página ${page}, Límite ${limit}`);
    
    const [alertas, totalAlertas] = await Promise.all([
      prisma.alertas.findMany({
        include: {
          gestante: {
            select: {
              nombre: true,
              documento: true
            }
          },
          madrina: {
            select: {
              nombre: true
            }
          }
        },
        orderBy: {
          fecha_creacion: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.alertas.count()
    ]);

    console.log(`📊 Se encontraron ${alertas.length} alertas de ${totalAlertas} totales`);

    const alertasFormatted = alertas.map(alerta => ({
      id: alerta.id,
      tipo: alerta.tipo_alerta,
      titulo: `Alerta ${alerta.tipo_alerta}`,
      descripcion: alerta.mensaje,
      gestante: alerta.gestante.nombre,
      documentoGestante: alerta.gestante.documento,
      madrina: alerta.madrina?.nombre || 'Sin madrina',
      fecha: alerta.fecha_creacion,
      prioridad: alerta.nivel_prioridad,
      estado: alerta.estado || (alerta.resuelta ? 'resuelta' : 'pendiente'),
      resuelta: alerta.resuelta,
      fechaResolucion: alerta.fecha_resolucion,
      esAutomatica: alerta.es_automatica,
      scoreRiesgo: alerta.score_riesgo,
      sintomas: alerta.sintomas,
      coordenadas: alerta.coordenadas_alerta
    }));

    const totalPages = Math.ceil(totalAlertas / limit);

    res.json({
      success: true,
      data: {
        alertas: alertasFormatted,
        pagination: {
          page: page,
          limit: limit,
          total: totalAlertas,
          totalPages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo alertas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener alertas',
      details: error.message
    });
  }
});

// Endpoint para consulta completa de registros de la base de datos
app.get('/api/database/stats', async (req, res) => {
  try {
    console.log('🔍 Realizando consulta completa de la base de datos...');
    
    const stats = await Promise.all([
      // Contar registros en cada tabla
      prisma.usuarios.count(),
      prisma.municipios.count(),
      prisma.ips.count(),
      prisma.medicos.count(),
      prisma.gestantes.count(),
      prisma.alertas.count(),
      prisma.controles.count(),
      prisma.control_prenatal.count(),
      prisma.contactos_emergencia.count(),
      prisma.seguimiento_emergencia.count(),
      prisma.contenidos.count(),
      prisma.progreso_contenido.count(),
      prisma.refresh_tokens.count(),
      prisma.dispositivos.count(),
      prisma.sync_logs.count(),
      prisma.sync_queue.count(),
      prisma.sync_conflicts.count(),
      prisma.entity_versions.count(),
      prisma.conversaciones.count(),
      prisma.mensajes.count(),
      prisma.zonas_cobertura.count(),
      prisma.logs.count(),
      
      // Estadísticas específicas
      prisma.usuarios.count({ where: { activo: true } }),
      prisma.gestantes.count({ where: { activa: true } }),
      prisma.gestantes.count({ where: { riesgo_alto: true } }),
      prisma.medicos.count({ where: { activo: true } }),
      prisma.ips.count({ where: { activo: true } }),
      prisma.alertas.count({ where: { resuelta: false } }),
      prisma.controles.count({ where: { realizado: true } }),
    ]);

    const [
      totalUsuarios, totalMunicipios, totalIps, totalMedicos, totalGestantes,
      totalAlertas, totalControles, totalControlPrenatal, totalContactosEmergencia,
      totalSeguimientoEmergencia, totalContenidos, totalProgresoContenido,
      totalRefreshTokens, totalDispositivos, totalSyncLogs, totalSyncQueue,
      totalSyncConflicts, totalEntityVersions, totalConversaciones, totalMensajes,
      totalZonasCobertura, totalLogs,
      usuariosActivos, gestantesActivas, gestantesAltoRiesgo, medicosActivos,
      ipsActivas, alertasActivas, controlesRealizados
    ] = stats;

    const databaseStats = {
      tablas: {
        usuarios: { total: totalUsuarios, activos: usuariosActivos },
        municipios: { total: totalMunicipios },
        ips: { total: totalIps, activas: ipsActivas },
        medicos: { total: totalMedicos, activos: medicosActivos },
        gestantes: { total: totalGestantes, activas: gestantesActivas, altoRiesgo: gestantesAltoRiesgo },
        alertas: { total: totalAlertas, activas: alertasActivas },
        controles: { total: totalControles, realizados: controlesRealizados },
        control_prenatal: { total: totalControlPrenatal },
        contactos_emergencia: { total: totalContactosEmergencia },
        seguimiento_emergencia: { total: totalSeguimientoEmergencia },
        contenidos: { total: totalContenidos },
        progreso_contenido: { total: totalProgresoContenido },
        refresh_tokens: { total: totalRefreshTokens },
        dispositivos: { total: totalDispositivos },
        sync_logs: { total: totalSyncLogs },
        sync_queue: { total: totalSyncQueue },
        sync_conflicts: { total: totalSyncConflicts },
        entity_versions: { total: totalEntityVersions },
        conversaciones: { total: totalConversaciones },
        mensajes: { total: totalMensajes },
        zonas_cobertura: { total: totalZonasCobertura },
        logs: { total: totalLogs }
      },
      resumen: {
        totalRegistros: stats.slice(0, 22).reduce((sum, count) => sum + count, 0),
        tablasConDatos: stats.slice(0, 22).filter(count => count > 0).length,
        tablasSinDatos: stats.slice(0, 22).filter(count => count === 0).length
      }
    };

    console.log('📊 Estadísticas completas de la base de datos:');
    console.log(`   - Total de registros: ${databaseStats.resumen.totalRegistros}`);
    console.log(`   - Tablas con datos: ${databaseStats.resumen.tablasConDatos}`);
    console.log(`   - Tablas sin datos: ${databaseStats.resumen.tablasSinDatos}`);
    console.log(`   - Usuarios: ${totalUsuarios} (${usuariosActivos} activos)`);
    console.log(`   - Gestantes: ${totalGestantes} (${gestantesActivas} activas, ${gestantesAltoRiesgo} alto riesgo)`);
    console.log(`   - Médicos: ${totalMedicos} (${medicosActivos} activos)`);
    console.log(`   - IPS: ${totalIps} (${ipsActivas} activas)`);
    console.log(`   - Alertas: ${totalAlertas} (${alertasActivas} activas)`);
    console.log(`   - Controles: ${totalControles} (${controlesRealizados} realizados)`);

    res.json({
      success: true,
      data: databaseStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de la base de datos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener estadísticas de la base de datos',
      details: error.message
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
      tipo: 'estadisticas-gestantes',
      titulo: 'Estadísticas de Gestantes por Municipio',
      descripcion: 'Estadísticas detalladas de gestantes agrupadas por municipio',
      datos: {
        totalGestantes: 150,
        gestantesAltoRiesgo: 25,
        gestantesPorMunicipio: [
          { municipio: 'Cartagena', total: 75, altoRiesgo: 15 },
          { municipio: 'Magangué', total: 45, altoRiesgo: 8 },
          { municipio: 'Turbaco', total: 30, altoRiesgo: 2 }
        ]
      },
      fechaGeneracion: new Date().toISOString()
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Cerrando conexión a la base de datos...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Cerrando conexión a la base de datos...');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;