"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganStream = exports.log = exports.httpLogger = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
/**
 * Configuración de niveles de log personalizados
 */
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
/**
 * Colores para cada nivel
 */
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};
winston_1.default.addColors(colors);
/**
 * Formato para logs en desarrollo (legible)
 */
const devFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`));
/**
 * Formato para logs en producción (JSON)
 */
const prodFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
/**
 * Determina el nivel de log según el entorno
 */
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'info';
};
/**
 * Configuración de transports (destinos de logs)
 */
const transports = [
    // Console transport (siempre activo)
    new winston_1.default.transports.Console({
        format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
    }),
    // File transport para errores
    new winston_1.default.transports.File({
        filename: path_1.default.join('logs', 'error.log'),
        level: 'error',
        format: prodFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
    // File transport para todos los logs
    new winston_1.default.transports.File({
        filename: path_1.default.join('logs', 'combined.log'),
        format: prodFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
];
/**
 * Logger principal
 */
exports.logger = winston_1.default.createLogger({
    level: level(),
    levels,
    transports,
    // No salir en errores no capturados
    exitOnError: false,
});
/**
 * Logger para requests HTTP
 */
exports.httpLogger = winston_1.default.createLogger({
    level: 'http',
    levels,
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.Console({
            format: devFormat,
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join('logs', 'http.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
});
/**
 * Helper para logging estructurado
 */
exports.log = {
    error: (message, meta) => {
        exports.logger.error(message, meta);
    },
    warn: (message, meta) => {
        exports.logger.warn(message, meta);
    },
    info: (message, meta) => {
        exports.logger.info(message, meta);
    },
    http: (message, meta) => {
        exports.httpLogger.http(message, meta);
    },
    debug: (message, meta) => {
        exports.logger.debug(message, meta);
    },
    // Métodos específicos del dominio
    auth: (message, meta) => {
        exports.logger.info(`[AUTH] ${message}`, meta);
    },
    database: (message, meta) => {
        exports.logger.info(`[DATABASE] ${message}`, meta);
    },
    api: (message, meta) => {
        exports.logger.info(`[API] ${message}`, meta);
    },
    security: (message, meta) => {
        exports.logger.warn(`[SECURITY] ${message}`, meta);
    },
};
/**
 * Stream para Morgan (HTTP logging middleware)
 */
exports.morganStream = {
    write: (message) => {
        exports.httpLogger.http(message.trim());
    },
};
// Crear directorio de logs si no existe
const fs_1 = __importDefault(require("fs"));
const logsDir = path_1.default.join(process.cwd(), 'logs');
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
exports.default = exports.logger;
