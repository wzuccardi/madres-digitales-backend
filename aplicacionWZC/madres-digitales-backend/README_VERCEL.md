# Madres Digitales Backend - Despliegue en Vercel

## 🚀 Despliegue Rápido

### 1. Preparación del Repositorio

```bash
# Clonar el repositorio
git clone <tu-repositorio-url>
cd madres-digitales-backend

# Instalar dependencias
npm install

# Generar cliente Prisma
npx prisma generate

# Compilar TypeScript
npm run build
```

### 2. Configurar Variables de Entorno

Copia las variables desde `.env.production.example` y configúralas en Vercel:

```bash
# Variables requeridas
DATABASE_URL=postgresql://...
JWT_SECRET=tu_secreto_jwt
JWT_REFRESH_SECRET=tu_secreto_refresh
CORS_ORIGINS=https://tu-dominio.vercel.app
```

### 3. Despliegue en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

## 📋 Checklist de Despliegue

- [ ] Repositorio conectado a Vercel
- [ ] Variables de entorno configuradas
- [ ] Base de datos PostgreSQL accesible
- [ ] Migraciones de Prisma ejecutadas
- [ ] CORS configurado para dominios de producción
- [ ] Tests pasando correctamente
- [ ] Build exitoso en Vercel

## 🔧 Configuración Clave

### vercel.json
- Configura rutas serverless
- Define headers CORS
- Establece tiempo máximo de ejecución

### api/index.js
- Punto de entrada para funciones serverless
- Maneja conexión con Prisma
- Configura CORS global

### package.json
- Scripts específicos para Vercel
- Build command optimizado
- Postinstall para Prisma

## 🗄️ Base de Datos

### Opción 1: Vercel Postgres (Recomendado)
1. En dashboard Vercel → Storage
2. Crear base de datos PostgreSQL
3. Copiar `DATABASE_URL`
4. Ejecutar migraciones

### Opción 2: Base de Datos Externa
1. Configurar conexión SSL
2. Verificar accesibilidad desde Vercel
3. Configurar connection pooling

## 📊 Monitoreo

### Logs
- Disponibles en Vercel dashboard
- Console logs aparecen en tiempo real
- Errores y warnings destacados

### Métricas
- Tiempo de respuesta
- Uso de funciones
- Errores por endpoint

## 🚨 Troubleshooting Común

### Error: CORS
```bash
# Verificar CORS_ORIGINS
echo $CORS_ORIGINS

# Debe incluir dominios específicos
https://tu-app.vercel.app,https://www.tu-dominio.com
```

### Error: Base de Datos
```bash
# Verificar conexión
npx prisma db pull --preview-feature

# Ejecutar migraciones
npx prisma migrate deploy
```

### Error: Timeout
- Optimizar consultas a base de datos
- Implementar caching
- Revisar límites de 30s de Vercel

## 🔄 Flujo de Trabajo

### Desarrollo
```bash
npm run dev          # Servidor local
npm run test         # Ejecutar tests
npm run build        # Verificar build
```

### Despliegue
```bash
git push main        # Despliegue automático a producción
git push develop     # Despliegue a preview
```

### Producción
```bash
vercel logs          # Ver logs en tiempo real
vercel env ls        # Listar variables de entorno
vercel --prod        # Forzar despliegue a producción
```

## 📚 Recursos

- [Documentación Vercel](https://vercel.com/docs)
- [Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

## 🆘 Soporte

Para problemas de despliegue:

1. Revisar logs en Vercel dashboard
2. Verificar variables de entorno
3. Consultar [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)
4. Contactar equipo de desarrollo

---

**Nota**: Esta configuración está optimizada para Vercel Serverless Functions. Para otros proveedores, consultar documentación específica.