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

    console.log('🔍 Obteniendo información de la base de datos...');
    
    // Usar exactamente la misma lógica que el endpoint que funciona
    const [
      totalUsuarios,
      totalGestantes,
      gestantesActivas,
      totalControles,
      controlesRealizados
    ] = await Promise.all([
      prisma.usuarios.count(),
      prisma.gestantes.count(),
      prisma.gestantes.count({ where: { activa: true } }),
      prisma.control_prenatal.count(),
      prisma.control_prenatal.count({ where: { realizado: true } })
    ]);

    const dbInfo = {
      totalUsuarios,
      totalGestantes,
      gestantesActivas,
      totalControles,
      controlesRealizados,
      timestamp: new Date().toISOString()
    };

    console.log('📊 Información de la BD obtenida:', dbInfo);

    res.json({
      success: true,
      data: dbInfo,
      message: 'Database info endpoint working correctly'
    });

  } catch (error) {
    console.error('❌ Error obteniendo información de la BD:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo información de la base de datos: ' + error.message
    });
  }
};