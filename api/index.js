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
app.get('/api/dashboard/estadisticas', (req, res) => {
  res.json({
    success: true,
    data: {
      totalGestantes: 125,
      controlesRealizados: 89,
      alertasActivas: 12,
      totalMedicos: 15,
      totalIps: 8,
      gestantesAltoRiesgo: 23,
      controlesHoy: 5,
      proximosCitas: 18
    }
  });
});

// IPS endpoints
app.get('/api/ips', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        nombre: 'IPS Cartagena Centro',
        direccion: 'Calle 30 #15-25',
        telefono: '300-123-4567',
        email: 'cartagena@ips.com',
        municipio: 'Cartagena',
        estado: 'activo'
      },
      {
        id: 2,
        nombre: 'IPS Magangué',
        direccion: 'Carrera 10 #8-15',
        telefono: '300-987-6543',
        email: 'magangue@ips.com',
        municipio: 'Magangué',
        estado: 'activo'
      }
    ]
  });
});

// Gestantes endpoints
app.get('/api/gestantes', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        nombre: 'María González',
        documento: '12345678',
        edad: 28,
        semanas: 24,
        riesgo: 'bajo',
        ips: 'IPS Cartagena Centro',
        ultimoControl: '2025-10-20',
        proximaCita: '2025-11-15'
      },
      {
        id: 2,
        nombre: 'Ana Rodríguez',
        documento: '87654321',
        edad: 32,
        semanas: 18,
        riesgo: 'alto',
        ips: 'IPS Magangué',
        ultimoControl: '2025-10-18',
        proximaCita: '2025-11-10'
      }
    ]
  });
});

// Médicos endpoints
app.get('/api/medicos', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        nombre: 'Dr. Carlos Pérez',
        especialidad: 'Ginecología',
        documento: '98765432',
        telefono: '300-555-1234',
        email: 'carlos.perez@medico.com',
        ips: 'IPS Cartagena Centro',
        estado: 'activo'
      },
      {
        id: 2,
        nombre: 'Dra. Laura Martínez',
        especialidad: 'Obstetricia',
        documento: '11223344',
        telefono: '300-555-5678',
        email: 'laura.martinez@medico.com',
        ips: 'IPS Magangué',
        estado: 'activo'
      }
    ]
  });
});

// Alertas endpoints
app.get('/api/alertas-automaticas/alertas', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  res.json({
    success: true,
    data: {
      alertas: [
        {
          id: 1,
          tipo: 'cita_vencida',
          titulo: 'Cita médica vencida',
          descripcion: 'María González tiene una cita vencida desde hace 3 días',
          gestante: 'María González',
          fecha: '2025-10-22',
          prioridad: 'alta',
          estado: 'pendiente'
        },
        {
          id: 2,
          tipo: 'alto_riesgo',
          titulo: 'Gestante de alto riesgo',
          descripcion: 'Ana Rodríguez requiere seguimiento especial',
          gestante: 'Ana Rodríguez',
          fecha: '2025-10-25',
          prioridad: 'crítica',
          estado: 'activa'
        }
      ],
      pagination: {
        page: page,
        limit: limit,
        total: 2,
        totalPages: 1
      }
    }
  });
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

module.exports = app;