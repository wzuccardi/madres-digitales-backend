# 🚀 Servidores Activos

## ✅ Estado: TODOS LOS SERVIDORES CORRIENDO

---

## 🔧 Backend API

### Estado
- ✅ **Corriendo**
- 🔌 **Puerto**: 3000
- 📍 **URL**: http://localhost:3000
- 🏥 **Health Check**: http://localhost:3000/health

### Proceso
- **Process ID**: 8
- **Comando**: `npm run dev`
- **Directorio**: `S/aplicacionWZC/madres-digitales-backend`

### Endpoints Principales
```
GET  http://localhost:3000/health
POST http://localhost:3000/api/auth/login
GET  http://localhost:3000/api/reportes/resumen-general
GET  http://localhost:3000/api/reportes/descargar/resumen-general/pdf
GET  http://localhost:3000/api/reportes/descargar/resumen-general/excel
```

---

## 🎨 Frontend Flutter Web

### Estado
- ✅ **Corriendo**
- 🔌 **Puerto**: 3009
- 📍 **URL**: http://localhost:3009

### Proceso
- **Process ID**: 6
- **Comando**: `flutter run -d web-server --web-port 3009`
- **Directorio**: `S/aplicacionWZC/madres_digitales_flutter_new`

### Características Activas
- ✅ Dashboard sin banner de bienvenida
- ✅ Botones flotantes con permisos por rol
- ✅ Módulo de reportes con descarga PDF/Excel
- ✅ Hot reload habilitado

---

## 🧪 Cómo Probar

### 1. Verificar Backend
```bash
# En navegador o curl
curl http://localhost:3000/health
```

**Respuesta esperada**:
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

### 2. Abrir Frontend
```
Navegador → http://localhost:3009
```

### 3. Probar Login
```
1. Ir a http://localhost:3009
2. Ingresar credenciales
3. Verificar que cargue el dashboard
```

### 4. Probar Dashboard
```
1. Verificar que NO aparezca el banner de bienvenida
2. Verificar botones flotantes en esquina inferior derecha
3. Según el rol, verificar botones visibles:
   - Todos: "Contenidos"
   - Admin/SuperAdmin: "Contenidos" + "Usuarios"
   - SuperAdmin: "Contenidos" + "Usuarios" + "Municipios"
```

### 5. Probar Reportes
```
1. Click en menú lateral → Reportes
2. Seleccionar mes y año
3. Verificar 6 tipos de reportes
4. Click en botón "PDF" de cualquier reporte
5. Click en botón "Excel" de cualquier reporte
6. Verificar mensajes de descarga
```

---

## 📊 Endpoints de Reportes para Probar

### Obtener Datos
```bash
# Resumen General
curl http://localhost:3000/api/reportes/resumen-general \
  -H "Authorization: Bearer YOUR_TOKEN"

# Estadísticas de Gestantes
curl http://localhost:3000/api/reportes/estadisticas-gestantes \
  -H "Authorization: Bearer YOUR_TOKEN"

# Reporte Mensual
curl "http://localhost:3000/api/reportes/consolidados/mensual?mes=11&anio=2024" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Descargar Archivos
```bash
# Descargar PDF
curl http://localhost:3000/api/reportes/descargar/resumen-general/pdf \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o reporte.pdf

# Descargar Excel
curl http://localhost:3000/api/reportes/descargar/resumen-general/excel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o reporte.xlsx
```

---

## 🔄 Comandos de Control

### Ver Procesos Activos
```bash
# Listar procesos
# (usar herramienta listProcesses)
```

### Ver Output de Backend
```bash
# Ver últimas 30 líneas
# (usar herramienta getProcessOutput con processId: 8)
```

### Ver Output de Frontend
```bash
# Ver últimas 30 líneas
# (usar herramienta getProcessOutput con processId: 6)
```

### Reiniciar Backend
```bash
# Detener
# (usar controlPwshProcess con action: stop, processId: 8)

# Iniciar
# (usar controlPwshProcess con action: start)
```

### Hot Reload Frontend
```bash
# En la terminal del frontend, presionar:
R  # Hot restart
```

---

## 🎯 Flujo de Prueba Completo

### Paso 1: Verificar Servidores
- [ ] Backend responde en http://localhost:3000/health
- [ ] Frontend carga en http://localhost:3009

### Paso 2: Login
- [ ] Abrir http://localhost:3009
- [ ] Ingresar credenciales de prueba
- [ ] Verificar redirección a dashboard

### Paso 3: Dashboard
- [ ] Verificar que NO hay banner de bienvenida
- [ ] Verificar estadísticas visibles
- [ ] Verificar botones flotantes según rol
- [ ] Click en "Contenidos" → navega correctamente
- [ ] Click en "Usuarios" (si visible) → navega correctamente
- [ ] Click en "Municipios" (si visible) → navega correctamente

### Paso 4: Reportes
- [ ] Navegar a Reportes desde menú lateral
- [ ] Cambiar mes y año en selectores
- [ ] Verificar que aparecen 6 reportes
- [ ] Click en "PDF" de Resumen General
- [ ] Verificar mensaje "Descargando reporte en pdf..."
- [ ] Click en "Excel" de Estadísticas de Gestantes
- [ ] Verificar mensaje "Descargando reporte en excel..."

### Paso 5: Verificar Descarga (en navegador)
- [ ] Abrir DevTools (F12)
- [ ] Ir a Network tab
- [ ] Click en botón PDF
- [ ] Verificar request a `/api/reportes/descargar/.../pdf`
- [ ] Verificar response con bytes del PDF

---

## 🐛 Troubleshooting

### Backend no responde
```bash
# Verificar que está corriendo
curl http://localhost:3000/health

# Si no responde, reiniciar
# 1. Detener proceso 8
# 2. Iniciar nuevamente
```

### Frontend no carga
```bash
# Verificar en navegador
http://localhost:3009

# Si no carga, verificar proceso 6
# Ver output para errores
```

### Error de CORS
```bash
# Verificar que backend permite origen del frontend
# En backend, verificar configuración de CORS
```

### Error de autenticación
```bash
# Verificar token en localStorage
# En DevTools → Application → Local Storage
# Buscar: auth_token o similar
```

### Descarga no funciona
```bash
# Verificar en DevTools → Network
# Ver request y response
# Verificar headers de autorización
```

---

## 📝 Credenciales de Prueba

### SuperAdmin
```
Email: superadmin@test.com
Password: [tu password]
```

### Admin
```
Email: admin@test.com
Password: [tu password]
```

### Coordinador
```
Email: coordinador@test.com
Password: [tu password]
```

---

## 🎉 ¡Todo Listo para Probar!

### URLs Principales
- 🔧 **Backend**: http://localhost:3000
- 🎨 **Frontend**: http://localhost:3009
- 🏥 **Health Check**: http://localhost:3000/health

### Funcionalidades Nuevas
- ✅ Dashboard sin banner
- ✅ Botones flotantes con permisos
- ✅ Descarga de reportes en PDF
- ✅ Descarga de reportes en Excel

**¡Empieza probando en**: http://localhost:3009 🚀
