# ⚡ ACCIÓN INMEDIATA - Configurar Vercel Frontend

## 🎯 Situación Actual

- ✅ Backend desplegado: `https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app`
- ⚠️ Frontend desplegado pero SIN compilar Flutter: `https://madres-digitales-frontend-clean-architecture-v49i-c0oru7mvi.vercel.app`

## 🔧 SOLUCIÓN RÁPIDA (5 minutos)

### Paso 1: Ir a Configuración de Vercel

1. Abre: https://vercel.com/dashboard
2. Click en tu proyecto frontend
3. Click en **Settings** (arriba a la derecha)

### Paso 2: Configurar Build Command

En **Settings > General > Build & Development Settings**:

1. **Framework Preset**: Cambiar a `Other`

2. **Build Command**: Pegar esto:
   ```bash
   curl -o flutter.tar.xz https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.19.6-stable.tar.xz && tar xf flutter.tar.xz && export PATH="$PATH:`pwd`/flutter/bin" && flutter config --enable-web --no-analytics && flutter pub get && flutter build web --release --web-renderer canvaskit --dart-define=ENVIRONMENT=production --dart-define=API_URL=https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api
   ```

3. **Output Directory**: 
   ```
   build/web
   ```

4. **Install Command**:
   ```
   echo "No npm install needed"
   ```

5. Click **Save**

### Paso 3: Agregar Variables de Entorno

En **Settings > Environment Variables**:

Agregar estas 3 variables:

**Variable 1:**
- Name: `FLUTTER_VERSION`
- Value: `3.19.6`
- Environments: ✅ Production ✅ Preview ✅ Development

**Variable 2:**
- Name: `API_URL`
- Value: `https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api`
- Environments: ✅ Production ✅ Preview ✅ Development

**Variable 3:**
- Name: `ENVIRONMENT`
- Value: `production`
- Environments: ✅ Production

Click **Save** en cada una

### Paso 4: Redeploy

1. Ir a **Deployments** (en el menú superior)
2. Click en el último deployment
3. Click en los 3 puntos (...) arriba a la derecha
4. Click en **Redeploy**
5. Confirmar

### Paso 5: Esperar (5-10 minutos)

El build tomará tiempo porque:
- Descarga Flutter (3.19.6)
- Instala dependencias
- Compila la aplicación web

Puedes ver el progreso en tiempo real en los logs.

---

## ✅ Verificación

Cuando termine el deployment:

### 1. Verificar Logs

En el deployment, deberías ver:
```
Downloading Flutter...
Extracting Flutter...
Running flutter pub get...
Running flutter build web...
✓ Built build/web
```

### 2. Abrir el Sitio

```
https://madres-digitales-frontend-clean-architecture-v49i-c0oru7mvi.vercel.app
```

Deberías ver:
- ✅ Página de login de Madres Digitales
- ✅ Logo y diseño correcto
- ✅ Sin errores en consola (F12)

### 3. Probar Login

1. Abrir DevTools (F12)
2. Ir a Network tab
3. Intentar login
4. Verificar que hace request a:
   ```
   https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api/auth/login
   ```

---

## 🐛 Si Algo Sale Mal

### Build Falla

Ver logs completos en Vercel y buscar el error específico.

### Timeout

Si el build toma más de 10 minutos y falla:
- Vercel Free tier tiene límite de 10 min de build
- Considera upgrade a Pro ($20/mes) o
- Usa build local (ver abajo)

### Build Local (Alternativa)

```bash
# En tu máquina
cd S/aplicacionWZC/madres_digitales_flutter_new

# Build
flutter build web --release --web-renderer canvaskit \
  --dart-define=ENVIRONMENT=production \
  --dart-define=API_URL=https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api

# Deploy
cd build/web
vercel --prod
```

---

## 📊 Resultado Esperado

Después de completar estos pasos:

✅ Frontend funcionando en: `https://madres-digitales-frontend-clean-architecture-v49i-c0oru7mvi.vercel.app`  
✅ Backend funcionando en: `https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app`  
✅ Comunicación entre frontend y backend funcionando  
✅ Login funcional  
✅ Sistema completo desplegado  

---

## 🎉 ¡Listo!

Una vez completado, tendrás el sistema completo funcionando en producción.

**Tiempo estimado**: 15-20 minutos (incluyendo build)

¿Necesitas ayuda con algún paso?
