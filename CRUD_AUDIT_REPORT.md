# 🔍 Auditoría Completa de CRUDs - Madres Digitales

## 📋 Módulos a Auditar

1. ✅ Gestantes
2. ✅ Controles Prenatales
3. ✅ Alertas
4. ✅ Usuarios
5. ✅ Médicos
6. ✅ IPS
7. ✅ Contenidos
8. ✅ Municipios

---

## 1. 🤰 GESTANTES

### Frontend (Flutter)

**Archivos a Revisar:**
- `lib/features/gestantes/presentation/pages/gestantes_list_page.dart`
- `lib/features/gestantes/presentation/pages/gestante_form_page.dart`
- `lib/features/gestantes/data/repositories/gestante_repository_impl.dart`

### Backend (Node.js/Express)

**Endpoints:**
- GET `/api/gestantes` - Listar
- GET `/api/gestantes/:id` - Obtener por ID
- POST `/api/gestantes` - Crear
- PUT `/api/gestantes/:id` - Actualizar
- DELETE `/api/gestantes/:id` - Eliminar

### ❌ ERRORES ENCONTRADOS:

#### Error 1: Falta endpoint DELETE en backend
**Ubicación:** `api/index.js`
**Problema:** No existe ruta DELETE para gestantes
**Impacto:** No se pueden eliminar gestantes desde el frontend
**Solución:** Agregar endpoint DELETE

#### Error 2: Validación de campos requeridos incompleta
**Ubicación:** Backend - POST/PUT gestantes
**Problema:** No valida todos los campos requeridos (nombre, fecha_nacimiento, regimen_salud)
**Impacto:** Se pueden crear gestantes con datos incompletos
**Solución:** Agregar validación completa

#### Error 3: Filtros por madrina no funcionan correctamente
**Ubicación:** `api/index.js` - GET /api/gestantes
**Problema:** El filtro por madrina_id no se aplica correctamente para roles
**Impacto:** Madrinas ven gestantes de otras madrinas
**Solución:** Corregir lógica de filtrado

---

## 2. 📋 CONTROLES PRENATALES

### Frontend (Flutter)

**Archivos a Revisar:**
- `lib/features/controles/presentation/pages/control_form_page.dart`
- `lib/features/controles_v2/presentation/controles_list_optimized_page.dart`

### Backend (Node.js/Express)

**Endpoints:**
- GET `/api/controles` - Listar
- GET `/api/controles/:id` - Obtener por ID
- POST `/api/alertas-automaticas/controles/con-evaluacion` - Crear con evaluación
- PUT `/api/controles/:id` - Actualizar
- DELETE `/api/controles/:id` - Eliminar

### ❌ ERRORES ENCONTRADOS:

#### Error 1: Endpoint POST /api/controles no existe
**Ubicación:** `api/index.js`
**Problema:** Solo existe el endpoint con evaluación, falta el básico
**Impacto:** Frontend antiguo no puede crear controles
**Solución:** Agregar endpoint POST /api/controles

#### Error 2: Formulario de control muy básico
**Ubicación:** `control_form_page.dart`
**Problema:** Solo tiene fecha y observaciones, faltan signos vitales
**Impacto:** No se capturan datos importantes
**Solución:** Integrar formulario MEOWS

#### Error 3: No se valida gestante_id en creación
**Ubicación:** Backend - crearControlConEvaluacion
**Problema:** No verifica que la gestante pertenezca a la madrina
**Impacto:** Madrinas pueden crear controles para gestantes de otras
**Solución:** Agregar validación de permisos

---

## 3. 🚨 ALERTAS

### Frontend (Flutter)

**Archivos a Revisar:**
- `lib/features/alertas/presentation/pages/alertas_list_page.dart`
- `lib/features/alertas/presentation/pages/alerta_form_page.dart`

### Backend (Node.js/Express)

**Endpoints:**
- GET `/api/alertas` - Listar
- GET `/api/alertas/:id` - Obtener por ID
- POST `/api/alertas` - Crear
- PUT `/api/alertas/:id` - Actualizar
- DELETE `/api/alertas/:id` - Eliminar
- PUT `/api/alertas/:id/leida` - Marcar como leída

### ❌ ERRORES ENCONTRADOS:

#### Error 1: Endpoint GET /api/alertas no filtra por permisos
**Ubicación:** `api/index.js`
**Problema:** No aplica filtros según rol del usuario
**Impacto:** Usuarios ven alertas que no les corresponden
**Solución:** Implementar filtrado por rol y municipio

#### Error 2: No existe endpoint para marcar alerta como leída
**Ubicación:** `api/index.js`
**Problema:** Falta ruta PUT /api/alertas/:id/leida
**Impacto:** No se pueden marcar alertas como leídas
**Solución:** Agregar endpoint

#### Error 3: Contador de alertas no leídas no funciona
**Ubicación:** Frontend - `main_layout.dart`
**Problema:** El método getUnreadAlertasCount puede fallar
**Impacto:** Badge de alertas no se actualiza
**Solución:** Agregar manejo de errores

---

## 4. 👥 USUARIOS

### Frontend (Flutter)

**Archivos a Revisar:**
- `lib/features/usuarios/presentation/pages/usuarios_list_page.dart`
- `lib/features/usuarios/presentation/pages/usuario_form_page.dart`

### Backend (Node.js/Express)

**Endpoints:**
- GET `/api/usuarios` - Listar
- GET `/api/usuarios/:id` - Obtener por ID
- POST `/api/usuarios` - Crear
- PUT `/api/usuarios/:id` - Actualizar
- DELETE `/api/usuarios/:id` - Eliminar

### ❌ ERRORES ENCONTRADOS:

#### Error 1: Endpoint GET /api/usuarios no existe
**Ubicación:** `api/index.js`
**Problema:** Usa query raw en lugar de endpoint REST
**Impacto:** Difícil de mantener y extender
**Solución:** Crear endpoint REST proper

#### Error 2: No se valida unicidad de email
**Ubicación:** Backend - POST /api/usuarios
**Problema:** No verifica si el email ya existe antes de crear
**Impacto:** Pueden crearse usuarios duplicados
**Solución:** Agregar validación de unicidad

#### Error 3: Contraseñas no se hashean correctamente
**Ubicación:** Backend - POST /api/usuarios
**Problema:** Lógica de hasheo puede fallar
**Impacto:** Contraseñas inseguras
**Solución:** Usar bcrypt consistentemente

---

## 5. 👨‍⚕️ MÉDICOS

### Frontend (Flutter)

**Archivos a Revisar:**
- `lib/features/medicos/presentation/pages/medicos_list_page.dart`
- `lib/features/medicos/presentation/pages/medico_form_page.dart`

### Backend (Node.js/Express)

**Endpoints:**
- GET `/api/medicos` - Listar
- GET `/api/medicos/:id` - Obtener por ID
- POST `/api/medicos` - Crear
- PUT `/api/medicos/:id` - Actualizar
- DELETE `/api/medicos/:id` - Eliminar

### ❌ ERRORES ENCONTRADOS:

#### Error 1: Endpoints de médicos no existen
**Ubicación:** `api/index.js`
**Problema:** No hay rutas CRUD para médicos
**Impacto:** No se pueden gestionar médicos desde el frontend
**Solución:** Crear todos los endpoints CRUD

#### Error 2: No se valida registro médico único
**Ubicación:** Backend (cuando se implemente)
**Problema:** Falta validación de unicidad
**Impacto:** Pueden crearse médicos duplicados
**Solución:** Agregar validación

---

## 6. 🏥 IPS

### Frontend (Flutter)

**Archivos a Revisar:**
- `lib/features/ips/presentation/pages/ips_list_page.dart`
- `lib/features/ips/presentation/pages/ips_form_page.dart`

### Backend (Node.js/Express)

**Endpoints:**
- GET `/api/ips` - Listar ✅
- GET `/api/ips/:id` - Obtener por ID ✅
- POST `/api/ips` - Crear
- PUT `/api/ips/:id` - Actualizar
- DELETE `/api/ips/:id` - Eliminar

### ❌ ERRORES ENCONTRADOS:

#### Error 1: Faltan endpoints POST, PUT, DELETE
**Ubicación:** `api/index.js`
**Problema:** Solo existen GET, faltan operaciones de escritura
**Impacto:** No se pueden crear/editar/eliminar IPS
**Solución:** Agregar endpoints faltantes

---

## 7. 📚 CONTENIDOS

### Frontend (Flutter)

**Archivos a Revisar:**
- `lib/features/contenido/presentation/pages/contenido_list_page.dart`
- `lib/features/contenido/presentation/pages/contenido_form_page.dart`

### Backend (Node.js/Express)

**Endpoints:**
- GET `/api/contenido` - Listar ✅
- GET `/api/contenido/:id` - Obtener por ID
- POST `/api/contenido` - Crear
- PUT `/api/contenido/:id` - Actualizar
- DELETE `/api/contenido/:id` - Eliminar

### ❌ ERRORES ENCONTRADOS:

#### Error 1: Endpoint GET /api/contenido retorna array vacío
**Ubicación:** `api/index.js`
**Problema:** Hardcodeado para retornar []
**Impacto:** No se muestran contenidos
**Solución:** Implementar query real a base de datos

#### Error 2: Faltan todos los endpoints de escritura
**Ubicación:** `api/index.js`
**Problema:** Solo existe GET básico
**Impacto:** No se pueden gestionar contenidos
**Solución:** Implementar CRUD completo

---

## 8. 🗺️ MUNICIPIOS

### Frontend (Flutter)

**Archivos a Revisar:**
- Usado en dropdowns de otros formularios

### Backend (Node.js/Express)

**Endpoints:**
- GET `/api/municipios` - Listar
- GET `/api/municipios/:id` - Obtener por ID

### ❌ ERRORES ENCONTRADOS:

#### Error 1: Endpoints de municipios no existen
**Ubicación:** `api/index.js`
**Problema:** No hay rutas para municipios
**Impacto:** Dropdowns de municipios no funcionan
**Solución:** Crear endpoints GET

---

## 📊 RESUMEN DE ERRORES

### Críticos (Bloquean funcionalidad) 🔴
1. Gestantes: Falta DELETE, filtros incorrectos
2. Controles: Falta POST básico, validación de permisos
3. Alertas: Falta filtrado por permisos, endpoint leída
4. Médicos: CRUD completo faltante
5. IPS: Faltan POST, PUT, DELETE
6. Contenidos: Implementación vacía
7. Municipios: Endpoints faltantes

### Importantes (Afectan seguridad/calidad) 🟠
1. Validación de campos requeridos incompleta
2. Validación de unicidad faltante (email, registro médico)
3. Hasheo de contraseñas inconsistente
4. Manejo de errores insuficiente

### Menores (Mejoras) 🟡
1. Formularios muy básicos
2. Falta integración MEOWS en formulario de control
3. Mensajes de error genéricos

---

## 🔧 PLAN DE CORRECCIÓN

### Fase 1: Errores Críticos (Prioridad Alta)
1. ✅ Implementar endpoints faltantes de Gestantes
2. ✅ Implementar endpoints faltantes de Controles
3. ✅ Implementar endpoints faltantes de Alertas
4. ✅ Implementar CRUD completo de Médicos
5. ✅ Implementar endpoints faltantes de IPS
6. ✅ Implementar CRUD completo de Contenidos
7. ✅ Implementar endpoints de Municipios

### Fase 2: Validaciones y Seguridad (Prioridad Alta)
1. ✅ Agregar validación de campos requeridos
2. ✅ Agregar validación de unicidad
3. ✅ Implementar filtrado por permisos
4. ✅ Mejorar hasheo de contraseñas

### Fase 3: Mejoras de UX (Prioridad Media)
1. ✅ Integrar formulario MEOWS en controles
2. ✅ Mejorar mensajes de error
3. ✅ Agregar loading states
4. ✅ Mejorar manejo de errores en frontend

---

**Fecha de Auditoría:** 2025-01-XX
**Auditor:** Sistema Automatizado
**Estado:** 🔄 EN CORRECCIÓN
