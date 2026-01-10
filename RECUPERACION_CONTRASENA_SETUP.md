# Configuración de Recuperación de Contraseña

## ✅ Implementación Completada

### Backend
- ✅ Endpoints `/api/auth/forgot-password` y `/api/auth/reset-password`
- ✅ Integración con Resend para envío de emails
- ✅ Tokens de reset con expiración de 1 hora
- ✅ Campos agregados al schema: `reset_token`, `reset_token_expires`

### Frontend
- ✅ Páginas de Flutter ya existían
- ✅ Agregado botón mostrar/ocultar contraseña en reset password
- ✅ Integración con auth provider

## 📋 Pasos para Activar en Producción

### 1. Migrar la Base de Datos

Ejecutar en tu máquina local:

```bash
cd S/aplicacionWZC/madres-digitales-backend
npx prisma migrate dev --name add_password_reset_fields
npx prisma generate
```

Esto agregará los campos `reset_token` y `reset_token_expires` a la tabla `usuarios`.

### 2. Configurar Variables de Entorno en Vercel

Ve al dashboard de Vercel → madres-digitales-backend → Settings → Environment Variables

Agregar:

```
RESEND_API_KEY=re_b71cxjFw_586ycZSBV6bHjSLD8m19qYLB
FRONTEND_URL=https://madres-digitales-frontend.vercel.app
```

### 3. Redeploy del Backend

Después de agregar las variables de entorno, Vercel hará un redeploy automático.

O puedes forzarlo con:
```bash
cd S/aplicacionWZC/madres-digitales-backend
git commit --allow-empty -m "Trigger redeploy for env vars"
git push origin main
```

## 🧪 Cómo Probar

### Flujo Completo:

1. **Solicitar Reset**:
   - Ir a la app → "Olvidé mi contraseña"
   - Ingresar email: `wzuccardi@gmail.com`
   - Verificar que llegue el email

2. **Restablecer Contraseña**:
   - Hacer clic en el enlace del email
   - Ingresar nueva contraseña
   - Usar el botón 👁️ para ver/ocultar la contraseña
   - Confirmar

3. **Login con Nueva Contraseña**:
   - Volver al login
   - Usar la nueva contraseña

## 📧 Configuración de Email

### Resend (Actual)
- **Plan**: Gratis (3000 emails/mes)
- **From**: `onboarding@resend.dev` (dominio de prueba)
- **API Key**: Ya configurada

### Para Producción (Opcional)

Si quieres usar tu propio dominio:

1. Ir a [Resend Dashboard](https://resend.com/domains)
2. Agregar dominio: `madresdigitales.com`
3. Configurar registros DNS:
   - SPF
   - DKIM
   - DMARC
4. Cambiar el `from` en el código:
   ```javascript
   from: 'Madres Digitales <noreply@madresdigitales.com>'
   ```

## 🔒 Seguridad Implementada

- ✅ Tokens aleatorios de 32 bytes
- ✅ Expiración de 1 hora
- ✅ Tokens de un solo uso (se eliminan después de usar)
- ✅ No revela si el email existe (previene enumeración)
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Validación de longitud mínima (6 caracteres)

## 📝 Endpoints Disponibles

### POST /api/auth/forgot-password
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Si el email existe, recibirás instrucciones..."
}
```

### POST /api/auth/reset-password
```json
{
  "token": "abc123...",
  "newPassword": "nuevaContraseña123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

## 🎨 UI Mejorada

### Reset Password Page
- Campo de contraseña con botón 👁️ para mostrar/ocultar
- Validación en tiempo real
- Mensajes de error claros
- Loading state durante el proceso

## 📊 Logs

El sistema registra:
- ✅ Solicitudes de reset (con email)
- ✅ Emails enviados exitosamente
- ✅ Contraseñas restablecidas
- ⚠️ Intentos con emails no existentes
- ❌ Errores en el proceso

## 🚀 Próximos Pasos (Opcional)

1. **Mejorar el diseño del email** con un template más profesional
2. **Agregar límite de intentos** (rate limiting)
3. **Notificar por email** cuando se cambie la contraseña
4. **Agregar 2FA** (autenticación de dos factores)
5. **Historial de cambios de contraseña**

## 📞 Soporte

Si hay problemas:
1. Verificar logs en Vercel
2. Verificar que las variables de entorno estén configuradas
3. Verificar que la migración de BD se haya ejecutado
4. Probar el endpoint directamente con Postman/curl
