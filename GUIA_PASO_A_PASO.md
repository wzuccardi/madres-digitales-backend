# 📖 GUÍA PASO A PASO - Deployment Completo

## 🎯 Objetivo
Dejar el sistema Madres Digitales completamente funcional en producción.

---

## ✅ PARTE 1: Lo que YA está listo

- ✅ Backend funcionando: `https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app`
- ✅ Frontend desplegado (pero sin compilar): `https://madres-digitales-frontend-clean-architecture-v49i-c0oru7mvi.vercel.app`
- ✅ Archivos de configuración creados (vercel.json, package.json, build.sh)
- ✅ Código en GitHub
- ✅ Documentación completa

---

## 🔧 PARTE 2: Lo que DEBES hacer (15 minutos)

### PASO 1: Abrir Vercel Dashboard (1 minuto)

1. Abre tu navegador
2. Ve a: **https://vercel.com/dashboard**
3. Inicia sesión si no lo has hecho
4. Deberías ver tus 2 proyectos:
   - `madres-digitales-backend-clean-architecture` ✅
   - `madres-digitales-frontend-clean-architecture` ⚠️

---

### PASO 2: Configurar el Proyecto Frontend (5 minutos)

1. **Click** en el proyecto `madres-digitales-frontend-clean-architecture`

2. **Click** en **"Settings"** (arriba a la derecha)

3. En el menú izquierdo, **Click** en **"General"**

4. Busca la sección **"Build & Development Settings"**

5. **Click** en **"Edit"** (o "Override")

6. Configura lo siguiente:

   **Framework Preset:**
   ```
   Other
   ```
   
   **Build Command:** (copiar TODO esto)
   ```bash
   curl -o flutter.tar.xz https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.19.6-stable.tar.xz && tar xf flutter.tar.xz && export PATH="$PATH:`pwd`/flutter/bin" && flutter config --enable-web --no-analytics && flutter pub get && flutter build web --release --web-renderer canvaskit --dart-define=ENVIRONMENT=production --dart-define=API_URL=https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api
   ```
   
   **Output Directory:**
   ```
   build/web
   ```
   
   **Install Command:**
   ```
   echo "No npm install needed"
   ```

7. **Click** en **"Save"**

---

### PASO 3: Agregar Variables de Entorno (3 minutos)

1. En el mismo menú de Settings, **Click** en **"Environment Variables"**

2. **Agregar Variable 1:**
   - Click en **"Add New"**
   - **Name:** `FLUTTER_VERSION`
   - **Value:** `3.19.6`
   - **Environments:** Marca las 3 casillas (Production, Preview, Development)
   - Click **"Save"**

3. **Agregar Variable 2:**
   - Click en **"Add New"**
   - **Name:** `API_URL`
   - **Value:** `https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api`
   - **Environments:** Marca las 3 casillas
   - Click **"Save"**

4. **Agregar Variable 3:**
   - Click en **"Add New"**
   - **Name:** `ENVIRONMENT`
   - **Value:** `production`
   - **Environments:** Marca solo **Production**
   - Click **"Save"**

---

### PASO 4: Redeploy (1 minuto)

1. En el menú superior, **Click** en **"Deployments"**

2. Verás una lista de deployments. El primero es el más reciente.

3. **Click** en los **3 puntos (...)** al lado derecho del deployment más reciente

4. **Click** en **"Redeploy"**

5. En el popup, **Click** en **"Redeploy"** nuevamente para confirmar

---

### PASO 5: Esperar el Build (5-10 minutos)

1. Verás una pantalla con logs en tiempo real

2. El proceso tomará varios minutos. Verás:
   ```
   Downloading Flutter...
   Extracting Flutter...
   Running flutter pub get...
   Running flutter build web...
   ✓ Built build/web
   ```

3. **NO CIERRES** la ventana hasta que veas:
   ```
   ✓ Deployment Ready
   ```

4. Si ves errores, copia el mensaje de error y avísame.

---

### PASO 6: Verificar que Funciona (2 minutos)

1. Una vez que termine el deployment, **Click** en **"Visit"** (botón arriba a la derecha)

2. Deberías ver:
   - ✅ Página de login de Madres Digitales
   - ✅ Logo y diseño correcto
   - ✅ Formulario de login

3. **Abrir DevTools:**
   - Presiona **F12** en tu teclado
   - Ve a la pestaña **"Console"**
   - **NO** deberías ver errores rojos

4. **Probar Login:**
   - Ve a la pestaña **"Network"** en DevTools
   - Intenta hacer login (aunque no tengas credenciales)
   - Deberías ver una petición a:
     ```
     https://madres-digitales-backend-clean-architecture-fwiax0cbp.vercel.app/api/auth/login
     ```

---

## ✅ PARTE 3: Verificación Final

### Si TODO funciona correctamente:

✅ Frontend carga sin errores  
✅ Backend responde  
✅ No hay errores CORS  
✅ El diseño se ve bien  
✅ Las peticiones llegan al backend  

**¡FELICIDADES! El sistema está desplegado y funcionando** 🎉

---

### Si algo NO funciona:

#### Problema 1: Build Falla (Error en logs)

**Síntomas:**
- El build termina con error
- Ves mensajes rojos en los logs

**Solución:**
1. Copia el mensaje de error completo
2. Avísame el error
3. Probablemente necesitemos ajustar el Build Command

#### Problema 2: Página en Blanco

**Síntomas:**
- El deployment dice "Success"
- Pero al abrir el sitio solo ves una página blanca

**Solución:**
1. Abre DevTools (F12)
2. Ve a Console
3. Copia los errores que veas
4. Avísame

#### Problema 3: Error CORS

**Síntomas:**
- El sitio carga
- Pero al intentar login ves error de CORS en Console

**Solución:**
1. Necesitamos actualizar CORS en el backend
2. Avísame y lo configuramos

#### Problema 4: Build Timeout (más de 10 minutos)

**Síntomas:**
- El build toma más de 10 minutos
- Vercel lo cancela

**Solución:**
- Vercel Free tiene límite de 10 min
- Opción 1: Upgrade a Vercel Pro ($20/mes)
- Opción 2: Build local y deploy (te ayudo)

---

## 📊 Resumen Visual

```
ANTES:
Backend: ✅ Funcionando
Frontend: ⚠️ Sin compilar

DESPUÉS (siguiendo esta guía):
Backend: ✅ Funcionando
Frontend: ✅ Funcionando
Sistema: ✅ Completo y operativo
```

---

## 🎯 Próximos Pasos (DESPUÉS de que funcione)

1. **Crear Usuario Admin:**
   - Necesitarás acceso a la base de datos
   - O crear un endpoint de registro inicial

2. **Configurar Dominio Personalizado** (Opcional):
   - Settings > Domains
   - Agregar: `app.tudominio.com`

3. **Configurar Monitoreo:**
   - UptimeRobot (gratis)
   - Monitorear cada 5 minutos

4. **Backups:**
   - Configurar backups de base de datos
   - Backups automáticos diarios

---

## 📞 ¿Necesitas Ayuda?

Si en algún paso tienes dudas o algo no funciona:

1. **Toma screenshot** del error o problema
2. **Copia** el mensaje de error completo
3. **Avísame** y te ayudo inmediatamente

---

## ⏱️ Tiempo Total Estimado

- Configuración en Vercel: **5 minutos**
- Build y deployment: **5-10 minutos**
- Verificación: **2 minutos**

**Total: 12-17 minutos**

---

## 🎉 ¡Empecemos!

**SIGUIENTE ACCIÓN:**
1. Abre https://vercel.com/dashboard
2. Sigue PASO 2 de esta guía

¡Vamos a dejarlo funcionando! 💪
