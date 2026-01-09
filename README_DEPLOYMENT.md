# 🚀 Guía Rápida de Deployment - Madres Digitales

## 📦 Repositorios

- **Backend**: https://github.com/wzuccardi/madres-digitales-backend-CleanArchitecture
- **Frontend**: https://github.com/wzuccardi/madres-digitales-frontend-CleanArchitecture

## ⚡ Deployment Rápido

### Frontend en Vercel (Recomendado)

#### Opción 1: Desde Dashboard (Más Fácil)

1. **Ir a Vercel**: https://vercel.com/new
2. **Importar repositorio**: `madres-digitales-frontend-CleanArchitecture`
3. **Configurar**:
   ```
   Build Command: bash install-flutter.sh && flutter build web --release --web-renderer canvaskit
   Output Directory: build/web
   Install Command: (dejar vacío)
   ```
4. **Variables de Entorno**:
   ```
   FLUTTER_VERSION=3.19.6
   API_URL=https://tu-backend.vercel.app/api
   ENVIRONMENT=production
   ```
5. **Deploy** ✅

#### Opción 2: Con Script PowerShell

```powershell
# Ejecutar script de deployment
.\DEPLOY_TO_VERCEL.ps1
```

#### Opción 3: Con CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Ir al directorio del frontend
cd S/aplicacionWZC/madres_digitales_flutter_new

# Build
flutter build web --release --web-renderer canvaskit

# Deploy
vercel --prod
```

### Backend en Vercel/DigitalOcean

#### Vercel (Serverless)

1. **Ir a Vercel**: https://vercel.com/new
2. **Importar**: `madres-digitales-backend-CleanArchitecture`
3. **Configurar**:
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```
4. **Variables de Entorno**:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=...
   JWT_REFRESH_SECRET=...
   NODE_ENV=production
   CORS_ORIGIN=https://tu-frontend.vercel.app
   ```
5. **Deploy** ✅

#### DigitalOcean (Droplet)

Ver guía completa en: `DEPLOYMENT_GUIDE.md`

```bash
# Crear Droplet Ubuntu 22.04
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clonar repositorio
git clone https://github.com/wzuccardi/madres-digitales-backend-CleanArchitecture.git
cd madres-digitales-backend-CleanArchitecture

# Configurar .env
cp .env.example .env
nano .env

# Build y ejecutar
docker build -t madres-backend .
docker run -d --name madres-backend -p 3000:3000 --env-file .env madres-backend
```

## 🔐 Variables de Entorno Requeridas

### Frontend

```env
FLUTTER_VERSION=3.19.6
API_URL=https://api.tudominio.com/api
ENVIRONMENT=production
```

### Backend

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=<generar con: openssl rand -base64 32>
JWT_REFRESH_SECRET=<generar con: openssl rand -base64 32>
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://tudominio.com
```

## 🌐 Configurar Dominio

### DNS

```
Tipo    Nombre    Valor                           TTL
CNAME   app       cname.vercel-dns.com           3600
CNAME   api       cname.vercel-dns.com           3600
```

### En Vercel

1. Proyecto > Settings > Domains
2. Add Domain: `app.tudominio.com`
3. Seguir instrucciones

## ✅ Verificación

### Frontend

```bash
# Verificar que carga
curl -I https://app.tudominio.com

# Debe retornar: HTTP/2 200
```

### Backend

```bash
# Health check
curl https://api.tudominio.com/health

# Debe retornar: {"status":"ok"}
```

### Funcionalidad

- [ ] Página de login carga
- [ ] Puede hacer login
- [ ] Dashboard muestra datos
- [ ] Navegación funciona
- [ ] Responsive en móvil

## 📊 Monitoreo

### Vercel Dashboard

- Ver deployments: https://vercel.com/dashboard
- Ver logs en tiempo real
- Ver analytics

### Logs

```bash
# Ver logs de Vercel
vercel logs

# Ver logs de deployment específico
vercel logs [deployment-url]
```

## 🔄 Actualizaciones

### Automático (Recomendado)

Vercel despliega automáticamente cuando haces push:

```bash
git add .
git commit -m "Update"
git push origin master
```

### Manual

```bash
# Frontend
cd S/aplicacionWZC/madres_digitales_flutter_new
flutter build web --release
vercel --prod

# Backend
cd S/aplicacionWZC/madres-digitales-backend
npm run build
vercel --prod
```

## 🆘 Troubleshooting

### Build Failed

```bash
# Limpiar y rebuild
flutter clean
flutter pub get
flutter build web --release
```

### CORS Error

Actualizar `CORS_ORIGIN` en backend con la URL del frontend:

```env
CORS_ORIGIN=https://app.tudominio.com,https://madres-digitales-frontend.vercel.app
```

### Assets No Cargan

Verificar rutas en `vercel.json` y que assets estén en `pubspec.yaml`

## 📚 Documentación Completa

- **Deployment Vercel**: `VERCEL_DEPLOYMENT.md`
- **Deployment General**: `DEPLOYMENT_GUIDE.md`
- **Backend README**: `aplicacionWZC/madres-digitales-backend/README.md`
- **Frontend README**: `aplicacionWZC/madres_digitales_flutter_new/README.md`

## 💰 Costos Estimados

### Plan Gratuito (Hobby)

- **Vercel Frontend**: $0/mes
- **Vercel Backend**: $0/mes (con límites)
- **Total**: $0/mes

### Plan Producción

- **Vercel Pro**: $20/mes (ambos proyectos)
- **DigitalOcean Droplet**: $24/mes (backend)
- **DigitalOcean Database**: $15/mes (PostgreSQL)
- **Total**: $59/mes

## 📞 Soporte

- **Email**: wzuccardi@gmail.com
- **GitHub Backend**: https://github.com/wzuccardi/madres-digitales-backend-CleanArchitecture/issues
- **GitHub Frontend**: https://github.com/wzuccardi/madres-digitales-frontend-CleanArchitecture/issues

## ✨ Checklist Final

- [ ] Repositorios en GitHub
- [ ] Frontend desplegado en Vercel
- [ ] Backend desplegado
- [ ] Base de datos configurada
- [ ] Variables de entorno configuradas
- [ ] Dominio configurado (opcional)
- [ ] SSL funcionando
- [ ] CORS configurado
- [ ] Health checks OK
- [ ] Login funciona
- [ ] Datos se muestran correctamente

¡Deployment completado! 🎉
