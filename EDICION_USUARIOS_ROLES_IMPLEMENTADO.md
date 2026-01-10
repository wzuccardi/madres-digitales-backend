# Implementación de Edición de Usuarios y Asignación de Roles

## Resumen
Se ha implementado un sistema completo de edición de usuarios con permisos basados en roles, permitiendo que:
- **Todos los usuarios** puedan editar su propio perfil
- **Super Administradores y Administradores** puedan asignar roles a otros usuarios
- **Coordinadores** puedan editar usuarios madrinas
- **Madrinas** puedan editar su propio registro

## Cambios en Backend

### 1. Controlador de Usuarios (`usuario.controller.ts`)

#### Nuevos Endpoints:

**GET `/usuarios/me/perfil`**
- Permite a cualquier usuario autenticado obtener su propio perfil
- Incluye información del municipio asociado

**PUT `/usuarios/me/perfil`**
- Permite a cualquier usuario actualizar su propio perfil
- Campos editables: nombre, teléfono, documento, tipo_documento

**PUT `/usuarios/:id`** (Actualizado)
- Ahora permite edición según permisos:
  - **Super Admin y Admin**: Pueden editar cualquier usuario (excepto cambiar rol)
  - **Coordinador**: Solo puede editar madrinas
  - **Usuario propio**: Puede editar sus propios datos básicos
- Campos editables según rol:
  - Todos: nombre, teléfono, documento, tipo_documento
  - Admin/Super Admin: también email, municipio_id, activo

**PATCH `/usuarios/:id/rol`** (Nuevo)
- Permite asignar roles a usuarios
- Solo accesible por Super Admin y Admin
- Restricciones:
  - Admin no puede promover a SUPER_ADMIN
  - Admin no puede modificar a otro SUPER_ADMIN

### 2. Rutas (`usuarios.routes.ts`)

```typescript
// Perfil propio
router.get('/me/perfil', authMiddleware, getMiPerfil);
router.put('/me/perfil', authMiddleware, actualizarMiPerfil);

// Edición de usuarios (con permisos)
router.put('/:id', authMiddleware, updateUsuario);

// Asignación de roles (solo admin)
router.patch('/:id/rol', authMiddleware, requireAdmin(), asignarRol);
```

## Cambios en Frontend

### 1. Nueva Pantalla: Edición de Perfil

**Archivo**: `lib/presentation/pages/profile/edit_profile_page.dart`

Características:
- Formulario para editar datos personales
- Validaciones en tiempo real
- Email solo lectura (no se puede modificar)
- Campos:
  - Nombre completo (requerido, mín 3 caracteres)
  - Tipo de documento (dropdown)
  - Número de documento (mín 6 dígitos)
  - Teléfono (10 dígitos)

### 2. Pantalla de Perfil Mejorada

**Archivo**: `lib/presentation/pages/profile/profile_page.dart`

Mejoras:
- Avatar con inicial del nombre
- Información organizada en cards
- Botón de editar perfil
- Botón de cerrar sesión con confirmación
- Etiquetas de roles traducidas al español

### 3. Widget de Asignación de Roles

**Archivo**: `lib/presentation/widgets/admin/assign_role_dialog.dart`

Características:
- Diálogo modal para asignar roles
- Muestra rol actual del usuario
- Opciones visuales con iconos y colores por rol:
  - Super Administrador (rojo, icono security)
  - Administrador (morado, icono admin_panel_settings)
  - Coordinador (azul, icono supervisor_account)
  - Madrina (naranja, icono favorite)
  - Médico (verde, icono medical_services)
- Validación antes de asignar
- Feedback visual de carga

### 4. Pantalla de Usuarios Mejorada

**Archivo**: `lib/presentation/pages/admin/usuarios_screen.dart`

Nuevas funcionalidades:
- Botón "Editar" en menú contextual
- Botón "Asignar Rol" (solo para admin y super_admin)
- Navegación a pantalla de edición
- Recarga automática después de asignar rol

### 5. Rutas Actualizadas

**Archivo**: `lib/core/router/app_router.dart`

Nuevas rutas:
```dart
// Edición de perfil propio
GoRoute(
  path: '/perfil/editar',
  name: 'perfil_editar',
  builder: (context, state) => const MainLayout(
    currentRoute: AppConstants.profileRoute,
    child: EditProfilePage(),
  ),
),
```

## Permisos por Rol

### Super Administrador
- ✅ Ver todos los usuarios
- ✅ Crear usuarios de cualquier rol
- ✅ Editar cualquier usuario
- ✅ Asignar cualquier rol
- ✅ Activar/desactivar usuarios
- ✅ Eliminar usuarios
- ✅ Editar su propio perfil

### Administrador
- ✅ Ver todos los usuarios
- ✅ Crear usuarios (excepto SUPER_ADMIN)
- ✅ Editar usuarios (excepto SUPER_ADMIN)
- ✅ Asignar roles (excepto SUPER_ADMIN)
- ✅ Activar/desactivar usuarios
- ✅ Eliminar usuarios (excepto SUPER_ADMIN)
- ✅ Editar su propio perfil

### Coordinador
- ✅ Ver usuarios
- ✅ Editar madrinas asignadas
- ✅ Editar su propio perfil
- ❌ No puede asignar roles
- ❌ No puede crear usuarios
- ❌ No puede eliminar usuarios

### Madrina
- ✅ Ver su propio perfil
- ✅ Editar su propio perfil
- ❌ No puede ver otros usuarios
- ❌ No puede editar otros usuarios

### Médico
- ✅ Ver su propio perfil
- ✅ Editar su propio perfil
- ❌ No puede ver otros usuarios
- ❌ No puede editar otros usuarios

## Flujos de Uso

### 1. Usuario Edita su Propio Perfil
1. Usuario hace clic en "Perfil" en el menú
2. Ve su información actual
3. Hace clic en "Editar Perfil"
4. Modifica los campos deseados
5. Hace clic en "Guardar Cambios"
6. Sistema valida y actualiza los datos
7. Muestra mensaje de éxito

### 2. Administrador Asigna Rol a Usuario
1. Admin navega a "Usuarios"
2. Hace clic en menú contextual (⋮) del usuario
3. Selecciona "Asignar Rol"
4. Se abre diálogo con opciones de roles
5. Selecciona el nuevo rol
6. Hace clic en "Asignar"
7. Sistema valida permisos y actualiza el rol
8. Lista de usuarios se recarga automáticamente

### 3. Coordinador Edita Madrina
1. Coordinador navega a "Usuarios"
2. Hace clic en menú contextual de una madrina
3. Selecciona "Editar"
4. Modifica los campos permitidos
5. Guarda los cambios
6. Sistema valida que sea una madrina y actualiza

## Validaciones Implementadas

### Backend
- ✅ Usuario autenticado
- ✅ Permisos según rol
- ✅ Admin no puede promover a SUPER_ADMIN
- ✅ Admin no puede modificar SUPER_ADMIN
- ✅ Coordinador solo puede editar madrinas
- ✅ Usuario solo puede editar su propio perfil

### Frontend
- ✅ Nombre: mínimo 3 caracteres
- ✅ Documento: mínimo 6 dígitos
- ✅ Teléfono: exactamente 10 dígitos numéricos
- ✅ Email: formato válido (solo lectura en edición)
- ✅ Campos requeridos marcados

## Mensajes de Error

### Backend
- "No autenticado" - Usuario no tiene sesión activa
- "No tienes permiso para editar este usuario" - Intento de edición sin permisos
- "Los coordinadores solo pueden editar madrinas" - Coordinador intenta editar otro rol
- "El administrador no puede promover usuarios a SUPER_ADMIN" - Restricción de promoción
- "Usuario no encontrado" - ID de usuario inválido

### Frontend
- "El nombre es requerido" - Campo vacío
- "El nombre debe tener al menos 3 caracteres" - Validación de longitud
- "El documento debe tener al menos 6 dígitos" - Validación de documento
- "El teléfono debe tener 10 dígitos" - Validación de teléfono
- "El teléfono solo debe contener números" - Validación de formato

## Próximos Pasos Sugeridos

1. **Agregar opción de "Perfil" en el menú principal** ✅ (Ya existe en el router)
2. **Implementar cambio de contraseña** desde el perfil
3. **Agregar foto de perfil** con upload de imagen
4. **Historial de cambios** de roles y ediciones
5. **Notificaciones** cuando se asigna un nuevo rol
6. **Filtros avanzados** en lista de usuarios (por rol, estado, municipio)
7. **Exportar lista de usuarios** a Excel/PDF
8. **Búsqueda de usuarios** por nombre, email o documento

## Testing

### Casos de Prueba Recomendados

1. **Edición de Perfil Propio**
   - Usuario madrina edita su perfil
   - Usuario coordinador edita su perfil
   - Validar que no se pueda cambiar email

2. **Asignación de Roles**
   - Super admin asigna rol SUPER_ADMIN
   - Admin intenta asignar rol SUPER_ADMIN (debe fallar)
   - Admin asigna rol COORDINADOR
   - Coordinador intenta asignar rol (debe fallar)

3. **Edición de Otros Usuarios**
   - Admin edita usuario madrina
   - Coordinador edita madrina
   - Coordinador intenta editar admin (debe fallar)
   - Madrina intenta editar otro usuario (debe fallar)

4. **Validaciones**
   - Nombre con menos de 3 caracteres
   - Teléfono con menos de 10 dígitos
   - Documento con menos de 6 dígitos
   - Campos vacíos

## Archivos Modificados

### Backend
- `src/controllers/usuario.controller.ts` - Nuevos endpoints y lógica de permisos
- `src/routes/usuarios.routes.ts` - Nuevas rutas

### Frontend
- `lib/presentation/pages/profile/profile_page.dart` - Mejorada
- `lib/presentation/pages/profile/edit_profile_page.dart` - Nueva
- `lib/presentation/pages/admin/usuarios_screen.dart` - Mejorada
- `lib/presentation/widgets/admin/assign_role_dialog.dart` - Nuevo
- `lib/core/router/app_router.dart` - Nueva ruta

## Conclusión

Se ha implementado exitosamente un sistema completo de edición de usuarios y asignación de roles con:
- ✅ Permisos granulares por rol
- ✅ Validaciones robustas
- ✅ Interfaz intuitiva
- ✅ Feedback claro al usuario
- ✅ Seguridad en backend y frontend

El sistema está listo para ser probado y desplegado.
