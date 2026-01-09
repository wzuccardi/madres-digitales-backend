# ✅ Deployment Listo - Repositorios Configurados

## Estado Actual

### ✅ Repositorios Creados y Código Subido

**Backend:**
- Repositorio: https://github.com/wzuccardi/madres-digitales-backend
- Branch: `main`
- Commit: "Initial commit: Backend con configuración Vercel lista"
- Estado: ✅ Código subido exitosamente

**Frontend:**
- Repositorio: https://github.com/wzuccardi/madres-digitales-frontend
- Branch: `main`
- Commit: "Initial commit: Frontend Flutter con configuración Vercel lista"
- Estado: ✅ Código subido exitosamente

---

## Configuraciones Verificadas

### Backend ✅
- ✅ `vercel.json` configurado con `buildCommand` y `installCommand`
- ✅ `package.json` con script `vercel-build` para Prisma
- ✅ `api/index.js` como punto de entrada
- ✅ `.vercelignore` configurado
- ✅ Estructura de carpetas correcta

### Frontend ✅
- ✅ `vercel.json` configurado para usar `build.sh`
- ✅ `build.sh` instala Flutter y construye la app
- ✅ `package.json` con script `vercel-build`
- ✅ `.vercelignore` configurado
- ✅ Variables de entorno definidas en build.sh

---

## Próximos Pasos - Configurar Vercel

### 1. Configurar Backend en Vercel

1. Ir a https://vercel.com/new
2. Importar: `wzuccardi/madres-digitales-backend`
3. Configuración:
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: (dejar vacío)
   - Output Directory: (dejar vacío)

4. **Variables de Entorno** (Settings → Environment Variables):
   ```
   DATABASE_URL=postgres://user:password@host:5432/database?sslmode=require
   JWT_SECRET=<generar con: openssl rand -base64 32>
   JWT_REFRESH_SECRET=<generar con: openssl rand -base64 32>
   NODE_ENV=production
   PORT=3000
   CORS_ORIGINS=https://tu-frontend.vercel.app
   FRONTEND_URL=https://tu-frontend.vercel.app
   BACKEND_URL=https://tu-backend.vercel.app
   ```

5. Click en **Deploy**

### 2. Configurar Frontend en Vercel

1. Ir a https://vercel.com/new
2. Importar: `wzuccardi/madres-digitales-frontend`
3. Configuración:
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: (dejar vacío)
   - Output Directory: (dejar vacío)

4. **Variables de Entorno** (Settings → Environment Variables):
   ```
   API_URL=https://tu-backend.vercel.app
   BACKEND_URL=https://tu-backend.vercel.app
   ENVIRONMENT=production
   ```

5. Click en **Deploy**

### 3. Actualizar CORS

Después de obtener las URLs de Vercel:

1. Ir al proyecto Backend en Vercel
2. Settings → Environment Variables
3. Actualizar `CORS_ORIGINS` con la URL real del frontend
4. Redeploy el backend

---

## Verificación Post-Deployment

### Backend
```bash
# Test de salud
curl https://tu-backend.vercel.app/api/health

# Test de login
curl -X POST https://tu-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Frontend
1. Abrir https://tu-frontend.vercel.app
2. Verificar que carga correctamente
3. Intentar login
4. Verificar conexión con backend

---

## Archivos de Configuración Importantes

### Backend
- `vercel.json` - Configuración de build
- `package.json` - Scripts de build
- `api/index.js` - Punto de entrada
- `.vercelignore` - Archivos excluidos

### Frontend
- `vercel.json` - Configuración de build
- `build.sh` - Script de instalación de Flutter
- `package.json` - Scripts de build
- `.vercelignore` - Archivos excluidos

---

## Notas Importantes

1. **Primera Build**: Puede tardar 5-10 minutos (Flutter se instala desde cero)
2. **Builds Subsecuentes**: Más rápidas gracias al cache de Vercel
3. **Base de Datos**: Debe ser accesible desde internet
4. **Secrets**: Nunca commitear archivos `.env`
5. **CORS**: Actualizar después de cada cambio de URL

---

## Documentación Adicional

- Ver `CHECKLIST_DEPLOYMENT_FINAL.md` para detalles completos
- Ver `COMANDOS_PUSH_REPOS.md` para comandos git usados
- Ver logs de Vercel para debugging

---

## ✅ Checklist Final

- [x] Repositorios creados en GitHub
- [x] Código subido a ambos repositorios
- [x] Configuraciones de Vercel verificadas
- [x] Variables de entorno documentadas
- [ ] Backend deployado en Vercel
- [ ] Frontend deployado en Vercel
- [ ] CORS actualizado
- [ ] Testing completo

---

**Estado**: Listo para deployment en Vercel 🚀
