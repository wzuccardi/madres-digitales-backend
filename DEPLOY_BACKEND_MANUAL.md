# FORZAR DESPLIEGUE MANUAL EN VERCEL

## PASOS PARA FORZAR DESPLIEGUE

### 1. Backend - Forzar Redeploy
1. Ir a https://vercel.com/dashboard
2. Buscar proyecto `madres-digitales-backend`
3. Ir a Settings → Git
4. Cambiar rama de `clon` a `master`
5. Hacer redeploy manual

### 2. Frontend - Forzar Redeploy  
1. Buscar proyecto `madres-digitales-frontend`
2. Ir a Settings → Git
3. Cambiar rama de `clon` a `master`
4. Hacer redeploy manual

### 3. Alternativa - Trigger con Commit Vacío
Si no tienes acceso al dashboard de Vercel, puedo hacer un commit vacío para forzar el redeploy:

```bash
git commit --allow-empty -m "trigger: Forzar redeploy en Vercel"
git push origin master
```

## VERIFICACIÓN POST-DESPLIEGUE

### Backend
- URL: https://madres-digitales-backend.vercel.app
- Endpoint: https://madres-digitales-backend.vercel.app/api/puerperio/estadisticas
- Esperado: `{"success": true, "data": {"resumen": {"total_gestantes_activas": 755, "total_puerperio": 158, "total_combinado": 913}}}`

### Frontend
- URL: https://madres-digitales-frontend.vercel.app
- Dashboard: Debe mostrar widget de puerperio
- Login: wzuccardi@gmail.com / 73102604722

## ESTADO ACTUAL
- ✅ Código en rama `master`
- ✅ Estructura correcta para Vercel
- ⏳ Esperando redeploy manual