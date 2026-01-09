# 🚀 Guía Completa de Deployment - Madres Digitales

## 📋 Índice

1. [Resumen del Sistema](#resumen-del-sistema)
2. [Repositorios](#repositorios)
3. [Arquitectura de Deployment](#arquitectura-de-deployment)
4. [Preparación](#preparación)
5. [Deployment Backend](#deployment-backend)
6. [Deployment Frontend](#deployment-frontend)
7. [Configuración de Dominio](#configuración-de-dominio)
8. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)
9. [Troubleshooting](#troubleshooting)

## 🎯 Resumen del Sistema

**Madres Digitales** es un sistema de monitoreo de salud materna compuesto por:

- **Backend**: API REST con Node.js + TypeScript + PostgreSQL
- **Frontend**: Aplicación Flutter (Web + Móvil)
- **Base de Datos**: PostgreSQL 15 con PostGIS
- **Cache**: Redis (opcional)

## 📦 Repositorios

### Backend
```
https://github.com/wzuccardi/madres-digitales-backend-CleanArchitecture
```

### Frontend
```
https://github.com/wzuccardi/madres-digitales-frontend-CleanArchitecture
```

## 🏗️ Arquitectura de Deployment

```
┌─────────────────────────────────────────────────────────┐
│                    Internet                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Nginx Reverse Proxy                         │
│         (SSL/TLS, Load Balancing)                        │
└────────┬────────────────────────────────┬───────────────┘
         │                                 │
         ▼                                 ▼
┌──────────────────┐            ┌──────────────────────┐
│  Frontend Web    │            │   Backend API        │
│  (Flutter Web)   │            │   (Node.js)          │
│  Port: 8080      │            │   Port: 3000         │
└──────────────────┘            └──────┬───────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────┐
                        │   PostgreSQL + PostGIS   │
                        │   Port: 5432             │
                        └──────────────────────────┘
```

## 🔧 Preparación

### 1. Servidor (DigitalOcean Droplet)

**Especificaciones Mínimas:**
- **CPU**: 2 vCPUs
- **RAM**: 4GB
- **Disco**: 80GB SSD
- **OS**: Ubuntu 22.04 LTS
- **Costo**: ~$24/mes

**Crear Droplet:**

1. Ir a DigitalOcean Dashboard
2. Create > Droplets
3. Seleccionar:
   - Ubuntu 22.04 LTS
   - Basic Plan - $24/mes (2GB RAM)
   - Región: New York 3
   - Habilitar: Monitoring, IPv6, Backups
4. Agregar SSH Key
5. Create Droplet

### 2. Configuración Inicial del Servidor

```bash
# Conectar al servidor
ssh root@YOUR_SERVER_IP

# Actualizar sistema
apt update && apt upgrade -y

# Crear usuario no-root
adduser deploy
usermod -aG sudo deploy

# Configurar firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Instalar dependencias básicas
apt install -y curl git build-essential
```

### 3. Instalar Docker y Docker Compose

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install docker-compose-plugin -y

# Agregar usuario al grupo docker
usermod -aG docker deploy

# Verificar instalación
docker --version
docker compose version
```

### 4. Instalar Node.js (opcional, si no usas Docker)

```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Instalar Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# Verificar
node --version
npm --version
```

## 🔙 Deployment Backend

### Opción 1: Docker (Recomendado)

```bash
# Cambiar a usuario deploy
su - deploy

# Crear directorio
mkdir -p /opt/madres-digitales
cd /opt/madres-digitales

# Clonar repositorio backend
git clone https://github.com/wzuccardi/madres-digitales-backend-CleanArchitecture.git backend
cd backend

# Crear archivo .env
nano .env
```

**Contenido del .env:**

```env
# Base de Datos
DATABASE_URL=postgresql://madres_user:STRONG_PASSWORD@postgres:5432/madres_digitales_prod

# JWT Secrets (generar con: openssl rand -base64 32)
JWT_SECRET=tu_jwt_secret_generado
JWT_REFRESH_SECRET=tu_refresh_secret_generado

# Server
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# CORS
CORS_ORIGIN=https://tudominio.com,https://www.tudominio.com

# Logging
LOG_LEVEL=info
```

**Generar secrets seguros:**

```bash
# JWT Secret
openssl rand -base64 32

# JWT Refresh Secret
openssl rand -base64 32
```

**Build y ejecutar:**

```bash
# Build imagen
docker build -t madres-backend:latest .

# Ejecutar contenedor
docker run -d \
  --name madres-backend \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  madres-backend:latest

# Ver logs
docker logs -f madres-backend

# Verificar salud
curl http://localhost:3000/health
```

### Opción 2: PM2 (Sin Docker)

```bash
# Instalar PM2
npm install -g pm2

# Clonar y configurar
git clone https://github.com/wzuccardi/madres-digitales-backend-CleanArchitecture.git backend
cd backend
npm install

# Crear .env (igual que arriba)

# Ejecutar migraciones
npx prisma migrate deploy
npx prisma generate

# Build
npm run build

# Iniciar con PM2
pm2 start dist/app.js --name madres-backend

# Guardar configuración PM2
pm2 save
pm2 startup

# Ver logs
pm2 logs madres-backend
```

### Base de Datos PostgreSQL

**Opción A: Docker**

```bash
# Ejecutar PostgreSQL con PostGIS
docker run -d \
  --name madres-postgres \
  --restart unless-stopped \
  -e POSTGRES_DB=madres_digitales_prod \
  -e POSTGRES_USER=madres_user \
  -e POSTGRES_PASSWORD=STRONG_PASSWORD \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgis/postgis:15-3.3-alpine

# Verificar
docker exec madres-postgres psql -U madres_user -d madres_digitales_prod -c "SELECT version();"
```

**Opción B: DigitalOcean Managed Database**

1. Ir a Databases en DigitalOcean
2. Create Database Cluster
3. Seleccionar PostgreSQL 15
4. Plan: Basic ($15/mes)
5. Copiar connection string
6. Actualizar DATABASE_URL en .env

## 🎨 Deployment Frontend

### Web (Vercel) - Recomendado

```bash
# Instalar Vercel CLI
npm install -g vercel

# Clonar repositorio
git clone https://github.com/wzuccardi/madres-digitales-frontend-CleanArchitecture.git frontend
cd frontend

# Build Flutter Web
flutter build web --release --web-renderer canvaskit

# Deploy a Vercel
cd build/web
vercel --prod

# Seguir instrucciones en pantalla
```

**Configurar en Vercel Dashboard:**

1. Ir a vercel.com
2. Import Project
3. Conectar GitHub
4. Seleccionar repositorio frontend
5. Configurar:
   - Framework Preset: Other
   - Build Command: `flutter build web --release`
   - Output Directory: `build/web`
6. Deploy

### Web (Docker + Nginx)

```bash
# En el servidor
cd /opt/madres-digitales

# Clonar frontend
git clone https://github.com/wzuccardi/madres-digitales-frontend-CleanArchitecture.git frontend
cd frontend

# Build imagen
docker build -t madres-frontend:latest .

# Ejecutar
docker run -d \
  --name madres-frontend \
  --restart unless-stopped \
  -p 8080:8080 \
  madres-frontend:latest
```

### Android APK

```bash
# En tu máquina local
cd frontend

# Build APK
flutter build apk --release --split-per-abi

# APKs generados en:
# build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk
# build/app/outputs/flutter-apk/app-arm64-v8a-release.apk
# build/app/outputs/flutter-apk/app-x86_64-release.apk

# Distribuir APK
# - Subir a Google Play Store
# - O distribuir directamente
```

## 🌐 Configuración de Dominio

### 1. Configurar DNS

En tu proveedor de dominio (GoDaddy, Namecheap, etc.):

```
Tipo    Nombre    Valor                TTL
A       @         YOUR_SERVER_IP       3600
A       www       YOUR_SERVER_IP       3600
A       api       YOUR_SERVER_IP       3600
CNAME   www       tudominio.com        3600
```

### 2. Instalar Nginx

```bash
# Instalar Nginx
sudo apt install nginx -y

# Crear configuración
sudo nano /etc/nginx/sites-available/madres-digitales
```

**Contenido de la configuración:**

```nginx
# Backend API
server {
    listen 80;
    server_name api.tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend Web
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Activar configuración:**

```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/madres-digitales /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 3. Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificados
sudo certbot --nginx -d tudominio.com -d www.tudominio.com -d api.tudominio.com

# Seguir instrucciones
# Seleccionar: Redirect HTTP to HTTPS

# Verificar renovación automática
sudo certbot renew --dry-run
```

## 📊 Monitoreo y Mantenimiento

### Health Checks

```bash
# Backend
curl https://api.tudominio.com/health

# Frontend
curl https://tudominio.com

# Base de datos
docker exec madres-postgres pg_isready
```

### Logs

```bash
# Backend (Docker)
docker logs -f madres-backend

# Backend (PM2)
pm2 logs madres-backend

# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL
docker logs -f madres-postgres
```

### Backups

**Base de Datos:**

```bash
# Backup manual
docker exec madres-postgres pg_dump -U madres_user madres_digitales_prod > backup_$(date +%Y%m%d).sql

# Backup automático (crontab)
crontab -e

# Agregar línea:
0 2 * * * docker exec madres-postgres pg_dump -U madres_user madres_digitales_prod > /backups/backup_$(date +\%Y\%m\%d).sql
```

**Código:**

```bash
# Backup automático con Git
cd /opt/madres-digitales/backend
git pull origin master
```

### Actualizaciones

**Backend:**

```bash
# Con Docker
cd /opt/madres-digitales/backend
git pull origin master
docker build -t madres-backend:latest .
docker stop madres-backend
docker rm madres-backend
docker run -d --name madres-backend --restart unless-stopped -p 3000:3000 --env-file .env madres-backend:latest

# Con PM2
cd /opt/madres-digitales/backend
git pull origin master
npm install
npm run build
pm2 restart madres-backend
```

**Frontend:**

```bash
# Vercel (automático con push a master)
git push origin master

# Docker
cd /opt/madres-digitales/frontend
git pull origin master
docker build -t madres-frontend:latest .
docker stop madres-frontend
docker rm madres-frontend
docker run -d --name madres-frontend --restart unless-stopped -p 8080:8080 madres-frontend:latest
```

## 🔧 Troubleshooting

### Backend no responde

```bash
# Verificar contenedor
docker ps -a
docker logs madres-backend

# Reiniciar
docker restart madres-backend

# Verificar puerto
sudo netstat -tulpn | grep 3000
```

### Error de base de datos

```bash
# Verificar PostgreSQL
docker exec madres-postgres psql -U madres_user -d madres_digitales_prod -c "SELECT 1;"

# Ver logs
docker logs madres-postgres

# Reiniciar
docker restart madres-postgres
```

### SSL no funciona

```bash
# Verificar certificados
sudo certbot certificates

# Renovar manualmente
sudo certbot renew

# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx
```

### Frontend no carga

```bash
# Verificar contenedor
docker logs madres-frontend

# Verificar Nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log

# Limpiar cache del navegador
```

## 📞 Soporte

- **Email**: wzuccardi@gmail.com
- **GitHub Backend**: https://github.com/wzuccardi/madres-digitales-backend-CleanArchitecture
- **GitHub Frontend**: https://github.com/wzuccardi/madres-digitales-frontend-CleanArchitecture

## ✅ Checklist de Deployment

- [ ] Servidor creado y configurado
- [ ] Docker instalado
- [ ] Repositorios clonados
- [ ] Variables de entorno configuradas
- [ ] Base de datos PostgreSQL funcionando
- [ ] Backend desplegado y respondiendo
- [ ] Frontend desplegado
- [ ] DNS configurado
- [ ] Nginx configurado
- [ ] SSL/TLS configurado
- [ ] Health checks funcionando
- [ ] Backups configurados
- [ ] Monitoreo activo

¡Deployment completado! 🎉
