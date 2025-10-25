const { PrismaClient } = require('@prisma/client');
const app = require('../../dist/app').default;

// Inicializar Prisma Client
const prisma = new PrismaClient();

// Middleware para conectar Prisma a cada request
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Handler principal para Netlify Functions
const handler = async (event, context) => {
  // Configurar headers CORS para todas las respuestas
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-HTTP-Method-Override',
    'Access-Control-Expose-Headers': 'Authorization',
    'Content-Type': 'application/json'
  };

  // Manejar preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Conectar a Prisma si no está conectado
    if (!prisma._engine) {
      await prisma.$connect();
    }

    // Convertir evento de Netlify a req de Express
    const req = {
      method: event.httpMethod,
      url: event.path,
      path: event.path,
      query: event.queryStringParameters || {},
      headers: event.headers || {},
      body: event.body ? JSON.parse(event.body) : {},
      prisma: prisma
    };

    // Crear respuesta simulada de Express
    let responseData = '';
    let statusCode = 200;
    let responseHeaders = { ...headers };

    const res = {
      statusCode: 200,
      setHeader: (name, value) => {
        responseHeaders[name] = value;
      },
      json: (data) => {
        responseData = JSON.stringify(data);
        return res;
      },
      status: (code) => {
        statusCode = code;
        return res;
      },
      send: (data) => {
        responseData = typeof data === 'string' ? data : JSON.stringify(data);
        return res;
      },
      end: () => {
        return res;
      }
    };

    // Procesar la solicitud con la app Express
    await new Promise((resolve, reject) => {
      app(req, res);
      setTimeout(resolve, 25000); // Timeout de 25s (límite de Netlify)
    });

    return {
      statusCode,
      headers: responseHeaders,
      body: responseData
    };

  } catch (error) {
    console.error('Error en la función de Netlify:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error interno del servidor',
        message: error.message
      })
    };
  }
};

// Cleanup para evitar conexiones colgadas
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = { handler };