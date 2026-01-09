# 🔧 Configurar Vercel Frontend - Madres Digitales

## 🎯 URL Actual del Frontend
```
https://madres-digitales-frontend-clean-architecture-v49i-c0oru7mvi.vercel.app
```

## ⚠️ Problema Detectado

El deployment actual no compiló Flutter (solo tomó 22ms). Necesitas reconfigurar el proyecto en Vercel.

---

## 📋 Pasos para Configurar Correctamente

### 1. Ir a Configuración del Proyecto

```
https://vercel.com/dashboard
```

1. Click en tu proyecto: `madres-digitales-frontend-clean-architecture`
2. Click en **Settings**

### 2. Configurar Build & Development Settings

En **Settings > General > Build & Development Settings**:

**Framework Preset:**
```
Other
```

**Root Directory:**
```
./
```

**Build Command:**
```bash
bash build.sh
```

**Output Directory:**
```
build/web
```

**Install Command:**
```bash
echo "No npm install needed"
```

### 3. Configurar Environment Variables

En **Settings > Environment Variables**, agregar:

```
Name: FLUTTER_VERSION
Value: 3.19.6
Environments: Production, Preview, Development
```

```
Name: API_URL
Value: https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api
Environments: Production, Preview, Development
```

```
Name: ENVIRONMENT
Value: production
Environments: Production
```

```
Name: ENVIRONMENT
Value: development
Environments: Preview, Development
```

### 4. Crear Archivos Necesarios en el Repositorio

Necesitas crear estos archivos en el repositorio del frontend:

**build.sh** (ya creado en el repo principal, necesitas copiarlo):
```bash
#!/bin/bash
set -e

echo "🚀 Starting Flutter Web Build for Vercel"

# Instalar Flutter si no existe
if ! command -v flutter &> /dev/null; then
    echo "📦 Installing Flutter..."
    FLUTTER_VERSION="3.19.6"
    cd $HOME
    
    if [ ! -d "flutter" ]; then
        git clone https://github.com/flutter/flutter.git -b ${FLUTTER_VERSION} --depth 1
    fi
    
    export PATH="$HOME/flutter/bin:$PATH"
    flutter config --no-analytics
    flutter config --enable-web
fi

export PATH="$HOME/flutter/bin:$PATH"

# Build
flutter clean
flutter pub get
flutter build web --release --web-renderer canvaskit \
  --dart-define=ENVIRONMENT=production \
  --dart-define=API_URL=https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api

echo "✅ Build completed!"
```

**vercel.json**:
```json
{
  "version": 2,
  "buildCommand": "bash build.sh",
  "outputDirectory": "build/web",
  "installCommand": "echo 'No npm install needed'",
  "routes": [
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/(.*\\.(js|css|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))",
      "dest": "/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**package.json**:
```json
{
  "name": "madres-digitales-frontend",
  "version": "1.0.0",
  "scripts": {
    "build": "bash build.sh",
    "vercel-build": "bash build.sh"
  }
}
```

### 5. Hacer Push de los Archivos

```bash
# En el repositorio del frontend
cd S/aplicacionWZC/madres_digitales_flutter_new

# Crear build.sh
cat > build.sh << 'EOF'
#!/bin/bash
set -e
echo "🚀 Starting Flutter Web Build"
if ! command -v flutter &> /dev/null; then
    FLUTTER_VERSION="3.19.6"
    cd $HOME
    if [ ! -d "flutter" ]; then
        git clone https://github.com/flutter/flutter.git -b ${FLUTTER_VERSION} --depth 1
    fi
    export PATH="$HOME/flutter/bin:$PATH"
    flutter config --no-analytics
    flutter config --enable-web
fi
export PATH="$HOME/flutter/bin:$PATH"
flutter clean
flutter pub get
flutter build web --release --web-renderer canvaskit \
  --dart-define=ENVIRONMENT=production \
  --dart-define=API_URL=https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api
echo "✅ Build completed!"
EOF

# Dar permisos de ejecución
chmod +x build.sh

# Commit y push
git add build.sh vercel.json package.json
git commit -m "Add Vercel build configuration"
git push origin master
```

### 6. Redeploy en Vercel

Después de hacer push:

**Opción A: Automático**
- Vercel detectará el push y redesplegará automáticamente

**Opción B: Manual**
1. Ir a tu proyecto en Vercel
2. Click en **Deployments**
3. Click en los 3 puntos del último deployment
4. Click en **Redeploy**

---

## ✅ Verificación

Después del redeploy (tomará 5-10 minutos):

### 1. Verificar Build Logs

En Vercel Dashboard > Deployments > [último deployment] > View Function Logs

Deberías ver:
```
🚀 Starting Flutter Web Build
📦 Installing Flutter...
✅ Flutter installed
🔨 Building Flutter Web...
✅ Build completed!
```

### 2. Verificar el Sitio

```bash
# Abrir en navegador
https://madres-digitales-frontend-clean-architecture-v49i-c0oru7mvi.vercel.app

# O con curl
curl -I https://madres-digitales-frontend-clean-architecture-v49i-c0oru7mvi.vercel.app
```

Deberías ver:
- Página de login de Madres Digitales
- Logo y assets cargando
- Sin errores en consola del navegador

### 3. Verificar Conexión con Backend

1. Abrir DevTools (F12)
2. Ir a Network tab
3. Intentar hacer login
4. Verificar requests a:
   ```
   https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api/auth/login
   ```

---

## 🐛 Troubleshooting

### Build Sigue Fallando

Si el build sigue siendo muy rápido (< 1 minuto):

1. Verificar que `build.sh` existe en el repositorio
2. Verificar que tiene permisos de ejecución: `chmod +x build.sh`
3. Verificar Build Command en Vercel: `bash build.sh`
4. Ver logs completos en Vercel

### Error: Flutter Command Not Found

Agregar al inicio de `build.sh`:
```bash
export PATH="$HOME/flutter/bin:$PATH"
```

### Error: Permission Denied

```bash
chmod +x build.sh
git add build.sh
git commit -m "Fix build.sh permissions"
git push
```

---

## 🚀 Alternativa: Build Local y Deploy

Si Vercel sigue teniendo problemas, puedes hacer build local:

```bash
# En tu máquina local
cd S/aplicacionWZC/madres_digitales_flutter_new

# Build
flutter build web --release --web-renderer canvaskit \
  --dart-define=ENVIRONMENT=production \
  --dart-define=API_URL=https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api

# Deploy con Vercel CLI
cd build/web
vercel --prod
```

---

## 📊 URLs Finales

**Backend:**
```
https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app
```

**Frontend:**
```
https://madres-digitales-frontend-clean-architecture-v49i-c0oru7mvi.vercel.app
```

**Health Checks:**
```bash
# Backend
curl https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/health

# Frontend
curl -I https://madres-digitales-frontend-clean-architecture-v49i-c0oru7mvi.vercel.app
```

---

## 📞 Siguiente Paso

Una vez configurado correctamente, el sitio debería:
- ✅ Mostrar la página de login
- ✅ Cargar assets (logo, imágenes)
- ✅ Conectar con el backend
- ✅ Permitir hacer login

¿Necesitas ayuda con algún paso específico?
