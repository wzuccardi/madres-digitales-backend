import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';
import * as syncController from '../controllers/sync.controller';

const router = Router();

/**
 * Todas las rutas de sincronización requieren autenticación
 */
router.use(authMiddleware);

/**
 * POST /api/sync/push
 * Enviar cambios locales al servidor (PUSH)
 * 
 * Body:
 * {
 *   "deviceId": "uuid-opcional",
 *   "items": [
 *     {
 *       "entityType": "gestante",
 *       "entityId": "uuid",
 *       "operation": "create|update|delete",
 *       "data": { ... },
 *       "version": 1,
 *       "localTimestamp": "2025-10-06T12:00:00Z"
 *     }
 *   ]
 * }
 */
router.post('/push', syncController.syncPush);

/**
 * POST /api/sync/pull
 * Descargar cambios desde el servidor (PULL)
 * 
 * Body:
 * {
 *   "deviceId": "uuid-opcional",
 *   "lastSyncTimestamp": "2025-10-06T12:00:00Z",
 *   "entityTypes": ["gestante", "control", "alerta"]
 * }
 */
router.post('/pull', syncController.syncPull);

/**
 * POST /api/sync/full
 * Sincronización completa (PUSH + PULL)
 * 
 * Body:
 * {
 *   "deviceId": "uuid-opcional",
 *   "items": [ ... ],
 *   "lastSyncTimestamp": "2025-10-06T12:00:00Z",
 *   "entityTypes": ["gestante", "control", "alerta"]
 * }
 */
router.post('/full', syncController.syncFull);

/**
 * GET /api/sync/status
 * Obtener estado de sincronización del usuario
 * 
 * Query params:
 * - deviceId: uuid-opcional
 */
router.get('/status', syncController.getSyncStatus);

/**
 * GET /api/sync/conflicts
 * Obtener conflictos pendientes de resolución
 */
router.get('/conflicts', syncController.getConflicts);

/**
 * POST /api/sync/conflicts/:conflictId/resolve
 * Resolver un conflicto de sincronización
 * 
 * Body:
 * {
 *   "resolution": "local_wins|server_wins|merge|manual",
 *   "mergedData": { ... } // Opcional, requerido para merge/manual
 * }
 */
router.post('/conflicts/:conflictId/resolve', syncController.resolveConflict);

/**
 * GET /api/sync/history
 * Obtener historial de sincronizaciones
 * 
 * Query params:
 * - limit: número (default: 10)
 * - deviceId: uuid-opcional
 */
router.get('/history', syncController.getSyncHistory);

/**
 * DELETE /api/sync/cleanup
 * Limpiar items sincronizados antiguos (solo admin)
 * 
 * Query params:
 * - daysOld: número (default: 30)
 */
router.delete('/cleanup', requireAdmin(), syncController.cleanupOldItems);

export default router;

