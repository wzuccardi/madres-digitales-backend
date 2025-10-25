"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserFromToken = getUserFromToken;
exports.getUserForFiltering = getUserForFiltering;
exports.hasAdminAccess = hasAdminAccess;
exports.canViewAllData = canViewAllData;
exports.optionalAuth = optionalAuth;
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
/**
 * Extrae información del usuario desde el token JWT
 * @param req Request object
 * @returns Información del usuario o null si no hay token válido
 */
async function getUserFromToken(req) {
    try {
        // Obtener token del header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        const token = authHeader.substring(7); // Remover 'Bearer '
        // Verificar y decodificar el token
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Obtener información actualizada del usuario desde la base de datos
        const user = await database_1.default.usuario.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                rol: true,
                activo: true,
            },
        });
        if (!user || !user.activo) {
            return null;
        }
        return {
            id: user.id,
            rol: user.rol,
        };
    }
    catch (error) {
        console.error('❌ Error extracting user from token:', error);
        return null;
    }
}
/**
 * Obtiene información del usuario para filtrado de datos
 * Si no hay token válido, usa valores por defecto para testing
 * @param req Request object
 * @returns Información del usuario con fallback para testing
 */
async function getUserForFiltering(req) {
    // Intentar obtener usuario del token
    const userFromToken = await getUserFromToken(req);
    if (userFromToken) {
        return userFromToken;
    }
    // Fallback para testing - usar admin por defecto
    console.log('⚠️ No valid token found, using default admin user for testing');
    return {
        id: 'c66fdb18-76f4-4767-95ad-9b4b81fa6add', // Usuario admin por defecto
        rol: 'admin',
    };
}
/**
 * Verifica si el usuario tiene permisos de administrador o coordinador
 * @param rol Rol del usuario
 * @returns true si tiene permisos administrativos
 */
function hasAdminAccess(rol) {
    return rol === 'admin' || rol === 'coordinador' || rol === 'super_admin' || rol === 'administrador';
}
/**
 * Verifica si el usuario puede ver todos los datos o solo los filtrados
 * @param rol Rol del usuario
 * @returns true si puede ver todos los datos
 */
function canViewAllData(rol) {
    return hasAdminAccess(rol);
}
/**
 * Middleware para autenticación JWT (opcional)
 * No bloquea la request si no hay token, solo agrega información del usuario si está disponible
 */
async function optionalAuth(req, res, next) {
    try {
        const userInfo = await getUserFromToken(req);
        if (userInfo) {
            // Obtener información completa del usuario
            const user = await database_1.default.usuario.findUnique({
                where: { id: userInfo.id },
                select: {
                    id: true,
                    email: true,
                    rol: true,
                },
            });
            if (user) {
                req.user = user;
            }
        }
        next();
    }
    catch (error) {
        console.error('❌ Error in optional auth middleware:', error);
        next(); // Continuar sin autenticación
    }
}
/**
 * Middleware para autenticación JWT requerida
 * Bloquea la request si no hay token válido
 */
async function requireAuth(req, res, next) {
    try {
        const userInfo = await getUserFromToken(req);
        if (!userInfo) {
            return res.status(401).json({ error: 'Token de autenticación requerido' });
        }
        // Obtener información completa del usuario
        const user = await database_1.default.usuario.findUnique({
            where: { id: userInfo.id },
            select: {
                id: true,
                email: true,
                rol: true,
            },
        });
        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('❌ Error in required auth middleware:', error);
        return res.status(401).json({ error: 'Token inválido' });
    }
}
/**
 * Middleware para verificar roles específicos
 * @param allowedRoles Array de roles permitidos
 */
function requireRole(allowedRoles) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Autenticación requerida' });
        }
        if (!allowedRoles.includes(req.user.rol)) {
            return res.status(403).json({ error: 'Permisos insuficientes' });
        }
        next();
    };
}
