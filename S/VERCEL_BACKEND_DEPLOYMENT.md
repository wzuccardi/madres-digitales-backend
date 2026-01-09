# 🚀 Deployment Backend en Vercel - Madres Digitales

## 📋 PROBLEMA IDENTIFICADO

Vercel no puede encontrar el `package.json` debido a la estructura de subdirectorios compleja.

### Error Original
```
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory, open '/vercel/path0/package.json'
```

## 🔧 SOLUCIÓN IMPLEMENTADA

### 1. Archivo Proxy en Raíz
Creado `api/index.js` en la raíz que importa el API real:
```javascript
// Proxy file for Vercel deployment
const app = require('../aplicacionWZC/madres-digitales-backend/api/index.js');
module.exports = app;
```

### 2. Configuración Vercel Simplificada
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.js"
    }
  ]
}
```

### 3. Package.json Optimizado
- Main apunta a `api/index.js`
- Dependencias principales incluidas
- Scripts simplificados
- Sin comandos complejos de Prisma

### 4. Archivo .vercelignore
- Ignora archivos innecesarios
- Reduce tamaño del deployment
- Evita conflictos con Flutter

## 📁 ESTRUCTURA FINAL

```
S/S/ (raíz del repositorio)
├── api/
│   └── index.js                     ← PROXY para Vercel
├── package.json                     ← Configuración principal
├── vercel.json                      ← Configuración Vercel
├── .vercelignore                    ← Archivos a ignorar
└── aplicacionWZC/
    └── madres-digitales-backend/
        └── api/index.js             ← API real con endpoint puerperio
```

## 🎯 VENTAJAS DE ESTA SOLUCIÓN

1. **Compatibilidad Vercel**: Estructura estándar que Vercel entiende
2. **Simplicidad**: Un solo punto de entrada
3. **Mantenibilidad**: API real permanece intacta
4. **Escalabilidad**: Fácil agregar más endpoints

## 🚀 DESPLIEGUE

### Automático
Los cambios se despliegan automáticamente cuando se hace push a `master`.

### Manual (si es necesario)
```bash
vercel --prod
```

## ✅ VERIFICACIÓN

### Backend API
- URL: https://madres-digitales-backend.vercel.app
- Endpoint: https://madres-digitales-backend.vercel.app/api/puerperio/estadisticas

### Datos Esperados
```json
{
  "success": true,
  "data": {
    "resumen": {
      "total_gestantes_activas": 755,
      "total_puerperio": 158,
      "total_combinado": 913
    }
  }
}
```

## 📝 PRÓXIMOS PASOS

1. Commit y push de los cambios
2. Esperar despliegue automático (2-3 minutos)
3. Verificar funcionamiento
4. Confirmar widget en frontend

---
**Actualizado**: 2026-01-09
**Estado**: Configuración optimizada para Vercel