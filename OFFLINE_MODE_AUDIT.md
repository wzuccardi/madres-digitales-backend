# 🔍 Auditoría del Modo Offline - Madres Digitales

## 📋 Estado Actual del Sistema Offline

### ✅ Componentes Existentes

#### 1. Servicio de Sincronización
**Archivo:** `lib/data/services/sync_service.dart`

**Funcionalidades Implementadas:**
- ✅ Detección de conectividad con `connectivity_plus`
- ✅ Sincronización automática periódica (cada 5 minutos)
- ✅ Cola de operaciones pendientes
- ✅ Sincronización de gestantes, controles y contenido
- ✅ Estados de sincronización (idle, syncing, success, error, offline)
- ✅ Stream de cambios de estado

**Tipos de Operaciones en Cola:**
- ✅ `alertas_create` - Crear alertas
- ✅ `alertas_resolver` - Resolver alertas
- ✅ `alertas_leida` - Marcar alertas como leídas
- ✅ `controles_create` - Crear controles
- ✅ `controles_create_eval` - Crear controles con evaluación MEOWS
- ✅ `controles_update` - Actualizar controles
- ✅ `controles_delete` - Eliminar controles
- ✅ `medicos_create` - Crear médicos
- ✅ `medicos_update` - Actualizar médicos
- ✅ `medicos_delete` - Eliminar médicos
- ✅ `medicos_toggle` - Activar/desactivar médicos

#### 2. Indicador de Conectividad
**Archivo:** `lib/presentation/widgets/layout/main_layout.dart`

**Características:**
- ✅ Indicador visual en la parte inferior de la pantalla
- ✅ Código de colores:
  - 🟠 Naranja: Sin conexión
  - 🔵 Azul: Sincronizando
  - 🟢 Verde: Conectado
- ✅ Botón "Sincronizar" cuando está offline
- ✅ Actualización en tiempo real del estado

#### 3. Almacenamiento Local
**Servicio:** `ApiService` con soporte de caché

**Funcionalidades:**
- ✅ Almacenamiento de datos en memoria
- ✅ Listas pendientes de sincronización
- ✅ Métodos `getList()` y `setList()` para persistencia

---

## ⚠️ Problemas Identificados

### 1. Almacenamiento No Persistente 🔴 CRÍTICO
**Problema:** Los datos se almacenan solo en memoria, se pierden al cerrar la app
**Impacto:** Las madrinas pierden todos los datos ingresados offline si cierran la app
**Solución Requerida:** Implementar almacenamiento persistente con SQLite o Hive

### 2. Sin Base de Datos Local 🔴 CRÍTICO
**Problema:** No hay base de datos local para almacenar datos offline
**Impacto:** No se pueden consultar datos históricos sin conexión
**Solución Requerida:** Implementar base de datos local (sqflite o drift)

### 3. Sincronización Unidireccional 🟠 IMPORTANTE
**Problema:** Solo sincroniza de local a servidor, no descarga datos nuevos del servidor
**Impacto:** Datos actualizados por otros usuarios no se reflejan
**Solución Requerida:** Implementar sincronización bidireccional

### 4. Sin Resolución de Conflictos 🟠 IMPORTANTE
**Problema:** No maneja conflictos cuando el mismo registro se modifica offline y online
**Impacto:** Puede sobrescribir cambios importantes
**Solución Requerida:** Implementar estrategia de resolución de conflictos

### 5. Sin Indicador de Datos Pendientes 🟡 MENOR
**Problema:** No muestra cuántos elementos están pendientes de sincronizar
**Impacto:** Usuario no sabe si hay datos sin sincronizar
**Solución Requerida:** Agregar contador de elementos pendientes

### 6. Sin Notificación de Sincronización Exitosa 🟡 MENOR
**Problema:** No notifica al usuario cuando la sincronización se completa
**Impacto:** Usuario no sabe si sus datos se guardaron correctamente
**Solución Requerida:** Agregar notificaciones/snackbars

### 7. Sin Validación de Integridad 🟡 MENOR
**Problema:** No valida que los datos sincronizados sean correctos
**Impacto:** Datos corruptos pueden sincronizarse
**Solución Requerida:** Agregar validación antes de sincronizar

---

## 🎯 Plan de Mejora del Modo Offline

### Fase 1: Almacenamiento Persistente (CRÍTICO)

#### 1.1 Implementar Base de Datos Local
**Tecnología:** `sqflite` o `drift`
**Tablas Necesarias:**
- `gestantes_local`
- `controles_local`
- `alertas_local`
- `sync_queue` - Cola de operaciones pendientes
- `sync_log` - Historial de sincronizaciones

#### 1.2 Migrar Almacenamiento en Memoria a SQLite
**Cambios:**
- Reemplazar `getList()`/`setList()` por queries SQL
- Implementar DAOs (Data Access Objects)
- Agregar índices para búsquedas rápidas

### Fase 2: Sincronización Bidireccional (IMPORTANTE)

#### 2.1 Descargar Datos del Servidor
**Funcionalidades:**
- Descargar gestantes asignadas a la madrina
- Descargar controles recientes
- Descargar alertas activas
- Actualizar datos locales con cambios del servidor

#### 2.2 Resolución de Conflictos
**Estrategias:**
- **Last Write Wins:** El último cambio gana (simple)
- **Server Wins:** El servidor siempre gana (seguro)
- **Manual Resolution:** Mostrar conflictos al usuario (complejo)

### Fase 3: Mejoras de UX (MENOR)

#### 3.1 Indicadores Mejorados
- Contador de elementos pendientes
- Barra de progreso durante sincronización
- Timestamp de última sincronización exitosa

#### 3.2 Notificaciones
- Snackbar cuando sincronización completa
- Alerta cuando hay muchos elementos pendientes
- Notificación cuando se recupera conectividad

#### 3.3 Modo Offline Explícito
- Botón para activar "Modo Offline" manualmente
- Indicador claro de que se está trabajando offline
- Advertencia antes de realizar operaciones críticas offline

---

## 📊 Comparación: Estado Actual vs Ideal

| Característica | Estado Actual | Estado Ideal |
|----------------|---------------|--------------|
| Almacenamiento | ⚠️ Memoria (volátil) | ✅ SQLite (persistente) |
| Base de datos local | ❌ No existe | ✅ Completa con índices |
| Sincronización | ⚠️ Unidireccional | ✅ Bidireccional |
| Conflictos | ❌ No maneja | ✅ Resuelve automáticamente |
| Indicador visual | ✅ Básico | ✅ Completo con contador |
| Notificaciones | ❌ No tiene | ✅ Snackbars y alertas |
| Validación | ❌ No valida | ✅ Valida antes de sync |
| Historial | ❌ No guarda | ✅ Log completo |
| Consultas offline | ⚠️ Limitadas | ✅ Completas |
| Performance | ⚠️ Lenta (memoria) | ✅ Rápida (índices) |

---

## 🚀 Implementación Recomendada

### Prioridad 1: CRÍTICO (Implementar Ya)
1. ✅ Implementar base de datos local con sqflite
2. ✅ Migrar almacenamiento de memoria a SQLite
3. ✅ Implementar persistencia de cola de sincronización
4. ✅ Agregar sincronización bidireccional básica

### Prioridad 2: IMPORTANTE (Implementar Pronto)
1. ✅ Implementar resolución de conflictos (Last Write Wins)
2. ✅ Agregar contador de elementos pendientes
3. ✅ Mejorar indicador de conectividad
4. ✅ Agregar notificaciones de sincronización

### Prioridad 3: MENOR (Implementar Después)
1. 🔄 Agregar validación de integridad
2. 🔄 Implementar historial de sincronizaciones
3. 🔄 Agregar modo offline explícito
4. 🔄 Optimizar performance con índices

---

## 📝 Código de Ejemplo: Base de Datos Local

```dart
// lib/data/database/app_database.dart
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class AppDatabase {
  static Database? _database;
  
  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }
  
  Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'madres_digitales.db');
    
    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        // Tabla de gestantes locales
        await db.execute('''
          CREATE TABLE gestantes_local (
            id TEXT PRIMARY KEY,
            nombre TEXT NOT NULL,
            documento TEXT,
            telefono TEXT,
            municipio_id TEXT,
            fecha_nacimiento TEXT,
            fecha_probable_parto TEXT,
            riesgo_alto INTEGER DEFAULT 0,
            activa INTEGER DEFAULT 1,
            synced INTEGER DEFAULT 0,
            created_at TEXT,
            updated_at TEXT
          )
        ''');
        
        // Tabla de controles locales
        await db.execute('''
          CREATE TABLE controles_local (
            id TEXT PRIMARY KEY,
            gestante_id TEXT NOT NULL,
            fecha_control TEXT NOT NULL,
            semanas_gestacion INTEGER,
            peso REAL,
            presion_sistolica INTEGER,
            presion_diastolica INTEGER,
            frecuencia_cardiaca INTEGER,
            temperatura REAL,
            meows_score INTEGER,
            meows_alert_level TEXT,
            observaciones TEXT,
            synced INTEGER DEFAULT 0,
            created_at TEXT,
            updated_at TEXT,
            FOREIGN KEY (gestante_id) REFERENCES gestantes_local(id)
          )
        ''');
        
        // Tabla de cola de sincronización
        await db.execute('''
          CREATE TABLE sync_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            operation_type TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            data TEXT NOT NULL,
            attempts INTEGER DEFAULT 0,
            max_attempts INTEGER DEFAULT 3,
            created_at TEXT,
            last_attempt_at TEXT,
            error_message TEXT
          )
        ''');
        
        // Índices para búsquedas rápidas
        await db.execute('CREATE INDEX idx_gestantes_synced ON gestantes_local(synced)');
        await db.execute('CREATE INDEX idx_controles_gestante ON controles_local(gestante_id)');
        await db.execute('CREATE INDEX idx_sync_queue_type ON sync_queue(operation_type)');
      },
    );
  }
}
```

---

## ✅ Conclusión

El sistema offline actual tiene una **base funcional** pero requiere mejoras críticas:

**Fortalezas:**
- ✅ Detección de conectividad funciona
- ✅ Indicador visual implementado
- ✅ Cola de operaciones básica existe
- ✅ Sincronización automática configurada

**Debilidades Críticas:**
- ❌ Sin almacenamiento persistente
- ❌ Sin base de datos local
- ❌ Sincronización unidireccional
- ❌ Sin resolución de conflictos

**Recomendación:** Implementar **Fase 1 (Almacenamiento Persistente)** de inmediato para evitar pérdida de datos.

---

**Fecha de Auditoría:** 2025-01-XX
**Estado:** 🟠 FUNCIONAL PERO REQUIERE MEJORAS CRÍTICAS
**Prioridad:** 🔴 ALTA
