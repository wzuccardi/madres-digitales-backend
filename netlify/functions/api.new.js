const { PrismaClient } = require('@prisma/client');
const { app } = require('../../dist/app').default;

// Inicializar Prisma Client
const prisma = new PrismaClient();

// Middleware para conectar Prisma a cada request
const prismaMiddleware = (req, res, next) => {
  req.prisma = prisma;
  next();
};

// Handler principal para Netlify Functions
const handler = async (event, context) => {
  try {
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

    // Conectar Prisma al request
    const req = {
      method: event.httpMethod,
      path: event.path,
      query: event.queryStringParameters || {},
      headers: event.headers || {},
      body: event.body ? JSON.parse(event.body) : {},
      prisma: prisma
    };

    // Procesar la solicitud con la app Express
    const response = await new Promise((resolve, reject) => {
      app(req, {
        end: (response) => {
          resolve(response);
        }
      });
    });

    // Extraer la respuesta
    let responseData = '';
    let statusCode = 200;
    let responseHeaders = { ...headers };

    // Simular el procesamiento de la respuesta
    response.on('data', (chunk) => {
      responseData += chunk;
    });

    response.on('end', () => {
      try {
        const parsedData = JSON.parse(responseData);
        statusCode = parsedData.statusCode || 200;
        responseHeaders = { ...responseHeaders, ...parsedData.headers };
      } catch (e) {
        console.error('Error parsing response:', e);
      }
    });

    // Limpiar conexión de Prisma
    await prisma.$disconnect();

    return {
      statusCode,
      headers: responseHeaders,
      body: responseData
    };
  } catch (error) {
    console.error('Error en Netlify Function:', error);
    
    // Asegurar desconexión de Prisma en caso de error
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting Prisma:', disconnectError);
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

module.exports = { handler };