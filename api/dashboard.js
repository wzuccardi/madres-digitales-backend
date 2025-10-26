const { PrismaClient } = require('@prisma/client');

let prisma;

try {
  prisma = new PrismaClient();
} catch (error) {
  console.error('Error initializing Prisma:', error);
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (!prisma) {
      return res.status(500).json({
        success: false,
        error: 'Prisma client not initialized'
      });
    }

    // Obtener estadísticas del dashboard
    const [
      totalGestantes,
      gestantesActivas,
      totalControles,
      controlesRealizados,
      controlesHoy
    ] = await Promise.all([
      prisma.gestantes.count(),
      prisma.gestantes.count({ where: { activa: true } }),
      prisma.control_prenatal.count(),
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

    res.json({
      success: true,
      data: {
        totalGestantes,
        gestantesActivas,
        totalControles,
        controlesRealizados,
        controlesHoy,
        proximosCitas,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener datos del dashboard: ' + error.message
    });
  }
};