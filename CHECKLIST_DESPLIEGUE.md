# ✅ Checklist de Despliegue a Producción

## 📋 Pre-Despliegue

### Base de Datos
- [ ] Base de datos PostgreSQL en producción creada
- [ ] Migraciones de Prisma ejecutadas
- [ ] Datos de prueba/seed cargados (si aplica)
- [ ] Backups configurados
- [ ] Connection pooling configurado (PgBouncer recomendado)

### Variables de Entorno
- [ ] `DATABASE_URL` configurada en Vercel
- [ ] `JWT_SECRET` generado y configurado (mínimo 64 caracteres)
- [ ] `JWT_EXPIRES_IN` configurado
- [ ] `ALLOWED_ORIGINS` con dominios de producción
- [ ] `NODE_ENV=production` configurado
- [ ] Todas las variables sensibles en Vercel (NO en código)

### Código
- [ ] Código en rama `main` actualizado
- [ ] Dependencias actualizadas (`npm audit fix`)
- [ ] Tests pasando (si existen)
- [ ] Linter sin errores
- [ ] Código de debug/console.log removido o condicional
- [ ] Botón de login automático desactivado en producción

### Seguridad
- [ ] CORS configurado correctamente
- [ ] Rate limiting activado
- [ ] Helmet configurado
- [ ] Validación de inputs en todos los endpoints
- [ ] SQL injection protegido (usando Prisma)
- [ ] XSS protegido
- [ ] CSRF tokens (si aplica)

## 🚀 Durante el Despliegue

### Backend
- [ ] Ejecutar `npm run build` localmente para verificar
- [ ] Ejecutar `vercel` para preview
- [ ] Probar endpoints en preview
- [ ] Ejecutar `vercel --prod` para producción
- [ ] Verificar que el despliegue fue exitoso

### Frontend
- [ ] Actualizar `API_URL` a producción
- [ ] Compilar con `flutter build web --release`
- [ ] Verificar que no hay errores de compilación
- [ ] Desplegar a Vercel
- [ ] Verificar que carga correctamente

## 🧪 Post-Despliegue - Testing

### Endpoints Críticos
- [ ] `GET /health` - Health check
- [ ] `POST /api/auth/login` - Login
- [ ] `GET /api/dashboard/estadisticas` - Dashboard
- [ ] `GET /api/gestantes` - Listar gestantes
- [ ] `GET /api/reportes/resumen-general` - Reportes
- [ ] `GET /api/reportes/descargar/resumen-general/pdf` - Descarga PDF
- [ ] `GET /api/alertas` - Alertas
- [ ] WebSocket connection (si aplica)

### Funcionalidad Frontend
- [ ] Login funciona
- [ ] Dashboard carga datos
- [ ] Navegación entre páginas
- [ ] Formularios funcionan
- [ ] Descarga de PDFs funciona
- [ ] Descarga de Excel funciona
- [ ] Alertas se muestran correctamente
- [ ] Responsive en móvil

### Performance
- [ ] Tiempo de respuesta < 2s para endpoints principales
- [ ] Imágenes optimizadas
- [ ] Assets comprimidos (gzip)
- [ ] Cache configurado correctamente
- [ ] Lazy loading funcionando

### Navegadores
- [ ] Chrome/Edge (últimas 2 versiones)
- [ ] Firefox (últimas 2 versiones)
- [ ] Safari (últimas 2 versiones)
- [ ] Móvil Chrome
- [ ] Móvil Safari

## 📊 Monitoreo

### Configuración
- [ ] Vercel Analytics activado
- [ ] Logs monitoreados
- [ ] Alertas configuradas para errores
- [ ] Uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Error tracking (Sentry, opcional)

### Métricas a Monitorear
- [ ] Uptime > 99.9%
- [ ] Response time < 2s
- [ ] Error rate < 1%
- [ ] Database connections < 80% del límite
- [ ] Memory usage < 80%

## 🔐 Seguridad Post-Despliegue

### Verificaciones
- [ ] SSL/TLS activo (HTTPS)
- [ ] Headers de seguridad configurados
- [ ] No hay información sensible en logs
- [ ] Tokens expiran correctamente
- [ ] Rate limiting funcionando
- [ ] CORS solo permite dominios autorizados

### Auditoría
- [ ] Ejecutar `npm audit`
- [ ] Revisar dependencias vulnerables
- [ ] Actualizar dependencias críticas
- [ ] Revisar permisos de base de datos

## 📝 Documentación

### Actualizar
- [ ] README.md con URLs de producción
- [ ] Documentación de API (Swagger/Postman)
- [ ] Guía de usuario actualizada
- [ ] Changelog con cambios de esta versión
- [ ] Runbook para incidentes

## 🔄 Rollback Plan

### En caso de problemas
- [ ] Tener backup de base de datos reciente
- [ ] Saber cómo hacer rollback en Vercel:
  ```bash
  vercel rollback
  ```
- [ ] Tener versión anterior funcionando
- [ ] Plan de comunicación con usuarios

## 📞 Contactos de Emergencia

- **DevOps**: [Nombre] - [Email/Teléfono]
- **Backend Lead**: [Nombre] - [Email/Teléfono]
- **Frontend Lead**: [Nombre] - [Email/Teléfono]
- **DBA**: [Nombre] - [Email/Teléfono]

## 🎯 URLs de Producción

Una vez desplegado, documentar:

- **Backend API**: `https://_____.vercel.app`
- **Frontend Web**: `https://_____.vercel.app`
- **Health Check**: `https://_____.vercel.app/health`
- **API Docs**: `https://_____.vercel.app/api-docs`
- **Admin Panel**: `https://_____.vercel.app/admin`

## ✅ Firma de Aprobación

- [ ] **Desarrollador**: _____________ Fecha: _______
- [ ] **QA**: _____________ Fecha: _______
- [ ] **Product Owner**: _____________ Fecha: _______
- [ ] **DevOps**: _____________ Fecha: _______

---

**Notas adicionales:**
- Mantener este checklist actualizado
- Revisar después de cada despliegue
- Agregar items según necesidades del proyecto

**Última actualización**: 24 de Noviembre, 2025
