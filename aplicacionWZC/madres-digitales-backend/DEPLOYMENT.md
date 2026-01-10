# 🚀 Guía de Deployment - Madres Digitales Backend

## 📋 Tabla de Contenidos

- [Requisitos](#requisitos)
- [Deployment con Docker](#deployment-con-docker)
- [Deployment en DigitalOcean](#deployment-en-digitalocean)
- [Variables de Entorno](#variables-de-entorno)
- [Base de Datos](#base-de-datos)
- [Monitoreo](#monitoreo)
- [Troubleshooting](#troubleshooting)

## 🔧 Requisitos

### Servidor

- **CPU**: 2 cores mínimo
- **RAM**: 2GB mínimo (4GB recomendado)
- **Disco**: 20GB mínimo
- **OS**: Ubuntu 22.04 LTS o superior

### Software

- Docker 24.0+
- Docker Compose 2.20+
- PostgreSQL 15+ con PostGIS
- Node.js 20 LTS (si no usas Docker)

## 🐳 Deployment con Docker

### 1. Preparar el Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
```

### 2. Clonar Repositorio

```bash
git clone https://github.com/wzuccardi/madres-digitales-backend-CleanArchitecture.git
cd madres-digitales-backend-CleanArchitecture
```

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus valores
nano .env
```

### 4. Build y Deploy

```bash
# Build de la imagen
docker build -t madres-digitales-backend:latest .

# Ejecutar contenedor
docker run -d \
  --name madres-backend \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  madres-digitales-backend:latest
```

### 5. Verificar Deployment

```bash
# Ver logs
docker logs -f madres-backend

# Verificar salud
curl http://localhost:3000/health
```

## ☁️ Deployment en DigitalOcean

### Opción 1: Droplet con Docker

1. **Crear Droplet**
   - Imagen: Ubuntu 22.04 LTS
   - Plan: Basic ($12/mes - 2GB RAM)
   - Región: New York 3
   - Habilitar: Monitoring, IPv6

2. **Configurar Firewall**
   ```bash
   # Permitir SSH, HTTP, HTTPS
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

3. **Instalar Docker** (ver sección anterior)

4. **Deploy con Docker Compose**
   ```bash
   # Usar docker-compose.prod.yml del repositorio principal
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Opción 2: App Platform

1. **Conectar Repositorio**
   - Ir a App Platform en DigitalOcean
   - Conectar GitHub
   - Seleccionar repositorio

2. **Configurar Build**
   ```yaml
   name: madres-digitales-backend
   services:
   - name: api
     github:
       repo: wzuccardi/madres-digitales-backend-CleanArchitecture
       branch: master
     build_command: npm run build
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     http_port: 3000
     routes:
     - path: /
   ```

3. **Configurar Base de Datos**
   - Crear PostgreSQL Managed Database
   - Versión: 15
   - Plan: Basic ($15/mes)
   - Agregar extensión PostGIS

4. **Variables de Entorno**
   - Agregar en App Platform Settings
   - Usar ${db.DATABASE_URL} para la conexión

## 🔐 Variables de Entorno

### Producción

```env
# Base de Datos
DATABASE_URL=postgresql://user:password@host:5432/madres_digitales_prod

# JWT Secrets (generar con: openssl rand -base64 32)
JWT_SECRET=<secret-generado>
JWT_REFRESH_SECRET=<secret-generado>

# Server
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# CORS
CORS_ORIGIN=https://tudominio.com,https://www.tudominio.com

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Upload
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=5242880
```

### Generar Secrets Seguros

```bash
# JWT Secret
openssl rand -base64 32

# JWT Refresh Secret
openssl rand -base64 32

# Encryption Key
openssl rand -hex 32
```

## 🗄️ Base de Datos

### Setup Inicial

```bash
# Conectar a PostgreSQL
psql -h localhost -U postgres

# Crear base de datos
CREATE DATABASE madres_digitales_prod;

# Habilitar PostGIS
\c madres_digitales_prod
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Migraciones

```bash
# Ejecutar migraciones
npx prisma migrate deploy

# Verificar estado
npx prisma migrate status

# Seed inicial (opcional)
npx prisma db seed
```

### Backups

```bash
# Backup manual
pg_dump -h localhost -U postgres madres_digitales_prod > backup_$(date +%Y%m%d).sql

# Backup automático (cron)
0 2 * * * pg_dump -h localhost -U postgres madres_digitales_prod > /backups/backup_$(date +\%Y\%m\%d).sql
```

### Restore

```bash
# Restaurar desde backup
psql -h localhost -U postgres madres_digitales_prod < backup_20241121.sql
```

## 📊 Monitoreo

### Health Check

```bash
# Endpoint de salud
curl http://localhost:3000/health

# Respuesta esperada
{
  "status": "ok",
  "timestamp": "2024-11-21T10:00:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

### Logs

```bash
# Ver logs en tiempo real
docker logs -f madres-backend

# Últimas 100 líneas
docker logs --tail 100 madres-backend

# Logs con timestamp
docker logs -t madres-backend
```

### Métricas

```bash
# Uso de recursos
docker stats madres-backend

# Procesos
docker top madres-backend
```

## 🔧 Troubleshooting

### Error: Cannot connect to database

```bash
# Verificar conexión
docker exec madres-backend npx prisma db pull

# Verificar variables de entorno
docker exec madres-backend env | grep DATABASE_URL

# Reiniciar contenedor
docker restart madres-backend
```

### Error: Port already in use

```bash
# Encontrar proceso usando el puerto
sudo lsof -i :3000

# Matar proceso
sudo kill -9 <PID>

# O cambiar puerto en .env
PORT=3001
```

### Error: Out of memory

```bash
# Aumentar límite de memoria
docker run -d \
  --name madres-backend \
  --memory="2g" \
  --memory-swap="2g" \
  -p 3000:3000 \
  madres-digitales-backend:latest
```

### Logs de Error

```bash
# Ver solo errores
docker logs madres-backend 2>&1 | grep ERROR

# Exportar logs
docker logs madres-backend > logs_$(date +%Y%m%d).txt
```

## 🔄 Actualización

### Rolling Update

```bash
# Pull última versión
git pull origin master

# Build nueva imagen
docker build -t madres-digitales-backend:latest .

# Detener contenedor actual
docker stop madres-backend

# Eliminar contenedor
docker rm madres-backend

# Iniciar nuevo contenedor
docker run -d \
  --name madres-backend \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  madres-digitales-backend:latest
```

### Zero Downtime Update

```bash
# Iniciar nuevo contenedor en puerto diferente
docker run -d \
  --name madres-backend-new \
  -p 3001:3000 \
  --env-file .env \
  madres-digitales-backend:latest

# Verificar que funciona
curl http://localhost:3001/health

# Actualizar nginx/load balancer para apuntar a 3001

# Detener contenedor viejo
docker stop madres-backend
docker rm madres-backend

# Renombrar nuevo contenedor
docker rename madres-backend-new madres-backend
```

## 🔒 Seguridad

### SSL/TLS

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d api.tudominio.com

# Renovación automática
sudo certbot renew --dry-run
```

### Firewall

```bash
# Configurar UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Fail2Ban

```bash
# Instalar
sudo apt install fail2ban

# Configurar
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 📞 Soporte

Para problemas de deployment:
- Email: wzuccardi@gmail.com
- GitHub Issues: https://github.com/wzuccardi/madres-digitales-backend-CleanArchitecture/issues
