# Inconsistencia de Controles Corregida

## Problema Identificado
El dashboard principal mostraba **297 controles** mientras que el dashboard de reportes mostraba **331 controles**.

## Causa Raíz
Los dos endpoints estaban contando controles de manera diferente:

### Dashboard Principal (`/api/dashboard/statistics`)
```javascript
controlesRealizados: prisma.control_prenatal.count({ 
  where: { ...controlWhere, realizado: true } 
})
```
- Contaba solo controles **realizados**
- Resultado: 297 controles

### Reportes (`/api/reportes/resumen-general`)
```javascript
totalControles: prisma.control_prenatal.count()
```
- Contaba **todos** los controles (realizados + pendientes)
- Resultado: 331 controles

## Solución Implementada

### 1. Actualizado `/api/reportes/resumen-general`
Ahora devuelve información más detallada:
```javascript
{
  total_controles: 331,           // Todos los controles
  controles_realizados: 297,      // Solo realizados
  controles_pendientes: 34,       // Solo pendientes
  controles_este_mes: X,
  promedio_controles_por_gestante: X
}
```

### 2. Actualizado Generador de Reportes PDF
El PDF ahora muestra:
- Total de controles: 331
- Controles realizados: 297
- Controles pendientes: 34
- Controles este mes: X
- Promedio de controles por gestante: X

### 3. Actualizado Generador de Reportes Excel
El Excel ahora incluye las mismas filas adicionales.

## Resultado
Ahora ambos dashboards son consistentes:
- **Dashboard Principal**: Muestra "Controles Realizados: 297"
- **Reportes**: Muestra "Total: 331, Realizados: 297, Pendientes: 34"

La información es clara y no hay inconsistencias.

## Archivos Modificados
1. `api/index.js` - Endpoint `/api/reportes/resumen-general`
2. `src/services/reportes-generator.service.js` - Generadores PDF y Excel

## Testing
1. Verificar que el dashboard principal sigue mostrando 297 controles realizados
2. Verificar que reportes ahora muestra:
   - Total: 331
   - Realizados: 297
   - Pendientes: 34
3. Descargar PDF y Excel para verificar que incluyen todos los campos
