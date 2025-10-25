"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const syncController = __importStar(require("../controllers/sync.controller"));
const router = (0, express_1.Router)();
/**
 * Todas las rutas de sincronización requieren autenticación
 */
router.use(auth_middleware_1.authMiddleware);
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
router.delete('/cleanup', (0, role_middleware_1.requireAdmin)(), syncController.cleanupOldItems);
exports.default = router;
