import morgan from 'morgan';
import { morganStream } from '../config/logger';

/**
 * Formato personalizado de Morgan para logging HTTP
 */
const format = ':method :url :status :res[content-length] - :response-time ms';

/**
 * Middleware de logging HTTP usando Morgan + Winston
 */
export const httpLogger = morgan(format, {
  stream: morganStream,
  // No loguear rutas de health check
  skip: (req) => req.url === '/health' || req.url === '/api/health'
});

export default httpLogger;

