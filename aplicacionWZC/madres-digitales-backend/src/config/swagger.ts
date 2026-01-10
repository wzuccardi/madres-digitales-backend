import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Madres Digitales API',
      version: version,
      description: 'API para el sistema de monitoreo de salud materna en Bolívar, Colombia',
      contact: {
        name: 'Equipo Madres Digitales',
        email: 'wzuccardi@gmail.com',
      },
      license: {
        name: 'Privado',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
      {
        url: 'https://api.madresdigitales.com',
        description: 'Servidor de producción',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT de autenticación',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'object',
              additionalProperties: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Usuario: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            nombre: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            rol: {
              type: 'string',
              enum: ['super_admin', 'admin', 'coordinador', 'madrina', 'medico'],
            },
            activo: {
              type: 'boolean',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Gestante: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            nombre: {
              type: 'string',
            },
            documento: {
              type: 'string',
            },
            tipoDocumento: {
              type: 'string',
              enum: ['CC', 'TI', 'RC', 'CE', 'PA'],
            },
            fechaNacimiento: {
              type: 'string',
              format: 'date',
            },
            telefono: {
              type: 'string',
              nullable: true,
            },
            direccion: {
              type: 'string',
              nullable: true,
            },
            municipioId: {
              type: 'string',
            },
            fechaUltimaMenstruacion: {
              type: 'string',
              format: 'date',
              nullable: true,
            },
            fechaProbableParto: {
              type: 'string',
              format: 'date',
              nullable: true,
            },
            numeroEmbarazos: {
              type: 'integer',
            },
            numeroPartos: {
              type: 'integer',
            },
            numeroAbortos: {
              type: 'integer',
            },
            grupoSanguineo: {
              type: 'string',
              nullable: true,
            },
            madrinaId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
            ipsId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
            activo: {
              type: 'boolean',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'wzuccardi@gmail.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'admin123',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            user: {
              $ref: '#/components/schemas/Usuario',
            },
            token: {
              type: 'string',
              description: 'JWT Access Token',
            },
            refreshToken: {
              type: 'string',
              description: 'JWT Refresh Token',
            },
          },
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              description: 'JWT Refresh Token',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints de autenticación y autorización',
      },
      {
        name: 'Gestantes',
        description: 'Gestión de gestantes',
      },
      {
        name: 'Usuarios',
        description: 'Gestión de usuarios del sistema',
      },
      {
        name: 'Controles',
        description: 'Controles prenatales',
      },
      {
        name: 'Alertas',
        description: 'Sistema de alertas y notificaciones',
      },
      {
        name: 'Dashboard',
        description: 'Estadísticas y métricas',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

