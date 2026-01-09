# 🔐 Matriz de Permisos - Sistema Madres Digitales

## 📋 Jerarquía de Roles

```
Super Admin
    ↓
  Admin
    ↓
Coordinador
    ↓
Médico / Madrina
```

---

## 🎯 Matriz de Permisos por Rol

### 1. 👑 SUPER ADMINISTRADOR

**Puede Crear:**
- ✅ Super Administradores
- ✅ Administradores
- ✅ Coordinadores
- ✅ Médicos
- ✅ Madrinas
- ✅ IPS
- ✅ Municipios

**Puede Ver:**
- ✅ Todo el sistema
- ✅ Todos los usuarios
- ✅ Todas las gestantes
- ✅ Todos los controles
- ✅ Todas las alertas
- ✅ Todos los reportes

**Puede Editar:**
- ✅ Todo

**Puede Eliminar:**
- ✅ Todo (con confirmación)

**Funciones Especiales:**
- ✅ Configuración del sistema
- ✅ Gestión de municipios
- ✅ Asignación de coordinadores a municipios
- ✅ Auditoría completa

---

### 2. 👨‍💼 ADMINISTRADOR

**Puede Crear:**
- ✅ Administradores
- ✅ Coordinadores
- ✅ Médicos
- ✅ Madrinas
- ✅ IPS
- ✅ Gestantes
- ✅ Controles
- ✅ Alertas

**Puede Ver:**
- ✅ Usuarios (excepto super admins)
- ✅ Todas las gestantes de su municipio
- ✅ Todos los controles de su municipio
- ✅ Todas las alertas de su municipio
- ✅ Reportes de su municipio
- ✅ IPS de su municipio
- ✅ Médicos de su municipio

**Puede Editar:**
- ✅ Usuarios que creó
- ✅ Gestantes de su municipio
- ✅ Controles de su municipio
- ✅ Alertas de su municipio
- ✅ IPS de su municipio

**Puede Eliminar:**
- ✅ Usuarios que creó (excepto admins)
- ✅ Gestantes de su municipio
- ✅ Controles de su municipio

**Funciones Especiales:**
- ✅ Asignar gestantes a madrinas
- ✅ Asignar madrinas a coordinadores
- ✅ Dashboard de su municipio
- ✅ Reportes avanzados

---

### 3. 👥 COORDINADOR

**Puede Crear:**
- ✅ Madrinas (de su municipio)
- ✅ Gestantes
- ✅ Controles
- ✅ Alertas

**Puede Ver:**
- ✅ Madrinas asignadas a él
- ✅ Gestantes de sus madrinas
- ✅ Controles de sus gestantes
- ✅ Alertas de sus gestantes
- ✅ Médicos (solo lectura)
- ✅ IPS (solo lectura)
- ✅ Reportes de sus madrinas

**Puede Editar:**
- ✅ Gestantes de sus madrinas
- ✅ Controles de sus gestantes
- ✅ Alertas de sus gestantes

**Puede Eliminar:**
- ⚠️ Limitado (solo con aprobación)

**Funciones Especiales:**
- ✅ Asignar gestantes a madrinas (de su equipo)
- ✅ Dashboard de su equipo
- ✅ Reportes de su equipo

---

### 4. 👨‍⚕️ MÉDICO

**Puede Crear:**
- ✅ Controles (de sus pacientes)
- ✅ Alertas (de sus pacientes)

**Puede Ver:**
- ✅ Gestantes asignadas a él
- ✅ Controles de sus pacientes
- ✅ Alertas de sus pacientes
- ✅ Otros médicos (solo lectura)
- ✅ IPS (solo lectura)
- ✅ Historial médico completo

**Puede Editar:**
- ✅ Controles que creó
- ✅ Alertas que creó
- ✅ Su perfil

**Puede Eliminar:**
- ❌ No puede eliminar

**Funciones Especiales:**
- ✅ Evaluación MEOWS
- ✅ Prescripciones
- ✅ Derivaciones a IPS

---

### 5. 👩‍🍼 MADRINA

**Puede Crear:**
- ✅ Gestantes (asignadas a ella)
- ✅ Controles (de sus gestantes)
- ✅ Alertas (de sus gestantes)
- ✅ Alertas SOS

**Puede Ver:**
- ✅ Gestantes asignadas a ella
- ✅ Controles de sus gestantes
- ✅ Alertas de sus gestantes
- ✅ Contenido educativo
- ✅ Su perfil

**Puede Editar:**
- ✅ Gestantes asignadas a ella
- ✅ Controles que creó
- ✅ Su perfil

**Puede Eliminar:**
- ❌ No puede eliminar

**Funciones Especiales:**
- ✅ Botón SOS
- ✅ Modo offline
- ✅ Sincronización
- ✅ Notificaciones push

---

## 📊 Tabla Resumen de Permisos

| Acción | Super Admin | Admin | Coordinador | Médico | Madrina |
|--------|-------------|-------|-------------|--------|---------|
| **USUARIOS** |
| Crear Super Admin | ✅ | ❌ | ❌ | ❌ | ❌ |
| Crear Admin | ✅ | ✅ | ❌ | ❌ | ❌ |
| Crear Coordinador | ✅ | ✅ | ❌ | ❌ | ❌ |
| Crear Médico | ✅ | ✅ | ❌ | ❌ | ❌ |
| Crear Madrina | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ver Usuarios | ✅ | ✅ | ⚠️ | ⚠️ | ❌ |
| Editar Usuarios | ✅ | ✅ | ⚠️ | ❌ | ❌ |
| Eliminar Usuarios | ✅ | ✅ | ❌ | ❌ | ❌ |
| **GESTANTES** |
| Crear Gestante | ✅ | ✅ | ✅ | ❌ | ✅ |
| Ver Gestantes | ✅ | ✅ | ✅ | ✅ | ✅ |
| Editar Gestante | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| Eliminar Gestante | ✅ | ✅ | ⚠️ | ❌ | ❌ |
| Asignar a Madrina | ✅ | ✅ | ✅ | ❌ | ❌ |
| **CONTROLES** |
| Crear Control | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver Controles | ✅ | ✅ | ✅ | ✅ | ✅ |
| Editar Control | ✅ | ✅ | ✅ | ✅ | ✅ |
| Eliminar Control | ✅ | ✅ | ⚠️ | ❌ | ❌ |
| **ALERTAS** |
| Crear Alerta | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver Alertas | ✅ | ✅ | ✅ | ✅ | ✅ |
| Resolver Alerta | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Eliminar Alerta | ✅ | ✅ | ⚠️ | ❌ | ❌ |
| **IPS** |
| Crear IPS | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver IPS | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Editar IPS | ✅ | ✅ | ❌ | ❌ | ❌ |
| Eliminar IPS | ✅ | ✅ | ❌ | ❌ | ❌ |
| **MÉDICOS** |
| Crear Médico | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver Médicos | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Editar Médico | ✅ | ✅ | ❌ | ⚠️ | ❌ |
| Eliminar Médico | ✅ | ✅ | ❌ | ❌ | ❌ |
| **REPORTES** |
| Ver Reportes | ✅ | ✅ | ✅ | ⚠️ | ❌ |
| Exportar Reportes | ✅ | ✅ | ✅ | ⚠️ | ❌ |
| **SISTEMA** |
| Configuración | ✅ | ⚠️ | ❌ | ❌ | ❌ |
| Municipios | ✅ | ❌ | ❌ | ❌ | ❌ |
| Auditoría | ✅ | ✅ | ❌ | ❌ | ❌ |

**Leyenda:**
- ✅ = Permitido
- ❌ = No permitido
- ⚠️ = Permitido con restricciones

---

## 🔒 Reglas de Negocio

### Creación de Usuarios

1. **Super Admin puede crear:**
   - Cualquier tipo de usuario
   - Sin restricciones de municipio

2. **Admin puede crear:**
   - Otros admins (mismo nivel)
   - Coordinadores de su municipio
   - Médicos de su municipio
   - Madrinas de su municipio
   - IPS de su municipio

3. **Coordinador puede crear:**
   - Solo madrinas de su municipio
   - Gestantes para sus madrinas

### Asignación de Gestantes

1. **Admin puede asignar:**
   - Cualquier gestante de su municipio
   - A cualquier madrina de su municipio

2. **Coordinador puede asignar:**
   - Gestantes a madrinas de su equipo
   - Solo madrinas asignadas a él

3. **Restricciones:**
   - Una gestante solo puede tener una madrina activa
   - No se puede reasignar sin desasignar primero
   - Historial de asignaciones se mantiene

### Visibilidad de Datos

1. **Por Municipio:**
   - Admin ve todo su municipio
   - Coordinador ve su equipo
   - Médico ve sus pacientes
   - Madrina ve sus gestantes

2. **Por Jerarquía:**
   - Superior ve datos de inferiores
   - Inferior NO ve datos de superiores
   - Mismo nivel NO ve datos entre sí (excepto admins)

---

## 🛠️ Implementación Técnica

### Backend - Middleware de Permisos

```javascript
// Verificar si puede crear usuario
function canCreateUser(creatorRole, targetRole) {
  const hierarchy = {
    'super_admin': ['super_admin', 'admin', 'coordinador', 'medico', 'madrina'],
    'admin': ['admin', 'coordinador', 'medico', 'madrina'],
    'coordinador': ['madrina'],
  };
  
  return hierarchy[creatorRole]?.includes(targetRole) || false;
}

// Verificar si puede asignar gestante
function canAssignGestante(userRole) {
  return ['super_admin', 'admin', 'coordinador'].includes(userRole);
}
```

### Frontend - RouteGuard

```dart
// Verificar permisos en rutas
RouteGuard(
  allowedRoles: [
    AppConstants.superAdminRole,
    AppConstants.adminRole,
    AppConstants.coordinatorRole,
  ],
  child: AssignGestantePage(),
)
```

---

## 📝 Casos de Uso

### Caso 1: Admin Crea Coordinador
1. Admin inicia sesión
2. Va a `/usuarios/nuevo`
3. Selecciona rol "Coordinador"
4. Asigna municipio (solo su municipio)
5. ✅ Sistema permite creación

### Caso 2: Coordinador Asigna Gestante
1. Coordinador inicia sesión
2. Va a `/gestantes/asignar`
3. Selecciona gestante
4. Ve solo madrinas de su equipo
5. Asigna madrina
6. ✅ Sistema permite asignación

### Caso 3: Coordinador Intenta Crear Médico
1. Coordinador inicia sesión
2. Intenta ir a `/medicos/nuevo`
3. ❌ Sistema bloquea acceso
4. Muestra mensaje: "No tiene permisos"

---

**Fecha de Creación:** 2025-01-XX
**Versión:** 1.0.0
**Estado:** 📋 DOCUMENTADO - PENDIENTE IMPLEMENTACIÓN
