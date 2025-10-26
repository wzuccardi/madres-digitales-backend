const express = require('express');
const cors = require('cors');

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
    message: 'Madres Digitales API - Versión Temporal Sin Prisma',
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

// Dashboard endpoints - DATOS TEMPORALES HASTA RESOLVER PRISMA
app.get('/api/dashboard/estadisticas', async (req, res) => {
  try {
    console.log('🔍 Devolviendo estadísticas temporales...');
    
    // Datos temporales que reflejan la realidad según lo que mencionas
    const estadisticas = {
      totalGestantes: 2, // Datos reales según lo que mencionas
      controlesRealizados: 5,
      alertasActivas: 1,
      totalMedicos: 3,
      totalIps: 2,
      gestantesAltoRiesgo: 1,
      controlesHoy: 0,
      proximosCitas: 2
    };

    console.log('📊 Estadísticas devueltas:', estadisticas);

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

// IPS endpoints
app.get('/api/ips', async (req, res) => {
  try {
    console.log('🔍 Devolviendo IPS temporales...');
    
    const ips = [
      {
        id: 1,
        nombre: 'IPS Cartagena Centro',
        nit: '900123456-1',
        direccion: 'Calle 30 #15-25',
        telefono: '300-123-4567',
        email: 'cartagena@ips.com',
        municipio: 'Cartagena',
        nivel: 'II',
        estado: 'activo',
        medicosAsignados: 2,
        gestantesAsignadas: 1
      },
      {
        id: 2,
        nombre: 'IPS Magangué',
        nit: '900654321-2',
        direccion: 'Carrera 10 #8-15',
        telefono: '300-987-6543',
        email: 'magangue@ips.com',
        municipio: 'Magangué',
        nivel: 'I',
        estado: 'activo',
        medicosAsignados: 1,
        gestantesAsignadas: 1
      }
    ];

    console.log(`📊 Devueltas ${ips.length} IPS`);

    res.json({
      success: true,
      data: ips
    });
  } catch (error) {
    console.error('❌ Error obteniendo IPS:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo IPS: ' + error.message
    });
  }
});

// Gestantes endpoints
app.get('/api/gestantes', async (req, res) => {
  try {
    console.log('🔍 Devolviendo gestantes temporales...');
    
    const gestantes = [
      {
        id: 1,
        nombre: 'María González',
        documento: '12345678',
        edad: 28,
        semanas: 24,
        riesgo: 'bajo',
        ips: 'IPS Cartagena Centro',
        municipio: 'Cartagena',
        ultimoControl: '2025-10-20',
        proximaCita: '2025-11-15',
        telefono: '300-111-2222',
        eps: 'Nueva EPS',
        medico: 'Dr. Carlos Pérez'
      },
      {
        id: 2,
        nombre: 'Ana Rodríguez',
        documento: '87654321',
        edad: 32,
        semanas: 18,
        riesgo: 'alto',
        ips: 'IPS Magangué',
        municipio: 'Magangué',
        ultimoControl: '2025-10-18',
        proximaCita: '2025-11-10',
        telefono: '300-333-4444',
        eps: 'Sanitas',
        medico: 'Dra. Laura Martínez'
      }
    ];

    console.log(`📊 Devueltas ${gestantes.length} gestantes`);

    res.json({
      success: true,
      data: gestantes
    });
  } catch (error) {
    console.error('❌ Error obteniendo gestantes:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo gestantes: ' + error.message
    });
  }
});

// Médicos endpoints
app.get('/api/medicos', async (req, res) => {
  try {
    console.log('🔍 Devolviendo médicos temporales...');
    
    const medicos = [
      {
        id: 1,
        nombre: 'Dr. Carlos Pérez',
        especialidad: 'Ginecología',
        documento: '98765432',
        telefono: '300-555-1234',
        email: 'carlos.perez@medico.com',
        ips: 'IPS Cartagena Centro',
        municipio: 'Cartagena',
        registroMedico: 'RM-12345',
        estado: 'activo',
        gestantesAsignadas: 1
      },
      {
        id: 2,
        nombre: 'Dra. Laura Martínez',
        especialidad: 'Obstetricia',
        documento: '11223344',
        telefono: '300-555-5678',
        email: 'laura.martinez@medico.com',
        ips: 'IPS Magangué',
        municipio: 'Magangué',
        registroMedico: 'RM-67890',
        estado: 'activo',
        gestantesAsignadas: 1
      },
      {
        id: 3,
        nombre: 'Dr. Juan Herrera',
        especialidad: 'Medicina General',
        documento: '55667788',
        telefono: '300-555-9012',
        email: 'juan.herrera@medico.com',
        ips: 'IPS Cartagena Centro',
        municipio: 'Cartagena',
        registroMedico: 'RM-11111',
        estado: 'activo',
        gestantesAsignadas: 0
      }
    ];

    console.log(`📊 Devueltos ${medicos.length} médicos`);

    res.json({
      success: true,
      data: medicos
    });
  } catch (error) {
    console.error('❌ Error obteniendo médicos:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo médicos: ' + error.message
    });
  }
});

// Alertas endpoints
app.get('/api/alertas-automaticas/alertas', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    console.log('🔍 Devolviendo alertas temporales...');
    
    const alertas = [
      {
        id: 1,
        tipo: 'alto_riesgo',
        titulo: 'Gestante de alto riesgo',
        descripcion: 'Ana Rodríguez requiere seguimiento especial por hipertensión',
        gestante: 'Ana Rodríguez',
        gestanteId: 2,
        fecha: '2025-10-25',
        prioridad: 'crítica',
        estado: 'activa',
        madrina: 'Sin asignar',
        esAutomatica: true,
        scoreRiesgo: 85
      }
    ];

    const totalAlertas = alertas.length;
    const totalPages = Math.ceil(totalAlertas / limit);

    console.log(`📊 Devueltas ${alertas.length} alertas activas`);

    res.json({
      success: true,
      data: {
        alertas,
        pagination: {
          page,
          limit,
          total: totalAlertas,
          totalPages
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
        totalGestantes: 2,
        gestantesAltoRiesgo: 1,
        gestantesPorMunicipio: [
          { municipio: 'Cartagena', total: 1, altoRiesgo: 0 },
          { municipio: 'Magangué', total: 1, altoRiesgo: 1 }
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

module.exports = app;