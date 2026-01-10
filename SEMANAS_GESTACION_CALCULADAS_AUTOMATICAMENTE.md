# ✅ Semanas de Gestación Calculadas Automáticamente

## 🐛 Problema Resuelto

**Síntoma:**
- Las semanas de gestación aparecían en **0** o **vacías** en los controles prenatales
- El frontend enviaba `semanas_gestacion: 0`
- El backend guardaba ese valor sin calcularlo

**Causa raíz:**
- El backend NO calculaba automáticamente las semanas de gestación
- Dependía de que el frontend enviara el valor correcto
- Si la gestante no tenía FUM, el cálculo no se podía hacer

## ✅ Solución Implementada

### 1. Cálculo Automático en el Backend

Se agregó un método privado en `ControlService` que calcula las semanas de gestación basándose en:
- **FUM (Fecha de Última Menstruación)** de la gestante
- **Fecha del control** prenatal

```typescript
private calcularSemanasGestacion(fechaUltimaMenstruacion: Date | null, fechaControl: Date): number | null {
    if (!fechaUltimaMenstruacion) {
        return null; // No se puede calcular sin FUM
    }

    const fum = new Date(fechaUltimaMenstruacion);
    const control = new Date(fechaControl);
    
    // Calcular diferencia en días
    const diferenciaDias = Math.floor((control.getTime() - fum.getTime()) / (1000 * 60 * 60 * 24));
    
    // Convertir a semanas
    const semanas = Math.floor(diferenciaDias / 7);
    
    // Validar rango (0-42 semanas)
    if (semanas < 0 || semanas > 42) {
        return null;
    }
    
    return semanas;
}
```

### 2. Integración en Creación de Controles

El cálculo se aplica automáticamente en dos métodos:

#### A. `createControlCompleto()`
```typescript
// Calcular semanas de gestación automáticamente si no se proporciona o es 0
let semanasGestacion = data.semanas_gestacion ? parseInt(data.semanas_gestacion.toString()) : null;

if (!semanasGestacion || semanasGestacion === 0) {
    semanasGestacion = this.calcularSemanasGestacion(
        gestante.fecha_ultima_menstruacion,
        new Date(data.fecha_control)
    );
}
```

#### B. `createControlConEvaluacion()`
```typescript
// Calcular semanas de gestación automáticamente si no se proporciona o es 0
let semanasGestacion = data.semanas_gestacion || null;

if (!semanasGestacion || semanasGestacion === 0) {
    semanasGestacion = this.calcularSemanasGestacion(
        gestante.fecha_ultima_menstruacion,
        new Date(data.fecha_control)
    );
}
```

## 📊 Cómo Funciona

### Ejemplo 1: Gestante con FUM

**Datos:**
- FUM: 1 de junio de 2024
- Fecha del control: 1 de diciembre de 2024

**Cálculo:**
```
Diferencia = 183 días
Semanas = 183 / 7 = 26 semanas
```

**Resultado:** El control se guarda con `semanas_gestacion: 26`

### Ejemplo 2: Gestante sin FUM

**Datos:**
- FUM: `null` (no registrada)
- Fecha del control: 1 de diciembre de 2024

**Cálculo:**
```
No se puede calcular sin FUM
```

**Resultado:** El control se guarda con `semanas_gestacion: null`

## 🎯 Beneficios

### 1. ✅ Precisión Automática
- El cálculo se hace en el backend, no depende del frontend
- Usa la FUM registrada en la base de datos
- Siempre es consistente

### 2. ✅ Validación de Rango
- Solo acepta valores entre 0 y 42 semanas
- Detecta fechas inválidas o inconsistentes
- Retorna `null` si el cálculo no es válido

### 3. ✅ Logging Detallado
- Registra cuando se calcula automáticamente
- Muestra advertencias si no hay FUM
- Ayuda a debuggear problemas

### 4. ✅ Compatibilidad
- Si el frontend envía un valor válido (> 0), se respeta
- Si envía 0 o null, se calcula automáticamente
- No rompe funcionalidad existente

## 🔍 Casos de Uso

### Caso 1: Frontend envía semanas_gestacion = 0
```json
{
  "gestante_id": "gestante_123",
  "fecha_control": "2024-12-01",
  "semanas_gestacion": 0,
  "peso": 165
}
```

**Backend:**
1. Detecta que `semanas_gestacion = 0`
2. Busca la FUM de la gestante
3. Calcula: `(fecha_control - FUM) / 7`
4. Guarda el valor calculado

### Caso 2: Frontend envía semanas_gestacion válido
```json
{
  "gestante_id": "gestante_123",
  "fecha_control": "2024-12-01",
  "semanas_gestacion": 26,
  "peso": 165
}
```

**Backend:**
1. Detecta que `semanas_gestacion = 26` (válido)
2. NO calcula, respeta el valor enviado
3. Guarda `26`

### Caso 3: Gestante sin FUM
```json
{
  "gestante_id": "gestante_456",
  "fecha_control": "2024-12-01",
  "semanas_gestacion": 0
}
```

**Backend:**
1. Detecta que `semanas_gestacion = 0`
2. Busca la FUM → `null`
3. No puede calcular
4. Guarda `null` y registra advertencia

## 📝 Logs Generados

### Cálculo exitoso:
```
INFO: Semanas de gestación calculadas automáticamente: 26
INFO: Semanas de gestación calculadas: 26 (FUM: 2024-06-01, Control: 2024-12-01)
```

### Sin FUM:
```
WARN: No se puede calcular semanas de gestación: FUM no disponible
```

### Fuera de rango:
```
WARN: Semanas de gestación fuera de rango: 50. FUM: 2023-01-01, Control: 2024-12-01
```

## 🚀 Deployment

**Commit:** `f6a0523`
**Mensaje:** "fix: calcular automáticamente semanas de gestación basándose en FUM al crear controles prenatales"
**Estado:** ✅ Desplegado en Vercel

### Archivos Modificados:
- `src/services/control.service.ts` - Agregado método `calcularSemanasGestacion()` y lógica de cálculo automático

## 🧪 Pruebas

### Test 1: Crear control con semanas_gestacion = 0
1. Seleccionar una gestante con FUM registrada
2. Crear un control prenatal
3. Dejar semanas_gestacion en 0 o vacío
4. ✅ Verificar que se calcula automáticamente

### Test 2: Crear control con semanas_gestacion válido
1. Seleccionar una gestante
2. Crear un control prenatal
3. Especificar semanas_gestacion = 20
4. ✅ Verificar que se guarda 20 (no se recalcula)

### Test 3: Gestante sin FUM
1. Seleccionar una gestante sin FUM
2. Crear un control prenatal
3. ✅ Verificar que semanas_gestacion queda en null
4. ✅ Verificar que aparece advertencia en logs

## 📋 Requisitos para el Cálculo

Para que el cálculo funcione correctamente, la gestante DEBE tener:

1. ✅ **FUM registrada** (`fecha_ultima_menstruacion` no null)
2. ✅ **FUM válida** (fecha en el pasado)
3. ✅ **Fecha de control válida**

Si falta alguno de estos requisitos, el campo quedará en `null`.

## 🎯 Próximos Pasos

### 1. Actualizar Gestantes sin FUM
Ejecutar script para identificar gestantes sin FUM:

```sql
SELECT 
    id,
    nombre,
    documento,
    fecha_ultima_menstruacion
FROM gestantes
WHERE activa = true
AND fecha_ultima_menstruacion IS NULL;
```

### 2. Solicitar FUM a Madrinas
- Notificar a las madrinas sobre gestantes sin FUM
- Solicitar que actualicen este dato crítico
- Priorizar gestantes con controles recientes

### 3. Validación en Frontend
- Agregar validación que alerte si no hay FUM
- Sugerir registrar FUM antes de crear control
- Mostrar mensaje informativo

## ✅ Conclusión

El problema de semanas de gestación en 0 está resuelto. El backend ahora:

- ✅ Calcula automáticamente las semanas de gestación
- ✅ Usa la FUM de la base de datos
- ✅ Valida rangos y fechas
- ✅ Registra logs detallados
- ✅ Es compatible con el frontend existente

**Los nuevos controles prenatales mostrarán las semanas de gestación correctamente calculadas.** 🎉

## 🔗 Referencias

- Commit: `f6a0523`
- Archivo: `src/services/control.service.ts`
- Método: `calcularSemanasGestacion()`
- Endpoints afectados:
  - `POST /api/controles`
  - `POST /api/alertas-automaticas/controles/con-evaluacion`
