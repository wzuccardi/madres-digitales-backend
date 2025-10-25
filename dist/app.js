"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
console.log('🚀 INICIANDO SERVIDOR - app.ts cargado - RESTART');
console.log('📍 Directorio actual:', process.cwd());
console.log('🔧 Argumentos:', process.argv);
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const index_1 = __importDefault(require("./routes/index"));
const error_middleware_1 = require("./middlewares/error.middleware");
const rate_limit_middleware_1 = require("./middlewares/rate-limit.middleware");
console.log('⚙️ Configurando dotenv...');
dotenv_1.default.config();
console.log('✅ dotenv configurado');
const app = (0, express_1.default)();
exports.prisma = new client_1.PrismaClient();
// Middlewares
// Configurar helmet con políticas más permisivas para desarrollo
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Permitir recursos cross-origin
    crossOriginEmbedderPolicy: false, // Deshabilitar para permitir videos
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            mediaSrc: ["'self'", "http://localhost:3000", "http://localhost:3008", "http://localhost:3009", "blob:", "data:"],
            imgSrc: ["'self'", "data:", "blob:", "http://localhost:3000"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        },
    },
}));
// CORS configuration - permitir todos los orígenes para desarrollo
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Permitir requests sin origin (como Postman) y todos los orígenes
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'X-HTTP-Method-Override'
    ],
    exposedHeaders: ['Authorization'],
    optionsSuccessStatus: 200,
    preflightContinue: false
}));
// Manejar preflight requests explícitamente
app.options('*', (0, cors_1.default)());
// Middleware para debugging CORS
app.use((req, res, next) => {
    console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.get('Origin')} - Content-Type: ${req.get('Content-Type')}`);
    if (req.method === 'POST' && req.path.includes('/auth/login')) {
        console.log('🔐 LOGIN REQUEST DETECTED:', {
            method: req.method,
            path: req.path,
            headers: req.headers,
            body: req.body
        });
    }
    next();
});
app.use(express_1.default.json());
// Middleware adicional para debugging POST requests
app.use((req, res, next) => {
    if (req.method === 'POST') {
        console.log('📮 POST REQUEST:', {
            url: req.url,
            path: req.path,
            body: req.body,
            contentType: req.get('Content-Type'),
            origin: req.get('Origin')
        });
    }
    next();
});
app.use((0, morgan_1.default)('combined'));
// Servir archivos estáticos desde la carpeta uploads
const uploadsPath = path_1.default.join(__dirname, '../uploads');
console.log('📁 Sirviendo archivos estáticos desde:', uploadsPath);
// Middleware para agregar headers CORS a archivos estáticos (videos)
app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    next();
});
app.use('/uploads', express_1.default.static(uploadsPath, {
    maxAge: '1d', // Cache por 1 día
    etag: true,
    lastModified: true,
    acceptRanges: true, // Permitir solicitudes de rango para videos
}));
// Rutas
app.get('/', (req, res) => {
    res.json({
        message: '🚀 Madres Digitales API - Conectado a Base de Datos Real',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        database: 'PostgreSQL - Datos Reales',
        endpoints: {
            auth: '/api/auth/*',
            gestantes: '/api/gestantes',
            controles: '/api/controles',
            alertas: '/api/alertas',
            ips: '/api/ips',
            contenido: '/api/contenido',
            reportes: '/api/reportes',
            uploads: '/uploads/*'
        }
    });
});
// Swagger Documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Madres Digitales API Docs',
}));
// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_1.swaggerSpec);
});
// Aplicar rate limiting general a todas las rutas API
app.use('/api', rate_limit_middleware_1.generalLimiter, index_1.default);
// Manejo de errores
app.use(error_middleware_1.errorHandler);
exports.default = app;
