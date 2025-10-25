"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncStatusSchema = exports.resolverConflictoSchema = exports.syncPullSchema = exports.syncBatchSchema = exports.crearSyncQueueSchema = exports.SyncEntity = exports.SyncOperation = exports.SyncStatus = void 0;
const zod_1 = require("zod");
/**
 * Enums para sincronización
 */
var SyncStatus;
(function (SyncStatus) {
    SyncStatus["PENDING"] = "pending";
    SyncStatus["SYNCING"] = "syncing";
    SyncStatus["SYNCED"] = "synced";
    SyncStatus["FAILED"] = "failed";
    SyncStatus["CONFLICT"] = "conflict";
})(SyncStatus || (exports.SyncStatus = SyncStatus = {}));
var SyncOperation;
(function (SyncOperation) {
    SyncOperation["CREATE"] = "create";
    SyncOperation["UPDATE"] = "update";
    SyncOperation["DELETE"] = "delete";
})(SyncOperation || (exports.SyncOperation = SyncOperation = {}));
var SyncEntity;
(function (SyncEntity) {
    SyncEntity["GESTANTE"] = "gestante";
    SyncEntity["CONTROL"] = "control";
    SyncEntity["ALERTA"] = "alerta";
    SyncEntity["USUARIO"] = "usuario";
    SyncEntity["IPS"] = "ips";
    SyncEntity["MEDICO"] = "medico";
    SyncEntity["MUNICIPIO"] = "municipio";
})(SyncEntity || (exports.SyncEntity = SyncEntity = {}));
/**
 * Schema para crear item en cola de sincronización
 */
exports.crearSyncQueueSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    deviceId: zod_1.z.string().uuid().optional(),
    entityType: zod_1.z.nativeEnum(SyncEntity),
    entityId: zod_1.z.string().uuid(),
    operation: zod_1.z.nativeEnum(SyncOperation),
    data: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
    version: zod_1.z.number().int().min(1).default(1),
});
/**
 * Schema para sincronización batch (múltiples items)
 */
exports.syncBatchSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    deviceId: zod_1.z.string().uuid().optional(),
    items: zod_1.z.array(zod_1.z.object({
        entityType: zod_1.z.nativeEnum(SyncEntity),
        entityId: zod_1.z.string().uuid(),
        operation: zod_1.z.nativeEnum(SyncOperation),
        data: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
        version: zod_1.z.number().int().min(1).default(1),
        localTimestamp: zod_1.z.string().optional(),
    })).min(1, 'Debe haber al menos un item para sincronizar'),
});
/**
 * Schema para pull de datos (descargar cambios del servidor)
 */
exports.syncPullSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    deviceId: zod_1.z.string().uuid().optional(),
    lastSyncTimestamp: zod_1.z.string().optional(),
    entityTypes: zod_1.z.array(zod_1.z.nativeEnum(SyncEntity)).optional(),
});
/**
 * Schema para resolver conflicto
 */
exports.resolverConflictoSchema = zod_1.z.object({
    conflictId: zod_1.z.string().uuid('ID de conflicto inválido'),
    resolution: zod_1.z.enum(['local_wins', 'server_wins', 'merge', 'manual']),
    mergedData: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
});
/**
 * Schema para obtener estado de sincronización
 */
exports.syncStatusSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    deviceId: zod_1.z.string().uuid().optional(),
});
