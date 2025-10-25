"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const database_1 = __importDefault(require("../config/database"));
const sync_dto_1 = require("../core/application/dtos/sync.dto");
const logger_1 = require("../config/logger");
const crypto_1 = require("crypto");
const conflict_error_1 = require("../core/domain/errors/conflict.error");
const not_found_error_1 = require("../core/domain/errors/not-found.error");
class SyncService {
    /**
     * Sincronizar batch de cambios desde el cliente
     */
    async syncBatch(dto) {
        const startTime = Date.now();
        let syncedItems = 0;
        let failedItems = 0;
        let conflicts = 0;
        const itemResults = [];
        // Crear log de sincronización
        const syncLog = await database_1.default.syncLog.create({
            data: {
                user_id: dto.userId,
                device_id: dto.deviceId,
                sync_type: 'push',
                entities_synced: 0,
                entities_failed: 0,
                conflicts: 0,
                status: 'syncing',
                started_at: new Date(),
            },
        });
        try {
            // Procesar cada item en una transacción
            for (const item of dto.items) {
                try {
                    const result = await this.syncSingleItem(dto.userId, dto.deviceId, item);
                    if (result.status === sync_dto_1.SyncStatus.SYNCED) {
                        syncedItems++;
                    }
                    else if (result.status === sync_dto_1.SyncStatus.CONFLICT) {
                        conflicts++;
                    }
                    else if (result.status === sync_dto_1.SyncStatus.FAILED) {
                        failedItems++;
                    }
                    itemResults.push(result);
                }
                catch (error) {
                    logger_1.logger.error('Error sincronizando item', {
                        error,
                        item,
                        userId: dto.userId,
                    });
                    failedItems++;
                    itemResults.push({
                        entityType: item.entityType,
                        entityId: item.entityId,
                        status: sync_dto_1.SyncStatus.FAILED,
                        errorMessage: error.message,
                    });
                }
            }
            // Actualizar log de sincronización
            const durationMs = Date.now() - startTime;
            await database_1.default.syncLog.update({
                where: { id: syncLog.id },
                data: {
                    entities_synced: syncedItems,
                    entities_failed: failedItems,
                    conflicts,
                    duration_ms: durationMs,
                    status: failedItems === 0 ? 'success' : 'partial',
                    completed_at: new Date(),
                },
            });
            logger_1.logger.info('Sincronización batch completada', {
                userId: dto.userId,
                totalItems: dto.items.length,
                syncedItems,
                failedItems,
                conflicts,
                durationMs,
            });
            return {
                success: failedItems === 0,
                totalItems: dto.items.length,
                syncedItems,
                failedItems,
                conflicts,
                items: itemResults,
                syncLogId: syncLog.id,
            };
        }
        catch (error) {
            // Actualizar log con error
            await database_1.default.syncLog.update({
                where: { id: syncLog.id },
                data: {
                    status: 'failed',
                    error_message: error.message,
                    completed_at: new Date(),
                },
            });
            throw error;
        }
    }
    /**
     * Sincronizar un solo item
     */
    async syncSingleItem(userId, deviceId, item) {
        // Verificar versión actual en el servidor
        const currentVersion = await this.getEntityVersion(item.entityType, item.entityId);
        // Si hay conflicto de versión
        if (currentVersion && currentVersion.version > item.version) {
            // Crear registro de conflicto
            const conflict = await this.createConflict(userId, deviceId, item, currentVersion);
            return {
                entityType: item.entityType,
                entityId: item.entityId,
                status: sync_dto_1.SyncStatus.CONFLICT,
                conflictId: conflict.id,
            };
        }
        // Aplicar cambio según la operación
        try {
            switch (item.operation) {
                case sync_dto_1.SyncOperation.CREATE:
                    await this.applyCreate(item);
                    break;
                case sync_dto_1.SyncOperation.UPDATE:
                    await this.applyUpdate(item);
                    break;
                case sync_dto_1.SyncOperation.DELETE:
                    await this.applyDelete(item);
                    break;
            }
            // Actualizar versión de la entidad
            await this.updateEntityVersion(item.entityType, item.entityId, item.version + 1, item.data, userId);
            return {
                entityType: item.entityType,
                entityId: item.entityId,
                status: sync_dto_1.SyncStatus.SYNCED,
            };
        }
        catch (error) {
            logger_1.logger.error('Error aplicando cambio', {
                error,
                item,
                userId,
            });
            return {
                entityType: item.entityType,
                entityId: item.entityId,
                status: sync_dto_1.SyncStatus.FAILED,
                errorMessage: error.message,
            };
        }
    }
    /**
     * Pull de cambios desde el servidor
     */
    async syncPull(dto) {
        const lastSync = dto.lastSyncTimestamp
            ? new Date(dto.lastSyncTimestamp)
            : new Date(0);
        const changes = {};
        const deletedIds = {};
        let totalChanges = 0;
        // Obtener cambios por tipo de entidad
        const entityTypes = dto.entityTypes || Object.values(sync_dto_1.SyncEntity);
        for (const entityType of entityTypes) {
            const { items, deleted } = await this.getChangesForEntity(entityType, lastSync, dto.userId);
            if (items.length > 0) {
                changes[`${entityType}s`] = items;
                totalChanges += items.length;
            }
            if (deleted.length > 0) {
                deletedIds[`${entityType}s`] = deleted;
                totalChanges += deleted.length;
            }
        }
        logger_1.logger.info('Pull de sincronización completado', {
            userId: dto.userId,
            totalChanges,
            lastSync,
        });
        return {
            success: true,
            lastSyncTimestamp: new Date().toISOString(),
            changes,
            deletedIds,
            totalChanges,
        };
    }
    /**
     * Obtener estado de sincronización
     */
    async getSyncStatus(dto) {
        const [pendingItems, syncingItems, failedItems, conflicts, lastSync] = await Promise.all([
            database_1.default.syncQueue.count({
                where: { user_id: dto.userId, status: 'pending' },
            }),
            database_1.default.syncQueue.count({
                where: { user_id: dto.userId, status: 'syncing' },
            }),
            database_1.default.syncQueue.count({
                where: { user_id: dto.userId, status: 'failed' },
            }),
            database_1.default.syncConflict.count({
                where: { user_id: dto.userId, resolved: false },
            }),
            database_1.default.syncLog.findFirst({
                where: { user_id: dto.userId },
                orderBy: { started_at: 'desc' },
            }),
        ]);
        const result = {
            pendingItems,
            syncingItems,
            failedItems,
            conflicts,
            lastSyncTimestamp: lastSync?.completed_at?.toISOString(),
            lastSyncStatus: lastSync?.status,
        };
        if (dto.deviceId) {
            const device = await database_1.default.dispositivo.findUnique({
                where: { id: dto.deviceId },
            });
            if (device) {
                result.deviceInfo = {
                    id: device.id,
                    lastSync: device.fecha_ultima_sincronizacion || undefined,
                    version: device.version_app || undefined,
                };
            }
        }
        return result;
    }
    /**
     * Resolver conflicto de sincronización
     */
    async resolveConflict(dto) {
        const conflict = await database_1.default.syncConflict.findUnique({
            where: { id: dto.conflictId },
        });
        if (!conflict) {
            throw new not_found_error_1.NotFoundError('Conflicto no encontrado');
        }
        if (conflict.resolved) {
            throw new conflict_error_1.ConflictError('El conflicto ya fue resuelto');
        }
        let finalData;
        switch (dto.resolution) {
            case 'local_wins':
                finalData = conflict.local_data;
                break;
            case 'server_wins':
                finalData = conflict.server_data;
                break;
            case 'merge':
            case 'manual':
                if (!dto.mergedData) {
                    throw new conflict_error_1.ConflictError('Se requieren datos merged para esta resolución');
                }
                finalData = dto.mergedData;
                break;
        }
        // Aplicar la resolución
        await this.applyUpdate({
            entityType: conflict.entity_type,
            entityId: conflict.entity_id,
            data: finalData,
            version: Math.max(conflict.local_version, conflict.server_version),
        });
        // Marcar conflicto como resuelto
        await database_1.default.syncConflict.update({
            where: { id: dto.conflictId },
            data: {
                resolved: true,
                resolution: dto.resolution,
                resolved_at: new Date(),
            },
        });
        logger_1.logger.info('Conflicto resuelto', {
            conflictId: dto.conflictId,
            resolution: dto.resolution,
        });
    }
    /**
     * Obtener versión actual de una entidad
     */
    async getEntityVersion(entityType, entityId) {
        return await database_1.default.entityVersion.findUnique({
            where: {
                entity_type_entity_id: {
                    entity_type: entityType,
                    entity_id: entityId,
                },
            },
        });
    }
    /**
     * Actualizar versión de una entidad
     */
    async updateEntityVersion(entityType, entityId, version, data, updatedBy) {
        const dataHash = this.calculateHash(data);
        await database_1.default.entityVersion.upsert({
            where: {
                entity_type_entity_id: {
                    entity_type: entityType,
                    entity_id: entityId,
                },
            },
            create: {
                entity_type: entityType,
                entity_id: entityId,
                version,
                data_hash: dataHash,
                updated_by: updatedBy,
            },
            update: {
                version,
                data_hash: dataHash,
                updated_by: updatedBy,
                updated_at: new Date(),
            },
        });
    }
    /**
     * Crear registro de conflicto
     */
    async createConflict(userId, deviceId, localItem, serverVersion) {
        // Obtener datos actuales del servidor
        const serverData = await this.getEntityData(localItem.entityType, localItem.entityId);
        return await database_1.default.syncConflict.create({
            data: {
                entity_type: localItem.entityType,
                entity_id: localItem.entityId,
                local_version: localItem.version,
                server_version: serverVersion.version,
                local_data: localItem.data,
                server_data: serverData,
                user_id: userId,
                device_id: deviceId,
            },
        });
    }
    /**
     * Obtener datos actuales de una entidad
     */
    async getEntityData(entityType, entityId) {
        const tableName = this.getTableName(entityType);
        const result = await database_1.default[tableName].findUnique({
            where: { id: entityId },
        });
        return result;
    }
    /**
     * Aplicar operación CREATE
     */
    async applyCreate(item) {
        const tableName = this.getTableName(item.entityType);
        await database_1.default[tableName].create({
            data: item.data,
        });
    }
    /**
     * Aplicar operación UPDATE
     */
    async applyUpdate(item) {
        const tableName = this.getTableName(item.entityType);
        await database_1.default[tableName].update({
            where: { id: item.entityId },
            data: item.data,
        });
    }
    /**
     * Aplicar operación DELETE
     */
    async applyDelete(item) {
        const tableName = this.getTableName(item.entityType);
        await database_1.default[tableName].delete({
            where: { id: item.entityId },
        });
    }
    /**
     * Obtener cambios para un tipo de entidad
     */
    async getChangesForEntity(entityType, lastSync, userId) {
        const tableName = this.getTableName(entityType);
        // Obtener items modificados/creados
        const items = await database_1.default[tableName].findMany({
            where: {
                updated_at: {
                    gt: lastSync,
                },
            },
        });
        // TODO: Implementar tracking de eliminaciones
        const deleted = [];
        return { items, deleted };
    }
    /**
     * Obtener nombre de tabla de Prisma
     */
    getTableName(entityType) {
        const tableMap = {
            [sync_dto_1.SyncEntity.GESTANTE]: 'gestante',
            [sync_dto_1.SyncEntity.CONTROL]: 'control',
            [sync_dto_1.SyncEntity.ALERTA]: 'alerta',
            [sync_dto_1.SyncEntity.USUARIO]: 'usuario',
            [sync_dto_1.SyncEntity.IPS]: 'ips',
            [sync_dto_1.SyncEntity.MEDICO]: 'medico',
            [sync_dto_1.SyncEntity.MUNICIPIO]: 'municipio',
        };
        return tableMap[entityType];
    }
    /**
     * Calcular hash MD5 de datos
     */
    calculateHash(data) {
        const jsonString = JSON.stringify(data);
        return (0, crypto_1.createHash)('md5').update(jsonString).digest('hex');
    }
    /**
     * Obtener conflictos pendientes de un usuario
     */
    async getConflicts(userId) {
        return await database_1.default.syncConflict.findMany({
            where: {
                user_id: userId,
                resolved: false,
            },
            orderBy: {
                created_at: 'desc',
            },
        });
    }
    /**
     * Limpiar items sincronizados antiguos
     */
    async cleanupOldSyncItems(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const result = await database_1.default.syncQueue.deleteMany({
            where: {
                status: 'synced',
                synced_at: {
                    lt: cutoffDate,
                },
            },
        });
        logger_1.logger.info('Items de sincronización antiguos eliminados', {
            count: result.count,
            daysOld,
        });
        return result.count;
    }
    /**
     * Obtener historial de sincronizaciones
     */
    async getSyncHistory(userId, deviceId, limit = 10) {
        const where = { user_id: userId };
        if (deviceId) {
            where.device_id = deviceId;
        }
        return await database_1.default.syncLog.findMany({
            where,
            orderBy: { started_at: 'desc' },
            take: limit,
        });
    }
}
exports.SyncService = SyncService;
