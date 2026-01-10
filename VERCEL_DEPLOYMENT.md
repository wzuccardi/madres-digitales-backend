# 🚀 Guía de Deployment en Vercel - Madres Digitales Frontend

## 📋 Tabla de Contenidos

1. [Preparación](#preparación)
2. [Opción 1: Deploy desde Dashboard](#opción-1-deploy-desde-dashboard-recomendado)
3. [Opción 2: Deploy con CLI](#opción-2-deploy-con-cli)
4. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
5. [Configuración de Dominio](#configuración-de-dominio)
6. [Verificación](#verificación)
7. [Troubleshooting](#troubleshooting)

## 🔧 Preparación

### Requisitos Previos

- ✅ Cuenta en Vercel (https://vercel.com)
- ✅ Repositorio en GitHub con el código del frontend
- ✅ Flutter instalado localmente (para testing)

### Archivos Necesarios (Ya Creados)

- ✅ `vercel.json` - Configuración de Vercel
- ✅ `package.json` - Scripts de build
- ✅ `.vercelignore` - Archivos a ignorar
- ✅ `install-flutter.sh` - Script de instalación de Flutter

## 🌐 Opción 1: Deploy desde Dashboard (Recomendado)

### Paso 1: Conectar GitHub con Vercel

1. **Ir a Vercel Dashboard**
   ```
   https://vercel.com/dashboard
   ```

2. **Crear Nuevo Proyecto**
   - Click en "Add New..." > "Project"
   - O ir directamente a: https://vercel.com/new

3. **Importar Repositorio**
   - Click en "Import Git Repository"
   - Seleccionar "GitHub"
   - Autorizar Vercel si es la primera vez
   - Buscar: `madres-digitales-frontend-CleanArchitecture`
   - Click en "Import"

### Paso 2: Configurar el Proyecto

**Configure Project:**

```
Project Name: madres-digitales-frontend
Framework Preset: Other
Root Directory: ./
```

**Build and Output Settings:**

```
Build Command: 
bash install-flutter.sh && flutter build web --release --web-renderer canvaskit

Output Directory: 
build/web

Install Command:
(dejar vacío o usar: echo "No npm install needed")
```

**Environment Variables:**

```
FLUTTER_VERSION = 3.19.6
FLUTTER_WEB_USE_SKIA = true
FLUTTER_WEB_CANVASKIT = true
```

### Paso 3: Deploy

1. Click en "Deploy"
2. Esperar a que termine el build (5-10 minutos)
3. ¡Listo! Tu app estará en: `https://madres-digitales-frontend.vercel.app`

### Paso 4: Configurar Dominio Personalizado (Opcional)

1. En el proyecto, ir a "Settings" > "Domains"
2. Click en "Add Domain"
3. Ingresar tu dominio: `app.tudominio.com`
4. Seguir instrucciones para configurar DNS

**Configuración DNS:**

```
Tipo    Nombre    Valor                           TTL
CNAME   app       cname.vercel-dns.com           3600
```

## 💻 Opción 2: Deploy con CLI

### Paso 1: Instalar Vercel CLI

```bash
# Instalar globalmente
npm install -g vercel

# O con yarn
yarn global add vercel
```

### Paso 2: Login

```bash
# Iniciar sesión
vercel login

# Seguir instrucciones en el navegador
```

### Paso 3: Configurar Proyecto

```bash
# Ir al directorio del frontend
cd S/aplicacionWZC/madres_digitales_flutter_new

# Inicializar proyecto Vercel
vercel

# Responder preguntas:
# ? Set up and deploy "~/madres_digitales_flutter_new"? [Y/n] Y
# ? Which scope do you want to deploy to? [Tu usuario]
# ? Link to existing project? [y/N] N
# ? What's your project's name? madres-digitales-frontend
# ? In which directory is your code located? ./
```

### Paso 4: Build Local (Opcional)

```bash
# Build Flutter Web
flutter build web --release --web-renderer canvaskit

# Verificar que build/web existe
ls -la build/web
```

### Paso 5: Deploy

```bash
# Deploy a producción
vercel --prod

# O deploy a preview
vercel

# Ver logs
vercel logs [deployment-url]
```

### Comandos Útiles

```bash
# Ver proyectos
vercel list

# Ver deployments
vercel ls

# Ver logs
vercel logs

# Eliminar deployment
vercel remove [deployment-url]

# Ver información del proyecto
vercel inspect [deployment-url]
```

## ⚙️ Configuración de Variables de Entorno

### Desde Dashboard

1. Ir a tu proyecto en Vercel
2. Settings > Environment Variables
3. Agregar variables:

```
Name: API_URL
Value: https://api.tudominio.com
Environment: Production, Preview, Development
```

```
Name: FLUTTER_VERSION
Value: 3.19.6
Environment: Production, Preview, Development
```

### Desde CLI

```bash
# Agregar variable
vercel env add API_URL

# Listar variables
vercel env ls

# Eliminar variable
vercel env rm API_URL
```

### Actualizar Código para Usar Variables

Editar `lib/config/environment.dart`:

```dart
class Environment {
  // En producción, Vercel inyectará estas variables
  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://localhost:3000/api',
  );
  
  static const String environment = String.fromEnvironment(
    'ENVIRONMENT',
    defaultValue: 'development',
  );
  
  static bool get isProduction => environment == 'production';
  static bool get isDevelopment => environment == 'development';
}
```

## 🌍 Configuración de Dominio

### Agregar Dominio Personalizado

**Desde Dashboard:**

1. Proyecto > Settings > Domains
2. Add Domain
3. Ingresar: `app.tudominio.com`
4. Configurar DNS según instrucciones

**Desde CLI:**

```bash
# Agregar dominio
vercel domains add app.tudominio.com

# Listar dominios
vercel domains ls

# Eliminar dominio
vercel domains rm app.tudominio.com
```

### Configuración DNS

**Opción A: CNAME (Recomendado)**

```
Tipo    Nombre    Valor                           TTL
CNAME   app       cname.vercel-dns.com           3600
```

**Opción B: A Record**

```
Tipo    Nombre    Valor                           TTL
A       app       76.76.21.21                    3600
```

### SSL/TLS

Vercel configura SSL automáticamente:
- ✅ Certificado SSL gratuito
- ✅ Renovación automática
- ✅ HTTPS forzado
- ✅ HTTP/2 habilitado

## ✅ Verificación

### 1. Verificar Build

```bash
# Ver logs del último deployment
vercel logs

# O desde dashboard
# Proyecto > Deployments > [último deployment] > View Function Logs
```

### 2. Verificar Sitio

```bash
# Abrir en navegador
vercel open

# O visitar directamente
# https://madres-digitales-frontend.vercel.app
```

### 3. Health Check

```bash
# Verificar que carga
curl -I https://madres-digitales-frontend.vercel.app

# Debe retornar: HTTP/2 200
```

### 4. Verificar Funcionalidad

- [ ] Página de login carga correctamente
- [ ] Assets (imágenes, iconos) cargan
- [ ] Puede hacer login (si backend está desplegado)
- [ ] Navegación funciona
- [ ] Responsive design funciona en móvil

## 🔧 Troubleshooting

### Error: Build Failed

**Problema:** Flutter no se instala correctamente

**Solución:**

```bash
# Verificar install-flutter.sh tiene permisos
chmod +x install-flutter.sh

# O modificar Build Command en Vercel:
curl -o flutter.tar.xz https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.19.6-stable.tar.xz && tar xf flutter.tar.xz && export PATH="$PATH:`pwd`/flutter/bin" && flutter config --enable-web && flutter build web --release --web-renderer canvaskit
```

### Error: Output Directory Not Found

**Problema:** `build/web` no existe después del build

**Solución:**

1. Verificar que el build command incluye `flutter build web`
2. Verificar Output Directory: `build/web`
3. Revisar logs para ver errores de build

### Error: CORS al conectar con Backend

**Problema:** Frontend no puede conectar con API

**Solución:**

Actualizar CORS en backend (`aplicacionWZC/madres-digitales-backend/src/config/cors.ts`):

```typescript
const allowedOrigins = [
  'http://localhost:3008',
  'https://madres-digitales-frontend.vercel.app',
  'https://app.tudominio.com',
];
```

### Error: Assets No Cargan

**Problema:** Imágenes o iconos no se muestran

**Solución:**

1. Verificar rutas en `vercel.json`
2. Usar rutas relativas en Flutter: `assets/images/logo.png`
3. Verificar `pubspec.yaml` tiene assets declarados

### Error: Página en Blanco

**Problema:** La app carga pero muestra pantalla blanca

**Solución:**

1. Abrir DevTools del navegador (F12)
2. Ver errores en Console
3. Verificar que CanvasKit cargó correctamente
4. Probar con `--web-renderer html` en lugar de `canvaskit`

### Performance Lenta

**Solución:**

1. Habilitar compresión en `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Encoding",
          "value": "gzip"
        }
      ]
    }
  ]
}
```

2. Optimizar assets:
```bash
# Comprimir imágenes
flutter pub run flutter_native_splash:create

# Tree-shake icons
flutter build web --release --tree-shake-icons
```

## 🔄 Actualizaciones Automáticas

### Configurar Auto-Deploy

Vercel despliega automáticamente cuando haces push a GitHub:

```bash
# Hacer cambios
git add .
git commit -m "Update frontend"
git push origin master

# Vercel detecta el push y despliega automáticamente
```

### Preview Deployments

Cada Pull Request crea un deployment de preview:

1. Crear branch: `git checkout -b feature/nueva-funcionalidad`
2. Hacer cambios y commit
3. Push: `git push origin feature/nueva-funcionalidad`
4. Crear PR en GitHub
5. Vercel crea deployment de preview automáticamente
6. URL de preview aparece en el PR

## 📊 Monitoreo

### Analytics

Habilitar Vercel Analytics:

1. Proyecto > Analytics
2. Enable Analytics
3. Ver métricas:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics

### Logs

```bash
# Ver logs en tiempo real
vercel logs --follow

# Ver logs de deployment específico
vercel logs [deployment-url]

# Ver logs de función específica
vercel logs --function [function-name]
```

## 💰 Costos

### Plan Hobby (Gratis)

- ✅ Deployments ilimitados
- ✅ 100 GB bandwidth/mes
- ✅ SSL automático
- ✅ Preview deployments
- ❌ Sin analytics avanzado
- ❌ Sin soporte prioritario

### Plan Pro ($20/mes)

- ✅ Todo lo del plan Hobby
- ✅ 1 TB bandwidth/mes
- ✅ Analytics avanzado
- ✅ Soporte prioritario
- ✅ Protección DDoS
- ✅ Más recursos de build

## 📞 Soporte

- **Documentación**: https://vercel.com/docs
- **Discord**: https://vercel.com/discord
- **GitHub**: https://github.com/vercel/vercel
- **Email**: wzuccardi@gmail.com

## ✅ Checklist de Deployment

- [ ] Cuenta de Vercel creada
- [ ] Repositorio conectado
- [ ] Archivos de configuración creados
- [ ] Build command configurado
- [ ] Output directory configurado
- [ ] Variables de entorno configuradas
- [ ] Primer deployment exitoso
- [ ] Sitio accesible
- [ ] Funcionalidad verificada
- [ ] Dominio personalizado configurado (opcional)
- [ ] SSL funcionando
- [ ] CORS configurado en backend
- [ ] Auto-deploy habilitado

¡Deployment en Vercel completado! 🎉
