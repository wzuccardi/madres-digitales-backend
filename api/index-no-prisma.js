const express = require('express');
const cors = require('cors');

console.log('🔍 DEBUG: Iniciando index-no-prisma.js');

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

console.log('🔍 DEBUG: Express configurado');

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Madres Digitales API - SIN PRISMA - Funcionando',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

console.log('🔍 DEBUG: Endpoint / registrado');

// Test endpoints
app.get('/api/test1', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint 1 working',
    timestamp: new Date().toISOString()
  });
});

console.log('🔍 DEBUG: Endpoint /api/test1 registrado');

app.get('/api/test2', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint 2 working',
    timestamp: new Date().toISOString()
  });
});

console.log('🔍 DEBUG: Endpoint /api/test2 registrado');

app.get('/api/database/status', (req, res) => {
  res.json({
    success: true,
    message: 'Database status endpoint working WITHOUT PRISMA',
    timestamp: new Date().toISOString()
  });
});

console.log('🔍 DEBUG: Endpoint /api/database/status registrado');

console.log('🔍 DEBUG: Todos los endpoints registrados - Archivo completado SIN PRISMA');

// Export for Vercel
module.exports = app;