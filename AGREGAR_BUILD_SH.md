# 🔧 AGREGAR build.sh al Repositorio Frontend

## 🎯 Problema
El archivo `build.sh` no está en el repositorio del frontend en GitHub.

## ✅ Solución Rápida (2 opciones)

---

## OPCIÓN 1: Desde GitHub Web (MÁS FÁCIL) ⭐

### Paso 1: Ir al Repositorio
```
https://github.com/wzuccardi/madres-digitales-frontend-CleanArchitecture
```

### Paso 2: Crear Archivo
1. Click en **"Add file"** (arriba a la derecha)
2. Click en **"Create new file"**

### Paso 3: Nombre del Archivo
En el campo de nombre, escribir:
```
build.sh
```

### Paso 4: Contenido del Archivo
Copiar y pegar TODO esto:

```bash
#!/bin/bash
set -e

echo "🚀 Flutter Web Build for Vercel"

# Variables
FLUTTER_VERSION="3.19.6"
FLUTTER_URL="https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_${FLUTTER_VERSION}-stable.tar.xz"
API_URL="https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api"

# Instalar Flutter si no existe
if ! command -v flutter &> /dev/null; then
    echo "📦 Installing Flutter ${FLUTTER_VERSION}..."
    
    cd /tmp
    curl -o flutter.tar.xz "$FLUTTER_URL"
    tar xf flutter.tar.xz
    export PATH="/tmp/flutter/bin:$PATH"
    
    flutter config --no-analytics --enable-web
    echo "✅ Flutter installed"
else
    echo "✅ Flutter found"
    export PATH="$PATH:$HOME/flutter/bin:/tmp/flutter/bin"
fi

# Volver al directorio del proyecto
cd "$VERCEL_PROJECT_ROOT" || cd "$(pwd)"

# Build
echo "🔨 Building..."
flutter clean
flutter pub get
flutter build web \
  --release \
  --web-renderer canvaskit \
  --dart-define=ENVIRONMENT=production \
  --dart-define=API_URL="$API_URL"

# Verificar
if [ ! -f "build/web/index.html" ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed!"
ls -lh build/web/
```

### Paso 5: Commit
1. Scroll down
2. En "Commit message" escribir: `Add build script for Vercel`
3. Click en **"Commit new file"**

### Paso 6: Redeploy en Vercel
1. Ir a Vercel Dashboard
2. Tu proyecto frontend
3. Deployments > ... > Redeploy

---

## OPCIÓN 2: Desde tu Máquina (Si tienes el repo clonado)

### Paso 1: Ir al Directorio
```bash
cd S/aplicacionWZC/madres_digitales_flutter_new
```

### Paso 2: Verificar Git
```bash
git status
```

Si dice "fatal: not a git repository", necesitas clonar el repo:
```bash
cd ..
rm -rf madres_digitales_flutter_new
git clone https://github.com/wzuccardi/madres-digitales-frontend-CleanArchitecture.git madres_digitales_flutter_new
cd madres_digitales_flutter_new
```

### Paso 3: Crear build.sh
```bash
cat > build.sh << 'EOF'
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
EOF
```

### Paso 4: Dar Permisos
```bash
chmod +x build.sh
```

### Paso 5: Commit y Push
```bash
git add build.sh
git commit -m "Add build script for Vercel"
git push origin main
```

### Paso 6: Redeploy en Vercel
Vercel detectará el push y redesplegará automáticamente.

---

## ✅ Verificación

Después de agregar el archivo:

1. Ve a: https://github.com/wzuccardi/madres-digitales-frontend-CleanArchitecture
2. Deberías ver `build.sh` en la lista de archivos
3. Vercel redesplegará automáticamente (o hazlo manual)
4. El build debería funcionar ahora

---

## 📊 Logs Esperados

Después del redeploy, deberías ver:

```
🚀 Flutter Web Build for Vercel
📦 Installing Flutter 3.19.6...
✅ Flutter installed
🔨 Building...
✅ Build completed!
```

---

## 🐛 Si Sigue Fallando

### Error: "build.sh: No such file or directory"
- El archivo no está en el repo
- Verifica en GitHub que existe
- Asegúrate de hacer commit al branch correcto (main o master)

### Error: "Permission denied"
- El archivo no tiene permisos de ejecución
- En GitHub esto no importa, Vercel lo ejecuta con bash

### Error: "Command not found: flutter"
- El script debería instalar Flutter automáticamente
- Revisa los logs completos en Vercel

---

## ⏱️ Tiempo

- **Opción 1 (GitHub Web)**: 2 minutos
- **Opción 2 (Local)**: 5 minutos

---

## 🚀 Siguiente Paso

Una vez agregado `build.sh`:

1. Esperar redeploy automático (o hacerlo manual)
2. Ver logs en Vercel
3. Verificar que el build completa exitosamente
4. Visitar el sitio

¡Casi listo! 💪
