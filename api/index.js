const { PrismaClient } = require('@prisma/client');
const app = require('../dist/app').default;

// Inicializar Prisma Client
const prisma = new PrismaClient();

// Middleware para conectar Prisma a cada request
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Manejo de la conexión para Vercel Serverless
module.exports = async (req, res) => {
  // Configurar headers CORS para todas las respuestas
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-HTTP-Method-Override');
  res.setHeader('Access-Control-Expose-Headers', 'Authorization');
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Conectar a Prisma si no está conectado
    if (!prisma._engine) {
      await prisma.$connect();
    }
    
    // Procesar la solicitud con la app Express
    app(req, res);
  } catch (error) {
    console.error('Error en la función serverless:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

// Cleanup para evitar conexiones colgadas
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});