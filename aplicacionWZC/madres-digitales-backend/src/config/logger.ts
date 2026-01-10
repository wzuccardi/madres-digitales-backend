import winston from 'winston';
import path from 'path';

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

winston.addColors(colors);

/**
 * Formato para logs en desarrollo (legible)
 */
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
  )
);

/**
 * Formato para logs en producción (JSON)
 */
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

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
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  }),
  
  // File transport para errores
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    format: prodFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // File transport para todos los logs
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    format: prodFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

/**
 * Logger principal
 */
export const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  // No salir en errores no capturados
  exitOnError: false,
});

/**
 * Logger para requests HTTP
 */
export const httpLogger = winston.createLogger({
  level: 'http',
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: devFormat,
    }),
    new winston.transports.File({
      filename: path.join('logs', 'http.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

/**
 * Helper para logging estructurado
 */
export const log = {
  error: (message: string, meta?: any) => {
    logger.error(message, meta);
  },
  
  warn: (message: string, meta?: any) => {
    logger.warn(message, meta);
  },
  
  info: (message: string, meta?: any) => {
    logger.info(message, meta);
  },
  
  http: (message: string, meta?: any) => {
    httpLogger.http(message, meta);
  },
  
  debug: (message: string, meta?: any) => {
    logger.debug(message, meta);
  },
  
  // Métodos específicos del dominio
  auth: (message: string, meta?: any) => {
    logger.info(`[AUTH] ${message}`, meta);
  },
  
  database: (message: string, meta?: any) => {
    logger.info(`[DATABASE] ${message}`, meta);
  },
  
  api: (message: string, meta?: any) => {
    logger.info(`[API] ${message}`, meta);
  },
  
  security: (message: string, meta?: any) => {
    logger.warn(`[SECURITY] ${message}`, meta);
  },
};

/**
 * Stream para Morgan (HTTP logging middleware)
 */
export const morganStream = {
  write: (message: string) => {
    httpLogger.http(message.trim());
  },
};

// Crear directorio de logs si no existe
import fs from 'fs';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export default logger;

