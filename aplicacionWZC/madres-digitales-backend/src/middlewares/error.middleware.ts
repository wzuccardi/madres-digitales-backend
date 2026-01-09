import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../core/domain/errors/base.error';
import { Prisma } from '@prisma/client';
import { log } from '../config/logger';

/**
 * Logger de errores con Winston
 */
const logError = (err: Error, req: Request) => {
  const errorLog = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: (req as any).user?.id,
    userAgent: req.get('user-agent'),
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    }
  };

  log.error('Request error', errorLog);
};

/**
 * Determina si el error es operacional (esperado) o programático (bug)
 */
const isOperationalError = (error: Error): boolean => {
  if (error instanceof BaseError) {
    return error.isOperational;
  }
  return false;
};

/**
 * Convierte errores de Prisma a errores personalizados
 */
const handlePrismaError = (error: any): { statusCode: number; message: string } => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return {
          statusCode: 409,
          message: `Ya existe un registro con ese ${error.meta?.target || 'valor'}`
        };
      case 'P2025':
        return {
          statusCode: 404,
          message: 'Registro no encontrado'
        };
      case 'P2003':
        return {
          statusCode: 400,
          message: 'Referencia inválida a otro registro'
        };
      default:
        return {
          statusCode: 500,
          message: 'Error de base de datos'
        };
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      statusCode: 400,
      message: 'Datos de entrada inválidos'
    };
  }

  return {
    statusCode: 500,
    message: 'Error de base de datos'
  };
};

/**
 * Middleware principal de manejo de errores
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Log del error
  logError(err, req);

  // Si es un error de Prisma, convertirlo
  if (err instanceof Prisma.PrismaClientKnownRequestError ||
      err instanceof Prisma.PrismaClientValidationError) {
    const prismaError = handlePrismaError(err);
    return res.status(prismaError.statusCode).json({
      success: false,
      message: prismaError.message,
      timestamp: new Date().toISOString()
    });
  }

  // Si es un error personalizado
  if (err instanceof BaseError) {
    return res.status(err.statusCode).json({
      success: false,
      ...err.toJSON(),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Error genérico
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });

  // Si es un error no operacional (bug), notificar al equipo
  if (!isOperationalError(err)) {
    log.error('🚨 ERROR NO OPERACIONAL DETECTADO - REQUIERE ATENCIÓN', {
      error: err,
      request: {
        method: req.method,
        url: req.url,
        body: req.body,
        params: req.params,
        query: req.query
      }
    });
    // Aquí se podría integrar con un servicio de monitoreo como Sentry
  }
}

/**
 * Middleware para capturar errores asíncronos
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para rutas no encontradas
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.url} no encontrada`,
    timestamp: new Date().toISOString()
  });
};
