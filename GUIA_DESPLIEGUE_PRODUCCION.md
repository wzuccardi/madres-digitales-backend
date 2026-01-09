# Guía de Despliegue a Producción - Vercel

## 📋 Pre-requisitos

### Backend
- ✅ Cuenta de Vercel
- ✅ Base de datos PostgreSQL en producción (Supabase/Neon/Railway)
- ✅ Variables de entorno configuradas

### Frontend Flutter Web
- ✅ Código compilado para producción
- ✅ Variables de entorno de producción

## 🔧 Configuración del Backend

### 1. Variables de Entorno en Vercel

Ir a: **Vercel Dashboard → Tu Proyecto → Settings → Environment Variables**

Agregar las siguientes variables:

```env
# Base de datos
DATABASE_URL=postgresql://usuario:password@host:5432/database?schema=public

# JWT
JWT_SECRET=tu_secreto_jwt_super_seguro_aqui
JWT_EXPIRES_IN=7d

# Puerto (Vercel lo maneja automáticamente)
PORT=3000

# Node Environment
NODE_ENV=production

# CORS (dominios permitidos)
ALLOWED_ORIGINS=https://tu-dominio-frontend.vercel.app,https://tu-dominio-custom.com

# WebSocket (si usas)
WEBSOCKET_PORT=3001
```

### 2. Verificar archivos de configuración

#### vercel.json
```json
{
  "version": 2,
  "functions": {
    "api/index.js": {
      "runtime": "@vercel/node@3",
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### package.json - Scripts necesarios
```json
{
  "scripts": {
    "dev": "node api/index.js",
    "start": "node api/index.js",
    "build": "prisma generate",
    "vercel-build": "prisma generate && prisma migrate deploy"
  }
}
```

### 3. Archivo .vercelignore
```
node_modules
.env
.env.local
dist
src
*.log
.git
.vscode
```

## 🚀 Pasos de Despliegue

### Backend en Vercel

1. **Instalar Vercel CLI** (si no lo tienes)
```bash
npm install -g vercel
```

2. **Login en Vercel**
```bash
vercel login
```

3. **Desplegar desde el directorio del backend**
```bash
cd S/aplicacionWZC/madres-digitales-backend
vercel
```

4. **Para producción**
```bash
vercel --prod
```

### Configuración Post-Despliegue

1. **Configurar dominio personalizado** (opcional)
   - Ir a Settings → Domains
   - Agregar tu dominio

2. **Verificar logs**
```bash
vercel logs
```

3. **Probar endpoints**
```bash
curl https://tu-proyecto.vercel.app/health
curl https://tu-proyecto.vercel.app/api/reportes/resumen-general
```

## 🎨 Frontend Flutter Web

### 1. Configurar variables de entorno

Crear archivo `lib/core/config/environment.dart`:

```dart
class Environment {
  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'https://tu-backend.vercel.app',
  );
  
  static const String wsUrl = String.fromEnvironment(
    'WS_URL',
    defaultValue: 'wss://tu-backend.vercel.app',
  );
  
  static const bool isProduction = bool.fromEnvironment(
    'PRODUCTION',
    defaultValue: false,
  );
}
```

### 2. Compilar para producción

```bash
cd S/aplicacionWZC/madres_digitales_flutter_new

# Compilar para web
flutter build web --release --dart-define=API_URL=https://tu-backend.vercel.app --dart-define=PRODUCTION=true

# Los archivos compilados estarán en build/web/
```

### 3. Desplegar Frontend en Vercel

Crear `vercel.json` en el directorio del frontend:

```json
{
  "version": 2,
  "buildCommand": "flutter build web --release",
  "outputDirectory": "build/web",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Desplegar:
```bash
cd S/aplicacionWZC/madres_digitales_flutter_new
vercel --prod
```

## 🔐 Seguridad en Producción

### 1. Configurar CORS correctamente

En `api/index.js`:
```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'https://tu-frontend.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### 2. Verificar JWT_SECRET

Asegúrate de usar un secreto fuerte en producción:
```bash
# Generar un secreto seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Rate Limiting

Agregar en `api/index.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por IP
});

app.use('/api/', limiter);
```

## 📊 Monitoreo

### 1. Logs en Vercel
```bash
vercel logs --follow
```

### 2. Analytics
- Activar Vercel Analytics en el dashboard
- Configurar alertas para errores

### 3. Health Check
Endpoint: `GET /health`
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-11-24T04:50:00.000Z"
}
```

## 🔄 CI/CD Automático

### Conectar con GitHub

1. Ir a Vercel Dashboard
2. Import Project → From Git
3. Seleccionar repositorio
4. Configurar:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build` (backend) o `flutter build web` (frontend)
   - **Output Directory**: `api` (backend) o `build/web` (frontend)
   - **Install Command**: `npm install` (backend) o `flutter pub get` (frontend)

### Auto-deploy
- **Production**: Push a `main` branch
- **Preview**: Push a cualquier otra branch

## 🐛 Troubleshooting

### Error: "Function execution timed out"
- Aumentar `maxDuration` en vercel.json
- Optimizar queries de base de datos
- Agregar índices en Prisma

### Error: "Module not found"
- Verificar que todas las dependencias estén en `package.json`
- Ejecutar `npm install` localmente
- Verificar que `node_modules` no esté en `.vercelignore`

### Error: "Database connection failed"
- Verificar `DATABASE_URL` en variables de entorno
- Verificar que la IP de Vercel esté permitida en tu base de datos
- Usar connection pooling (PgBouncer)

### Error de CORS
- Verificar `ALLOWED_ORIGINS` en variables de entorno
- Verificar configuración de CORS en `api/index.js`

## 📝 Checklist Final

### Backend
- [ ] Variables de entorno configuradas en Vercel
- [ ] Base de datos de producción configurada
- [ ] Migraciones de Prisma ejecutadas
- [ ] CORS configurado correctamente
- [ ] JWT_SECRET seguro configurado
- [ ] Rate limiting activado
- [ ] Health check funcionando
- [ ] Logs monitoreados

### Frontend
- [ ] API_URL apuntando a producción
- [ ] Compilado con `--release`
- [ ] Variables de entorno configuradas
- [ ] Rutas configuradas correctamente
- [ ] Assets optimizados
- [ ] Service worker configurado (PWA)

### Testing
- [ ] Probar login
- [ ] Probar endpoints principales
- [ ] Probar descarga de PDFs
- [ ] Probar WebSocket (si aplica)
- [ ] Probar en diferentes navegadores
- [ ] Probar en móvil

## 🎯 URLs de Producción

Una vez desplegado, tendrás:

- **Backend API**: `https://tu-proyecto-backend.vercel.app`
- **Frontend Web**: `https://tu-proyecto-frontend.vercel.app`
- **Health Check**: `https://tu-proyecto-backend.vercel.app/health`
- **API Docs**: `https://tu-proyecto-backend.vercel.app/api-docs` (si tienes Swagger)

## 📞 Soporte

Si encuentras problemas:
1. Revisar logs: `vercel logs`
2. Verificar variables de entorno
3. Probar endpoints localmente primero
4. Revisar documentación de Vercel: https://vercel.com/docs

---

**Última actualización**: 24 de Noviembre, 2025
**Versión**: 1.0.0
