import { Request, Response, NextFunction } from 'express';
import { SyncService } from '../services/sync.service';
import {
  syncBatchSchema,
  syncPullSchema,
  syncStatusSchema,
  resolverConflictoSchema,
} from '../core/application/dtos/sync.dto';
import { logger } from '../config/logger';

const syncService = new SyncService();

/**
 * Sincronizar batch de cambios desde el cliente (PUSH)
 * POST /api/sync/push
 */
export const syncPush = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const dto = syncBatchSchema.parse({
      ...req.body,
      userId,
    });

    // Map items to operations for the service
    const syncBatchDto = {
      userId: dto.userId,
      deviceId: dto.deviceId || 'unknown',
      operations: dto.items.map(item => ({
        id: item.entityId,
        entityType: item.entityType,
        entityId: item.entityId,
        operation: item.operation,
        data: item.data,
        timestamp: new Date(item.localTimestamp || Date.now())
      }))
    };

    const result = await syncService.syncBatch(syncBatchDto);

    logger.info('Sincronización push completada', {
      userId,
      totalItems: dto.items.length,
      syncedItems: result.processedItems,
      failedItems: result.failedItems,
      conflicts: result.conflicts,
    });

    res.status(200).json({
      success: result.success,
      totalItems: dto.items.length,
      syncedItems: result.processedItems,
      failedItems: result.failedItems,
      conflicts: result.conflicts,
      message: result.success
        ? 'Sincronización completada exitosamente'
        : 'Sincronización completada con errores',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Descargar cambios desde el servidor (PULL)
 * POST /api/sync/pull
 */
export const syncPull = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const dto = syncPullSchema.parse({
      ...req.body,
      userId,
    });

    const result = await syncService.syncPull(dto);

    logger.info('Sincronización pull completada', {
      userId,
      totalChanges: result.totalChanges,
    });

    res.status(200).json({
      success: true,
      message: 'Cambios descargados exitosamente',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estado de sincronización
 * GET /api/sync/status
 */
export const getSyncStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const dto = syncStatusSchema.parse({
      userId,
      deviceId: req.query.deviceId as string | undefined,
    });

    // Método temporal hasta que se implemente getSyncStatus
    const result = {
      lastSync: new Date(),
      pendingItems: 0,
      conflicts: 0,
      status: 'synced'
    };

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener conflictos pendientes
 * GET /api/sync/conflicts
 */
export const getConflicts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
  } catch (error) {
    next(error);
  }
};

/**
 * Resolver conflicto de sincronización
 * POST /api/sync/conflicts/:conflictId/resolve
 */
export const resolveConflict = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const dto = resolverConflictoSchema.parse({
      conflictId: req.params.conflictId,
      ...req.body,
    });

    // Map resolution types
    const resolutionMap = {
      'local_wins': 'local',
      'server_wins': 'server',
      'manual': 'merge',
      'merge': 'merge'
    } as const;

    const mappedResolution = resolutionMap[dto.resolution as keyof typeof resolutionMap] || 'merge';
    
    await syncService.resolveConflict(dto.conflictId, mappedResolution, dto.mergedData);

    logger.info('Conflicto resuelto', {
      userId,
      conflictId: dto.conflictId,
      resolution: dto.resolution,
    });

    res.status(200).json({
      success: true,
      message: 'Conflicto resuelto exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sincronización completa (PUSH + PULL)
 * POST /api/sync/full
 */
export const syncFull = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const startTime = Date.now();

    // 1. PUSH: Enviar cambios locales al servidor
    let pushResult = null;
    if (req.body.items && req.body.items.length > 0) {
      const pushDto = syncBatchSchema.parse({
        ...req.body,
        userId,
      });
      
      // Map items to operations for the service
      const syncBatchDto = {
        userId: pushDto.userId,
        deviceId: pushDto.deviceId || 'unknown',
        operations: pushDto.items.map(item => ({
          id: item.entityId,
          entityType: item.entityType,
          entityId: item.entityId,
          operation: item.operation,
          data: item.data,
          timestamp: new Date(item.localTimestamp || Date.now())
        }))
      };
      
      pushResult = await syncService.syncBatch(syncBatchDto);
    }

    // 2. PULL: Descargar cambios del servidor
    const pullDto = syncPullSchema.parse({
      userId,
      deviceId: req.body.deviceId,
      lastSyncTimestamp: req.body.lastSyncTimestamp,
      entityTypes: req.body.entityTypes,
    });
    const pullResult = await syncService.syncPull(pullDto);

    const durationMs = Date.now() - startTime;

    logger.info('Sincronización completa finalizada', {
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
  } catch (error) {
    next(error);
  }
};

/**
 * Limpiar items sincronizados antiguos (solo admin)
 * DELETE /api/sync/cleanup
 */
export const cleanupOldItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const daysOld = parseInt(req.query.daysOld as string) || 30;
    const count = await syncService.cleanupOldSyncData(daysOld);

    res.status(200).json({
      success: true,
      message: `${count} items antiguos eliminados`,
      data: { count, daysOld },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener historial de sincronizaciones
 * GET /api/sync/history
 */
export const getSyncHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const deviceId = req.query.deviceId as string | undefined;

    const history = await syncService.getSyncHistory(userId, deviceId, limit);

    res.status(200).json({
      success: true,
      data: history,
      total: history.length,
    });
  } catch (error) {
    next(error);
  }
};

