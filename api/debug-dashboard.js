const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

console.log('🔍 DEBUG: Iniciando debug-dashboard.js');

const prisma = new PrismaClient();
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

console.log('🔍 DEBUG: Registrando endpoint /api/dashboard/simple');

// Versión simplificada del endpoint que funciona - SIN la segunda consulta await
app.get('/api/dashboard/simple', async (req, res) => {
  try {
    console.log('📊 Iniciando consulta simple...');
    
    // SOLO la primera consulta Promise.all
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

    console.log('📊 Promise.all completado');

    // SIN la segunda consulta await que puede estar causando el bloqueo
    // const proximosCitas = await prisma.control_prenatal.count({...});

    const estadisticas = {
      totalGestantes,
      controlesRealizados,
      alertasActivas,
      totalMedicos,
      totalIps,
      gestantesAltoRiesgo,
      controlesHoy,
      proximosCitas: 0 // Hardcoded para evitar la segunda consulta
    };

    console.log('📊 Estadísticas preparadas:', estadisticas);

    res.json({
      success: true,
      data: estadisticas
    });
    
    console.log('📊 Respuesta enviada correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error: ' + error.message
    });
  }
});

console.log('🔍 DEBUG: Endpoint registrado');

// Test endpoint después
console.log('🔍 DEBUG: Registrando endpoint /api/test-after');
app.get('/api/test-after', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint after dashboard',
    timestamp: new Date().toISOString()
  });
});
console.log('🔍 DEBUG: Test endpoint registrado');

console.log('🔍 DEBUG: Archivo completado');

module.exports = app;