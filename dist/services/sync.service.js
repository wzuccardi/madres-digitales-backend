"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const database_1 = __importDefault(require("../config/database"));
const logger_1 = require("../config/logger");
class SyncService {
    /**
     * Obtener estado de sincronización
     */
    async getSyncStatus(dto) {
        try {
            logger_1.logger.info('SyncService: Obteniendo estado de sincronización', {
                userId: dto.userId,
                deviceId: dto.deviceId,
            });
            // Obtener último log de sincronización
            const lastSyncLog = await database_1.default.syncLog.findFirst({
                where: {
                    usuario_id: dto.userId,
                    device_id: dto.deviceId,
                },
                orderBy: { fecha_inicio: 'desc' },
            });
            // Contar elementos pendientes en la cola
            const pendingItems = await database_1.default.syncQueue.count({
                where: {
                    usuario_id: dto.userId,
                    estado: 'pending',
                },
            });
            // Contar conflictos no resueltos
            const conflicts = await database_1.default.syncConflict.count({
                where: {
                    usuario_id: dto.userId,
                    estado: 'pending',
                },
            });
            const status = conflicts > 0 ? 'error' :
                pendingItems > 0 ? 'pending' :
                    'synced';
            return {
                lastSync: lastSyncLog?.fecha_inicio || null,
                pendingItems,
                conflicts,
                status,
            };
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo estado de sincronización', error);
            throw error;
        }
    }
    /**
     * Iniciar proceso de sincronización
     */
    async startSync(userId, deviceId) {
        try {
            logger_1.logger.info('SyncService: Iniciando sincronización', {
                userId,
                deviceId,
            });
            const syncLog = await database_1.default.syncLog.create({
                data: {
                    usuario_id: userId,
                    device_id: deviceId,
                    tipo_operacion: 'sync_up',
                    entidad: 'all',
                    estado: 'pending',
                    fecha_inicio: new Date(),
                },
            });
            return syncLog.id;
        }
        catch (error) {
            logger_1.logger.error('Error iniciando sincronización', error);
            throw error;
        }
    }
    /**
     * Procesar lote de operaciones de sincronización
     */
    async processBatch(dto) {
        try {
            logger_1.logger.info('SyncService: Procesando lote de sincronización', {
                userId: dto.userId,
                operationsCount: dto.operations.length,
            });
            let processedItems = 0;
            let failedItems = 0;
            const conflicts = [];
            for (const operation of dto.operations) {
                try {
                    await this.processOperation(operation, dto.userId);
                    processedItems++;
                }
                catch (error) {
                    failedItems++;
                    logger_1.logger.error('Error procesando operación', error, {
                        operationId: operation.id,
                        entityType: operation.entityType,
                    });
                }
            }
            // Actualizar log de sincronización
            const syncLog = await database_1.default.syncLog.findFirst({
                where: {
                    usuario_id: dto.userId,
                    device_id: dto.deviceId,
                    estado: 'pending',
                },
                orderBy: { fecha_creacion: 'desc' },
            });
            if (syncLog) {
                await database_1.default.syncLog.update({
                    where: { id: syncLog.id },
                    data: {
                        estado: failedItems > 0 ? 'error' : 'success',
                        fecha_fin: new Date(),
                        duracion_ms: Date.now() - syncLog.fecha_inicio.getTime(),
                    },
                });
            }
            return {
                success: failedItems === 0,
                processedItems,
                failedItems,
                conflicts,
            };
        }
        catch (error) {
            logger_1.logger.error('Error procesando lote de sincronización', error);
            throw error;
        }
    }
    /**
     * Procesar una operación individual
     */
    async processOperation(operation, userId) {
        // Implementación simplificada - en producción esto sería más complejo
        logger_1.logger.debug('Procesando operación', {
            operationId: operation.id,
            entityType: operation.entityType,
            operation: operation.operation,
        });
        // Aquí iría la lógica específica para cada tipo de entidad
        // Por ahora solo registramos la operación
        if (userId) {
            await database_1.default.syncQueue.create({
                data: {
                    usuario_id: userId,
                    device_id: 'unknown',
                    entidad: operation.entityType,
                    entidad_id: operation.entityId,
                    operacion: operation.operation,
                    datos: operation.data,
                    estado: 'completed',
                    fecha_procesamiento: new Date(),
                },
            });
        }
    }
    /**
     * Obtener conflictos pendientes
     */
    async getPendingConflicts(userId) {
        try {
            logger_1.logger.info('SyncService: Obteniendo conflictos pendientes', { userId });
            const conflicts = await database_1.default.syncConflict.findMany({
                where: {
                    usuario_id: userId,
                    estado: 'pending',
                },
                orderBy: { fecha_inicio: 'desc' },
            });
            return conflicts.map(conflict => ({
                id: conflict.id,
                entityType: conflict.entidad,
                entityId: conflict.entidad_id,
                localVersion: 1, // Simplificado
                serverVersion: 2, // Simplificado
                localData: conflict.datos_local,
                serverData: conflict.datos_servidor,
                conflictType: conflict.tipo_conflicto,
                resolved: conflict.estado === 'resolved',
            }));
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo conflictos pendientes', error);
            return [];
        }
    }
    /**
     * Resolver conflicto
     */
    async resolveConflict(conflictId, resolution, mergedData) {
        try {
            logger_1.logger.info('SyncService: Resolviendo conflicto', {
                conflictId,
                resolution,
            });
            const conflict = await database_1.default.syncConflict.findUnique({
                where: { id: conflictId },
            });
            if (!conflict) {
                throw new Error('Conflicto no encontrado');
            }
            let finalData;
            switch (resolution) {
                case 'local':
                    finalData = conflict.datos_local;
                    break;
                case 'server':
                    finalData = conflict.datos_servidor;
                    break;
                case 'merge':
                    finalData = mergedData || conflict.datos_servidor;
                    break;
            }
            // Actualizar el conflicto como resuelto
            await database_1.default.syncConflict.update({
                where: { id: conflictId },
                data: {
                    estado: 'resolved',
                    resolucion: finalData,
                    fecha_resolucion: new Date(),
                },
            });
            logger_1.logger.info('Conflicto resuelto exitosamente', { conflictId });
        }
        catch (error) {
            logger_1.logger.error('Error resolviendo conflicto', error);
            throw error;
        }
    }
    /**
     * Limpiar datos de sincronización antiguos
     */
    async cleanupOldSyncData(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            // Limpiar logs antiguos
            const deletedLogs = await database_1.default.syncLog.deleteMany({
                where: {
                    fecha_inicio: { lt: cutoffDate },
                    estado: { in: ['success', 'error'] },
                },
            });
            // Limpiar conflictos resueltos antiguos
            const deletedConflicts = await database_1.default.syncConflict.deleteMany({
                where: {
                    fecha_creacion: { lt: cutoffDate },
                    estado: 'resolved',
                },
            });
            logger_1.logger.info('Limpieza de datos de sincronización completada', {
                deletedLogs: deletedLogs.count,
                deletedConflicts: deletedConflicts.count,
            });
        }
        catch (error) {
            logger_1.logger.error('Error limpiando datos de sincronización', error);
        }
    }
    /**
     * Obtener estadísticas de sincronización
     */
    async getSyncStats(userId) {
        try {
            const stats = await database_1.default.syncLog.groupBy({
                by: ['estado'],
                where: { usuario_id: userId },
                _count: { id: true },
            });
            const deviceStats = await database_1.default.dispositivo.findMany({
                where: { usuario_id: userId },
                select: {
                    device_id: true,
                    device_name: true,
                    platform: true,
                    app_version: true,
                    last_sync: true,
                },
            });
            return {
                syncStats: stats.map(stat => ({
                    status: stat.estado,
                    count: stat._count.id,
                })),
                devices: deviceStats.map(device => ({
                    deviceId: device.device_id,
                    deviceName: device.device_name,
                    platform: device.platform,
                    version: device.app_version,
                    lastSync: device.last_sync,
                })),
            };
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo estadísticas de sincronización', error);
            return { syncStats: [], devices: [] };
        }
    }
    /**
     * Sincronización por lotes
     */
    async syncBatch(dto) {
        try {
            logger_1.logger.info('SyncService: Iniciando sincronización por lotes', {
                userId: dto.userId,
                deviceId: dto.deviceId,
                operationsCount: dto.operations.length,
            });
            let processedItems = 0;
            let failedItems = 0;
            const conflicts = [];
            for (const operation of dto.operations) {
                try {
                    await this.processOperation(operation);
                    processedItems++;
                }
                catch (error) {
                    failedItems++;
                    logger_1.logger.error('Error procesando operación de sync', { operation, error });
                }
            }
            return {
                success: failedItems === 0,
                processedItems,
                failedItems,
                conflicts,
            };
        }
        catch (error) {
            logger_1.logger.error('Error en sincronización por lotes', error);
            throw error;
        }
    }
    /**
     * Sincronización pull (obtener datos del servidor)
     */
    async syncPull(dto) {
        try {
            logger_1.logger.info('SyncService: Iniciando pull sync', {
                userId: dto.userId,
                deviceId: dto.deviceId,
            });
            // Obtener datos actualizados desde la última sincronización
            const lastSync = await this.getLastSyncTime(dto.userId, dto.deviceId);
            const updatedData = await this.getUpdatedDataSince(lastSync);
            return {
                success: true,
                data: updatedData,
                timestamp: new Date(),
            };
        }
        catch (error) {
            logger_1.logger.error('Error en pull sync', error);
            throw error;
        }
    }
    /**
     * Obtener conflictos pendientes
     */
    async getConflicts(userId) {
        try {
            const conflicts = await database_1.default.syncConflict.findMany({
                where: {
                    usuario_id: userId,
                    estado: 'pending',
                },
                orderBy: {
                    fecha_creacion: 'desc',
                },
            });
            return conflicts.map(conflict => ({
                id: conflict.id,
                entityType: conflict.entidad,
                entityId: conflict.entidad_id,
                localVersion: 1, // conflict.version_local,
                serverVersion: 1, // conflict.version_servidor,
                localData: conflict.datos_local,
                serverData: conflict.datos_servidor,
                conflictType: conflict.tipo_conflicto,
                resolved: conflict.estado === 'resolved',
            }));
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo conflictos', error);
            return [];
        }
    }
    /**
     * Obtener historial de sincronización
     */
    async getSyncHistory(userId, deviceId, limit = 50) {
        try {
            const whereClause = { usuario_id: userId };
            if (deviceId) {
                whereClause.device_id = deviceId;
            }
            const history = await database_1.default.syncLog.findMany({
                where: whereClause,
                orderBy: { fecha_inicio: 'desc' },
                take: limit,
            });
            return history.map(log => ({
                id: log.id,
                timestamp: log.fecha_inicio,
                status: log.estado,
                operation: log.tipo_operacion,
                entity: log.entidad,
                duration: log.duracion_ms,
                error: log.error_message,
            }));
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo historial de sync', error);
            return [];
        }
    }
    async getLastSyncTime(userId, deviceId) {
        const lastSync = await database_1.default.syncLog.findFirst({
            where: {
                usuario_id: userId,
                device_id: deviceId,
                estado: 'success',
            },
            orderBy: { fecha_fin: 'desc' },
        });
        return lastSync?.fecha_fin || null;
    }
    async getUpdatedDataSince(lastSync) {
        // Implementación básica para obtener datos actualizados
        return {
            gestantes: [],
            controles: [],
            alertas: [],
        };
    }
}
exports.SyncService = SyncService;
