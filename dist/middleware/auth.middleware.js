"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitRefresh = exports.validateRefreshToken = exports.checkTokenExpiration = exports.requireMadrinaDeGestante = exports.requireRole = exports.authMiddleware = void 0;
const token_service_1 = require("../services/token.service");
const client_1 = require("@prisma/client");
const logger_1 = require("../config/logger");
const base_error_1 = require("../core/domain/errors/base.error");
// NUEVO: Instancia de PrismaClient
const prisma = new client_1.PrismaClient();
/**
 * Middleware de autenticación
 */
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger_1.log.security('Missing or invalid authorization header', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path,
                method: req.method,
            });
            throw new base_error_1.UnauthorizedError('Token de autenticación requerido');
        }
        const token = authHeader.substring(7); // Remover 'Bearer '
        // Verificar el token
        const payload = token_service_1.tokenService.verifyAccessToken(token);
        // Obtener datos actualizados del usuario
        const user = await prisma.usuario.findUnique({
            where: { id: payload.id },
            select: {
                id: true,
                email: true,
                rol: true,
                activo: true,
                ultimo_acceso: true,
            },
        });
        if (!user || !user.activo) {
            logger_1.log.security('Usuario no encontrado o inactivo', {
                userId: payload.id,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path,
                method: req.method,
            });
            throw new base_error_1.UnauthorizedError('Usuario no autorizado');
        }
        // NUEVO: Actualizar último acceso de forma asíncrona (no bloquear)
        updateLastAccess(user.id).catch(error => {
            logger_1.log.error('Error actualizando último acceso', { userId: user.id, error: error.message });
        });
        // Agregar información del usuario a la request
        req.user = {
            id: user.id,
            email: user.email,
            rol: user.rol,
        };
        logger_1.log.debug('Usuario autenticado', {
            userId: user.id,
            email: user.email,
            rol: user.rol,
            ip: req.ip,
            path: req.path,
            method: req.method,
        });
        next();
    }
    catch (error) {
        logger_1.log.security('Error en autenticación', {
            error: error.message,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method,
        });
        if (error instanceof base_error_1.UnauthorizedError) {
            return res.status(401).json({
                success: false,
                error: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            error: 'Error de autenticación',
        });
    }
};
exports.authMiddleware = authMiddleware;
/**
 * NUEVO: Función auxiliar para actualizar último acceso de forma asíncrona
 */
async function updateLastAccess(userId) {
    try {
        await prisma.usuario.update({
            where: { id: userId },
            data: { ultimo_acceso: new Date() },
        });
    }
    catch (error) {
        // Error ya manejado en el llamador
        throw error;
    }
}
/**
 * Middleware opcional para verificar roles específicos
 */
const requireRole = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado',
            });
        }
        const { rol } = req.user;
        if (!rolesPermitidos.includes(rol)) {
            logger_1.log.security('Acceso denegado - rol no permitido', {
                userId: req.user.id,
                rol,
                rolesPermitidos,
                ip: req.ip,
                path: req.path,
                method: req.method,
            });
            return res.status(403).json({
                success: false,
                error: 'Acceso denegado',
            });
        }
        logger_1.log.debug('Acceso permitido - rol verificado', {
            userId: req.user.id,
            rol,
            ip: req.ip,
            path: req.path,
            method: req.method,
        });
        next();
    };
};
exports.requireRole = requireRole;
/**
 * Middleware para verificar si el usuario es madrina de una gestante específica
 */
const requireMadrinaDeGestante = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado',
            });
        }
        const { id: userId, rol } = req.user;
        const { gestanteId } = req.params;
        // Si es admin o coordinador, permitir acceso
        if (['admin', 'super_admin', 'coordinador'].includes(rol)) {
            return next();
        }
        // Verificar si es la madrina asignada
        const gestante = await prisma.gestante.findUnique({
            where: { id: gestanteId },
            select: { madrina_id: true },
        });
        if (!gestante || gestante.madrina_id !== userId) {
            logger_1.log.security('Acceso denegado - no es madrina de la gestante', {
                userId,
                rol,
                gestanteId,
                madrinaAsignada: gestante?.madrina_id,
                ip: req.ip,
                path: req.path,
                method: req.method,
            });
            return res.status(403).json({
                success: false,
                error: 'No tienes permiso para acceder a esta gestante',
            });
        }
        logger_1.log.debug('Acceso permitido - madrina verificada', {
            userId,
            rol,
            gestanteId,
            ip: req.ip,
            path: req.path,
            method: req.method,
        });
        next();
    }
    catch (error) {
        logger_1.log.error('Error en verificación de madrina', {
            error: error.message,
            userId: req.user?.id,
            gestanteId: req.params.gestanteId,
            ip: req.ip,
            path: req.path,
            method: req.method,
        });
        return res.status(500).json({
            success: false,
            error: 'Error verificando permisos',
        });
    }
};
exports.requireMadrinaDeGestante = requireMadrinaDeGestante;
/**
 * NUEVO: Middleware para verificar si el token está próximo a expirar
 */
const checkTokenExpiration = (thresholdMinutes = 15) => {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return next(); // Si no hay token, continuar
            }
            const token = authHeader.substring(7);
            // Verificar si el token está próximo a expirar
            const isExpiringSoon = token_service_1.tokenService.isTokenExpiringSoon(token, thresholdMinutes);
            if (isExpiringSoon) {
                // Agregar header para que el cliente sepa que debe refrescar
                res.setHeader('X-Token-Expiring-Soon', 'true');
                res.setHeader('X-Token-Refresh-Threshold', `${thresholdMinutes} minutes`);
            }
            next();
        }
        catch (error) {
            logger_1.log.error('Error verificando expiración del token', {
                error: error.message,
                ip: req.ip,
                path: req.path,
            });
            next(); // Continuar aunque haya error
        }
    };
};
exports.checkTokenExpiration = checkTokenExpiration;
/**
 * NUEVO: Middleware para validar tokens de refresh
 */
const validateRefreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token es requerido',
            });
        }
        // Verificar el refresh token
        const payload = token_service_1.tokenService.verifyRefreshToken(refreshToken);
        // Validar que el refresh token coincida con el almacenado
        const isValid = await token_service_1.tokenService.validateRefreshToken(payload.id, refreshToken);
        if (!isValid) {
            logger_1.log.security('Refresh token inválido o expirado', { userId: payload.id });
            return res.status(401).json({
                success: false,
                error: 'Refresh token inválido o expirado',
            });
        }
        // Obtener datos actualizados del usuario
        const user = await prisma.usuario.findUnique({
            where: { id: payload.id },
            select: {
                id: true,
                email: true,
                rol: true,
                activo: true,
            },
        });
        if (!user || !user.activo) {
            logger_1.log.security('Usuario no encontrado o inactivo', { userId: payload.id });
            return res.status(401).json({
                success: false,
                error: 'Usuario no autorizado',
            });
        }
        // Agregar información del usuario a la request
        req.user = {
            id: user.id,
            email: user.email,
            rol: user.rol,
        };
        logger_1.log.debug('Refresh token validado', {
            userId: user.id,
            email: user.email,
            rol: user.rol,
            ip: req.ip,
        });
        next();
    }
    catch (error) {
        logger_1.log.security('Error validando refresh token', {
            error: error.message,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
        });
        if (error instanceof base_error_1.UnauthorizedError) {
            return res.status(401).json({
                success: false,
                error: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            error: 'Error validando refresh token',
        });
    }
};
exports.validateRefreshToken = validateRefreshToken;
/**
 * NUEVO: Middleware para limitar solicitudes de refresh
 */
exports.rateLimitRefresh = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // Máximo 20 refresh por ventana
    message: {
        success: false,
        error: 'Demasiados intentos de refresh. Por favor, espere 15 minutos.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Usar el ID del usuario si está disponible
        return req.user?.id || req.ip;
    },
});
// Importar rate limit
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
