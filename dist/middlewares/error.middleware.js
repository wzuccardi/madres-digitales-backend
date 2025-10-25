"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.asyncHandler = void 0;
exports.errorHandler = errorHandler;
const base_error_1 = require("../core/domain/errors/base.error");
const client_1 = require("@prisma/client");
const logger_1 = require("../config/logger");
/**
 * Logger de errores con Winston
 */
const logError = (err, req) => {
    const errorLog = {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userId: req.user?.id,
        userAgent: req.get('user-agent'),
        error: {
            name: err.name,
            message: err.message,
            stack: err.stack
        }
    };
    logger_1.log.error('Request error', errorLog);
};
/**
 * Determina si el error es operacional (esperado) o programático (bug)
 */
const isOperationalError = (error) => {
    if (error instanceof base_error_1.BaseError) {
        return error.isOperational;
    }
    return false;
};
/**
 * Convierte errores de Prisma a errores personalizados
 */
const handlePrismaError = (error) => {
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
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
    if (error instanceof client_1.Prisma.PrismaClientValidationError) {
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
function errorHandler(err, req, res, next) {
    // Log del error
    logError(err, req);
    // Si es un error de Prisma, convertirlo
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError ||
        err instanceof client_1.Prisma.PrismaClientValidationError) {
        const prismaError = handlePrismaError(err);
        return res.status(prismaError.statusCode).json({
            success: false,
            message: prismaError.message,
            timestamp: new Date().toISOString()
        });
    }
    // Si es un error personalizado
    if (err instanceof base_error_1.BaseError) {
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
        logger_1.log.error('🚨 ERROR NO OPERACIONAL DETECTADO - REQUIERE ATENCIÓN', {
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
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
/**
 * Middleware para rutas no encontradas
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta ${req.method} ${req.url} no encontrada`,
        timestamp: new Date().toISOString()
    });
};
exports.notFoundHandler = notFoundHandler;
