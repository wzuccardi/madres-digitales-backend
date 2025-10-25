# Guía de Despliegue en Vercel - Madres Digitales Backend

## Overview

Esta guía explica cómo desplegar el backend de Madres Digitales en Vercel utilizando Serverless Functions.

## Requisitos Previos

1. **Cuenta en Vercel**: [https://vercel.com](https://vercel.com)
2. **GitHub Repository**: El código debe estar en un repositorio GitHub
3. **Base de Datos PostgreSQL**: Configurada y accesible (Vercel Postgres o externa)
4. **Variables de Entorno**: Configuradas en Vercel

## Configuración del Proyecto

### 1. Estructura de Archivos para Vercel

```
madres-digitales-backend/
├── api/
│   └── index.js              # Entry point para Vercel Serverless
├── src/
│   ├── app.ts                # Aplicación Express
│   ├── server.ts             # Servidor tradicional (local)
│   └── ...                   # Resto del código fuente
├── prisma/
│   └── schema.prisma        # Esquema de base de datos
├── vercel.json               # Configuración de Vercel
├── package.json              # Dependencias y scripts
└── .env.production.example   # Variables de entorno ejemplo
```

### 2. Archivos Clave para Vercel

#### `vercel.json`
- Configura las rutas y funciones serverless
- Define headers CORS para archivos estáticos
- Establece tiempo máximo de ejecución (30s)

#### `api/index.js`
- Punto de entrada para las funciones serverless
- Maneja la conexión con Prisma
- Configura CORS para todas las respuestas

#### `package.json` (scripts actualizados)
```json
{
  "scripts": {
    "vercel-build": "npm run build",
    "postinstall": "npx prisma generate",
    "build": "tsc && npx prisma generate"
  }
}
```

## Pasos para el Despliegue

### 1. Configurar Variables de Entorno en Vercel

En el dashboard de Vercel, ve a `Settings > Environment Variables` y agrega:

**Variables Requeridas:**
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `JWT_SECRET`: Secret para tokens JWT
- `JWT_REFRESH_SECRET`: Secret para refresh tokens
- `CORS_ORIGINS`: Dominios permitidos (separados por comas)

**Variables Opcionales:**
- `NODE_ENV`: `production` (automático en Vercel)
- `LOG_LEVEL`: `info` o `error`
- `RATE_LIMIT_WINDOW_MS`: Ventana de rate limiting
- `RATE_LIMIT_MAX_REQUESTS`: Máximo de requests por ventana

### 2. Conectar Repositorio GitHub

1. En Vercel, haz clic en "Add New Project"
2. Importa tu repositorio GitHub
3. Vercel detectará automáticamente que es un proyecto Node.js

### 3. Configurar Build Settings

Vercel usará la configuración de `vercel.json`, pero verifica:

- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. Configurar Base de Datos

#### Opción A: Vercel Postgres (Recomendado)
1. En el proyecto Vercel, ve a `Storage`
2. Crea una nueva base de datos PostgreSQL
3. Copia el `DATABASE_URL` proporcionado
4. Agrégalo a las variables de entorno

#### Opción B: Base de Datos Externa
1. Asegúrate que la base de datos sea accesible desde Vercel
2. Configura `DATABASE_URL` con la conexión completa
3. Verifica que SSL esté habilitado (`sslmode=require`)

### 5. Ejecutar Migraciones

Para Vercel, las migraciones deben ejecutarse manualmente:

```bash
# Localmente, apuntando a la base de datos de producción
DATABASE_URL="tu_production_db_url" npx prisma migrate deploy
```

O crea un script de migración que se ejecute durante el build.

### 6. Despliegue Automático

Una vez configurado, cada push a la rama principal desencadenará un despliegue automático.

## Consideraciones Especiales

### 1. Limitaciones de Serverless

- **Tiempo de ejecución**: Máximo 30 segundos por función
- **WebSocket**: No soportado en Vercel Serverless
- **Conexiones persistentes**: No mantener conexiones abiertas

### 2. Archivos Estáticos

Los archivos en `/uploads` se sirven directamente, pero considera:

- Usar un servicio de almacenamiento externo (AWS S3, Vercel Blob)
- Implementar limpieza periódica de archivos temporales

### 3. Base de Datos

- **Connection Pooling**: Vercel recomienda usar connection pooling
- **Prisma Accelerate**: Considera usar para mejor rendimiento

### 4. Monitoreo

Configura monitoreo para detectar problemas:

```javascript
// En app.ts
if (process.env.NODE_ENV === 'production') {
  // Configurar Sentry, New Relic, etc.
}
```

## Comandos Útiles

### Desarrollo Local
```bash
npm run dev              # Servidor local tradicional
npm run build            # Compilar TypeScript
npm run start            # Iniciar servidor compilado
```

### Despliegue
```bash
vercel --prod            # Despliegue a producción
vercel                   # Despliegue a preview
```

### Base de Datos
```bash
npx prisma generate      # Generar cliente Prisma
npx prisma migrate dev   # Migraciones en desarrollo
npx prisma migrate deploy # Migraciones en producción
npx prisma studio        # Interfaz gráfica de la BD
```

## Troubleshooting

### Problemas Comunes

1. **Error de CORS**
   - Verifica `CORS_ORIGINS` en variables de entorno
   - Revisa los headers en `vercel.json`

2. **Error de conexión a BD**
   - Verifica `DATABASE_URL`
   - Asegúrate que SSL esté habilitado
   - Revisa firewall de la base de datos

3. **Timeout de funciones**
   - Optimiza consultas a la base de datos
   - Implementa caching
   - Considera dividir funciones grandes

4. **Build fallido**
   - Verifica que `prisma generate` se ejecute
   - Revisa dependencias en `package.json`
   - Verifica TypeScript compilation

### Logs y Debugging

- **Vercel Logs**: `Functions` tab en el dashboard
- **Console Logs**: Aparecen en Vercel logs
- **Database Logs**: Disponibles en el proveedor de BD

## Buenas Prácticas

1. **Variables de Entorno**: Nunca commits de archivos `.env`
2. **Secrets**: Usa secrets específicos para producción
3. **Testing**: Ejecuta tests antes de cada despliegue
4. **Monitoreo**: Configura alertas para errores
5. **Backup**: Implementa backup automático de la base de datos
6. **Security**: Revisa dependencias regularmente

## Recursos Adicionales

- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma en Vercel](https://www.prisma.io/docs/guides/deployment/deploying-to-vercel)
- [Best Practices for Node.js on Vercel](https://vercel.com/guides/deploying-a-nodejs-application)

## Soporte

Si encuentras problemas:

1. Revisa los logs en Vercel dashboard
2. Verifica la configuración de variables de entorno
3. Consulta la documentación oficial de Vercel
4. Contacta al equipo de desarrollo si el problema persiste