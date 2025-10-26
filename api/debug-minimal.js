const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

console.log('🔍 DEBUG: Iniciando archivo debug-minimal.js');

// Inicializar Prisma Client
const prisma = new PrismaClient();
console.log('🔍 DEBUG: Prisma Client inicializado');

const app = express();
console.log('🔍 DEBUG: Express app creada');

// CORS configuration
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));
console.log('🔍 DEBUG: CORS configurado');

app.use(express.json());
console.log('🔍 DEBUG: Express JSON middleware configurado');

// Health check
console.log('🔍 DEBUG: Registrando endpoint /');
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Debug Minimal API - Funcionando',
    timestamp: new Date().toISOString()
  });
});
console.log('🔍 DEBUG: Endpoint / registrado');

// Test endpoint 1
console.log('🔍 DEBUG: Registrando endpoint /api/test1');
app.get('/api/test1', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint 1 working',
    timestamp: new Date().toISOString()
  });
});
console.log('🔍 DEBUG: Endpoint /api/test1 registrado');

// Dashboard endpoint (copy of working one)
console.log('🔍 DEBUG: Registrando endpoint /api/dashboard/test');
app.get('/api/dashboard/test', async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas de prueba...');
    
    const totalGestantes = await prisma.gestantes.count({ where: { activa: true } });
    
    res.json({
      success: true,
      data: {
        totalGestantes,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error: ' + error.message
    });
  }
});
console.log('🔍 DEBUG: Endpoint /api/dashboard/test registrado');

// Test endpoint 2
console.log('🔍 DEBUG: Registrando endpoint /api/test2');
app.get('/api/test2', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint 2 working',
    timestamp: new Date().toISOString()
  });
});
console.log('🔍 DEBUG: Endpoint /api/test2 registrado');

// Database status simple
console.log('🔍 DEBUG: Registrando endpoint /api/database/status-simple');
app.get('/api/database/status-simple', (req, res) => {
  res.json({
    success: true,
    message: 'Database status simple working',
    timestamp: new Date().toISOString()
  });
});
console.log('🔍 DEBUG: Endpoint /api/database/status-simple registrado');

console.log('🔍 DEBUG: Todos los endpoints registrados - Archivo completado');

// Export for Vercel
module.exports = app;