"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseTimeMiddleware = exports.debugLogMiddleware = exports.databaseErrorHandler = exports.authErrorHandler = exports.validationErrorHandler = exports.warningHandlerMiddleware = exports.asyncErrorHandler = exports.errorHandlerMiddleware = void 0;
const error_handling_service_1 = require("../services/error-handling.service");
const logger_1 = require("../config/logger");
/**
 * Middleware global para manejo de errores críticos
 */
const errorHandlerMiddleware = (error, req, res, next) => {
    const startTime = Date.now();
    try {
        // Extraer información del contexto
        const contexto = {
            componente: req.route?.path ? `API:${req.route.path}` : 'API:Desconocido',
            accion: req.method,
            datos: {
                url: req.url,
                params: req.params,
                query: req.query,
                body: req.body,
                headers: req.headers,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
            },
            usuarioId: req.user?.id,
        };
        // Manejar error crítico
        error_handling_service_1.errorHandlingService.manejarErrorCritico(error, contexto)
            .then(() => {
            const duration = Date.now() - startTime;
            logger_1.log.error('Error crítico manejado por middleware', {
                error: error.message,
                componente: contexto.componente,
                accion: contexto.accion,
                duration: `${duration}ms`,
                timestamp: new Date().toISOString(),
            });
        })
            .catch(manejoError => {
            const duration = Date.now() - startTime;
            console.error(`❌ ErrorHandlerMiddleware: Error manejando error crítico:`, manejoError);
            logger_1.log.error('Error en middleware de manejo de errores', {
                error: manejoError.message,
                errorOriginal: error.message,
                componente: contexto.componente,
                accion: contexto.accion,
                duration: `${duration}ms`,
                timestamp: new Date().toISOString(),
            });
        });
        // Enviar respuesta de error al cliente
        const statusCode = error.statusCode || error.status || 500;
        const mensaje = statusCode < 500 ? error.message : 'Error interno del servidor';
        res.status(statusCode).json({
            success: false,
            error: mensaje,
            timestamp: new Date().toISOString(),
            path: req.path,
        });
    }
    catch (middlewareError) {
        const duration = Date.now() - startTime;
        console.error(`❌ ErrorHandlerMiddleware: Error crítico en middleware:`, middlewareError);
        // Último recurso: respuesta genérica
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            timestamp: new Date().toISOString(),
            path: req.path,
        });
        logger_1.log.error('Error crítico en middleware de manejo de errores', {
            error: middlewareError.message,
            errorOriginal: error.message,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.errorHandlerMiddleware = errorHandlerMiddleware;
/**
 * Middleware para capturar errores asíncronos en rutas
 */
const asyncErrorHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncErrorHandler = asyncErrorHandler;
/**
 * Middleware para registrar advertencias
 */
const warningHandlerMiddleware = (advertencia, contexto, notificar = false) => {
    return (req, res, next) => {
        try {
            // Enriquecer contexto con información de la request
            const contextoEnriquecido = {
                ...contexto,
                datos: {
                    ...contexto.datos,
                    url: req.url,
                    params: req.params,
                    query: req.query,
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                },
                usuarioId: contexto.usuarioId || req.user?.id,
            };
            // Manejar advertencia
            error_handling_service_1.errorHandlingService.manejarAdvertencia(advertencia, contextoEnriquecido, notificar)
                .catch(error => {
                console.error(`❌ WarningHandlerMiddleware: Error manejando advertencia:`, error);
            });
            next();
        }
        catch (error) {
            console.error(`❌ WarningHandlerMiddleware: Error en middleware de advertencias:`, error);
            next();
        }
    };
};
exports.warningHandlerMiddleware = warningHandlerMiddleware;
/**
 * Middleware para manejar errores de validación
 */
const validationErrorHandler = (req, res, next) => {
    try {
        // Si hay errores de validación, manejarlos como advertencias
        if (req.validationErrors) {
            const errores = req.validationErrors;
            error_handling_service_1.errorHandlingService.manejarAdvertencia(`Errores de validación: ${JSON.stringify(errores)}`, {
                componente: 'API:Validación',
                accion: req.method,
                datos: {
                    url: req.url,
                    errores,
                },
                usuarioId: req.user?.id,
            }, false // No notificar errores de validación
            ).catch(error => {
                console.error(`❌ ValidationErrorHandler: Error manejando errores de validación:`, error);
            });
        }
        next();
    }
    catch (error) {
        console.error(`❌ ValidationErrorHandler: Error en middleware de validación:`, error);
        next();
    }
};
exports.validationErrorHandler = validationErrorHandler;
/**
 * Middleware para manejar errores de autenticación
 */
const authErrorHandler = (req, res, next) => {
    try {
        // Si hay errores de autenticación, manejarlos como advertencias
        if (req.authError) {
            const error = req.authError;
            error_handling_service_1.errorHandlingService.manejarAdvertencia(`Error de autenticación: ${error.message}`, {
                componente: 'API:Autenticación',
                accion: req.method,
                datos: {
                    url: req.url,
                    error: error.message,
                },
                usuarioId: req.user?.id,
            }, false // No notificar errores de autenticación comunes
            ).catch(error => {
                console.error(`❌ AuthErrorHandler: Error manejando error de autenticación:`, error);
            });
        }
        next();
    }
    catch (error) {
        console.error(`❌ AuthErrorHandler: Error en middleware de autenticación:`, error);
        next();
    }
};
exports.authErrorHandler = authErrorHandler;
/**
 * Middleware para manejar errores de base de datos
 */
const databaseErrorHandler = (req, res, next) => {
    try {
        // Si hay errores de base de datos, manejarlos como advertencias
        if (req.databaseError) {
            const error = req.databaseError;
            error_handling_service_1.errorHandlingService.manejarAdvertencia(`Error de base de datos: ${error.message}`, {
                componente: 'API:BaseDeDatos',
                accion: req.method,
                datos: {
                    url: req.url,
                    error: error.message,
                    query: req.databaseQuery,
                },
                usuarioId: req.user?.id,
            }, true // Notificar errores de base de datos
            ).catch(error => {
                console.error(`❌ DatabaseErrorHandler: Error manejando error de base de datos:`, error);
            });
        }
        next();
    }
    catch (error) {
        console.error(`❌ DatabaseErrorHandler: Error en middleware de base de datos:`, error);
        next();
    }
};
exports.databaseErrorHandler = databaseErrorHandler;
/**
 * Middleware para registrar información de depuración
 */
const debugLogMiddleware = (req, res, next) => {
    // Solo registrar en modo desarrollo
    if (process.env.NODE_ENV === 'development') {
        const startTime = Date.now();
        // Registrar información de la request
        console.log(`🔍 DebugLogMiddleware: ${req.method} ${req.url}`, {
            params: req.params,
            query: req.query,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            usuarioId: req.user?.id,
        });
        // Interceptamos el método res.json para registrar la respuesta
        const originalJson = res.json;
        res.json = function (data) {
            const duration = Date.now() - startTime;
            console.log(`🔍 DebugLogMiddleware: Response ${req.method} ${req.url} (${duration}ms)`, {
                statusCode: res.statusCode,
                dataSize: JSON.stringify(data).length,
            });
            return originalJson.call(this, data);
        };
    }
    next();
};
exports.debugLogMiddleware = debugLogMiddleware;
/**
 * Middleware para medir tiempo de respuesta
 */
const responseTimeMiddleware = (req, res, next) => {
    const startTime = Date.now();
    // Interceptamos el método res.end para registrar el tiempo de respuesta
    const originalEnd = res.end;
    res.end = function (...args) {
        const duration = Date.now() - startTime;
        // Registrar advertencia si el tiempo de respuesta es muy alto
        if (duration > 5000) { // Más de 5 segundos
            error_handling_service_1.errorHandlingService.manejarAdvertencia(`Tiempo de respuesta alto: ${duration}ms`, {
                componente: 'API:Rendimiento',
                accion: req.method,
                datos: {
                    url: req.url,
                    duration,
                    statusCode: res.statusCode,
                },
                usuarioId: req.user?.id,
            }, duration > 10000 // Notificar si es más de 10 segundos
            ).catch(error => {
                console.error(`❌ ResponseTimeMiddleware: Error manejando advertencia de tiempo de respuesta:`, error);
            });
        }
        return originalEnd.call(this, ...args);
    };
    next();
};
exports.responseTimeMiddleware = responseTimeMiddleware;
