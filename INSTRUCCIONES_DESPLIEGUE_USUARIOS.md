# Instrucciones de Despliegue - Sistema de Edición de Usuarios y Roles

## Pre-requisitos

1. Base de datos PostgreSQL con tabla `usuarios` actualizada
2. Backend Node.js/TypeScript corriendo
3. Frontend Flutter compilado

## Paso 1: Verificar Base de Datos

Ejecutar el script SQL para verificar que todos los campos existan:

```bash
psql -h <host> -U <usuario> -d <base_de_datos> -f verificar_campos_usuarios.sql
```

O desde pgAdmin/DBeaver, ejecutar el contenido de `verificar_campos_usuarios.sql`

### Campos Requeridos en Tabla `usuarios`:
- ✅ `id` (VARCHAR, PRIMARY KEY)
- ✅ `nombre` (VARCHAR)
- ✅ `email` (VARCHAR, UNIQUE)
- ✅ `password_hash` (VARCHAR)
- ✅ `documento` (VARCHAR, nullable)
- ✅ `tipo_documento` (VARCHAR, default 'cedula')
- ✅ `rol` (ENUM o VARCHAR)
- ✅ `municipio_id` (VARCHAR, nullable)
- ✅ `telefono` (VARCHAR, nullable)
- ✅ `activo` (BOOLEAN, default true)
- ✅ `reset_token` (VARCHAR, nullable)
- ✅ `reset_token_expires` (TIMESTAMP, nullable)
- ✅ `fecha_creacion` (TIMESTAMP)
- ✅ `fecha_actualizacion` (TIMESTAMP)

## Paso 2: Desplegar Backend

### 2.1 Verificar Archivos Modificados

```bash
cd S/aplicacionWZC/madres-digitales-backend

# Verificar que los archivos existan
ls -la src/controllers/usuario.controller.ts
ls -la src/routes/usuarios.routes.ts
```

### 2.2 Compilar TypeScript

```bash
npm run build
```

### 2.3 Reiniciar Servidor

Si está en desarrollo:
```bash
npm run dev
```

Si está en producción (Vercel, Railway, etc.):
```bash
# Hacer commit y push
git add .
git commit -m "feat: implementar edición de usuarios y asignación de roles"
git push origin main
```

### 2.4 Verificar Endpoints

Probar los nuevos endpoints con curl o Postman:

```bash
# Obtener perfil propio
curl -X GET http://localhost:3000/api/usuarios/me/perfil \
  -H "Authorization: Bearer <token>"

# Actualizar perfil propio
curl -X PUT http://localhost:3000/api/usuarios/me/perfil \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "telefono": "3001234567",
    "documento": "1234567890",
    "tipo_documento": "cedula"
  }'

# Asignar rol (solo admin/super_admin)
curl -X PATCH http://localhost:3000/api/usuarios/<user_id>/rol \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"rol": "COORDINADOR"}'
```

## Paso 3: Desplegar Frontend

### 3.1 Verificar Archivos Nuevos

```bash
cd S/aplicacionWZC/madres_digitales_flutter_new

# Verificar archivos nuevos
ls -la lib/presentation/pages/profile/edit_profile_page.dart
ls -la lib/presentation/widgets/admin/assign_role_dialog.dart
```

### 3.2 Limpiar y Obtener Dependencias

```bash
flutter clean
flutter pub get
```

### 3.3 Compilar para Web

```bash
flutter build web --release
```

### 3.4 Compilar para Android (APK)

```bash
flutter build apk --release
```

### 3.5 Compilar para iOS (si aplica)

```bash
flutter build ios --release
```

### 3.6 Desplegar a Vercel (Web)

```bash
# Si ya está configurado Vercel
vercel --prod

# O usar el script
./build.sh
```

## Paso 4: Pruebas Post-Despliegue

### 4.1 Pruebas de Usuario Normal (Madrina/Médico)

1. Iniciar sesión como madrina o médico
2. Ir a "Perfil" en el menú
3. Verificar que se muestre la información correcta
4. Hacer clic en "Editar Perfil"
5. Modificar nombre, teléfono, documento
6. Guardar cambios
7. Verificar que se actualice correctamente

### 4.2 Pruebas de Coordinador

1. Iniciar sesión como coordinador
2. Ir a "Usuarios"
3. Buscar una madrina
4. Hacer clic en menú contextual (⋮)
5. Seleccionar "Editar"
6. Modificar datos
7. Guardar cambios
8. Verificar que NO pueda editar administradores

### 4.3 Pruebas de Administrador

1. Iniciar sesión como administrador
2. Ir a "Usuarios"
3. Seleccionar cualquier usuario (excepto super_admin)
4. Hacer clic en "Asignar Rol"
5. Cambiar el rol
6. Verificar que se actualice
7. Intentar asignar rol SUPER_ADMIN (debe fallar)

### 4.4 Pruebas de Super Administrador

1. Iniciar sesión como super_admin
2. Ir a "Usuarios"
3. Seleccionar cualquier usuario
4. Hacer clic en "Asignar Rol"
5. Cambiar a cualquier rol (incluyendo SUPER_ADMIN)
6. Verificar que se actualice correctamente

## Paso 5: Monitoreo

### 5.1 Logs del Backend

Verificar logs para errores:

```bash
# Si usa PM2
pm2 logs

# Si usa Docker
docker logs <container_name>

# Si usa Vercel
vercel logs
```

### 5.2 Métricas

Monitorear:
- Tiempo de respuesta de endpoints
- Errores 401 (no autenticado)
- Errores 403 (sin permisos)
- Errores 500 (servidor)

## Paso 6: Rollback (si es necesario)

Si algo sale mal:

### Backend
```bash
git revert HEAD
git push origin main
```

### Frontend
```bash
# Volver a compilar versión anterior
git checkout <commit_anterior>
flutter build web --release
vercel --prod
```

## Troubleshooting

### Error: "No autenticado"
- Verificar que el token JWT sea válido
- Verificar que el middleware de autenticación esté funcionando
- Revisar logs del backend

### Error: "No tienes permiso"
- Verificar el rol del usuario en la base de datos
- Verificar que el middleware de roles esté funcionando
- Revisar que los roles estén en mayúsculas en BD

### Error: "Usuario no encontrado"
- Verificar que el ID del usuario sea correcto
- Verificar que el usuario exista en la base de datos

### Frontend no muestra cambios
- Limpiar caché del navegador
- Hacer hard refresh (Ctrl+Shift+R)
- Verificar que se haya desplegado la nueva versión

### Campos no se actualizan
- Verificar que los campos existan en la base de datos
- Ejecutar `verificar_campos_usuarios.sql`
- Revisar logs del backend

## Checklist Final

- [ ] Base de datos actualizada con todos los campos
- [ ] Backend desplegado y funcionando
- [ ] Endpoints probados con Postman/curl
- [ ] Frontend compilado para web
- [ ] Frontend compilado para móvil (si aplica)
- [ ] Pruebas de usuario normal completadas
- [ ] Pruebas de coordinador completadas
- [ ] Pruebas de administrador completadas
- [ ] Pruebas de super admin completadas
- [ ] Logs monitoreados sin errores
- [ ] Documentación actualizada
- [ ] Equipo notificado de los cambios

## Contacto y Soporte

Si hay problemas durante el despliegue:
1. Revisar logs del backend y frontend
2. Verificar que la base de datos tenga todos los campos
3. Probar endpoints manualmente con Postman
4. Revisar permisos de usuarios en la base de datos

## Notas Adicionales

- Los cambios son retrocompatibles
- No se requiere migración de datos existentes
- Los usuarios existentes pueden empezar a usar las nuevas funciones inmediatamente
- Se recomienda notificar a los usuarios sobre las nuevas funcionalidades

## Próximos Pasos Recomendados

1. Implementar cambio de contraseña desde el perfil
2. Agregar foto de perfil
3. Implementar historial de cambios de roles
4. Agregar notificaciones cuando se asigna un rol
5. Implementar filtros avanzados en lista de usuarios
