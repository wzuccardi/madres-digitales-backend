# 🔍 ANÁLISIS DETALLADO DE ERRORES TYPESCRIPT - MADRES DIGITALES

## 📊 RESUMEN DE ERRORES (58 TOTAL)

| Archivo | Errores | Tipo Principal |
|---------|---------|----------------|
| assignment.service.ts | 33 | Include type mismatch, Property access on 'never' |
| alerta.service.ts | 6 | Include type mismatch, Missing fields |
| municipios.controller.ts | 4 | Include type mismatch, Missing fields in WhereInput |
| ips.service.ts | 4 | Include type mismatch, Missing properties |
| smart-alerts.service.ts | 4 | Include type mismatch, Missing 'estado' field |
| notification.service.ts | 2 | Include type mismatch, Type casting |
| control.service.ts | 2 | Missing 'medico_tratante_id' field |
| dashboard.service.ts | 1 | Include type mismatch |
| scoring.service.ts | 1 | Include type mismatch |
| ips.controller.ts | 1 | Unknown type issue |

## 🚨 CATEGORÍAS DE ERRORES

### 1. INCLUDE TYPE MISMATCH (Más común)
**Problema:** Prisma devuelve `never` para include clauses
**Causa:** El cliente de Prisma no reconoce las relaciones definidas en el esquema

#### Ejemplos:
```typescript
// ERROR: Type '{ municipio: true; }' is not assignable to type 'never'
const gestante = await prisma.gestante.findUnique({
  where: { id: string },
  include: { municipio: true } // ❌ Devuelve 'never'
});

// ERROR: Property 'nombre' does not exist on type 'never'
console.log(gestante.municipio?.nombre); // ❌ municipio es 'never'
```

**Archivos afectados:**
- assignment.service.ts (líneas 16, 35, 55, 114, 134, 233)
- alerta.service.ts (línea 91)
- ips.service.ts (línea 19)
- dashboard.service.ts (línea 167)
- scoring.service.ts (línea 123)
- notification.service.ts (línea 90)
- smart-alerts.service.ts (línea 15, 394)

### 2. MISSING FIELDS IN SCHEMA
**Problema:** El código usa campos que no existen en el esquema Prisma generado

#### 2.1 Campo 'medico_tratante_id' faltante
```typescript
// ERROR: 'medico_tratante_id' does not exist in type ControlPrenatalUpdateInput
medico_tratante_id: data.medico_tratante_id // ❌ Campo no reconocido
```
**Archivo:** control.service.ts (líneas 138)

#### 2.2 Campo 'estado' faltante en Alerta
```typescript
// ERROR: 'estado' does not exist in type AlertaWhereInput
where: { estado: 'pendiente' } // ❌ Campo no existe
```
**Archivo:** smart-alerts.service.ts (líneas 109, 333)

#### 2.3 Campo 'descripcion_detallada' faltante en Alerta
```typescript
// ERROR: 'descripcion_detallada' does not exist in type AlertaUpdateInput
descripcion_detallada: observaciones // ❌ Campo no existe
```
**Archivo:** alerta.service.ts (línea 310)

### 3. MISSING PROPERTIES IN WHERE INPUT
**Problema:** Campos de relación no reconocidos en WhereInput

#### Ejemplos:
```typescript
// ERROR: 'gestantes' does not exist in type MunicipioWhereInput
where: {
  gestantes: { some: { activa: true } } // ❌ Relación no reconocida
}

// ERROR: 'municipio_id' does not exist in type MedicoWhereInput
where: {
  municipio_id: gestante.municipio_id // ❌ Campo no reconocido
}
```
**Archivos afectados:**
- municipios.controller.ts (líneas 252, 261, 270)
- assignment.service.ts (línea 159)

### 4. MISSING COORDINATE PROPERTIES
**Problema:** El código usa `latitud` y `longitud` como campos separados, pero el esquema usa `coordenadas` JSON

#### Ejemplos:
```typescript
// ERROR: Property 'latitud' does not exist
ips.latitud || 0, ips.longitud || 0 // ❌ Campos no existen

// CORRECTO: Usar coordenadas JSON
const coords = ips.coordenadas as { type: string, coordinates: [number, number] };
const latitud = coords?.coordinates[1] || 0;
const longitud = coords?.coordinates[0] || 0;
```
**Archivo:** ips.service.ts (líneas 89)

### 5. ENUM TYPE MISMATCH
**Problema:** Strings no asignables a tipos enum

#### Ejemplos:
```typescript
// ERROR: Type 'string' is not assignable to type 'IpsNivel'
nivel_atencion: nivelAtencion, // ❌ String vs Enum

// CORRECTO:
nivel_atencion: nivelAtencion as IpsNivel,
```
**Archivos afectados:**
- ips.service.ts (línea 127)
- notification.service.ts (línea 257)

### 6. JSON NULL TYPE ISSUES
**Problema:** Manejo incorrecto de valores null en campos JSON

#### Ejemplos:
```typescript
// ERROR: Type 'null' is not assignable to InputJsonValue
coordenadas_alerta: data.latitud && data.longitud ? {
  type: "Point",
  coordinates: [data.longitud, data.latitud]
} : null // ❌ null no permitido

// CORRECTO:
coordenadas_alerta: data.latitud && data.longitud ? {
  type: "Point",
  coordinates: [data.longitud, data.latitud]
} : Prisma.JsonNull
```
**Archivo:** alerta.service.ts (líneas 341, 396)

## 🔧 SOLUCIONES PROPUESTAS

### Solución 1: REGENERAR CLIENTE PRISMA
```bash
# Limpiar y regenerar
rm -rf node_modules/.prisma
npx prisma generate --force
```

### Solución 2: VERIFICAR SINCRONIZACIÓN BD-ESQUEMA
```bash
# Verificar estado
npx prisma db pull
npx prisma db push
```

### Solución 3: AGREGAR CAMPOS FALTANTES AL ESQUEMA
```prisma
model Alerta {
  // ... campos existentes
  estado              String? // Agregar campo estado
  descripcion_detallada String? // Agregar descripción detallada
}
```

### Solución 4: TYPE ASSERTIONS TEMPORALES
```typescript
// Para include clauses
const result = await prisma.gestante.findUnique({
  where: { id },
  include: { municipio: true }
}) as any; // Temporal hasta arreglar Prisma

// Para campos faltantes
const data = {
  ...otherFields,
  medico_tratante_id: medicoId
} as any; // Temporal
```

### Solución 5: USAR COORDENADAS JSON CORRECTAMENTE
```typescript
// En lugar de ips.latitud, ips.longitud
const getCoordinates = (coordenadas: any) => {
  if (!coordenadas?.coordinates) return { lat: 0, lng: 0 };
  return {
    lat: coordenadas.coordinates[1],
    lng: coordenadas.coordinates[0]
  };
};
```

## 🎯 PLAN DE ACCIÓN INMEDIATO

### Paso 1: Arreglar Prisma Client
1. Detener todos los procesos
2. Limpiar cache de Prisma
3. Regenerar cliente con permisos correctos
4. Verificar que las relaciones funcionen

### Paso 2: Arreglar Campos Faltantes
1. Agregar `estado` y `descripcion_detallada` a modelo Alerta
2. Verificar que `medico_tratante_id` existe en ControlPrenatal
3. Crear migración si es necesario

### Paso 3: Arreglar Coordenadas
1. Reemplazar `latitud`/`longitud` con acceso a `coordenadas` JSON
2. Crear funciones helper para manejo de GeoJSON

### Paso 4: Type Assertions Temporales
1. Agregar `as any` a include clauses problemáticas
2. Agregar type assertions para campos faltantes
3. Documentar TODOs para arreglar después

### Paso 5: Probar Compilación
1. Intentar compilar con `npx tsc --noEmitOnError false`
2. Verificar que el servidor inicie
3. Probar endpoints críticos

## 🚀 COMANDOS PARA EJECUTAR

```bash
# 1. Limpiar Prisma
rm -rf node_modules/.prisma
rm -rf dist

# 2. Regenerar cliente
npx prisma generate

# 3. Verificar BD
npx prisma db push

# 4. Compilar con errores permitidos
npx tsc --noEmitOnError false

# 5. Iniciar servidor
node dist/app.js
```

## ⚠️ NOTAS IMPORTANTES

1. **No eliminar datos:** Todas las soluciones deben preservar datos existentes
2. **Backup recomendado:** Hacer backup de BD antes de cambios de esquema
3. **Prioridad:** Hacer que el servidor funcione primero, optimizar después
4. **Testing:** Probar endpoints críticos después de cada cambio

## 📋 CHECKLIST DE VERIFICACIÓN

- [ ] Cliente Prisma regenerado sin errores
- [ ] Relaciones funcionan en queries
- [ ] Campos faltantes agregados al esquema
- [ ] Coordenadas manejadas correctamente
- [ ] Servidor inicia sin errores
- [ ] Endpoint `/api/controles` funciona
- [ ] Flutter app puede crear controles
- [ ] Sistema de alertas automáticas funciona
