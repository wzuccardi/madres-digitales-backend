"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasMinRole = exports.hasAnyRole = exports.hasRole = exports.requireSameMunicipio = exports.requireOwnData = exports.requireMadrina = exports.requireCoordinador = exports.requireAdmin = exports.requireSuperAdmin = exports.requireMinRole = exports.requireRole = exports.UsuarioRol = void 0;
const forbidden_error_1 = require("../core/domain/errors/forbidden.error");
const unauthorized_error_1 = require("../core/domain/errors/unauthorized.error");
const logger_1 = require("../config/logger");
/**
 * Roles disponibles en el sistema
 */
var UsuarioRol;
(function (UsuarioRol) {
    UsuarioRol["SUPER_ADMIN"] = "super_admin";
    UsuarioRol["ADMIN"] = "admin";
    UsuarioRol["COORDINADOR"] = "coordinador";
    UsuarioRol["MADRINA"] = "madrina";
    UsuarioRol["MEDICO"] = "medico";
    UsuarioRol["GESTANTE"] = "gestante";
})(UsuarioRol || (exports.UsuarioRol = UsuarioRol = {}));
/**
 * Jerarquía de roles (de mayor a menor privilegio)
 */
const ROLE_HIERARCHY = {
    [UsuarioRol.SUPER_ADMIN]: 5,
    [UsuarioRol.ADMIN]: 4,
    [UsuarioRol.COORDINADOR]: 3,
    [UsuarioRol.MADRINA]: 2,
    [UsuarioRol.MEDICO]: 1,
    [UsuarioRol.GESTANTE]: 0,
};
/**
 * Middleware para requerir uno o más roles específicos
 *
 * @param roles - Roles permitidos para acceder al endpoint
 * @returns Middleware function
 *
 * @example
 * router.post('/gestantes', requireRole(UsuarioRol.ADMIN, UsuarioRol.MADRINA), crearGestante);
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        try {
            // Verificar que el usuario esté autenticado
            if (!req.user) {
                throw new unauthorized_error_1.UnauthorizedError('Usuario no autenticado');
            }
            const userRole = req.user.rol;
            // Verificar que el rol del usuario esté en la lista de roles permitidos
            if (!roles.includes(userRole)) {
                logger_1.logger.warn('Acceso denegado por rol', {
                    userId: req.user.id,
                    userRole,
                    requiredRoles: roles,
                    endpoint: req.path,
                    method: req.method,
                });
                throw new forbidden_error_1.ForbiddenError(`Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`);
            }
            // Log de acceso exitoso
            logger_1.logger.info('Acceso autorizado', {
                userId: req.user.id,
                userRole,
                endpoint: req.path,
                method: req.method,
            });
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireRole = requireRole;
/**
 * Middleware para requerir un rol mínimo en la jerarquía
 *
 * @param minRole - Rol mínimo requerido
 * @returns Middleware function
 *
 * @example
 * router.get('/usuarios', requireMinRole(UsuarioRol.COORDINADOR), listarUsuarios);
 */
const requireMinRole = (minRole) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new unauthorized_error_1.UnauthorizedError('Usuario no autenticado');
            }
            const userRole = req.user.rol;
            const userLevel = ROLE_HIERARCHY[userRole];
            const minLevel = ROLE_HIERARCHY[minRole];
            if (userLevel < minLevel) {
                logger_1.logger.warn('Acceso denegado por nivel de rol insuficiente', {
                    userId: req.user.id,
                    userRole,
                    userLevel,
                    minRole,
                    minLevel,
                    endpoint: req.path,
                    method: req.method,
                });
                throw new forbidden_error_1.ForbiddenError(`Acceso denegado. Se requiere rol ${minRole} o superior`);
            }
            logger_1.logger.info('Acceso autorizado por nivel de rol', {
                userId: req.user.id,
                userRole,
                endpoint: req.path,
                method: req.method,
            });
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireMinRole = requireMinRole;
/**
 * Middleware para permitir solo super_admin
 *
 * @returns Middleware function
 *
 * @example
 * router.delete('/usuarios/:id', requireSuperAdmin(), eliminarUsuario);
 */
const requireSuperAdmin = () => {
    return (0, exports.requireRole)(UsuarioRol.SUPER_ADMIN);
};
exports.requireSuperAdmin = requireSuperAdmin;
/**
 * Middleware para permitir admin o super_admin
 *
 * @returns Middleware function
 *
 * @example
 * router.post('/usuarios', requireAdmin(), crearUsuario);
 */
const requireAdmin = () => {
    return (0, exports.requireRole)(UsuarioRol.ADMIN, UsuarioRol.SUPER_ADMIN);
};
exports.requireAdmin = requireAdmin;
/**
 * Middleware para permitir coordinador, admin o super_admin
 *
 * @returns Middleware function
 *
 * @example
 * router.get('/reportes', requireCoordinador(), obtenerReportes);
 */
const requireCoordinador = () => {
    return (0, exports.requireRole)(UsuarioRol.COORDINADOR, UsuarioRol.ADMIN, UsuarioRol.SUPER_ADMIN);
};
exports.requireCoordinador = requireCoordinador;
/**
 * Middleware para permitir madrina, coordinador, admin o super_admin
 *
 * @returns Middleware function
 *
 * @example
 * router.post('/gestantes', requireMadrina(), crearGestante);
 */
const requireMadrina = () => {
    return (0, exports.requireRole)(UsuarioRol.MADRINA, UsuarioRol.COORDINADOR, UsuarioRol.ADMIN, UsuarioRol.SUPER_ADMIN);
};
exports.requireMadrina = requireMadrina;
/**
 * Middleware para verificar que el usuario accede a sus propios datos
 *
 * @param userIdParam - Nombre del parámetro que contiene el ID del usuario
 * @returns Middleware function
 *
 * @example
 * router.get('/usuarios/:id', requireOwnData('id'), obtenerUsuario);
 */
const requireOwnData = (userIdParam = 'id') => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new unauthorized_error_1.UnauthorizedError('Usuario no autenticado');
            }
            const requestedUserId = req.params[userIdParam];
            const currentUserId = req.user.id;
            const userRole = req.user.rol;
            // Admins y super_admins pueden acceder a cualquier dato
            if (userRole === UsuarioRol.ADMIN ||
                userRole === UsuarioRol.SUPER_ADMIN) {
                return next();
            }
            // Otros usuarios solo pueden acceder a sus propios datos
            if (requestedUserId !== currentUserId) {
                logger_1.logger.warn('Intento de acceso a datos de otro usuario', {
                    userId: currentUserId,
                    requestedUserId,
                    endpoint: req.path,
                    method: req.method,
                });
                throw new forbidden_error_1.ForbiddenError('No tienes permiso para acceder a estos datos');
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireOwnData = requireOwnData;
/**
 * Middleware para verificar que el usuario pertenece al mismo municipio
 *
 * @param municipioIdParam - Nombre del parámetro que contiene el ID del municipio
 * @returns Middleware function
 *
 * @example
 * router.get('/gestantes/municipio/:municipioId', requireSameMunicipio('municipioId'), listarGestantes);
 */
const requireSameMunicipio = (municipioIdParam = 'municipioId') => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new unauthorized_error_1.UnauthorizedError('Usuario no autenticado');
            }
            const requestedMunicipioId = req.params[municipioIdParam];
            const userMunicipioId = req.user.municipioId;
            const userRole = req.user.rol;
            // Admins, super_admins y coordinadores pueden acceder a cualquier municipio
            if (userRole === UsuarioRol.ADMIN ||
                userRole === UsuarioRol.SUPER_ADMIN ||
                userRole === UsuarioRol.COORDINADOR) {
                return next();
            }
            // Otros usuarios solo pueden acceder a su propio municipio
            if (!userMunicipioId || requestedMunicipioId !== userMunicipioId) {
                logger_1.logger.warn('Intento de acceso a datos de otro municipio', {
                    userId: req.user.id,
                    userMunicipioId,
                    requestedMunicipioId,
                    endpoint: req.path,
                    method: req.method,
                });
                throw new forbidden_error_1.ForbiddenError('No tienes permiso para acceder a datos de este municipio');
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireSameMunicipio = requireSameMunicipio;
/**
 * Helper para verificar si un usuario tiene un rol específico
 *
 * @param user - Usuario a verificar
 * @param role - Rol a verificar
 * @returns true si el usuario tiene el rol
 */
const hasRole = (user, role) => {
    return user?.rol === role;
};
exports.hasRole = hasRole;
/**
 * Helper para verificar si un usuario tiene uno de varios roles
 *
 * @param user - Usuario a verificar
 * @param roles - Roles a verificar
 * @returns true si el usuario tiene alguno de los roles
 */
const hasAnyRole = (user, roles) => {
    return roles.includes(user?.rol);
};
exports.hasAnyRole = hasAnyRole;
/**
 * Helper para verificar si un usuario tiene un rol mínimo
 *
 * @param user - Usuario a verificar
 * @param minRole - Rol mínimo requerido
 * @returns true si el usuario tiene el rol mínimo o superior
 */
const hasMinRole = (user, minRole) => {
    const userLevel = ROLE_HIERARCHY[user?.rol];
    const minLevel = ROLE_HIERARCHY[minRole];
    return userLevel >= minLevel;
};
exports.hasMinRole = hasMinRole;
