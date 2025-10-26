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

    console.log('🔍 Obteniendo estado de la base de datos...');
    
    // Obtener datos básicos de la base de datos usando el patrón que funciona
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
};