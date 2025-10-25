# 🔐 Roles y Permisos - Madres Digitales

## Índice

1. [Roles del Sistema](#roles-del-sistema)
2. [Jerarquía de Roles](#jerarquía-de-roles)
3. [Permisos por Módulo](#permisos-por-módulo)
4. [Matriz de Permisos](#matriz-de-permisos)
5. [Uso de Middlewares](#uso-de-middlewares)
6. [Ejemplos de Implementación](#ejemplos-de-implementación)

---

## Roles del Sistema

### 1. Super Admin
**Nivel**: 5 (Máximo)

**Descripción**: Administrador del sistema con acceso total.

**Permisos**:
- ✅ Acceso completo a todos los módulos
- ✅ Gestión de usuarios (crear, editar, eliminar)
- ✅ Gestión de municipios
- ✅ Configuración del sistema
- ✅ Acceso a logs y auditoría
- ✅ Gestión de roles y permisos

### 2. Admin
**Nivel**: 4

**Descripción**: Administrador con permisos amplios pero limitados.

**Permisos**:
- ✅ Gestión de gestantes
- ✅ Gestión de controles prenatales
- ✅ Gestión de alertas
- ✅ Gestión de IPS y médicos
- ✅ Visualización de reportes
- ✅ Gestión de usuarios (excepto super_admin)
- ❌ Gestión de municipios
- ❌ Configuración del sistema

### 3. Coordinador
**Nivel**: 3

**Descripción**: Coordinador de un municipio o región.

**Permisos**:
- ✅ Visualización de gestantes de su municipio
- ✅ Visualización de controles prenatales
- ✅ Visualización de alertas
- ✅ Visualización de reportes y estadísticas
- ✅ Asignación de madrinas
- ❌ Gestión de usuarios
- ❌ Gestión de IPS y médicos
- ❌ Configuración del sistema

### 4. Madrina
**Nivel**: 2

**Descripción**: Madrina comunitaria que acompaña a gestantes.

**Permisos**:
- ✅ Gestión de gestantes asignadas
- ✅ Registro de controles prenatales
- ✅ Visualización de alertas de sus gestantes
- ✅ Gestión de IPS y médicos
- ❌ Visualización de reportes
- ❌ Gestión de usuarios
- ❌ Acceso a gestantes no asignadas

### 5. Médico
**Nivel**: 1

**Descripción**: Médico tratante de una IPS.

**Permisos**:
- ✅ Visualización de gestantes de su IPS
- ✅ Registro de controles prenatales
- ✅ Visualización de alertas
- ❌ Gestión de gestantes
- ❌ Gestión de IPS y médicos
- ❌ Visualización de reportes
- ❌ Gestión de usuarios

### 6. Gestante
**Nivel**: 0 (Mínimo)

**Descripción**: Mujer embarazada en el sistema.

**Permisos**:
- ✅ Visualización de sus propios datos
- ✅ Visualización de sus controles prenatales
- ✅ Visualización de sus alertas
- ✅ Visualización de contenido educativo
- ❌ Gestión de otros usuarios
- ❌ Acceso a datos de otras gestantes
- ❌ Visualización de reportes

---

## Jerarquía de Roles

```
┌─────────────────────────────────────┐
│         Super Admin (5)             │ ← Acceso total
├─────────────────────────────────────┤
│           Admin (4)                 │ ← Gestión completa
├─────────────────────────────────────┤
│        Coordinador (3)              │ ← Supervisión
├─────────────────────────────────────┤
│          Madrina (2)                │ ← Acompañamiento
├─────────────────────────────────────┤
│          Médico (1)                 │ ← Atención médica
├─────────────────────────────────────┤
│         Gestante (0)                │ ← Usuario final
└─────────────────────────────────────┘
```

---

## Permisos por Módulo

### Módulo: Gestantes

| Acción | Super Admin | Admin | Coordinador | Madrina | Médico | Gestante |
|--------|-------------|-------|-------------|---------|--------|----------|
| Crear | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Ver todas | ✅ | ✅ | ✅ (municipio) | ✅ (asignadas) | ✅ (IPS) | ❌ |
| Ver una | ✅ | ✅ | ✅ (municipio) | ✅ (asignada) | ✅ (IPS) | ✅ (propia) |
| Actualizar | ✅ | ✅ | ❌ | ✅ (asignada) | ❌ | ❌ |
| Eliminar | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Módulo: Controles Prenatales

| Acción | Super Admin | Admin | Coordinador | Madrina | Médico | Gestante |
|--------|-------------|-------|-------------|---------|--------|----------|
| Crear | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Ver todos | ✅ | ✅ | ✅ (municipio) | ✅ (asignadas) | ✅ (IPS) | ❌ |
| Ver uno | ✅ | ✅ | ✅ (municipio) | ✅ (asignada) | ✅ (IPS) | ✅ (propio) |
| Actualizar | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Eliminar | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Módulo: Alertas

| Acción | Super Admin | Admin | Coordinador | Madrina | Médico | Gestante |
|--------|-------------|-------|-------------|---------|--------|----------|
| Crear | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Ver todas | ✅ | ✅ | ✅ (municipio) | ✅ (asignadas) | ✅ (IPS) | ❌ |
| Ver una | ✅ | ✅ | ✅ (municipio) | ✅ (asignada) | ✅ (IPS) | ✅ (propia) |
| Resolver | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Eliminar | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Módulo: Reportes

| Acción | Super Admin | Admin | Coordinador | Madrina | Médico | Gestante |
|--------|-------------|-------|-------------|---------|--------|----------|
| Ver reportes | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Exportar | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

### Módulo: Usuarios

| Acción | Super Admin | Admin | Coordinador | Madrina | Médico | Gestante |
|--------|-------------|-------|-------------|---------|--------|----------|
| Crear | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver todos | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver uno | ✅ | ✅ | ❌ | ✅ (propio) | ✅ (propio) | ✅ (propio) |
| Actualizar | ✅ | ✅ | ❌ | ✅ (propio) | ✅ (propio) | ✅ (propio) |
| Eliminar | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Módulo: IPS y Médicos

| Acción | Super Admin | Admin | Coordinador | Madrina | Médico | Gestante |
|--------|-------------|-------|-------------|---------|--------|----------|
| Crear | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ver todos | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Ver uno | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Actualizar | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Eliminar | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Módulo: Municipios

| Acción | Super Admin | Admin | Coordinador | Madrina | Médico | Gestante |
|--------|-------------|-------|-------------|---------|--------|----------|
| Crear | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Ver todos | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Ver uno | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Actualizar | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Eliminar | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Uso de Middlewares

### Importar Middlewares

```typescript
import {
  requireRole,
  requireMinRole,
  requireSuperAdmin,
  requireAdmin,
  requireCoordinador,
  requireMadrina,
  requireOwnData,
  requireSameMunicipio,
  UsuarioRol,
} from '../middlewares/role.middleware';
```

### Ejemplos de Uso

#### 1. Requerir Rol Específico

```typescript
// Solo super_admin
router.delete('/municipios/:id',
  authenticateToken,
  requireSuperAdmin(),
  eliminarMunicipio
);

// Admin o super_admin
router.post('/usuarios',
  authenticateToken,
  requireAdmin(),
  crearUsuario
);

// Coordinador, admin o super_admin
router.get('/reportes',
  authenticateToken,
  requireCoordinador(),
  obtenerReportes
);

// Madrina, coordinador, admin o super_admin
router.post('/gestantes',
  authenticateToken,
  requireMadrina(),
  crearGestante
);
```

#### 2. Requerir Múltiples Roles

```typescript
router.post('/controles',
  authenticateToken,
  requireRole(UsuarioRol.MADRINA, UsuarioRol.MEDICO, UsuarioRol.ADMIN),
  crearControl
);
```

#### 3. Requerir Rol Mínimo

```typescript
// Requiere coordinador o superior
router.get('/estadisticas',
  authenticateToken,
  requireMinRole(UsuarioRol.COORDINADOR),
  obtenerEstadisticas
);
```

#### 4. Verificar Acceso a Propios Datos

```typescript
router.get('/usuarios/:id',
  authenticateToken,
  requireOwnData('id'),
  obtenerUsuario
);
```

#### 5. Verificar Acceso por Municipio

```typescript
router.get('/gestantes/municipio/:municipioId',
  authenticateToken,
  requireSameMunicipio('municipioId'),
  listarGestantes
);
```

---

## Ejemplos de Implementación

### Ejemplo 1: Rutas de Gestantes

```typescript
// src/routes/gestantes.routes.ts
import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireMadrina, requireAdmin } from '../middlewares/role.middleware';
import * as gestanteController from '../controllers/gestante.controller';

const router = Router();

// Crear gestante: Madrina o superior
router.post('/',
  authenticateToken,
  requireMadrina(),
  gestanteController.crear
);

// Listar gestantes: Madrina o superior
router.get('/',
  authenticateToken,
  requireMadrina(),
  gestanteController.listar
);

// Ver gestante: Madrina o superior
router.get('/:id',
  authenticateToken,
  requireMadrina(),
  gestanteController.obtenerPorId
);

// Actualizar gestante: Madrina o superior
router.put('/:id',
  authenticateToken,
  requireMadrina(),
  gestanteController.actualizar
);

// Eliminar gestante: Solo admin o super_admin
router.delete('/:id',
  authenticateToken,
  requireAdmin(),
  gestanteController.eliminar
);

export default router;
```

### Ejemplo 2: Rutas de Reportes

```typescript
// src/routes/reportes.routes.ts
import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireCoordinador } from '../middlewares/role.middleware';
import * as reporteController from '../controllers/reporte.controller';

const router = Router();

// Todos los endpoints de reportes requieren coordinador o superior
router.use(authenticateToken, requireCoordinador());

router.get('/resumen-general', reporteController.getResumenGeneral);
router.get('/estadisticas-gestantes', reporteController.getEstadisticasGestantes);
router.get('/estadisticas-controles', reporteController.getEstadisticasControles);
router.get('/estadisticas-alertas', reporteController.getEstadisticasAlertas);
router.get('/estadisticas-riesgo', reporteController.getEstadisticasRiesgo);
router.get('/tendencias', reporteController.getTendencias);

export default router;
```

### Ejemplo 3: Rutas de Usuarios

```typescript
// src/routes/usuarios.routes.ts
import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireAdmin, requireOwnData } from '../middlewares/role.middleware';
import * as usuarioController from '../controllers/usuario.controller';

const router = Router();

// Crear usuario: Solo admin o super_admin
router.post('/',
  authenticateToken,
  requireAdmin(),
  usuarioController.crear
);

// Listar usuarios: Solo admin o super_admin
router.get('/',
  authenticateToken,
  requireAdmin(),
  usuarioController.listar
);

// Ver usuario: Admin o el propio usuario
router.get('/:id',
  authenticateToken,
  requireOwnData('id'),
  usuarioController.obtenerPorId
);

// Actualizar usuario: Admin o el propio usuario
router.put('/:id',
  authenticateToken,
  requireOwnData('id'),
  usuarioController.actualizar
);

// Eliminar usuario: Solo admin o super_admin
router.delete('/:id',
  authenticateToken,
  requireAdmin(),
  usuarioController.eliminar
);

export default router;
```

---

## Conclusión

El sistema de roles y permisos proporciona:

✅ **Control de acceso granular**
✅ **Seguridad por capas**
✅ **Auditoría de accesos**
✅ **Fácil mantenimiento**
✅ **Escalabilidad**

