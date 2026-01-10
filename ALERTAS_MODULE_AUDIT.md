# 🔍 Auditoría del Módulo de Alertas

## 📋 Problemas Encontrados

### 1. 🔴 CRÍTICO: IPS y Médicos Restringidos Solo a Admins

**Ubicación:** `lib/core/router/app_router.dart`

**Problema:**
```dart
GoRoute(
  path: '/medicos',
  builder: (context, state) => const MainLayout(
    child: RouteGuard(
      allowedRoles: [AppConstants.adminRole, AppConstants.superAdminRole], // ❌ Solo admins
      child: MedicosScreen()
    ),
  ),
),
```

**Impacto:**
- ❌ Coordinadores no pueden ver médicos
- ❌ Madrinas no pueden ver médicos
- ❌ Médicos no pueden ver su propia información
- ❌ Similar problema con IPS

**Solución:**
Permitir acceso a coordinadores y médicos también:
```dart
allowedRoles: [
  AppConstants.adminRole,
  AppConstants.superAdminRole,
  AppConstants.coordinatorRole,
  AppConstants.medicoRole,
]
```

### 2. 🟠 IMPORTANTE: Formulario de Alertas Incompleto

**Ubicación:** `lib/features/alertas/presentation/pages/alerta_form_page.dart`

**Problemas:**
1. ❌ No permite seleccionar médico asignado
2. ❌ No permite seleccionar IPS derivada
3. ❌ No permite agregar síntomas
4. ❌ No permite agregar coordenadas GPS
5. ❌ Tipos de alerta hardcodeados y desactualizados
6. ❌ No usa el sistema de evaluación automática

**Campos Faltantes:**
- `madrina_id` - ID de la madrina
- `medico_asignado_id` - Médico asignado
- `ips_derivada_id` - IPS a donde derivar
- `sintomas` - Lista de síntomas
- `coordenadas_alerta` - Ubicación GPS
- `es_automatica` - Si es alerta automática
- `score_riesgo` - Puntuación de riesgo

### 3. 🟠 IMPORTANTE: Lista de Alertas Muestra Campos Incorrectos

**Ubicación:** `lib/features/alertas/presentation/pages/alertas_list_page.dart`

**Problema:**
```dart
ListTile(
  title: Text(alerta['titulo'] ?? 'Sin título'),  // ❌ Campo 'titulo' no existe
  subtitle: Text(alerta['descripcion'] ?? ''),    // ❌ Campo 'descripcion' no existe
)
```

**Campos Correctos:**
- `mensaje` - En lugar de 'titulo' y 'descripcion'
- `tipo_alerta` - Tipo de alerta
- `nivel_prioridad` - Prioridad
- `gestante_id` - ID de gestante
- `resuelta` - Estado

### 4. 🟡 MENOR: Tipos de Alerta Desactualizados

**Ubicación:** `alerta_form_page.dart`

**Actual:**
```dart
static const tipos = ['sos', 'medica', 'control', 'recordatorio', 'sistema', 'informacion'];
```

**Debería Ser (según schema.prisma):**
```dart
static const tipos = [
  'SOS_MEDICA',
  'CONTROL_VENCIDO',
  'SINTOMAS_PREOCUPANTES',
  'RECORDATORIO_CONTROL',
  'EMERGENCIA',
  'SEGUIMIENTO',
  'hipertension_severa',
  'hipertension',
  'hipotension',
  'taquicardia_severa',
  'bradicardia',
  'fiebre_alta',
  'fiebre',
  'ganancia_peso_excesiva',
  'hemorragia',
  'preeclampsia',
  'preeclampsia_severa',
  'parto_prematuro',
  'sufrimiento_fetal',
  'sepsis',
  'infeccion',
  'hiperemesis',
  'ausencia_movimientos_fetales',
  'sepsis_materna',
  'signos_vitales_anormales',
  'sintomas_criticos',
  'tendencia_hipertension',
];
```

### 5. 🟡 MENOR: Prioridades Desactualizadas

**Actual:**
```dart
static const prioridades = ['baja', 'media', 'alta', 'critica'];
```

**Debería Ser:**
```dart
static const prioridades = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];
// O en minúsculas: ['baja', 'media', 'alta', 'critica']
```

---

## 🔧 Correcciones Necesarias

### Corrección 1: Permitir Acceso a IPS y Médicos

**Archivo:** `lib/core/router/app_router.dart`

**Cambiar:**
```dart
// Médicos
GoRoute(
  path: '/medicos',
  builder: (context, state) => const MainLayout(
    child: RouteGuard(
      allowedRoles: [
        AppConstants.adminRole,
        AppConstants.superAdminRole,
        AppConstants.coordinatorRole,  // ✅ Agregar
        AppConstants.medicoRole,        // ✅ Agregar
      ],
      child: MedicosScreen()
    ),
  ),
),

// IPS
GoRoute(
  path: '/ips',
  builder: (context, state) => const MainLayout(
    child: RouteGuard(
      allowedRoles: [
        AppConstants.adminRole,
        AppConstants.superAdminRole,
        AppConstants.coordinatorRole,  // ✅ Agregar
        AppConstants.medicoRole,        // ✅ Agregar
      ],
      child: IpsScreen()
    ),
  ),
),
```

### Corrección 2: Mejorar Formulario de Alertas

**Archivo:** `lib/features/alertas/presentation/pages/alerta_form_page.dart`

**Agregar Campos:**
1. Dropdown para seleccionar médico
2. Dropdown para seleccionar IPS
3. Multi-select para síntomas
4. Botón para capturar ubicación GPS
5. Usar tipos de alerta del enum

### Corrección 3: Corregir Lista de Alertas

**Archivo:** `lib/features/alertas/presentation/pages/alertas_list_page.dart`

**Cambiar:**
```dart
ListTile(
  title: Text(alerta['mensaje'] ?? 'Sin mensaje'),
  subtitle: Text('${alerta['tipo_alerta']} - ${alerta['nivel_prioridad']}'),
  leading: Icon(
    alerta['resuelta'] == true ? Icons.check_circle : Icons.warning,
    color: alerta['resuelta'] == true ? Colors.green : Colors.orange,
  ),
  trailing: Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      if (alerta['resuelta'] != true)
        IconButton(
          icon: const Icon(Icons.check, color: Colors.green),
          onPressed: () async {
            await apiService.put('/alertas/${alerta['id']}/leida');
            fetchAlertas();
          },
        ),
      IconButton(
        icon: const Icon(Icons.delete, color: Colors.red),
        onPressed: () async {
          await apiService.delete('/alertas/${alerta['id']}');
          fetchAlertas();
        },
      ),
    ],
  ),
)
```

---

## 📊 Resumen de Problemas

| Problema | Severidad | Estado | Impacto |
|----------|-----------|--------|---------|
| IPS/Médicos restringidos | 🔴 Crítico | Pendiente | Usuarios no pueden acceder |
| Formulario incompleto | 🟠 Importante | Pendiente | Funcionalidad limitada |
| Lista muestra campos incorrectos | 🟠 Importante | Pendiente | Información incorrecta |
| Tipos desactualizados | 🟡 Menor | Pendiente | Inconsistencia con BD |
| Prioridades desactualizadas | 🟡 Menor | Pendiente | Inconsistencia con BD |

---

## ✅ Plan de Acción

### Fase 1: Correcciones Críticas (Inmediato)
1. ✅ Permitir acceso a IPS y Médicos para coordinadores y médicos
2. ✅ Corregir campos en lista de alertas
3. ✅ Actualizar tipos y prioridades

### Fase 2: Mejoras Importantes (Pronto)
1. 🔄 Mejorar formulario de alertas
2. 🔄 Agregar selección de médico e IPS
3. 🔄 Agregar captura de ubicación GPS
4. 🔄 Agregar selección de síntomas

### Fase 3: Integraciones (Después)
1. 🔄 Integrar con sistema MEOWS
2. 🔄 Agregar evaluación automática
3. 🔄 Agregar notificaciones push
4. 🔄 Agregar historial de alertas

---

**Fecha de Auditoría:** 2025-01-XX
**Estado:** 🟠 REQUIERE CORRECCIONES CRÍTICAS
**Prioridad:** 🔴 ALTA
