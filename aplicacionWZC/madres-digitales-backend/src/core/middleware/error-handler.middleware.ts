import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../errors/app-error';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Si ya se envió una respuesta, no hacer nada
  if (res.headersSent) {
    return next(error);
  }

  // Error de la aplicación
  if (error instanceof AppError) {
    logger.error('Application Error:', {
      error: error.message,
      code: error.code,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code || 'APP_ERROR',
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
        }),
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
    return;
  }

  // Error de validación de Zod
  if (error.name === 'ZodError') {
    logger.error('Validation Error:', {
      error: error.message,
      issues: (error as any).issues,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: (error as any).issues,
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
        }),
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
    return;
  }

  // Error de Prisma
  if (error.name === 'PrismaClientKnownRequestError') {
    logger.error('Database Error:', {
      error: error.message,
      code: (error as any).code,
      meta: (error as any).meta,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    const prismaError = error as any;
    let statusCode = 500;
    let message = 'Database error';
    let code = 'DATABASE_ERROR';

    switch (prismaError.code) {
      case 'P2002':
        statusCode = 409;
        message = 'Resource already exists';
        code = 'DUPLICATE_RESOURCE';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Resource not found';
        code = 'NOT_FOUND';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Foreign key constraint violated';
        code = 'FOREIGN_KEY_VIOLATION';
        break;
    }

    res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
          meta: prismaError.meta,
        }),
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
    return;
  }

  // Error de JWT
  if (error.name === 'JsonWebTokenError') {
    logger.error('JWT Error:', {
      error: error.message,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
        }),
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
    return;
  }

  // Error de red
  if ((error as any).code === 'ECONNREFUSED' || (error as any).code === 'ENOTFOUND' || (error as any).code === 'ECONNRESET') {
    logger.error('Network Error:', {
      error: error.message,
      code: (error as any).code,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(503).json({
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Network error',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
        }),
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
    return;
  }

  // Error genérico
  logger.error('Unhandled Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
      }),
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

// Middleware para manejar errores asíncronos
export const asyncErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Si ya se envió una respuesta, no hacer nada
  if (res.headersSent) {
    return next(error);
  }

  // Manejar el error de forma asíncrona
  Promise.resolve().then(() => {
    errorHandler(error, req, res, next);
  });
};

// Middleware para errores no capturados
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Resource not found',
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  });
};

// Middleware para errores de método no permitido
export const methodNotAllowedHandler = (req: Request, res: Response): void => {
  res.status(405).json({
    success: false,
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: 'Method not allowed',
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  });
};