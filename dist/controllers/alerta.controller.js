"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGestantesDisponibles = exports.getEstadisticasAlertas = exports.notificarEmergencia = exports.getAlertasActivas = exports.getAlertasByGestante = exports.resolverAlerta = exports.deleteAlerta = exports.updateAlerta = exports.createAlerta = exports.getAlertaById = exports.getAllAlertas = exports.getAlertasByUser = void 0;
const alerta_service_1 = require("../services/alerta.service");
const logger_1 = require("../config/logger");
const alertaService = new alerta_service_1.AlertaService();
/**
 * Obtener alertas filtradas por permisos del usuario
 */
const getAlertasByUser = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        console.log(`🔐 Controller: Obteniendo alertas para usuario ${userId}`);
        const alertas = await alertaService.getAlertasByUser(userId);
        console.log(`✅ Controller: ${alertas.length} alertas obtenidas con permisos`);
        res.json({
            success: true,
            data: alertas
        });
    }
    catch (error) {
        console.error('❌ Controller: Error obteniendo alertas por usuario:', error);
        logger_1.log.error('Error obteniendo alertas por usuario', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Error al obtener alertas'
        });
    }
};
exports.getAlertasByUser = getAlertasByUser;
/**
 * Obtener todas las alertas (solo para administradores)
 */
const getAllAlertas = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.rol;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Solo los administradores pueden ver todas las alertas'
            });
        }
        console.log(`🔍 Controller: Obteniendo todas las alertas (admin)`);
        const alertas = await alertaService.getAllAlertas();
        console.log(`✅ Controller: ${alertas.length} alertas obtenidas`);
        res.json({
            success: true,
            data: alertas
        });
    }
    catch (error) {
        console.error('❌ Controller: Error obteniendo todas las alertas:', error);
        logger_1.log.error('Error obteniendo todas las alertas', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Error al obtener alertas'
        });
    }
};
exports.getAllAlertas = getAllAlertas;
/**
 * Obtener alerta por ID
 */
const getAlertaById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        console.log(`🔍 Controller: Obteniendo alerta ${id}`);
        const alerta = await alertaService.getAlertaById(id, userId);
        if (!alerta) {
            return res.status(404).json({
                success: false,
                error: 'Alerta no encontrada'
            });
        }
        console.log(`✅ Controller: Alerta ${id} obtenida`);
        res.json({
            success: true,
            data: alerta
        });
    }
    catch (error) {
        console.error(`❌ Controller: Error obteniendo alerta ${req.params.id}:`, error);
        logger_1.log.error('Error obteniendo alerta por ID', { error: error.message });
        if (error.message.includes('No tiene permisos')) {
            res.status(403).json({
                success: false,
                error: error.message
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
};
exports.getAlertaById = getAlertaById;
/**
 * Crear nueva alerta manual
 */
const createAlerta = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        const { gestante_id, tipo_alerta, nivel_prioridad, mensaje } = req.body;
        // Validaciones básicas
        if (!gestante_id || !tipo_alerta || !nivel_prioridad || !mensaje) {
            return res.status(400).json({
                success: false,
                error: 'Los campos gestante_id, tipo_alerta, nivel_prioridad y mensaje son requeridos'
            });
        }
        // Validar nivel de prioridad
        const nivelesValidos = ['baja', 'media', 'alta', 'critica'];
        if (!nivelesValidos.includes(nivel_prioridad)) {
            return res.status(400).json({
                success: false,
                error: 'El nivel de prioridad debe ser: baja, media, alta o critica'
            });
        }
        console.log(`🚨 Controller: Creando alerta para gestante ${gestante_id}`);
        const alertaData = {
            gestante_id,
            tipo_alerta,
            nivel_prioridad,
            mensaje,
            sintomas: req.body.sintomas || [],
            coordenadas_alerta: req.body.coordenadas_alerta,
            es_automatica: false, // Las alertas manuales siempre son false
            score_riesgo: 0 // Las alertas manuales inician con score 0
        };
        const nuevaAlerta = await alertaService.createAlerta(alertaData, userId);
        console.log(`✅ Controller: Alerta creada con ID ${nuevaAlerta.id}`);
        res.status(201).json({
            success: true,
            data: nuevaAlerta
        });
    }
    catch (error) {
        console.error('❌ Controller: Error creando alerta:', error);
        logger_1.log.error('Error creando alerta', { error: error.message });
        if (error.message.includes('No tiene permisos')) {
            res.status(403).json({
                success: false,
                error: error.message
            });
        }
        else if (error.message.includes('no encontrada')) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        }
        else {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
};
exports.createAlerta = createAlerta;
/**
 * Actualizar alerta existente
 */
const updateAlerta = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        console.log(`🚨 Controller: Actualizando alerta ${id}`);
        // Validar que el ID sea válido
        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'ID de alerta requerido'
            });
        }
        // Validar nivel de prioridad si se proporciona
        const nivelesValidos = ['baja', 'media', 'alta', 'critica'];
        if (req.body.nivel_prioridad && !nivelesValidos.includes(req.body.nivel_prioridad)) {
            return res.status(400).json({
                success: false,
                error: 'El nivel de prioridad debe ser: baja, media, alta o critica'
            });
        }
        const alertaActualizada = await alertaService.updateAlertaCompleta(id, req.body);
        console.log(`✅ Controller: Alerta ${id} actualizada exitosamente`);
        res.json({
            success: true,
            data: alertaActualizada
        });
    }
    catch (error) {
        console.error(`❌ Controller: Error actualizando alerta ${req.params.id}:`, error);
        logger_1.log.error('Error actualizando alerta', { error: error.message });
        if (error.message.includes('No tiene permisos')) {
            res.status(403).json({
                success: false,
                error: error.message
            });
        }
        else if (error.message.includes('no encontrada')) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        }
        else {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
};
exports.updateAlerta = updateAlerta;
/**
 * Eliminar alerta
 */
const deleteAlerta = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        console.log(`🗑️ Controller: Eliminando alerta ${id}`);
        await alertaService.deleteAlerta(id);
        console.log(`✅ Controller: Alerta ${id} eliminada exitosamente`);
        res.json({
            success: true,
            message: 'Alerta eliminada exitosamente'
        });
    }
    catch (error) {
        console.error(`❌ Controller: Error eliminando alerta ${req.params.id}:`, error);
        logger_1.log.error('Error eliminando alerta', { error: error.message });
        if (error.message.includes('No tiene permisos')) {
            res.status(403).json({
                success: false,
                error: error.message
            });
        }
        else if (error.message.includes('no encontrada')) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
};
exports.deleteAlerta = deleteAlerta;
/**
 * Resolver alerta (marcar como resuelta)
 */
const resolverAlerta = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        console.log(`✅ Controller: Resolviendo alerta ${id}`);
        const alertaResuelta = await alertaService.resolverAlerta(id, userId);
        console.log(`✅ Controller: Alerta ${id} resuelta exitosamente`);
        res.json({
            success: true,
            data: alertaResuelta
        });
    }
    catch (error) {
        console.error(`❌ Controller: Error resolviendo alerta ${req.params.id}:`, error);
        logger_1.log.error('Error resolviendo alerta', { error: error.message });
        if (error.message.includes('No tiene permisos')) {
            res.status(403).json({
                success: false,
                error: error.message
            });
        }
        else if (error.message.includes('no encontrada')) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        }
        else {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
};
exports.resolverAlerta = resolverAlerta;
/**
 * Obtener alertas por gestante
 */
const getAlertasByGestante = async (req, res) => {
    try {
        const { gestanteId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        console.log(`📋 Controller: Obteniendo alertas para gestante ${gestanteId}`);
        const alertas = await alertaService.getAlertasByGestante(gestanteId);
        console.log(`✅ Controller: ${alertas.length} alertas obtenidas para gestante ${gestanteId}`);
        res.json({
            success: true,
            data: alertas
        });
    }
    catch (error) {
        console.error(`❌ Controller: Error obteniendo alertas para gestante ${req.params.gestanteId}:`, error);
        logger_1.log.error('Error obteniendo alertas por gestante', { error: error.message });
        if (error.message.includes('No tiene permisos')) {
            res.status(403).json({
                success: false,
                error: error.message
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
};
exports.getAlertasByGestante = getAlertasByGestante;
/**
 * Obtener alertas activas (no resueltas)
 */
const getAlertasActivas = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        console.log(`🔥 Controller: Obteniendo alertas activas para usuario ${userId}`);
        const alertas = await alertaService.getAlertasActivas();
        console.log(`✅ Controller: ${alertas.length} alertas activas obtenidas`);
        res.json({
            success: true,
            data: alertas
        });
    }
    catch (error) {
        console.error('❌ Controller: Error obteniendo alertas activas:', error);
        logger_1.log.error('Error obteniendo alertas activas', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.getAlertasActivas = getAlertasActivas;
/**
 * Notificar emergencia (crear alerta crítica)
 */
const notificarEmergencia = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        const { gestante_id, mensaje, coordenadas_alerta } = req.body;
        if (!gestante_id || !mensaje) {
            return res.status(400).json({
                success: false,
                error: 'Los campos gestante_id y mensaje son requeridos'
            });
        }
        console.log(`🚨 Controller: Notificando emergencia para gestante ${gestante_id}`);
        const alertaEmergencia = {
            gestante_id,
            tipo_alerta: 'emergencia_obstetrica',
            nivel_prioridad: 'critica',
            mensaje,
            coordenadas_alerta,
            es_automatica: false,
            score_riesgo: 100 // Emergencias tienen score máximo
        };
        const nuevaAlerta = await alertaService.createAlerta(alertaEmergencia, userId);
        console.log(`✅ Controller: Emergencia notificada con ID ${nuevaAlerta.id}`);
        res.status(201).json({
            success: true,
            data: nuevaAlerta,
            message: 'Emergencia notificada exitosamente'
        });
    }
    catch (error) {
        console.error('❌ Controller: Error notificando emergencia:', error);
        logger_1.log.error('Error notificando emergencia', { error: error.message });
        if (error.message.includes('No tiene permisos')) {
            res.status(403).json({
                success: false,
                error: error.message
            });
        }
        else if (error.message.includes('no encontrada')) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        }
        else {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
};
exports.notificarEmergencia = notificarEmergencia;
/**
 * Obtener estadísticas de alertas para dashboard
 */
const getEstadisticasAlertas = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        console.log(`📊 Controller: Obteniendo estadísticas de alertas para usuario ${userId}`);
        // Obtener alertas del usuario y calcular estadísticas básicas
        const alertas = await alertaService.getAlertasByUser(userId);
        const estadisticas = {
            total: alertas.length,
            criticas: alertas.filter(a => a.nivel_prioridad === 'critica').length,
            altas: alertas.filter(a => a.nivel_prioridad === 'alta').length,
            medias: alertas.filter(a => a.nivel_prioridad === 'media').length,
            bajas: alertas.filter(a => a.nivel_prioridad === 'baja').length,
            pendientes: alertas.filter(a => !a.resuelta).length,
            resueltas: alertas.filter(a => a.resuelta).length,
            automaticas: alertas.filter(a => a.es_automatica).length,
        };
        console.log(`✅ Controller: Estadísticas obtenidas exitosamente`);
        res.json({
            success: true,
            data: estadisticas
        });
    }
    catch (error) {
        console.error('❌ Controller: Error obteniendo estadísticas:', error);
        logger_1.log.error('Error obteniendo estadísticas de alertas', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.getEstadisticasAlertas = getEstadisticasAlertas;
/**
 * Obtener gestantes disponibles para crear alertas (filtrado por permisos)
 */
const getGestantesDisponibles = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.rol;
        const userMunicipioId = req.user?.municipio_id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        console.log(`👥 Controller: Obteniendo gestantes disponibles para usuario ${userId}`);
        // Usar Prisma directamente para obtener gestantes según permisos
        const prisma = new (require('@prisma/client').PrismaClient)();
        let whereClause = { activa: true };
        // Filtrar según rol
        if (userRole === 'madrina') {
            whereClause.madrina_id = userId;
        }
        else if (userRole === 'coordinador' && userMunicipioId) {
            whereClause.municipio_id = userMunicipioId;
        }
        // Admin puede ver todas las gestantes activas
        const gestantes = await prisma.gestante.findMany({
            where: whereClause,
            select: {
                id: true,
                nombre: true,
                documento: true,
                telefono: true,
                municipio: {
                    select: {
                        id: true,
                        nombre: true
                    }
                },
                madrina: {
                    select: {
                        id: true,
                        nombre: true
                    }
                }
            },
            orderBy: { nombre: 'asc' }
        });
        console.log(`✅ Controller: ${gestantes.length} gestantes disponibles obtenidas`);
        res.json({
            success: true,
            data: gestantes
        });
    }
    catch (error) {
        console.error('❌ Controller: Error obteniendo gestantes disponibles:', error);
        logger_1.log.error('Error obteniendo gestantes disponibles', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.getGestantesDisponibles = getGestantesDisponibles;
