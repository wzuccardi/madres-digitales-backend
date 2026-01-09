# Solución Error 401 en Login

## Problema
Al intentar hacer login, se reciben múltiples errores 401:
- `/api/auth/login` - 401
- `/api/auth/refresh` - 401 (múltiples intentos)

## Causas Posibles

### 1. Token Viejo en LocalStorage
El frontend tiene guardado un token expirado o inválido y está intentando refrescarlo constantemente.

**Solución:**
1. Abrir DevTools > Application > Local Storage
2. Buscar `https://madres-digitales-frontend.vercel.app`
3. Eliminar todas las entradas relacionadas con auth/token
4. Recargar la página
5. Intentar login nuevamente

### 2. Credenciales Incorrectas
Las credenciales que estás usando no existen en la base de datos o la contraseña es incorrecta.

**Verificar:**
```sql
SELECT id, email, nombre, rol, activo 
FROM usuarios 
WHERE email = 'tu-email@ejemplo.com';
```

### 3. Usuario Inactivo
El usuario existe pero está marcado como inactivo.

**Verificar:**
```sql
SELECT activo FROM usuarios WHERE email = 'tu-email@ejemplo.com';
```

**Solución:**
```sql
UPDATE usuarios SET activo = true WHERE email = 'tu-email@ejemplo.com';
```

### 4. Backend No Desplegado
El backend en Vercel no se ha desplegado correctamente con los últimos cambios.

**Verificar:**
1. Ir a https://vercel.com/dashboard
2. Verificar que el deploy del backend esté completo
3. Verificar que no haya errores en los logs

### 5. CORS Issues
El backend está rechazando peticiones del frontend por problemas de CORS.

**Verificar en DevTools > Network:**
- Ver si hay errores de CORS en las peticiones
- Verificar que los headers `Access-Control-Allow-Origin` estén presentes

## Solución Rápida

### Paso 1: Limpiar LocalStorage
```javascript
// En la consola del navegador:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Paso 2: Verificar Credenciales
Usa las credenciales de super admin:
- Email: `wzuccardi@gmail.com`
- Password: (la que configuraste en la base de datos)

### Paso 3: Verificar Backend
Ir a: https://madres-digitales-backend.vercel.app/api/health

Debería responder:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### Paso 4: Test Manual de Login
```bash
curl -X POST https://madres-digitales-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wzuccardi@gmail.com","password":"tu-password"}'
```

## Errores Secundarios

### Material Icons 404
Los iconos aún no se cargan correctamente. Esto es un problema visual pero no afecta el login.

**Solución:** Ya está en proceso con los cambios del `index.html` y `build.sh`.

### Service Worker 404
Flutter está intentando cargar un service worker que no existe en Vercel.

**Solución:** Esto es normal en Flutter web y no afecta la funcionalidad.

## Próximos Pasos

1. Limpiar localStorage
2. Verificar que el backend esté desplegado
3. Intentar login con credenciales correctas
4. Si persiste, verificar logs del backend en Vercel
