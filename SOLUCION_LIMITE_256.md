# ✅ SOLUCIÓN - Límite de 256 Caracteres en Vercel

## 🎯 Problema
Vercel tiene un límite de 256 caracteres para el Build Command, y nuestro comando es muy largo.

## ✅ Solución
Usar el archivo `build.sh` que ya está en el repositorio.

---

## 📋 PASOS ACTUALIZADOS

### PASO 1: Ir a Vercel Dashboard
```
https://vercel.com/dashboard
```

### PASO 2: Abrir Proyecto Frontend
Click en: `madres-digitales-frontend-clean-architecture`

### PASO 3: Configurar Build Settings

1. Click en **"Settings"**
2. Click en **"General"**
3. Buscar **"Build & Development Settings"**
4. Click en **"Edit"** o **"Override"**

**Configurar así:**

**Framework Preset:**
```
Other
```

**Build Command:** (SOLO esto, es corto)
```
bash build.sh
```

**Output Directory:**
```
build/web
```

**Install Command:**
```
(dejar vacío)
```

5. Click **"Save"**

---

### PASO 4: Variables de Entorno

En **Settings > Environment Variables**, agregar:

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

---

### PASO 5: Verificar que build.sh está en el Repo

El archivo `build.sh` debe estar en la raíz del repositorio del frontend.

**Contenido de build.sh:**
```bash
#!/bin/bash
set -e

echo "🚀 Flutter Web Build for Vercel"

# Variables
FLUTTER_VERSION="3.19.6"
FLUTTER_URL="https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_${FLUTTER_VERSION}-stable.tar.xz"
API_URL="https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api"

# Instalar Flutter
if ! command -v flutter &> /dev/null; then
    echo "📦 Installing Flutter..."
    cd /tmp
    curl -o flutter.tar.xz "$FLUTTER_URL"
    tar xf flutter.tar.xz
    export PATH="/tmp/flutter/bin:$PATH"
    flutter config --no-analytics --enable-web
fi

# Build
cd "$VERCEL_PROJECT_ROOT" || cd "$(pwd)"
flutter clean
flutter pub get
flutter build web --release --web-renderer canvaskit \
  --dart-define=ENVIRONMENT=production \
  --dart-define=API_URL="$API_URL"

echo "✅ Build completed!"
```

---

### PASO 6: Redeploy

1. Click en **"Deployments"**
2. Click en los **3 puntos (...)** del último deployment
3. Click en **"Redeploy"**
4. Confirmar

---

### PASO 7: Esperar y Verificar

El build tomará 5-10 minutos. Verás en los logs:

```
🚀 Flutter Web Build for Vercel
📦 Installing Flutter...
🔨 Building...
✅ Build completed!
```

---

## ✅ Verificación

Una vez completado:

1. Click en **"Visit"**
2. Deberías ver la página de login
3. Abrir DevTools (F12)
4. No debe haber errores en Console

---

## 🐛 Si build.sh No Existe en el Repo

Si Vercel dice que no encuentra `build.sh`, necesitas agregarlo al repositorio del frontend:

### Opción A: Desde GitHub Web

1. Ve a: https://github.com/wzuccardi/madres-digitales-frontend-CleanArchitecture
2. Click en "Add file" > "Create new file"
3. Nombre: `build.sh`
4. Pega el contenido de arriba
5. Commit

### Opción B: Desde tu Máquina

```bash
cd S/aplicacionWZC/madres_digitales_flutter_new

# Crear build.sh (copiar contenido de arriba)
nano build.sh

# Dar permisos
chmod +x build.sh

# Commit
git add build.sh
git commit -m "Add build script for Vercel"
git push origin master
```

---

## 📊 Resumen

**Build Command en Vercel:**
```
bash build.sh
```

**Output Directory:**
```
build/web
```

**Variables de Entorno:**
- `FLUTTER_VERSION=3.19.6`
- `API_URL=https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api`
- `ENVIRONMENT=production`

---

## ✨ ¡Listo!

Con estos pasos, el build command es corto (solo 13 caracteres) y todo el proceso está en el archivo `build.sh`.

**Tiempo estimado**: 15-20 minutos total
