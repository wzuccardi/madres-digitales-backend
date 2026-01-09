# Madres Digitales Backend - Despliegue en Netlify

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

Copia las variables desde `.env.netlify.example` y configúralas en Netlify:

```bash
# Variables requeridas
DATABASE_URL=postgresql://...
JWT_SECRET=tu_secreto_jwt
JWT_REFRESH_SECRET=tu_secreto_refresh
CORS_ORIGINS=https://madresdigitales.netlify.app
```

### 3. Despliegue en Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Desplegar
netlify deploy --prod
```

## 📋 Checklist de Despliegue

- [ ] Repositorio conectado a Netlify
- [ ] Variables de entorno configuradas
- [ ] Base de datos PostgreSQL externa accesible
- [ ] Migraciones de Prisma ejecutadas
- [ ] CORS configurado para `madresdigitales.netlify.app`
- [ ] Tests pasando correctamente
- [ ] Build exitoso en Netlify

## 🔧 Configuración Clave

### netlify.toml
- Configura rutas serverless
- Define headers CORS
- Establece comando de build y directorio de funciones

### netlify/functions/api.js
- Punto de entrada para funciones serverless
- Maneja conexión con Prisma
- Convierte eventos de Netlify a requests Express

### package.json
- Scripts específicos para Netlify
- Build command optimizado
- Postinstall para Prisma

## 🗄️ Base de Datos

### Opción 1: Supabase (Recomendado)
1. Crear cuenta en [Supabase](https://supabase.com)
2. Crear nuevo proyecto PostgreSQL
3. Copiar `DATABASE_URL`
4. Ejecutar migraciones

### Opción 2: Railway
1. Crear cuenta en [Railway](https://railway.app)
2. Crear servicio PostgreSQL
3. Configurar conexión SSL
4. Ejecutar migraciones

### Opción 3: PlanetScale
1. Crear cuenta en [PlanetScale](https://planetscale.com)
2. Crear base de datos
3. Configurar conexión SSL
4. Ejecutar migraciones

## 📊 Monitoreo

### Logs
- Disponibles en Netlify dashboard
- Console logs aparecen en tiempo real
- Errores y warnings destacados

### Métricas
- Tiempo de respuesta de funciones
- Uso de funciones serverless
- Errores por endpoint

## 🚨 Troubleshooting Común

### Error: CORS
```bash
# Verificar CORS_ORIGINS
echo $CORS_ORIGINS

# Debe incluir el dominio de Netlify
https://madresdigitales.netlify.app
```

### Error: Base de Datos
```bash
# Verificar conexión
npx prisma db pull --preview-feature

# Ejecutar migraciones
npx prisma migrate deploy
```

### Error: Timeout de Funciones
- Optimizar consultas a base de datos
- Implementar caching
- Revisar límites de 25s de Netlify

## 🔄 Flujo de Trabajo

### Desarrollo
```bash
npm run dev              # Servidor local tradicional
npm run netlify-dev       # Desarrollo con Netlify Functions
npm run test             # Ejecutar tests
npm run build            # Verificar build
```

### Despliegue
```bash
git push main            # Despliegue automático a producción
git push develop         # Despliegue a preview
netlify deploy --prod     # Forzar despliegue a producción
```

### Producción
```bash
netlify logs             # Ver logs en tiempo real
netlify env:list         # Listar variables de entorno
netlify status           # Estado del despliegue
```

## 🌐 Configuración de Dominio

### Dominio Personalizado
1. En Netlify dashboard → Site settings → Domain management
2. Agregar dominio personalizado
3. Configurar DNS según instrucciones
4. Actualizar `CORS_ORIGINS` con nuevo dominio

### Actualizar CORS
```bash
# Agregar dominio personalizado a CORS_ORIGINS
CORS_ORIGINS=https://madresdigitales.netlify.app,https://www.tudominio.com
```

## 📚 Recursos

- [Documentación Netlify](https://docs.netlify.com/)
- [Netlify Functions](https://docs.netlify.com/edge-functions/overview/)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment/deploying-to-netlify)

## 🆘 Soporte

Para problemas de despliegue:

1. Revisar logs en Netlify dashboard
2. Verificar variables de entorno
3. Consultar [DEPLOY_NETLIFY.md](./DEPLOY_NETLIFY.md)
4. Contactar equipo de desarrollo

## 🎯 URL de Producción

Una vez desplegado, tu backend estará disponible en:
- **Principal**: `https://madresdigitales.netlify.app`
- **API Endpoints**: `https://madresdigitales.netlify.app/api/*`

---

**Nota**: Esta configuración está optimizada para Netlify Functions. Para otros proveedores, consultar documentación específica.