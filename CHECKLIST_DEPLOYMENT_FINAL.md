# Checklist Final de Deployment - Madres Digitales

## ✅ Estado Actual

### Backend (madres-digitales-backend)

#### Configuración Vercel ✅
- **vercel.json**: Configurado correctamente
  - `buildCommand`: `npm run vercel-build` (genera Prisma client)
  - `installCommand`: `npm install`
  - Rewrites configurados para `/api/index.js`
  - Headers de seguridad configurados

#### Package.json ✅
- Script `vercel-build`: `npx prisma generate --schema=prisma/schema.prisma`
- Script `postinstall`: Genera Prisma client automáticamente
- Engine Node: `20.x`
- Punto de entrada: `api/index.js`

#### Variables de Entorno Requeridas 🔴
Configurar en Vercel Dashboard:
```
DATABASE_URL=postgres://user:password@host:5432/database?sslmode=require
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
NODE_ENV=production
PORT=3000
CORS_ORIGINS=https://tu-frontend.vercel.app
FRONTEND_URL=https://tu-frontend.vercel.app
BACKEND_URL=https://tu-backend.vercel.app
```

#### Archivos Importantes ✅
- `api/index.js`: Punto de entrada principal
- `prisma/schema.prisma`: Schema de base de datos
- `.vercelignore`: Excluye archivos innecesarios del build

---

### Frontend (madres_digitales_flutter_new)

#### Configuración Vercel ✅
- **vercel.json**: Configurado para Flutter Web
  - `buildCommand`: `flutter build web --release`
  - `outputDirectory`: `build/web`

#### Package.json ✅
- Script `vercel-build`: `bash build.sh`
- Script `build`: Ejecuta build.sh con mensaje de confirmación

#### Build Script (build.sh) ✅
- Instala Flutter desde GitHub (stable branch)
- Ejecuta `flutter pub get`
- Construye la app web con variables de entorno:
  - `ENVIRONMENT` (default: production)
  - `API_URL` (default: https://madres-digitales-backend.vercel.app)
  - `BACKEND_URL`

#### Variables de Entorno Requeridas 🔴
Configurar en Vercel Dashboard:
```
ENVIRONMENT=production
API_URL=https://tu-backend.vercel.app
BACKEND_URL=https://tu-backend.vercel.app
```

---

## 📋 Pasos para Deployment

### 1. Crear Repositorios en GitHub

#### Backend:
```bash
# Crear nuevo repo en GitHub: madres-digitales-backend
# Luego ejecutar:
cd S/aplicacionWZC/madres-digitales-backend
git init
git add .
git commit -m "Initial commit - Backend"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/madres-digitales-backend.git
git push -u origin main
```

#### Frontend:
```bash
# Crear nuevo repo en GitHub: madres-digitales-frontend
# Luego ejecutar:
cd S/aplicacionWZC/madres_digitales_flutter_new
git init
git add .
git commit -m "Initial commit - Frontend"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/madres-digitales-frontend.git
git push -u origin main
```

### 2. Configurar Vercel - Backend

1. Ir a https://vercel.com/new
2. Importar el repositorio `madres-digitales-backend`
3. Configurar:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (dejar vacío, usa vercel.json)
   - **Output Directory**: (dejar vacío, usa vercel.json)

4. Agregar Variables de Entorno:
   - `DATABASE_URL`: Tu conexión a PostgreSQL
   - `JWT_SECRET`: Generar con `openssl rand -base64 32`
   - `JWT_REFRESH_SECRET`: Generar con `openssl rand -base64 32`
   - `NODE_ENV`: `production`
   - `CORS_ORIGINS`: URL del frontend (se actualizará después)

5. Deploy

### 3. Configurar Vercel - Frontend

1. Ir a https://vercel.com/new
2. Importar el repositorio `madres-digitales-frontend`
3. Configurar:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (dejar vacío, usa vercel.json)
   - **Output Directory**: (dejar vacío, usa vercel.json)

4. Agregar Variables de Entorno:
   - `API_URL`: URL del backend (ej: https://madres-digitales-backend.vercel.app)
   - `BACKEND_URL`: Misma URL del backend
   - `ENVIRONMENT`: `production`

5. Deploy

### 4. Actualizar CORS en Backend

Después de obtener la URL del frontend:
1. Ir a Vercel Dashboard del backend
2. Settings → Environment Variables
3. Actualizar `CORS_ORIGINS` con la URL real del frontend
4. Redeploy

---

## ⚠️ Problemas Conocidos y Soluciones

### Backend

#### Problema: "build.sh: No such file or directory"
✅ **SOLUCIONADO**: Actualizado `vercel.json` para usar `buildCommand` en lugar de `functions`

#### Problema: Prisma Client no generado
✅ **SOLUCIONADO**: Script `vercel-build` genera el cliente automáticamente

#### Problema: Timeout en Vercel
⚠️ **PENDIENTE**: Si ocurre, considerar:
- Optimizar queries de Prisma
- Usar Prisma Accelerate
- Implementar caching

### Frontend

#### Problema: Flutter no instalado en Vercel
✅ **SOLUCIONADO**: `build.sh` instala Flutter automáticamente

#### Problema: Build tarda mucho
⚠️ **NORMAL**: Primera build puede tardar 5-10 minutos. Builds subsecuentes son más rápidas.

---

## 🔍 Verificación Post-Deployment

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
4. Verificar que se conecta al backend

---

## 📝 Notas Importantes

1. **Base de Datos**: Asegúrate de tener una base de datos PostgreSQL accesible desde internet
2. **Secrets**: Nunca commitear archivos `.env` al repositorio
3. **CORS**: Actualizar CORS_ORIGINS después de cada cambio de URL
4. **Prisma**: El schema debe estar en `prisma/schema.prisma`
5. **Node Version**: Vercel usa Node 20.x por defecto (configurado en package.json)

---

## 🚀 Próximos Pasos

1. ✅ Configuraciones listas
2. 🔴 Crear repositorios en GitHub
3. 🔴 Configurar proyectos en Vercel
4. 🔴 Agregar variables de entorno
5. 🔴 Hacer primer deployment
6. 🔴 Verificar funcionamiento
7. 🔴 Actualizar CORS
8. 🔴 Testing completo

---

## 📞 Soporte

Si encuentras problemas:
1. Revisar logs en Vercel Dashboard
2. Verificar variables de entorno
3. Comprobar que DATABASE_URL es accesible
4. Verificar que CORS está configurado correctamente
