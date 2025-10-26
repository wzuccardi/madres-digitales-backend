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

    console.log('🔍 Probando acceso a tabla controles...');
    
    // Probar acceso a la tabla controles específicamente
    const controlesCount = await prisma.controles.count();
    console.log('✅ Tabla controles accesible, count:', controlesCount);

    res.json({
      success: true,
      data: {
        controlesCount,
        message: 'Tabla controles accesible correctamente',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error accediendo a tabla controles:', error);
    res.status(500).json({
      success: false,
      error: 'Error accediendo a tabla controles: ' + error.message
    });
  }
};