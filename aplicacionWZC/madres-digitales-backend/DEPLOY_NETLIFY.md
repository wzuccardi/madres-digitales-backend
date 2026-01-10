# Guía de Despliegue en Netlify - Madres Digitales Backend

## Overview

Esta guía explica cómo desplegar el backend de Madres Digitales en Netlify utilizando Netlify Functions.

## Requisitos Previos

1. **Cuenta en Netlify**: [https://netlify.com](https://netlify.com)
2. **GitHub Repository**: El código debe estar en un repositorio GitHub
3. **Base de Datos PostgreSQL**: Configurada y accesible (externa, ya que Netlify no ofrece base de datos nativa)
4. **Netlify CLI**: Para desarrollo local

## Configuración del Proyecto

### 1. Estructura de Archivos para Netlify

```
madres-digitales-backend/
├── netlify/
│   └── functions/
│       └── api.js              # Entry point para Netlify Functions
├── src/
│   ├── app.ts                # Aplicación Express
│   ├── server.ts             # Servidor tradicional (local)
│   └── ...                   # Resto del código fuente
├── prisma/
│   └── schema.prisma        # Esquema de base de datos
├── netlify.toml              # Configuración de Netlify
├── package.json              # Dependencias y scripts
└── .env.netlify.example      # Variables de entorno ejemplo
```

### 2. Archivos Clave para Netlify

#### `netlify.toml`
- Configura las rutas y funciones serverless
- Define headers CORS para archivos estáticos
- Establece comando de build y directorio de funciones

#### `netlify/functions/api.js`
- Punto de entrada para las funciones serverless
- Maneja la conexión con Prisma
- Convierte eventos de Netlify a requests de Express

#### `package.json` (scripts actualizados)
```json
{
  "scripts": {
    "netlify-build": "npm run build",
    "netlify-dev": "netlify dev",
    "build": "tsc && npx prisma generate"
  }
}
```

## Pasos para el Despliegue

### 1. Configurar Variables de Entorno en Netlify

En el dashboard de Netlify, ve a `Site settings > Environment variables` y agrega:

**Variables Requeridas:**
- `DATABASE_URL`: URL de conexión a PostgreSQL externa
- `JWT_SECRET`: Secret para tokens JWT
- `JWT_REFRESH_SECRET`: Secret para refresh tokens
- `CORS_ORIGINS`: `https://madresdigitales.netlify.app`

**Variables Opcionales:**
- `NODE_ENV`: `production` (automático en Netlify)
- `LOG_LEVEL`: `info` o `error`
- `RATE_LIMIT_WINDOW_MS`: Ventana de rate limiting
- `RATE_LIMIT_MAX_REQUESTS`: Máximo de requests por ventana

### 2. Conectar Repositorio GitHub

1. En Netlify, haz clic en "Add new site > Import an existing project"
2. Conecta tu proveedor de Git (GitHub)
3. Selecciona el repositorio del backend
4. Netlify detectará automáticamente que es un proyecto Node.js

### 3. Configurar Build Settings

Netlify usará la configuración de `netlify.toml`, pero verifica:

- **Build command**: `npm run netlify-build`
- **Functions directory**: `netlify/functions`
- **Publish directory**: `dist`

### 4. Configurar Base de Datos

Netlify no ofrece base de datos nativa, por lo que necesitas:

#### Opción A: Supabase (Recomendado)
1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto PostgreSQL
3. Copia el `DATABASE_URL` proporcionado
4. Agrégalo a las variables de entorno de Netlify

#### Opción B: Railway
1. Crea una cuenta en [Railway](https://railway.app)
2. Crea un nuevo servicio PostgreSQL
3. Configura la conexión y obtén el `DATABASE_URL`
4. Agrégalo a las variables de entorno

#### Opción C: PlanetScale
1. Crea una cuenta en [PlanetScale](https://planetscale.com)
2. Crea una nueva base de datos
3. Configura la conexión SSL
4. Agrégalo a las variables de entorno

### 5. Ejecutar Migraciones

Para Netlify, las migraciones deben ejecutarse manualmente:

```bash
# Localmente, apuntando a la base de datos de producción
DATABASE_URL="tu_production_db_url" npx prisma migrate deploy
```

O crea un script de migración que se ejecute durante el build.

### 6. Despliegue Automático

Una vez configurado, cada push a la rama principal desencadenará un despliegue automático.

## Consideraciones Especiales

### 1. Limitaciones de Netlify Functions

- **Tiempo de ejecución**: Máximo 25 segundos por función
- **WebSocket**: No soportado en Netlify Functions
- **Conexiones persistentes**: No mantener conexiones abiertas
- **Tamaño máximo**: 50MB por función

### 2. Archivos Estáticos

Los archivos en `/uploads` se sirven directamente, pero considera:

- Usar un servicio de almacenamiento externo (AWS S3, Cloudinary)
- Implementar limpieza periódica de archivos temporales
- Configurar cache headers adecuados

### 3. Base de Datos

- **Connection Pooling**: Es crucial para performance
- **SSL Requerido**: Todas las conexiones deben usar SSL
- **Timeouts**: Configurar timeouts adecuados

### 4. Monitoreo

Configura monitoreo para detectar problemas:

```javascript
// En app.ts
if (process.env.NODE_ENV === 'production') {
  // Configurar Sentry, LogRocket, etc.
}
```

## Comandos Útiles

### Desarrollo Local
```bash
npm run dev              # Servidor local tradicional
npm run netlify-dev       # Desarrollo con Netlify Functions
npm run build            # Compilar TypeScript
```

### Despliegue
```bash
netlify deploy --prod     # Despliegue a producción
netlify deploy           # Despliegue a preview
netlify dev             # Servidor de desarrollo local
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
   - Revisa los headers en `netlify.toml`
   - Asegúrate de incluir `https://madresdigitales.netlify.app`

2. **Error de conexión a BD**
   - Verifica `DATABASE_URL`
   - Asegúrate que SSL esté habilitado (`sslmode=require`)
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

- **Netlify Logs**: `Site functions` tab en el dashboard
- **Console Logs**: Aparecen en Netlify logs
- **Database Logs**: Disponibles en el proveedor de BD

## Buenas Prácticas

1. **Variables de Entorno**: Nunca commits de archivos `.env`
2. **Secrets**: Usa secrets específicos para producción
3. **Testing**: Ejecuta tests antes de cada despliegue
4. **Monitoreo**: Configura alertas para errores
5. **Backup**: Implementa backup automático de la base de datos
6. **Security**: Revisa dependencias regularmente

## Configuración de Dominio Personalizado

### 1. Configurar Dominio en Netlify

1. Ve a `Site settings > Domain management`
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones de Netlify

### 2. Actualizar CORS

Una vez configurado el dominio, actualiza `CORS_ORIGINS`:

```
CORS_ORIGINS=https://madresdigitales.netlify.app,https://www.tudominio.com
```

## Recursos Adicionales

- [Netlify Functions](https://docs.netlify.com/edge-functions/overview/)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)
- [Prisma en Netlify](https://www.prisma.io/docs/guides/deployment/deploying-to-netlify)
- [Supabase Integration](https://supabase.com/docs/guides/hosting/netlify)

## Soporte

Si encuentras problemas:

1. Revisa los logs en Netlify dashboard
2. Verifica la configuración de variables de entorno
3. Consulta la documentación oficial de Netlify
4. Contacta al equipo de desarrollo si el problema persiste

---

**Nota**: Esta configuración está optimizada para Netlify Functions. Para otros proveedores, consultar documentación específica.