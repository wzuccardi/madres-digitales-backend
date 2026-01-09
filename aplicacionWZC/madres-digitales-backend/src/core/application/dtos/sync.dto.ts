import { z } from 'zod';

/**
 * Enums para sincronización
 */
export enum SyncStatus {
  PENDING = 'pending',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  FAILED = 'failed',
  CONFLICT = 'conflict',
}

export enum SyncOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum SyncEntity {
  GESTANTE = 'gestante',
  CONTROL = 'control',
  ALERTA = 'alerta',
  USUARIO = 'usuario',
  IPS = 'ips',
  MEDICO = 'medico',
  MUNICIPIO = 'municipio',
}

/**
 * Schema para crear item en cola de sincronización
 */
export const crearSyncQueueSchema = z.object({
  userId: z.string().uuid(),
  deviceId: z.string().uuid().optional(),
  entityType: z.nativeEnum(SyncEntity),
  entityId: z.string().uuid(),
  operation: z.nativeEnum(SyncOperation),
  data: z.record(z.string(), z.any()),
  version: z.number().int().min(1).default(1),
});

export type CrearSyncQueueDTO = z.infer<typeof crearSyncQueueSchema>;

/**
 * Schema para sincronización batch (múltiples items)
 */
export const syncBatchSchema = z.object({
  userId: z.string().uuid(),
  deviceId: z.string().uuid().optional(),
  items: z.array(
    z.object({
      entityType: z.nativeEnum(SyncEntity),
      entityId: z.string().uuid(),
      operation: z.nativeEnum(SyncOperation),
      data: z.record(z.string(), z.any()),
      version: z.number().int().min(1).default(1),
      localTimestamp: z.string().optional(),
    })
  ).min(1, 'Debe haber al menos un item para sincronizar'),
});

export type SyncBatchDTO = z.infer<typeof syncBatchSchema>;

/**
 * Schema para pull de datos (descargar cambios del servidor)
 */
export const syncPullSchema = z.object({
  userId: z.string().uuid(),
  deviceId: z.string().uuid().optional(),
  lastSyncTimestamp: z.string().optional(),
  entityTypes: z.array(z.nativeEnum(SyncEntity)).optional(),
});

export type SyncPullDTO = z.infer<typeof syncPullSchema>;

/**
 * Schema para resolver conflicto
 */
export const resolverConflictoSchema = z.object({
  conflictId: z.string().uuid('ID de conflicto inválido'),
  resolution: z.enum(['local_wins', 'server_wins', 'merge', 'manual']),
  mergedData: z.record(z.string(), z.any()).optional(),
});

export type ResolverConflictoDTO = z.infer<typeof resolverConflictoSchema>;

/**
 * Schema para obtener estado de sincronización
 */
export const syncStatusSchema = z.object({
  userId: z.string().uuid(),
  deviceId: z.string().uuid().optional(),
});

export type SyncStatusDTO = z.infer<typeof syncStatusSchema>;

/**
 * Interfaces para respuestas
 */
export interface SyncQueueItem {
  id: string;
  userId: string;
  deviceId?: string;
  entityType: SyncEntity;
  entityId: string;
  operation: SyncOperation;
  data: any;
  status: SyncStatus;
  version: number;
  conflictData?: any;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;
}

export interface SyncBatchResult {
  success: boolean;
  totalItems: number;
  syncedItems: number;
  failedItems: number;
  conflicts: number;
  items: Array<{
    entityType: SyncEntity;
    entityId: string;
    status: SyncStatus;
    errorMessage?: string;
    conflictId?: string;
  }>;
  syncLogId: string;
}

export interface SyncPullResult {
  success: boolean;
  lastSyncTimestamp: string;
  changes: {
    gestantes?: any[];
    controles?: any[];
    alertas?: any[];
    usuarios?: any[];
    ips?: any[];
    medicos?: any[];
    municipios?: any[];
  };
  deletedIds: {
    gestantes?: string[];
    controles?: string[];
    alertas?: string[];
    usuarios?: string[];
    ips?: string[];
    medicos?: string[];
    municipios?: string[];
  };
  totalChanges: number;
}

export interface SyncStatusResult {
  pendingItems: number;
  syncingItems: number;
  failedItems: number;
  conflicts: number;
  lastSyncTimestamp?: string;
  lastSyncStatus?: string;
  deviceInfo?: {
    id: string;
    lastSync?: Date;
    version?: string;
  };
}

export interface SyncConflict {
  id: string;
  entityType: SyncEntity;
  entityId: string;
  localVersion: number;
  serverVersion: number;
  localData: any;
  serverData: any;
  userId: string;
  deviceId?: string;
  resolved: boolean;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

export interface EntityVersion {
  id: string;
  entityType: SyncEntity;
  entityId: string;
  version: number;
  dataHash: string;
  updatedBy: string;
  updatedAt: Date;
}

export interface SyncLog {
  id: string;
  userId: string;
  deviceId?: string;
  syncType: string;
  entitiesSynced: number;
  entitiesFailed: number;
  conflicts: number;
  durationMs?: number;
  status: string;
  errorMessage?: string;
  metadata?: any;
  startedAt: Date;
  completedAt?: Date;
}

