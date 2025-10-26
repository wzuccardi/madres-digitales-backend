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

    console.log('🔍 Realizando prueba completa de la base de datos...');
    
    // Test all main tables
    const [
      totalUsuarios,
      totalMunicipios,
      totalIps,
      totalMedicos,
      totalGestantes,
      totalAlertas,
      totalControles,
      totalControlPrenatal,
      totalContenidos
    ] = await Promise.all([
      prisma.usuarios.count(),
      prisma.municipios.count(),
      prisma.ips.count(),
      prisma.medicos.count(),
      prisma.gestantes.count(),
      prisma.alertas.count(),
      prisma.controles.count(),
      prisma.control_prenatal.count(),
      prisma.contenidos.count()
    ]);

    // Test specific queries
    const gestantesActivas = await prisma.gestantes.count({ where: { activa: true } });
    const controlesRealizados = await prisma.control_prenatal.count({ where: { realizado: true } });
    
    // Test with relations
    const gestanteConRelaciones = await prisma.gestantes.findFirst({
      include: {
        municipios: true,
        madrina: true,
        medico_tratante: true,
        ips_asignada: true,
        control_prenatal: {
          take: 1,
          orderBy: { fecha_control: 'desc' }
        }
      }
    });

    res.json({
      success: true,
      message: 'Prueba completa de Prisma exitosa',
      data: {
        counts: {
          totalUsuarios,
          totalMunicipios,
          totalIps,
          totalMedicos,
          totalGestantes,
          totalAlertas,
          totalControles,
          totalControlPrenatal,
          totalContenidos,
          gestantesActivas,
          controlesRealizados
        },
        sampleData: {
          gestanteConRelaciones: gestanteConRelaciones ? {
            id: gestanteConRelaciones.id,
            nombre: gestanteConRelaciones.nombre,
            municipio: gestanteConRelaciones.municipios?.nombre || null,
            madrina: gestanteConRelaciones.madrina?.nombre || null,
            medico: gestanteConRelaciones.medico_tratante?.nombre || null,
            ips: gestanteConRelaciones.ips_asignada?.nombre || null,
            ultimoControl: gestanteConRelaciones.control_prenatal.length > 0 
              ? gestanteConRelaciones.control_prenatal[0].fecha_control 
              : null
          } : null
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Complete test error:', error);
    res.status(500).json({
      success: false,
      error: 'Error en prueba completa: ' + error.message,
      stack: error.stack
    });
  }
};