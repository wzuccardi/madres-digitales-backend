# Auditoría del Módulo de Reportes

## Problemas Identificados

### 1. Frontend - Pantalla de Reportes
**Archivo**: `lib/presentation/pages/reportes/reportes_screen.dart`

#### Problemas:
1. **Campos incorrectos en resumenGeneral**:
   - Intenta acceder a `gestantes_nuevas` que no existe en el backend
   - El backend devuelve `total_gestantes`, no `gestantes_activas`

2. **Endpoints de descarga incorrectos**:
   - Algunos endpoints como `estadisticas-riesgo` y `tendencias` no existen en el backend

3. **Manejo de errores genérico**:
   - No muestra errores específicos del servidor

### 2. Backend - Endpoints de Reportes

#### Endpoints Implementados:
✅ `/api/reportes/resumen-general` - GET
✅ `/api/reportes/descargar/resumen-general/pdf` - GET
✅ `/api/reportes/descargar/resumen-general/excel` - GET
✅ `/api/reportes/estadisticas-gestantes` - GET
✅ `/api/reportes/descargar/estadisticas-gestantes/pdf` - GET
✅ `/api/reportes/descargar/estadisticas-gestantes/excel` - GET
✅ `/api/reportes/estadisticas-controles` - GET
✅ `/api/reportes/descargar/estadisticas-controles/pdf` - GET
✅ `/api/reportes/descargar/estadisticas-controles/excel` - GET
✅ `/api/reportes/estadisticas-alertas` - GET
✅ `/api/reportes/descargar/estadisticas-alertas/pdf` - GET
✅ `/api/reportes/descargar/estadisticas-alertas/excel` - GET
✅ `/api/reportes/consolidados/mensual` - GET
✅ `/api/reportes/consolidados/anual` - GET
✅ `/api/reportes/consolidados/municipio` - GET (DUPLICADO - líneas 4830 y 5066)

#### Endpoints NO Implementados (pero llamados desde frontend):
❌ `/api/reportes/estadisticas-riesgo`
❌ `/api/reportes/tendencias`

### 3. Estructura de Datos Inconsistente

#### Backend devuelve (`/api/reportes/resumen-general`):
```json
{
  "total_gestantes": 518,
  "total_controles": 331,
  "controles_realizados": 297,
  "controles_pendientes": 34,
  "total_alertas_activas": 54,
  "gestantes_alto_riesgo": 0,
  "controles_este_mes": X,
  "alertas_criticas": X,
  "promedio_controles_por_gestante": X,
  "fecha_generacion": "..."
}
```

#### Frontend espera:
```dart
data['total_gestantes']  // ✅ Existe
data['gestantes_nuevas']  // ❌ NO existe
data['controles_realizados']  // ✅ Existe
data['controles_pendientes']  // ✅ Existe
data['total_alertas_activas']  // ✅ Existe
data['gestantes_alto_riesgo']  // ✅ Existe
```

## Soluciones Necesarias

### 1. Actualizar Backend
- [ ] Agregar campo `gestantes_nuevas` al endpoint `/api/reportes/resumen-general`
- [ ] Eliminar endpoint duplicado de `consolidados/municipio`
- [ ] Implementar endpoints faltantes o removerlos del frontend

### 2. Actualizar Frontend
- [ ] Corregir campos en `_buildResumenGeneral()`
- [ ] Remover reportes no implementados (`estadisticas-riesgo`, `tendencias`)
- [ ] Mejorar manejo de errores

### 3. Mejorar Generación de PDFs/Excel
- [ ] Verificar que todos los campos se incluyen correctamente
- [ ] Agregar más información visual a los PDFs

## Prioridad de Correcciones

### Alta Prioridad:
1. Corregir campos en frontend para que coincidan con backend
2. Agregar `gestantes_nuevas` al backend
3. Remover reportes no implementados del frontend

### Media Prioridad:
4. Eliminar endpoint duplicado
5. Mejorar manejo de errores

### Baja Prioridad:
6. Implementar reportes adicionales (riesgo, tendencias)
7. Mejorar diseño de PDFs
