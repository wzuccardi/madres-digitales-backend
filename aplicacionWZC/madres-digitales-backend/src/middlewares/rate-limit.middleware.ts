import rateLimit from 'express-rate-limit';
import { log } from '../config/logger';

/**
 * Rate limiter general para todas las rutas
 * 100 requests por 15 minutos
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: {
    success: false,
    error: 'Demasiadas solicitudes, por favor intente más tarde'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    log.security('Rate limit exceeded', {
      ip: req.ip,
      url: req.url,
      method: req.method
    });
    res.status(429).json({
      success: false,
      error: 'Demasiadas solicitudes, por favor intente más tarde'
    });
  }
});

/**
 * Rate limiter estricto para login
 * 5 intentos por 15 minutos
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por ventana
  skipSuccessfulRequests: true, // No contar requests exitosos
  message: {
    success: false,
    error: 'Demasiados intentos de login, por favor intente más tarde'
  },
  handler: (req, res) => {
    log.security('Login rate limit exceeded', {
      ip: req.ip,
      email: req.body?.email
    });
    res.status(429).json({
      success: false,
      error: 'Demasiados intentos de login. Por favor intente en 15 minutos.'
    });
  }
});

/**
 * Rate limiter para registro
 * 3 registros por hora
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 registros por hora
  message: {
    success: false,
    error: 'Demasiados registros, por favor intente más tarde'
  },
  handler: (req, res) => {
    log.security('Register rate limit exceeded', {
      ip: req.ip,
      email: req.body?.email
    });
    res.status(429).json({
      success: false,
      error: 'Demasiados intentos de registro. Por favor intente en 1 hora.'
    });
  }
});

/**
 * Rate limiter para refresh token
 * 10 refreshes por hora
 */
export const refreshLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 refreshes por hora
  message: {
    success: false,
    error: 'Demasiadas renovaciones de token, por favor intente más tarde'
  },
  handler: (req, res) => {
    log.security('Refresh token rate limit exceeded', {
      ip: req.ip
    });
    res.status(429).json({
      success: false,
      error: 'Demasiadas renovaciones de token. Por favor intente más tarde.'
    });
  }
});

/**
 * Rate limiter para APIs de escritura (POST, PUT, DELETE)
 * 30 requests por 15 minutos
 */
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // 30 requests por ventana
  message: {
    success: false,
    error: 'Demasiadas operaciones de escritura, por favor intente más tarde'
  },
  handler: (req, res) => {
    log.security('Write operation rate limit exceeded', {
      ip: req.ip,
      url: req.url,
      method: req.method
    });
    res.status(429).json({
      success: false,
      error: 'Demasiadas operaciones. Por favor intente más tarde.'
    });
  }
});

