# 🔄 Sistema de Sincronización Offline - Madres Digitales

## Índice

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Modelos de Datos](#modelos-de-datos)
4. [API Endpoints](#api-endpoints)
5. [Flujos de Sincronización](#flujos-de-sincronización)
6. [Manejo de Conflictos](#manejo-de-conflictos)
7. [Ejemplos de Uso](#ejemplos-de-uso)

---

## Descripción General

El sistema de sincronización offline permite a las madrinas trabajar sin conexión a internet y sincronizar sus cambios cuando recuperan la conectividad.

### Características Principales

✅ **Sincronización Bidireccional**: Push (cliente → servidor) y Pull (servidor → cliente)
✅ **Detección de Conflictos**: Versionado optimista con resolución de conflictos
✅ **Queue de Sincronización**: Cola de cambios pendientes con reintentos automáticos
✅ **Sincronización Batch**: Múltiples cambios en una sola petición
✅ **Historial de Sincronización**: Logs detallados de todas las sincronizaciones
✅ **Limpieza Automática**: Eliminación de datos antiguos sincronizados

---

## Arquitectura

### Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Flutter)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   SQLite     │  │  Sync Queue  │  │ Conflict UI  │      │
│  │   Local DB   │  │   Manager    │  │   Resolver   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/JSON
┌─────────────────────────────────────────────────────────────┐
│                   SERVIDOR (Node.js)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Sync Service │  │  PostgreSQL  │  │  Sync Queue  │      │
│  │              │  │   Database   │  │    Table     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Entity Version│  │ Sync Conflict│  │   Sync Log   │      │
│  │    Table     │  │    Table     │  │    Table     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Estrategia de Sincronización

1. **Optimistic Locking**: Cada entidad tiene un número de versión
2. **Conflict Detection**: Comparación de versiones local vs servidor
3. **Conflict Resolution**: Manual, automática o merge
4. **Retry Logic**: Reintentos automáticos con backoff exponencial

---

## Modelos de Datos

### SyncQueue

Cola de cambios pendientes de sincronización.

```typescript
{
  id: string;              // UUID
  user_id: string;         // Usuario que hizo el cambio
  device_id?: string;      // Dispositivo origen
  entity_type: SyncEntity; // gestante, control, alerta, etc.
  entity_id: string;       // ID de la entidad
  operation: SyncOperation;// create, update, delete
  data: object;            // Datos a sincronizar
  status: SyncStatus;      // pending, syncing, synced, failed, conflict
  version: number;         // Versión de la entidad
  conflict_data?: object;  // Datos en conflicto
  error_message?: string;  // Mensaje de error
  retry_count: number;     // Número de reintentos
  max_retries: number;     // Máximo de reintentos (default: 3)
  created_at: Date;
  updated_at: Date;
  synced_at?: Date;
}
```

### EntityVersion

Tracking de versiones para optimistic locking.

```typescript
{
  id: string;
  entity_type: SyncEntity;
  entity_id: string;
  version: number;         // Versión actual
  data_hash: string;       // Hash MD5 de los datos
  updated_by: string;      // Usuario que actualizó
  updated_at: Date;
}
```

### SyncConflict

Registro de conflictos de sincronización.

```typescript
{
  id: string;
  entity_type: SyncEntity;
  entity_id: string;
  local_version: number;
  server_version: number;
  local_data: object;      // Datos del cliente
  server_data: object;     // Datos del servidor
  user_id: string;
  device_id?: string;
  resolved: boolean;
  resolution?: string;     // local_wins, server_wins, merge, manual
  resolved_by?: string;
  resolved_at?: Date;
  created_at: Date;
}
```

### SyncLog

Historial de sincronizaciones.

```typescript
{
  id: string;
  user_id: string;
  device_id?: string;
  sync_type: string;       // full, incremental, push, pull
  entities_synced: number;
  entities_failed: number;
  conflicts: number;
  duration_ms?: number;
  status: string;          // success, partial, failed
  error_message?: string;
  metadata?: object;
  started_at: Date;
  completed_at?: Date;
}
```

---

## API Endpoints

### POST /api/sync/push

Enviar cambios locales al servidor.

**Request:**
```json
{
  "deviceId": "uuid-opcional",
  "items": [
    {
      "entityType": "gestante",
      "entityId": "uuid",
      "operation": "create",
      "data": {
        "nombre": "María García",
        "documento": "1234567890",
        ...
      },
      "version": 1,
      "localTimestamp": "2025-10-06T12:00:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sincronización completada exitosamente",
  "data": {
    "totalItems": 1,
    "syncedItems": 1,
    "failedItems": 0,
    "conflicts": 0,
    "items": [
      {
        "entityType": "gestante",
        "entityId": "uuid",
        "status": "synced"
      }
    ],
    "syncLogId": "uuid"
  }
}
```

### POST /api/sync/pull

Descargar cambios desde el servidor.

**Request:**
```json
{
  "deviceId": "uuid-opcional",
  "lastSyncTimestamp": "2025-10-06T12:00:00Z",
  "entityTypes": ["gestante", "control", "alerta"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cambios descargados exitosamente",
  "data": {
    "lastSyncTimestamp": "2025-10-06T13:00:00Z",
    "changes": {
      "gestantes": [...],
      "controles": [...],
      "alertas": [...]
    },
    "deletedIds": {
      "gestantes": ["uuid1", "uuid2"]
    },
    "totalChanges": 15
  }
}
```

### POST /api/sync/full

Sincronización completa (PUSH + PULL).

**Request:**
```json
{
  "deviceId": "uuid-opcional",
  "items": [...],
  "lastSyncTimestamp": "2025-10-06T12:00:00Z",
  "entityTypes": ["gestante", "control", "alerta"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sincronización completa exitosa",
  "data": {
    "push": { ... },
    "pull": { ... },
    "durationMs": 1234
  }
}
```

### GET /api/sync/status

Obtener estado de sincronización.

**Query Params:**
- `deviceId`: UUID del dispositivo (opcional)

**Response:**
```json
{
  "success": true,
  "data": {
    "pendingItems": 5,
    "syncingItems": 0,
    "failedItems": 2,
    "conflicts": 1,
    "lastSyncTimestamp": "2025-10-06T12:00:00Z",
    "lastSyncStatus": "success",
    "deviceInfo": {
      "id": "uuid",
      "lastSync": "2025-10-06T12:00:00Z",
      "version": "1.0.0"
    }
  }
}
```

### GET /api/sync/conflicts

Obtener conflictos pendientes.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "entityType": "gestante",
      "entityId": "uuid",
      "localVersion": 2,
      "serverVersion": 3,
      "localData": { ... },
      "serverData": { ... },
      "createdAt": "2025-10-06T12:00:00Z"
    }
  ],
  "total": 1
}
```

### POST /api/sync/conflicts/:conflictId/resolve

Resolver un conflicto.

**Request:**
```json
{
  "resolution": "local_wins",
  "mergedData": { ... }
}
```

**Opciones de resolución:**
- `local_wins`: Usar datos del cliente
- `server_wins`: Usar datos del servidor
- `merge`: Usar datos merged (requiere mergedData)
- `manual`: Resolución manual (requiere mergedData)

**Response:**
```json
{
  "success": true,
  "message": "Conflicto resuelto exitosamente"
}
```

### GET /api/sync/history

Obtener historial de sincronizaciones.

**Query Params:**
- `limit`: Número de registros (default: 10)
- `deviceId`: UUID del dispositivo (opcional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "syncType": "full",
      "entitiesSynced": 10,
      "entitiesFailed": 0,
      "conflicts": 0,
      "durationMs": 1234,
      "status": "success",
      "startedAt": "2025-10-06T12:00:00Z",
      "completedAt": "2025-10-06T12:00:01Z"
    }
  ],
  "total": 1
}
```

---

## Flujos de Sincronización

### Flujo 1: Sincronización Inicial

```
1. Usuario instala la app
2. Usuario hace login
3. App ejecuta PULL completo
4. Descarga todas las entidades relevantes
5. Guarda en SQLite local
6. Marca timestamp de última sincronización
```

### Flujo 2: Trabajo Offline

```
1. Usuario pierde conectividad
2. App detecta offline
3. Usuario crea/modifica datos
4. Cambios se guardan en SQLite local
5. Cambios se agregan a SyncQueue local
6. UI muestra indicador de "pendiente de sincronización"
```

### Flujo 3: Sincronización Automática

```
1. App detecta conectividad
2. App ejecuta PUSH de cambios pendientes
3. Servidor procesa cada cambio
4. Si hay conflictos, se registran
5. App ejecuta PULL de cambios del servidor
6. App actualiza SQLite local
7. UI muestra "sincronizado"
```

### Flujo 4: Resolución de Conflictos

```
1. Usuario ve notificación de conflicto
2. Usuario abre pantalla de conflictos
3. Usuario ve datos local vs servidor
4. Usuario elige resolución:
   - Mantener local
   - Usar servidor
   - Merge manual
5. App envía resolución al servidor
6. Servidor aplica resolución
7. Conflicto marcado como resuelto
```

---

## Manejo de Conflictos

### Detección de Conflictos

Un conflicto ocurre cuando:
- Versión local < Versión servidor
- Ambas versiones tienen cambios diferentes

### Estrategias de Resolución

#### 1. Local Wins
```typescript
// El cliente tiene la razón
finalData = conflict.local_data;
```

#### 2. Server Wins
```typescript
// El servidor tiene la razón
finalData = conflict.server_data;
```

#### 3. Merge Automático
```typescript
// Combinar cambios no conflictivos
finalData = {
  ...conflict.server_data,
  ...conflict.local_data,
};
```

#### 4. Merge Manual
```typescript
// Usuario decide campo por campo
finalData = userMergedData;
```

---

## Ejemplos de Uso

### Ejemplo 1: Crear Gestante Offline

```typescript
// Cliente (Flutter)
const gestante = {
  id: uuid(),
  nombre: "María García",
  documento: "1234567890",
  ...
};

// Guardar en SQLite local
await db.insert('gestantes', gestante);

// Agregar a queue de sincronización
await db.insert('sync_queue', {
  entityType: 'gestante',
  entityId: gestante.id,
  operation: 'create',
  data: gestante,
  version: 1,
  status: 'pending',
});

// Cuando hay conexión, sincronizar
const response = await api.post('/sync/push', {
  items: [
    {
      entityType: 'gestante',
      entityId: gestante.id,
      operation: 'create',
      data: gestante,
      version: 1,
    },
  ],
});
```

### Ejemplo 2: Sincronización Completa

```typescript
// Cliente (Flutter)
const lastSync = await getLastSyncTimestamp();

const response = await api.post('/sync/full', {
  deviceId: await getDeviceId(),
  items: await getPendingChanges(),
  lastSyncTimestamp: lastSync,
  entityTypes: ['gestante', 'control', 'alerta'],
});

// Aplicar cambios del servidor
await applyServerChanges(response.data.pull.changes);
await deleteLocalItems(response.data.pull.deletedIds);

// Actualizar timestamp
await setLastSyncTimestamp(response.data.pull.lastSyncTimestamp);
```

---

## Conclusión

El sistema de sincronización offline proporciona:

✅ **Trabajo sin conexión** para madrinas en zonas rurales
✅ **Sincronización automática** cuando hay conectividad
✅ **Detección y resolución de conflictos** robusta
✅ **Historial completo** de sincronizaciones
✅ **Escalabilidad** para miles de dispositivos

**Próximos pasos**: Implementar cliente Flutter con SQLite y lógica de sincronización.

