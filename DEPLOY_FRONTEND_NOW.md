# 🚀 Deploy Frontend AHORA - Madres Digitales

## ✅ Backend Ya Desplegado

**URL Backend**: https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app

---

## 📋 Pasos para Desplegar Frontend (5 minutos)

### Opción 1: Vercel Dashboard (MÁS FÁCIL) ⭐

1. **Ir a Vercel**
   ```
   https://vercel.com/new
   ```

2. **Importar Repositorio**
   - Click en "Import Git Repository"
   - Buscar: `madres-digitales-frontend-CleanArchitecture`
   - Click "Import"

3. **Configurar Proyecto**
   
   **Project Name:**
   ```
   madres-digitales-frontend
   ```
   
   **Framework Preset:**
   ```
   Other
   ```
   
   **Root Directory:**
   ```
   ./
   ```

4. **Build Settings**
   
   **Build Command:**
   ```bash
   bash install-flutter.sh && flutter build web --release --web-renderer canvaskit --dart-define=ENVIRONMENT=production --dart-define=API_URL=https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api
   ```
   
   **Output Directory:**
   ```
   build/web
   ```
   
   **Install Command:**
   ```
   (dejar vacío o poner: echo "No npm install needed")
   ```

5. **Environment Variables**
   
   Click en "Environment Variables" y agregar:
   
   ```
   Name: FLUTTER_VERSION
   Value: 3.19.6
   Environment: Production, Preview, Development
   ```
   
   ```
   Name: API_URL
   Value: https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api
   Environment: Production, Preview, Development
   ```
   
   ```
   Name: ENVIRONMENT
   Value: production
   Environment: Production
   ```

6. **Deploy**
   - Click en "Deploy"
   - Esperar 5-10 minutos
   - ¡Listo! 🎉

---

### Opción 2: Vercel CLI (RÁPIDO)

```bash
# 1. Instalar Vercel CLI (si no lo tienes)
npm install -g vercel

# 2. Login
vercel login

# 3. Ir al directorio del frontend
cd S/aplicacionWZC/madres_digitales_flutter_new

# 4. Build
flutter build web --release --web-renderer canvaskit --dart-define=ENVIRONMENT=production --dart-define=API_URL=https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api

# 5. Deploy
vercel --prod
```

---

### Opción 3: Script PowerShell (AUTOMÁTICO)

```powershell
# Ejecutar el script
.\DEPLOY_TO_VERCEL.ps1
```

---

## 🔧 Configuración Importante

### CORS en Backend

El backend ya debe tener configurado CORS. Verifica que incluya:

```env
CORS_ORIGIN=https://madres-digitales-frontend.vercel.app,https://tu-dominio-frontend.vercel.app
```

Si necesitas actualizar CORS:
1. Ir a tu proyecto backend en Vercel
2. Settings > Environment Variables
3. Editar `CORS_ORIGIN` y agregar la URL del frontend
4. Redeploy el backend

---

## ✅ Verificación Post-Deployment

### 1. Verificar que el sitio carga

```bash
# Obtener URL del deployment
vercel ls

# O visitar directamente
# https://madres-digitales-frontend.vercel.app
```

### 2. Verificar conexión con backend

1. Abrir el sitio en el navegador
2. Abrir DevTools (F12)
3. Ir a la pestaña Network
4. Intentar hacer login
5. Verificar que las requests van a:
   ```
   https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api/auth/login
   ```

### 3. Checklist de Funcionalidad

- [ ] Página de login carga sin errores
- [ ] Assets (logo, imágenes) cargan correctamente
- [ ] Puede hacer login con credenciales válidas
- [ ] Dashboard muestra datos
- [ ] Navegación entre páginas funciona
- [ ] No hay errores CORS en consola
- [ ] Responsive funciona en móvil

---

## 🐛 Troubleshooting

### Error: Build Failed

**Problema**: Flutter no se instala correctamente

**Solución**:
1. Verificar que `install-flutter.sh` existe
2. Verificar Build Command en Vercel
3. Ver logs completos en Vercel Dashboard

### Error: CORS

**Problema**: Frontend no puede conectar con backend

**Solución**:
```bash
# Actualizar CORS_ORIGIN en backend
# Ir a Vercel Dashboard > Backend Project > Settings > Environment Variables
# Editar CORS_ORIGIN:
CORS_ORIGIN=https://madres-digitales-frontend.vercel.app,https://madres-digitales-frontend-git-master-tu-usuario.vercel.app
```

### Error: Assets No Cargan

**Problema**: Imágenes o iconos no se muestran

**Solución**:
1. Verificar `pubspec.yaml` tiene assets declarados
2. Verificar rutas en código son relativas
3. Verificar `vercel.json` tiene configuración de assets

### Error: Página en Blanco

**Problema**: La app carga pero muestra pantalla blanca

**Solución**:
1. Abrir DevTools (F12)
2. Ver errores en Console
3. Verificar que CanvasKit cargó
4. Probar con `--web-renderer html` en lugar de `canvaskit`

---

## 📊 URLs Finales

### Backend
```
https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app
```

### Frontend (después del deploy)
```
https://madres-digitales-frontend.vercel.app
```

### Health Checks
```bash
# Backend
curl https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/health

# Frontend
curl -I https://madres-digitales-frontend.vercel.app
```

---

## 🎯 Próximos Pasos Después del Deploy

1. **Configurar Dominio Personalizado** (Opcional)
   - Settings > Domains
   - Add: `app.tudominio.com`

2. **Configurar Analytics**
   - Analytics > Enable

3. **Configurar Monitoreo**
   - UptimeRobot: https://uptimerobot.com
   - Monitorear cada 5 minutos

4. **Crear Usuario Admin**
   ```bash
   # Usar script en backend
   npm run create-admin
   ```

5. **Probar Funcionalidad Completa**
   - Login
   - CRUD de gestantes
   - Controles prenatales
   - Alertas
   - Reportes

---

## 📞 Soporte

**Email**: wzuccardi@gmail.com  
**GitHub**: https://github.com/wzuccardi/madres-digitales-frontend-CleanArchitecture

---

## ✨ Comando Rápido (Copy-Paste)

```bash
# Todo en uno
cd S/aplicacionWZC/madres_digitales_flutter_new && flutter build web --release --web-renderer canvaskit --dart-define=ENVIRONMENT=production --dart-define=API_URL=https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api && vercel --prod
```

---

**¡Listo para desplegar! 🚀**
