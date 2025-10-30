# Configuración de Variables de Entorno

## 📋 Archivos de Configuración

### `.env` (Producción)
- **Ubicación**: `aplicacionWZC/madres-digitales-backend/.env`
- **Propósito**: Configuración para Vercel/Producción
- **Estado**: ✅ Configurado y listo para producción
- **Contiene**:
  - Base de datos de Prisma Cloud
  - JWT Secrets seguros
  - URLs de producción (Vercel)
  - CORS configurado para dominio de producción

### `.env.local` (Desarrollo Local)
- **Ubicación**: `aplicacionWZC/madres-digitales-backend/.env.local`
- **Propósito**: Configuración para desarrollo local
- **Creado**: ✅ Nuevo archivo para pruebas locales
- **Contiene**:
  - Base de datos local (PostgreSQL)
  - JWT Secrets simples para desarrollo
  - URLs locales (localhost)
  - CORS abierto para desarrollo

### `.env.example` (Plantilla)
- **Ubicación**: `aplicacionWZC/madres-digitales-backend/.env.example`
- **Propósito**: Plantilla para otros desarrolladores
- **Uso**: Referencia de qué variables se necesitan

## 🚀 Cómo Usar

### Para Desarrollo Local

1. **Asegúrate de tener PostgreSQL corriendo localmente**:
   ```bash
   # En Windows (si usas PostgreSQL instalado)
   # El servicio debe estar corriendo
   
   # O usa Docker:
   docker run --name postgres-dev -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
   ```

2. **El archivo `.env.local` ya está configurado**:
   - Node.js automáticamente cargará `.env.local` en desarrollo
   - No necesitas hacer nada más

3. **Ejecuta la aplicación**:
   ```bash
   npm run dev
   # o
   npm start
   ```

4. **Sincroniza la base de datos**:
   ```bash
   npx prisma migrate dev
   # o
   npx prisma db push
   ```

### Para Producción (Vercel)

1. **El archivo `.env` contiene las configuraciones de producción**
2. **Vercel cargará automáticamente estas variables**
3. **No necesitas hacer nada especial**

## ⚠️ Importante

### Seguridad
- ✅ `.env` está en `.gitignore` (no se sube a Git)
- ✅ `.env.local` está en `.gitignore` (no se sube a Git)
- ✅ Solo `.env.example` se sube a Git (sin valores sensibles)

### Prioridad de Carga
Node.js carga las variables en este orden:
1. `.env.local` (si existe) - Desarrollo local
2. `.env` - Producción o configuración por defecto
3. Variables del sistema

### Cambiar Base de Datos

**Para usar la BD de Prisma Cloud en desarrollo**:
```bash
# Edita .env.local y descomenta:
# DATABASE_URL="postgres://ff07eebc333c5499909e4b9766469e0b08d9c9e62beb8a9e5f426f3c793632a1:sk_fSmVWDgDBhkj8E1xooYPd@db.prisma.io:5432/postgres?sslmode=require"

# Y comenta la línea de PostgreSQL local
```

**Para usar PostgreSQL local**:
```bash
# Asegúrate de que .env.local tenga:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/madres_digitales_dev?schema=public"
```

## 🔍 Verificar Configuración

```bash
# Ver qué variables se están usando:
npm run dev

# Deberías ver en los logs:
# ✅ Database connected
# ✅ Server running on port 3000
```

## 📝 Resumen

| Archivo | Propósito | Ambiente | Git |
|---------|-----------|----------|-----|
| `.env` | Producción | Vercel | ❌ Ignorado |
| `.env.local` | Desarrollo | Local | ❌ Ignorado |
| `.env.example` | Plantilla | Referencia | ✅ Incluido |

## ✅ Estado Actual

- ✅ `.env` - Configurado para Vercel (LISTO PARA PRODUCCIÓN)
- ✅ `.env.local` - Configurado para desarrollo local (LISTO PARA PRUEBAS)
- ✅ Puedes probar localmente sin perder configuraciones de producción

