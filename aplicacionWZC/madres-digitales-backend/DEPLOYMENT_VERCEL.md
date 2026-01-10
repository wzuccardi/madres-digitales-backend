# Deployment en Vercel - Backend

## Configuración Rápida

### 1. Conectar Repositorio
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en "Add New" → "Project"
3. Importa el repositorio: `https://github.com/wzuccardi/madres-digitales-backend`

### 2. Configuración del Proyecto

**Framework Preset:** Other
**Root Directory:** `./`
**Build Command:** `npm run vercel-build`
**Output Directory:** (dejar vacío)
**Install Command:** `npm install`

### 3. Variables de Entorno Requeridas

Configura estas variables en Vercel Dashboard → Settings → Environment Variables:

```env
# Database (Supabase)
DATABASE_URL=postgres://user:password@host:5432/database?sslmode=require
PRISMA_DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=your_api_key

# JWT Secrets
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# Environment
NODE_ENV=production
PORT=3000

# CORS
CORS_ORIGINS=https://madres-digitales-frontend.vercel.app,https://madres-digitales.vercel.app

# URLs
FRONTEND_URL=https://madres-digitales-frontend.vercel.app
BACKEND_URL=https://madres-digitales-backend.vercel.app
```

### 4. Deploy

Una vez configurado, Vercel desplegará automáticamente:
- En cada push a la rama principal
- En cada pull request (preview deployment)

### 5. Verificación Post-Deploy

Verifica que el API esté funcionando:
```bash
curl https://madres-digitales-backend.vercel.app/api/health
```

## Estructura del Proyecto

```
madres-digitales-backend/
├── api/
│   └── index.js          # Entry point para Vercel
├── src/                  # Código fuente
├── prisma/              # Schema de base de datos
├── vercel.json          # Configuración de Vercel
└── package.json         # Dependencies y scripts
```

## Comandos Importantes

```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Generar Prisma Client
npm run vercel-build
```

## Troubleshooting

### Error: Prisma Client no generado
- Verifica que `vercel-build` script esté en package.json
- Asegúrate que DATABASE_URL esté configurado

### Error: Timeout en funciones
- Las funciones serverless tienen límite de 30s
- Optimiza queries de base de datos
- Considera usar Prisma Accelerate

### Error: CORS
- Verifica CORS_ORIGINS en variables de entorno
- Asegúrate que incluya el dominio del frontend

## Monitoreo

- **Logs:** Vercel Dashboard → Deployments → [tu deployment] → Logs
- **Analytics:** Vercel Dashboard → Analytics
- **Errors:** Vercel Dashboard → Errors

## Notas Importantes

1. **Prisma Generate:** Se ejecuta automáticamente en build
2. **Migrations:** No se ejecutan automáticamente, hazlo manualmente
3. **Uploads:** Los archivos subidos no persisten, usa almacenamiento externo (S3, Cloudinary)
4. **WebSockets:** No soportados en Vercel, considera alternativas
