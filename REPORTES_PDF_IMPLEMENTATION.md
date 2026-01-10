# Implementación de Generación de Reportes en PDF

## ✅ Completado

### Backend - Controladores
Se agregaron las siguientes funciones al controlador de reportes (`reporte.controller.ts`):

1. **getEstadisticasControlesPDF** - Genera PDF de estadísticas de controles prenatales
2. **getEstadisticasRiesgoPDF** - Genera PDF de estadísticas de riesgo
3. **getTendenciasPDF** - Genera PDF de análisis de tendencias

### Backend - Servicios
Se agregaron las siguientes funciones al servicio de exportación PDF (`export-pdf.service.ts`):

1. **generateEstadisticasControlesPDF** - Genera el documento PDF con:
   - Resumen general de controles
   - Total de controles
   - Controles del mes actual
   - Promedio por gestante
   - Distribución por municipio

2. **generateEstadisticasRiesgoPDF** - Genera el documento PDF con:
   - Distribución por nivel de riesgo
   - Porcentajes de cada nivel
   - Factores de riesgo más comunes

3. **generateTendenciasPDF** - Genera el documento PDF con:
   - Tendencias de gestantes por mes
   - Tendencias de controles por mes
   - Tendencias de alertas por mes

### Backend - Rutas
Se agregaron las siguientes rutas en `reportes.routes.ts`:

- `GET /api/reportes/descargar/estadisticas-controles/pdf`
- `GET /api/reportes/descargar/estadisticas-riesgo/pdf`
- `GET /api/reportes/descargar/tendencias/pdf`

### Frontend - Flutter
Ya implementado en sesión anterior:

1. **Descarga en Web** - Usando `universal_html` para crear blobs y descargar archivos
2. **Descarga en Móvil** - Usando `path_provider` y `share_plus` para guardar y compartir archivos
3. **Interfaz de Usuario** - Botones de descarga para PDF y Excel en cada reporte

## 📊 Reportes Disponibles

Todos los siguientes reportes ahora tienen descarga en PDF y Excel:

1. ✅ **Resumen General** - Vista general del sistema
2. ✅ **Estadísticas de Gestantes** - Análisis por municipio
3. ✅ **Estadísticas de Controles** - Controles prenatales realizados
4. ✅ **Estadísticas de Alertas** - Alertas generadas y resueltas
5. ✅ **Estadísticas de Riesgo** - Distribución por nivel de riesgo
6. ✅ **Tendencias** - Análisis temporal de datos

## 🎨 Características de los PDFs

- **Diseño profesional** con encabezados y pie de página
- **Fecha de generación** en cada documento
- **Formato A4** con márgenes apropiados
- **Tipografía clara** con jerarquía visual
- **Tablas y listas** para datos estructurados
- **Paginación automática** cuando el contenido es extenso

## 🔧 Tecnologías Utilizadas

### Backend
- **pdfkit** - Generación de documentos PDF
- **exceljs** - Generación de archivos Excel
- **TypeScript** - Tipado fuerte y mejor mantenibilidad

### Frontend
- **universal_html** - Descarga de archivos en web
- **path_provider** - Acceso a directorios en móvil
- **share_plus** - Compartir archivos en móvil
- **permission_handler** - Permisos de almacenamiento

## 📝 Uso

### Desde la Aplicación

1. Navegar a la sección de **Reportes**
2. Seleccionar el reporte deseado
3. Hacer clic en el botón **PDF** o **Excel**
4. El archivo se descargará automáticamente

### Desde la API

```bash
# Ejemplo: Descargar resumen general en PDF
GET /api/reportes/descargar/resumen-general/pdf
Authorization: Bearer <token>

# Ejemplo: Descargar estadísticas de controles en PDF
GET /api/reportes/descargar/estadisticas-controles/pdf?fecha_inicio=2024-01-01&fecha_fin=2024-12-31
Authorization: Bearer <token>

# Ejemplo: Descargar tendencias en PDF
GET /api/reportes/descargar/tendencias/pdf?meses=12
Authorization: Bearer <token>
```

## 🔐 Seguridad

- Todos los endpoints requieren autenticación
- Validación de permisos según rol de usuario
- Los reportes se filtran según el contexto del usuario (madrina, coordinador, admin)

## 🚀 Próximos Pasos

1. Agregar gráficos a los PDFs (usando canvas o imágenes)
2. Implementar reportes personalizados con filtros avanzados
3. Agregar opción de envío por email
4. Implementar programación de reportes automáticos
5. Agregar más formatos de exportación (CSV, JSON)

## 📌 Notas

- Los PDFs se generan en el servidor para garantizar consistencia
- El frontend maneja la descarga según la plataforma (web/móvil)
- Los archivos no se almacenan en el servidor, se generan on-demand
- El caché de reportes mejora el rendimiento de generación
