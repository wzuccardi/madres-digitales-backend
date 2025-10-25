"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../config/logger");
const prisma = new client_1.PrismaClient();
class PermissionService {
    constructor() {
        console.log('🔐 PermissionService initialized');
    }
    /**
     * Obtiene los permisos de un usuario basado en su rol y municipio
     */
    async getUserPermissions(userId) {
        try {
            console.log(`🔍 Obteniendo permisos para usuario: ${userId}`);
            const usuario = await prisma.usuario.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    rol: true,
                    municipio_id: true,
                    gestantesAsignadas: {
                        select: { id: true },
                        where: { activa: true }
                    }
                }
            });
            if (!usuario) {
                throw new Error(`Usuario ${userId} no encontrado`);
            }
            const assignedGestanteIds = usuario.gestantesAsignadas.map(g => g.id);
            let permissions;
            switch (usuario.rol) {
                case 'administrador':
                case 'super_admin':
                case 'admin':
                    permissions = {
                        canViewAllGestantes: true,
                        canViewAllAlertas: true,
                        assignedGestanteIds: [],
                        municipioId: undefined,
                        role: 'administrador'
                    };
                    break;
                case 'coordinador':
                    permissions = {
                        canViewAllGestantes: false,
                        canViewAllAlertas: false,
                        assignedGestanteIds: [],
                        municipioId: usuario.municipio_id || undefined,
                        role: 'coordinador'
                    };
                    break;
                case 'madrina':
                    permissions = {
                        canViewAllGestantes: false,
                        canViewAllAlertas: false,
                        assignedGestanteIds: assignedGestanteIds,
                        municipioId: usuario.municipio_id || undefined,
                        role: 'madrina'
                    };
                    break;
                case 'medico':
                    permissions = {
                        canViewAllGestantes: false,
                        canViewAllAlertas: false,
                        assignedGestanteIds: assignedGestanteIds,
                        municipioId: usuario.municipio_id || undefined,
                        role: 'medico'
                    };
                    break;
                default:
                    // Agregar logging para depurar roles no reconocidos
                    console.log(`⚠️ Rol no reconocido en PermissionService: ${usuario.rol}`);
                    console.log(`⚠️ Roles válidos son: administrador, super_admin, admin, coordinador, madrina, medico`);
                    // Para roles no reconocidos, asignar permisos mínimos en lugar de lanzar error
                    permissions = {
                        canViewAllGestantes: false,
                        canViewAllAlertas: false,
                        assignedGestanteIds: [],
                        municipioId: usuario.municipio_id || undefined,
                        role: 'desconocido'
                    };
                    break;
            }
            console.log(`✅ Permisos obtenidos para ${usuario.rol}:`, permissions);
            return permissions;
        }
        catch (error) {
            console.error('❌ Error obteniendo permisos de usuario:', error);
            logger_1.log.error('Error obteniendo permisos de usuario', { error: error.message, userId });
            throw error;
        }
    }
    /**
     * Filtra gestantes según los permisos del usuario
     */
    async filterGestantesByPermission(userId) {
        try {
            console.log(`🔍 Filtrando gestantes por permisos para usuario: ${userId}`);
            const permissions = await this.getUserPermissions(userId);
            let whereClause = { activa: true };
            if (permissions.role === 'administrador') {
                // Administradores ven todas las gestantes
                whereClause = { activa: true };
            }
            else if (permissions.role === 'coordinador') {
                // Coordinadores ven gestantes de su municipio
                if (permissions.municipioId) {
                    whereClause = {
                        activa: true,
                        municipio_id: permissions.municipioId
                    };
                }
                else {
                    // Si coordinador no tiene municipio asignado, no ve ninguna gestante
                    return [];
                }
            }
            else if (permissions.role === 'madrina') {
                // Madrinas ven solo sus gestantes asignadas
                if (permissions.assignedGestanteIds.length > 0) {
                    whereClause = {
                        activa: true,
                        id: { in: permissions.assignedGestanteIds }
                    };
                }
                else {
                    // Si madrina no tiene gestantes asignadas, no ve ninguna
                    return [];
                }
            }
            else {
                // Otros roles (médico) ven sus gestantes asignadas
                if (permissions.assignedGestanteIds.length > 0) {
                    whereClause = {
                        activa: true,
                        id: { in: permissions.assignedGestanteIds }
                    };
                }
                else {
                    return [];
                }
            }
            const gestantes = await prisma.gestante.findMany({
                where: whereClause,
                include: {
                    municipio: {
                        select: { id: true, nombre: true }
                    },
                    madrina: {
                        select: { id: true, nombre: true }
                    }
                },
                orderBy: { nombre: 'asc' }
            });
            console.log(`✅ ${gestantes.length} gestantes filtradas para ${permissions.role}`);
            return gestantes;
        }
        catch (error) {
            console.error('❌ Error filtrando gestantes:', error);
            logger_1.log.error('Error filtrando gestantes por permisos', { error: error.message, userId });
            throw error;
        }
    }
    /**
     * Filtra alertas según los permisos del usuario
     */
    async filterAlertasByPermission(userId) {
        try {
            console.log(`🔍 Filtrando alertas por permisos para usuario: ${userId}`);
            const permissions = await this.getUserPermissions(userId);
            let whereClause = {};
            if (permissions.role === 'administrador') {
                // Administradores ven todas las alertas
                whereClause = {};
            }
            else if (permissions.role === 'coordinador') {
                // Coordinadores ven alertas de gestantes de su municipio
                if (permissions.municipioId) {
                    whereClause = {
                        gestante: {
                            municipio_id: permissions.municipioId,
                            activa: true
                        }
                    };
                }
                else {
                    return [];
                }
            }
            else if (permissions.role === 'madrina') {
                // Madrinas ven alertas de sus gestantes asignadas
                if (permissions.assignedGestanteIds.length > 0) {
                    whereClause = {
                        gestante_id: { in: permissions.assignedGestanteIds },
                        gestante: { activa: true }
                    };
                }
                else {
                    return [];
                }
            }
            else {
                // Otros roles ven alertas de sus gestantes asignadas
                if (permissions.assignedGestanteIds.length > 0) {
                    whereClause = {
                        gestante_id: { in: permissions.assignedGestanteIds },
                        gestante: { activa: true }
                    };
                }
                else {
                    return [];
                }
            }
            const alertas = await prisma.alerta.findMany({
                where: whereClause,
                include: {
                    gestante: {
                        select: {
                            id: true,
                            nombre: true,
                            municipio: {
                                select: { id: true, nombre: true }
                            }
                        }
                    },
                    madrina: {
                        select: { id: true, nombre: true }
                    }
                },
                orderBy: [
                    { nivel_prioridad: 'desc' },
                    { fecha_creacion: 'desc' }
                ]
            });
            console.log(`✅ ${alertas.length} alertas filtradas para ${permissions.role}`);
            return alertas;
        }
        catch (error) {
            console.error('❌ Error filtrando alertas:', error);
            logger_1.log.error('Error filtrando alertas por permisos', { error: error.message, userId });
            throw error;
        }
    }
    /**
     * Verifica si un usuario puede acceder a una gestante específica
     */
    async canAccessGestante(userId, gestanteId) {
        try {
            console.log(`🔍 Verificando acceso a gestante ${gestanteId} para usuario ${userId}`);
            const permissions = await this.getUserPermissions(userId);
            // Administradores pueden acceder a cualquier gestante
            if (permissions.role === 'administrador') {
                return true;
            }
            // Obtener información de la gestante
            const gestante = await prisma.gestante.findUnique({
                where: { id: gestanteId },
                select: {
                    id: true,
                    municipio_id: true,
                    madrina_id: true,
                    activa: true
                }
            });
            if (!gestante || !gestante.activa) {
                return false;
            }
            // Coordinadores pueden acceder a gestantes de su municipio
            if (permissions.role === 'coordinador') {
                return permissions.municipioId === gestante.municipio_id;
            }
            // Madrinas pueden acceder solo a sus gestantes asignadas
            if (permissions.role === 'madrina') {
                return permissions.assignedGestanteIds.includes(gestanteId);
            }
            // Otros roles pueden acceder a sus gestantes asignadas
            return permissions.assignedGestanteIds.includes(gestanteId);
        }
        catch (error) {
            console.error('❌ Error verificando acceso a gestante:', error);
            logger_1.log.error('Error verificando acceso a gestante', { error: error.message, userId, gestanteId });
            return false;
        }
    }
    /**
     * Verifica si un usuario puede crear una alerta para una gestante específica
     */
    async canCreateAlertaForGestante(userId, gestanteId) {
        // Para crear alertas, se aplican las mismas reglas que para acceder a gestantes
        return this.canAccessGestante(userId, gestanteId);
    }
    /**
     * Obtiene gestantes por permisos de municipio (específico para coordinadores)
     */
    async getGestantesByMunicipioPermission(userId) {
        try {
            console.log(`🔍 Obteniendo gestantes por municipio para usuario: ${userId}`);
            const permissions = await this.getUserPermissions(userId);
            if (permissions.role === 'administrador') {
                // Administradores ven todas las gestantes
                return this.filterGestantesByPermission(userId);
            }
            if (permissions.role === 'coordinador' && permissions.municipioId) {
                const gestantes = await prisma.gestante.findMany({
                    where: {
                        activa: true,
                        municipio_id: permissions.municipioId
                    },
                    include: {
                        municipio: {
                            select: { id: true, nombre: true }
                        },
                        madrina: {
                            select: { id: true, nombre: true }
                        }
                    },
                    orderBy: { nombre: 'asc' }
                });
                console.log(`✅ ${gestantes.length} gestantes del municipio obtenidas`);
                return gestantes;
            }
            // Para otros roles, usar el filtrado estándar
            return this.filterGestantesByPermission(userId);
        }
        catch (error) {
            console.error('❌ Error obteniendo gestantes por municipio:', error);
            logger_1.log.error('Error obteniendo gestantes por municipio', { error: error.message, userId });
            throw error;
        }
    }
    /**
     * Obtiene filtro WHERE para alertas basado en permisos
     */
    async getAlertasWhereFilter(userId) {
        try {
            console.log(`🔍 Obteniendo filtro WHERE para alertas del usuario: ${userId}`);
            const permissions = await this.getUserPermissions(userId);
            let whereFilter = {};
            if (permissions.role === 'administrador') {
                // Administradores ven todas las alertas
                whereFilter = {};
            }
            else if (permissions.role === 'coordinador') {
                // Coordinadores ven alertas de gestantes de su municipio
                if (permissions.municipioId) {
                    whereFilter = {
                        gestante: {
                            municipio_id: permissions.municipioId,
                            activa: true
                        }
                    };
                }
                else {
                    // Si no tiene municipio, no ve alertas
                    whereFilter = { id: 'no-access' };
                }
            }
            else if (permissions.role === 'madrina') {
                // Madrinas ven alertas de sus gestantes asignadas
                if (permissions.assignedGestanteIds.length > 0) {
                    whereFilter = {
                        gestante_id: { in: permissions.assignedGestanteIds },
                        gestante: { activa: true }
                    };
                }
                else {
                    whereFilter = { id: 'no-access' };
                }
            }
            else {
                // Otros roles ven alertas de sus gestantes asignadas
                if (permissions.assignedGestanteIds.length > 0) {
                    whereFilter = {
                        gestante_id: { in: permissions.assignedGestanteIds },
                        gestante: { activa: true }
                    };
                }
                else {
                    whereFilter = { id: 'no-access' };
                }
            }
            console.log(`✅ Filtro WHERE generado para ${permissions.role}`);
            return whereFilter;
        }
        catch (error) {
            console.error('❌ Error generando filtro WHERE para alertas:', error);
            logger_1.log.error('Error generando filtro WHERE para alertas', { error: error.message, userId });
            throw error;
        }
    }
    /**
     * Verifica si un usuario puede acceder a un municipio específico
     */
    async canAccessMunicipio(userId, municipioId) {
        try {
            const permissions = await this.getUserPermissions(userId);
            // Administradores pueden acceder a cualquier municipio
            if (permissions.role === 'administrador') {
                return true;
            }
            // Coordinadores solo pueden acceder a su municipio asignado
            if (permissions.role === 'coordinador') {
                return permissions.municipioId === municipioId;
            }
            // Madrinas pueden acceder a su municipio
            if (permissions.role === 'madrina') {
                return permissions.municipioId === municipioId;
            }
            return false;
        }
        catch (error) {
            console.error('❌ Error verificando acceso a municipio:', error);
            return false;
        }
    }
}
exports.PermissionService = PermissionService;
