"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSyncHistory = exports.cleanupOldItems = exports.syncFull = exports.resolveConflict = exports.getConflicts = exports.getSyncStatus = exports.syncPull = exports.syncPush = void 0;
const sync_service_1 = require("../services/sync.service");
const sync_dto_1 = require("../core/application/dtos/sync.dto");
const logger_1 = require("../config/logger");
const syncService = new sync_service_1.SyncService();
/**
 * Sincronizar batch de cambios desde el cliente (PUSH)
 * POST /api/sync/push
 */
const syncPush = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const dto = sync_dto_1.syncBatchSchema.parse({
            ...req.body,
            userId,
        });
        const result = await syncService.syncBatch(dto);
        logger_1.logger.info('Sincronización push completada', {
            userId,
            totalItems: result.totalItems,
            syncedItems: result.syncedItems,
            failedItems: result.failedItems,
            conflicts: result.conflicts,
        });
        res.status(200).json({
            success: result.success,
            message: result.success
                ? 'Sincronización completada exitosamente'
                : 'Sincronización completada con errores',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.syncPush = syncPush;
/**
 * Descargar cambios desde el servidor (PULL)
 * POST /api/sync/pull
 */
const syncPull = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const dto = sync_dto_1.syncPullSchema.parse({
            ...req.body,
            userId,
        });
        const result = await syncService.syncPull(dto);
        logger_1.logger.info('Sincronización pull completada', {
            userId,
            totalChanges: result.totalChanges,
        });
        res.status(200).json({
            success: true,
            message: 'Cambios descargados exitosamente',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.syncPull = syncPull;
/**
 * Obtener estado de sincronización
 * GET /api/sync/status
 */
const getSyncStatus = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const dto = sync_dto_1.syncStatusSchema.parse({
            userId,
            deviceId: req.query.deviceId,
        });
        const result = await syncService.getSyncStatus(dto);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSyncStatus = getSyncStatus;
/**
 * Obtener conflictos pendientes
 * GET /api/sync/conflicts
 */
const getConflicts = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const conflicts = await syncService.getConflicts(userId);
        res.status(200).json({
            success: true,
            data: conflicts,
            total: conflicts.length,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getConflicts = getConflicts;
/**
 * Resolver conflicto de sincronización
 * POST /api/sync/conflicts/:conflictId/resolve
 */
const resolveConflict = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const dto = sync_dto_1.resolverConflictoSchema.parse({
            conflictId: req.params.conflictId,
            ...req.body,
        });
        await syncService.resolveConflict(dto);
        logger_1.logger.info('Conflicto resuelto', {
            userId,
            conflictId: dto.conflictId,
            resolution: dto.resolution,
        });
        res.status(200).json({
            success: true,
            message: 'Conflicto resuelto exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resolveConflict = resolveConflict;
/**
 * Sincronización completa (PUSH + PULL)
 * POST /api/sync/full
 */
const syncFull = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const startTime = Date.now();
        // 1. PUSH: Enviar cambios locales al servidor
        let pushResult = null;
        if (req.body.items && req.body.items.length > 0) {
            const pushDto = sync_dto_1.syncBatchSchema.parse({
                ...req.body,
                userId,
            });
            pushResult = await syncService.syncBatch(pushDto);
        }
        // 2. PULL: Descargar cambios del servidor
        const pullDto = sync_dto_1.syncPullSchema.parse({
            userId,
            deviceId: req.body.deviceId,
            lastSyncTimestamp: req.body.lastSyncTimestamp,
            entityTypes: req.body.entityTypes,
        });
        const pullResult = await syncService.syncPull(pullDto);
        const durationMs = Date.now() - startTime;
        logger_1.logger.info('Sincronización completa finalizada', {
            userId,
            durationMs,
            pushResult: pushResult
                ? {
                    syncedItems: pushResult.syncedItems,
                    failedItems: pushResult.failedItems,
                    conflicts: pushResult.conflicts,
                }
                : null,
            pullResult: {
                totalChanges: pullResult.totalChanges,
            },
        });
        res.status(200).json({
            success: true,
            message: 'Sincronización completa exitosa',
            data: {
                push: pushResult,
                pull: pullResult,
                durationMs,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.syncFull = syncFull;
/**
 * Limpiar items sincronizados antiguos (solo admin)
 * DELETE /api/sync/cleanup
 */
const cleanupOldItems = async (req, res, next) => {
    try {
        const daysOld = parseInt(req.query.daysOld) || 30;
        const count = await syncService.cleanupOldSyncItems(daysOld);
        res.status(200).json({
            success: true,
            message: `${count} items antiguos eliminados`,
            data: { count, daysOld },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.cleanupOldItems = cleanupOldItems;
/**
 * Obtener historial de sincronizaciones
 * GET /api/sync/history
 */
const getSyncHistory = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const limit = parseInt(req.query.limit) || 10;
        const deviceId = req.query.deviceId;
        const history = await syncService.getSyncHistory(userId, deviceId, limit);
        res.status(200).json({
            success: true,
            data: history,
            total: history.length,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSyncHistory = getSyncHistory;
