# 🚀 Redeploy Forzado en Vercel

## 📋 Resumen

Se forzó un redeploy del frontend en Vercel para asegurar que se muestre la versión más reciente del formulario de registro de usuarios.

## 🔧 Acción Realizada

**Commit:** `de0631d` - "chore: forzar redeploy en Vercel - actualizar formulario de registro"

**Comando ejecutado:**
```bash
git commit --allow-empty -m "chore: forzar redeploy en Vercel - actualizar formulario de registro"
git push origin main
```

## ✅ Formulario de Registro Verificado

El formulario de usuario (`usuario_form_screen.dart`) contiene todos los campos necesarios:

### Campos Obligatorios (*)
1. **Email** - Validación de formato email
2. **Nombres** - Mínimo 2 caracteres
3. **Apellidos** - Mínimo 2 caracteres
4. **Rol** - Dropdown filtrado según permisos del usuario actual
5. **Contraseña** - Solo para nuevos usuarios, mínimo 6 caracteres
6. **Confirmar Contraseña** - Debe coincidir con la contraseña

### Campos Opcionales
7. **Documento** - Número de identificación
8. **Teléfono** - Número de contacto
9. **Dirección** - Dirección completa (multilinea)
10. **Municipio** - Dropdown con municipios activos

## 🎯 Funcionalidades del Formulario

### Permisos por Rol
- **Super Admin**: Puede asignar cualquier rol
- **Admin**: Puede asignar roles excepto Super Admin
- **Coordinador**: Solo puede crear/editar Madrinas

### Validaciones
- Email con formato válido
- Nombres y apellidos mínimo 2 caracteres
- Contraseña mínimo 6 caracteres
- Confirmación de contraseña debe coincidir
- Rol obligatorio

### Comportamiento
- **Modo Crear**: Muestra campos de contraseña
- **Modo Editar**: Oculta campos de contraseña
- **Municipios**: Se cargan dinámicamente desde la API
- **Nombre completo**: Se combina nombres + apellidos para el backend

## ⏰ Tiempo de Deploy

Vercel tarda aproximadamente **3-5 minutos** en:
1. Detectar el nuevo commit
2. Ejecutar el build de Flutter web
3. Desplegar la nueva versión

## 🔍 Verificación

Para verificar que el redeploy funcionó:

1. **Espera 5 minutos** después del push
2. **Limpia el caché del navegador**:
   - Chrome/Edge: Ctrl + Shift + R
   - Mac: Cmd + Shift + R
   - O abre DevTools (F12) → Network → marca "Disable cache"
3. **Recarga la página** de registro de usuarios
4. **Verifica** que todos los campos estén presentes

## 📊 Commits Recientes

1. `de0631d` - Forzar redeploy (commit vacío)
2. `4bdb3b6` - Agregar widget de Usuarios en dashboard
3. `211551f` - Corregir parseo de usuarios

## ⚠️ Nota sobre Caché

Si después del redeploy sigues viendo la versión antigua:

1. **Hard refresh**: Ctrl + Shift + R
2. **Borrar caché del sitio**:
   - Chrome: Configuración → Privacidad → Borrar datos de navegación
   - Selecciona solo "Imágenes y archivos en caché"
   - Rango de tiempo: "Última hora"
3. **Modo incógnito**: Abre una ventana privada para probar
4. **Verificar en Vercel**: Ve al dashboard de Vercel y confirma que el deploy se completó

## 🔗 URLs

- **Frontend**: https://madres-digitales-frontend.vercel.app
- **Backend**: https://madres-digitales-backend.vercel.app/api
- **GitHub Frontend**: https://github.com/wzuccardi/madres-digitales-frontend
- **GitHub Backend**: https://github.com/wzuccardi/madres-digitales-backend

## 📝 Próximos Pasos

- [ ] Esperar 5 minutos para que Vercel complete el deploy
- [ ] Limpiar caché del navegador
- [ ] Verificar formulario de registro
- [ ] Probar creación de usuario con todos los campos
- [ ] Verificar que el widget de "Usuarios" muestre el número correcto
