"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCoordinatorOrAdmin = exports.requireAdmin = exports.validateMunicipioAccess = exports.validateGestanteAccess = void 0;
const permission_service_1 = require("../services/permission.service");
const logger_1 = require("../config/logger");
const permissionService = new permission_service_1.PermissionService();
/**
 * Middleware para verificar permisos de acceso a gestantes
 */
const validateGestanteAccess = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const gestanteId = req.params.gestanteId || req.body.gestante_id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        if (!gestanteId) {
            return res.status(400).json({
                success: false,
                error: 'ID de gestante requerido'
            });
        }
        const canAccess = await permissionService.canAccessGestante(userId, gestanteId);
        if (!canAccess) {
            logger_1.log.warn('Acceso denegado a gestante', { userId, gestanteId });
            return res.status(403).json({
                success: false,
                error: 'No tiene permisos para acceder a esta gestante'
            });
        }
        next();
    }
    catch (error) {
        console.error('❌ Error en middleware de permisos de gestante:', error);
        logger_1.log.error('Error en middleware de permisos de gestante', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.validateGestanteAccess = validateGestanteAccess;
/**
 * Middleware para verificar permisos de acceso a municipios (para coordinadores)
 */
const validateMunicipioAccess = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const municipioId = req.params.municipioId || req.body.municipio_id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        if (!municipioId) {
            return res.status(400).json({
                success: false,
                error: 'ID de municipio requerido'
            });
        }
        const canAccess = await permissionService.canAccessMunicipio(userId, municipioId);
        if (!canAccess) {
            logger_1.log.warn('Acceso denegado a municipio', { userId, municipioId });
            return res.status(403).json({
                success: false,
                error: 'No tiene permisos para acceder a este municipio'
            });
        }
        next();
    }
    catch (error) {
        console.error('❌ Error en middleware de permisos de municipio:', error);
        logger_1.log.error('Error en middleware de permisos de municipio', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.validateMunicipioAccess = validateMunicipioAccess;
/**
 * Middleware para verificar que el usuario es administrador
 */
const requireAdmin = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        const permissions = await permissionService.getUserPermissions(userId);
        if (permissions.role !== 'administrador') {
            logger_1.log.warn('Acceso denegado - se requiere rol de administrador', { userId, role: permissions.role });
            return res.status(403).json({
                success: false,
                error: 'Se requieren permisos de administrador'
            });
        }
        next();
    }
    catch (error) {
        console.error('❌ Error en middleware de administrador:', error);
        logger_1.log.error('Error en middleware de administrador', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.requireAdmin = requireAdmin;
/**
 * Middleware para verificar que el usuario es coordinador o administrador
 */
const requireCoordinatorOrAdmin = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        const permissions = await permissionService.getUserPermissions(userId);
        if (permissions.role !== 'coordinador' && permissions.role !== 'administrador') {
            logger_1.log.warn('Acceso denegado - se requiere rol de coordinador o administrador', {
                userId,
                role: permissions.role
            });
            return res.status(403).json({
                success: false,
                error: 'Se requieren permisos de coordinador o administrador'
            });
        }
        next();
    }
    catch (error) {
        console.error('❌ Error en middleware de coordinador/administrador:', error);
        logger_1.log.error('Error en middleware de coordinador/administrador', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.requireCoordinatorOrAdmin = requireCoordinatorOrAdmin;
