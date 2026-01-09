# ✅ CHECKLIST DE DEPLOYMENT

## 📋 Configuración en Vercel

### PASO 1: Abrir Proyecto
- [ ] Ir a https://vercel.com/dashboard
- [ ] Click en `madres-digitales-frontend-clean-architecture`
- [ ] Click en "Settings"

### PASO 2: Build Settings
- [ ] Click en "General"
- [ ] Buscar "Build & Development Settings"
- [ ] Click en "Edit"
- [ ] Framework Preset: `Other`
- [ ] Build Command: (copiar de abajo)
- [ ] Output Directory: `build/web`
- [ ] Install Command: `echo "No npm install needed"`
- [ ] Click "Save"

### PASO 3: Variables de Entorno
- [ ] Click en "Environment Variables"
- [ ] Agregar `FLUTTER_VERSION` = `3.19.6` (todas las environments)
- [ ] Agregar `API_URL` = `https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api` (todas)
- [ ] Agregar `ENVIRONMENT` = `production` (solo Production)

### PASO 4: Redeploy
- [ ] Click en "Deployments"
- [ ] Click en "..." del último deployment
- [ ] Click en "Redeploy"
- [ ] Confirmar

### PASO 5: Esperar
- [ ] Ver logs en tiempo real
- [ ] Esperar 5-10 minutos
- [ ] Verificar que dice "Deployment Ready"

### PASO 6: Verificar
- [ ] Click en "Visit"
- [ ] Ver página de login
- [ ] Abrir DevTools (F12)
- [ ] Verificar sin errores en Console
- [ ] Probar login (ver Network tab)

---

## 📝 Build Command (Copiar Completo)

```bash
curl -o flutter.tar.xz https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.19.6-stable.tar.xz && tar xf flutter.tar.xz && export PATH="$PATH:`pwd`/flutter/bin" && flutter config --enable-web --no-analytics && flutter pub get && flutter build web --release --web-renderer canvaskit --dart-define=ENVIRONMENT=production --dart-define=API_URL=https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api
```

---

## ✅ Verificación Final

- [ ] Frontend carga correctamente
- [ ] Backend responde
- [ ] No hay errores CORS
- [ ] Login funciona
- [ ] Diseño se ve bien
- [ ] Responsive funciona

---

## 🎉 ¡Listo!

Si todos los checkboxes están marcados, el sistema está funcionando.

**URLs Finales:**
- Backend: https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app
- Frontend: https://madres-digitales-frontend-clean-architecture-v49i-c0oru7mvi.vercel.app
