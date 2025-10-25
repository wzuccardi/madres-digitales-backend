"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCriticalRateLimitMiddleware = exports.createApiRateLimitMiddleware = exports.createAuthRateLimitMiddleware = exports.createRateLimitMiddleware = exports.RateLimitingMiddleware = void 0;
const logger_1 = require("../config/logger");
/**
 * Opciones de Rate Limiting por defecto
 */
const defaultConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100, // 100 solicitudes por ventana
    message: 'Too many requests, please try again later.',
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
};
/**
 * Middleware de Rate Limiting con Redis
 */
class RateLimitingMiddleware {
    constructor(config = {}) {
        this.clients = new Map();
        this.config = { ...defaultConfig, ...config };
    }
    /**
     * NUEVO: Middleware principal de Rate Limiting
     */
    middleware() {
        return async (req, res, next) => {
            try {
                // NUEVO: Generar clave para el cliente
                const key = this._generateKey(req);
                // NUEVO: Obtener información del cliente
                const clientInfo = await this._getClientInfo(key);
                // NUEVO: Verificar si se debe saltar la solicitud
                if (this._shouldSkipRequest(req, clientInfo)) {
                    return next();
                }
                // NUEVO: Verificar límite de tasa
                const isAllowed = await this._checkRateLimit(key, clientInfo);
                if (!isAllowed) {
                    // NUEVO: Registrar intento de Rate Limiting
                    logger_1.log.warn('Rate limit excedido', {
                        key,
                        ip: req.ip,
                        userAgent: req.get('User-Agent'),
                        path: req.path,
                        method: req.method,
                    });
                    // NUEVO: Enviar respuesta de Rate Limiting
                    return this._sendRateLimitResponse(res, clientInfo);
                }
                // NUEVO: Actualizar información del cliente
                await this._updateClientInfo(key, clientInfo);
                // NUEVO: Continuar con la siguiente función middleware
                next();
            }
            catch (error) {
                // NUEVO: En caso de error, permitir la solicitud pero registrar el error
                logger_1.log.error('Error en middleware de Rate Limiting', {
                    error: error.message,
                    ip: req.ip,
                    path: req.path,
                    method: req.method,
                });
                next();
            }
        };
    }
    /**
     * NUEVO: Generar clave para el cliente
     */
    _generateKey(req) {
        // Usar generador personalizado si está configurado
        if (this.config.keyGenerator) {
            return this.config.keyGenerator(req);
        }
        // NUEVO: Generar clave basada en IP y User-Agent
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        const key = `rate_limit:${ip}:${this._hashString(userAgent)}`;
        return key;
    }
    /**
     * NUEVO: Obtener información del cliente desde Redis
     */
    _getClientInfo(key) {
        const now = Date.now();
        const clientData = this.clients.get(key);
        if (!clientData || now > clientData.resetTime) {
            // Nuevo cliente o ventana expirada
            const newClientData = {
                count: 0,
                resetTime: now + this.config.windowMs,
                firstRequest: now,
                lastRequest: now,
            };
            this.clients.set(key, newClientData);
            return newClientData;
        }
        return clientData;
    }
    /**
     * NUEVO: Verificar si se debe saltar la solicitud
     */
    _shouldSkipRequest(req, clientInfo) {
        const now = Date.now();
        // NUEVO: Verificar si la ventana de tiempo ha expirado
        if (now > clientInfo.resetTime) {
            return false; // No saltar, se reiniciará el contador
        }
        // NUEVO: Verificar si se deben saltar solicitudes exitosas
        if (this.config.skipSuccessfulRequests && req.statusCode && req.statusCode < 400) {
            return true;
        }
        // NUEVO: Verificar si se deben saltar solicitudes fallidas
        if (this.config.skipFailedRequests && req.statusCode && req.statusCode >= 400) {
            return true;
        }
        return false;
    }
    /**
     * NUEVO: Verificar límite de tasa
     */
    _checkRateLimit(key, clientInfo) {
        const now = Date.now();
        // Verificar si la ventana de tiempo ha expirado
        if (now > clientInfo.resetTime) {
            // Reiniciar contador
            clientInfo.count = 1;
            clientInfo.resetTime = now + this.config.windowMs;
            clientInfo.lastRequest = now;
            this.clients.set(key, clientInfo);
            return true;
        }
        // Verificar si se ha excedido el límite
        if (clientInfo.count >= this.config.maxRequests) {
            return false;
        }
        // Incrementar contador
        clientInfo.count++;
        clientInfo.lastRequest = now;
        this.clients.set(key, clientInfo);
        return true;
    }
    /**
     * NUEVO: Actualizar información del cliente
     */
    _updateClientInfo(key, clientInfo) {
        // Actualizar información del cliente en el mapa
        this.clients.set(key, clientInfo);
    }
    /**
     * NUEVO: Enviar respuesta de Rate Limiting
     */
    _sendRateLimitResponse(res, clientInfo) {
        const now = Date.now();
        const resetTime = Math.max(0, Math.ceil((clientInfo.resetTime - now) / 1000));
        res.status(429).json({
            success: false,
            error: this.config.message || 'Too many requests',
            retryAfter: resetTime,
            timestamp: new Date().toISOString(),
        });
        // NUEVO: Establecer headers de Rate Limiting
        res.set({
            'X-RateLimit-Limit': this.config.maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, this.config.maxRequests - clientInfo.count).toString(),
            'X-RateLimit-Reset': new Date(clientInfo.resetTime).toISOString(),
            'Retry-After': resetTime.toString(),
        });
    }
    /**
     * NUEVO: Función para hash de strings
     */
    _hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a entero de 32 bits
        }
        return Math.abs(hash).toString(16);
    }
    /**
     * NUEVO: Limpiar claves expiradas
     */
    cleanupExpiredKeys() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [key, clientData] of this.clients.entries()) {
            if (now > clientData.resetTime) {
                this.clients.delete(key);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            logger_1.log.info('Claves expiradas limpiadas', {
                cleanedCount,
                totalKeys: this.clients.size,
            });
        }
    }
    /**
     * NUEVO: Obtener estadísticas de Rate Limiting
     */
    getStats() {
        let totalClients = 0;
        let totalRequests = 0;
        let activeClients = 0;
        const now = Date.now();
        for (const [key, clientData] of this.clients.entries()) {
            totalClients++;
            totalRequests += clientData.count || 0;
            // Verificar si el cliente está activo (última solicitud hace menos de 5 minutos)
            if (now - clientData.lastRequest < 5 * 60 * 1000) {
                activeClients++;
            }
        }
        return {
            totalClients,
            totalRequests,
            activeClients,
            windowMs: this.config.windowMs,
            maxRequests: this.config.maxRequests,
        };
    }
    /**
     * NUEVO: Cerrar conexión Redis
     */
    disconnect() {
        this.clients.clear();
        logger_1.log.info('Conexión Rate Limiting cerrada');
    }
}
exports.RateLimitingMiddleware = RateLimitingMiddleware;
/**
 * NUEVO: Factoría para crear middleware de Rate Limiting con configuración personalizada
 */
const createRateLimitMiddleware = (config = {}) => {
    const rateLimiting = new RateLimitingMiddleware(config);
    // NUEVO: Programar limpieza periódica de claves expiradas
    setInterval(() => {
        rateLimiting.cleanupExpiredKeys();
    }, 10 * 60 * 1000); // Cada 10 minutos
    return rateLimiting.middleware();
};
exports.createRateLimitMiddleware = createRateLimitMiddleware;
/**
 * NUEVO: Middleware de Rate Limiting para endpoints de autenticación
 */
const createAuthRateLimitMiddleware = () => {
    return (0, exports.createRateLimitMiddleware)({
        windowMs: 15 * 60 * 1000, // 15 minutos
        maxRequests: 5, // 5 intentos de login
        message: 'Too many login attempts, please try again later.',
        keyGenerator: (req) => {
            const ip = req.ip || req.connection.remoteAddress || 'unknown';
            return `auth_rate_limit:${ip}`;
        },
    });
};
exports.createAuthRateLimitMiddleware = createAuthRateLimitMiddleware;
/**
 * NUEVO: Middleware de Rate Limiting para endpoints de API generales
 */
const createApiRateLimitMiddleware = () => {
    return (0, exports.createRateLimitMiddleware)({
        windowMs: 15 * 60 * 1000, // 15 minutos
        maxRequests: 1000, // 1000 solicitudes
        message: 'API rate limit exceeded, please try again later.',
    });
};
exports.createApiRateLimitMiddleware = createApiRateLimitMiddleware;
/**
 * NUEVO: Middleware de Rate Limiting para endpoints críticos
 */
const createCriticalRateLimitMiddleware = () => {
    return (0, exports.createRateLimitMiddleware)({
        windowMs: 60 * 1000, // 1 minuto
        maxRequests: 10, // 10 solicitudes
        message: 'Critical endpoint rate limit exceeded, please try again later.',
    });
};
exports.createCriticalRateLimitMiddleware = createCriticalRateLimitMiddleware;
