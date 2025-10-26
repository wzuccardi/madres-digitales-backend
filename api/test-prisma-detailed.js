const { PrismaClient } = require('@prisma/client');

let prisma;

try {
  prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
} catch (error) {
  console.error('Error initializing Prisma:', error);
}

module.exports = async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({
        success: false,
        error: 'Prisma client not initialized'
      });
    }

    console.log('Testing Prisma connection...');

    // Test 1: Simple count
    const userCount = await prisma.usuarios.count();
    console.log('User count:', userCount);

    // Test 2: Count gestantes
    const gestanteCount = await prisma.gestantes.count();
    console.log('Gestante count:', gestanteCount);

    // Test 3: Count control_prenatal (the problematic table)
    const controlCount = await prisma.control_prenatal.count();
    console.log('Control prenatal count:', controlCount);

    // Test 4: Count controles (the old table)
    const controlesCount = await prisma.controles.count();
    console.log('Controles count:', controlesCount);

    // Test 5: Test the exact query from the API
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

    res.json({
      success: true,
      message: 'All Prisma queries successful',
      data: {
        userCount,
        gestanteCount,
        controlCount,
        controlesCount,
        dashboard: {
          totalGestantes,
          gestantesActivas,
          totalControles,
          controlesRealizados,
          controlesHoy
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Detailed Prisma test error:', error);
    res.status(500).json({
      success: false,
      error: 'Prisma test failed: ' + error.message,
      stack: error.stack
    });
  }
};