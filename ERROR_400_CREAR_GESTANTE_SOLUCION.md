# Error 400 al Crear Gestante - Solución

## 🐛 Problema Identificado

**Error:** `400 Bad Request - Client error - the request contains bad syntax or cannot be fulfilled`

**Causa:** El formulario de creación de gestantes está enviando campos que no existen en el schema del backend.

### Campos que el Backend Acepta (según schema.prisma)
```typescript
{
  documento: string
  tipo_documento: string
  nombre: string
  fecha_nacimiento: DateTime
  telefono: string
  direccion: string
  coordenadas: Json (opcional)
  fecha_ultima_menstruacion: DateTime (opcional)
  fecha_probable_parto: DateTime (opcional)
  eps: string (opcional)
  regimen_salud: string
  municipio_id: string (opcional)
  madrina_id: string (opcional)
  medico_tratante_id: string (opcional)
  ips_asignada_id: string (opcional)
  activa: boolean
  riesgo_alto: boolean
}
```

### Campos que el Formulario Está Enviando (EXTRA)
```typescript
{
  // Campos válidos...
  
  // ❌ Campos que NO existen en el backend:
  esAltoRiesgo: boolean  // Debería ser riesgo_alto
  factoresRiesgo: string[]  // No existe en schema
  grupoSanguineo: string  // No existe en schema
  contactoEmergenciaNombre: string  // No existe en schema
  contactoEmergenciaTelefono: string  // No existe en schema
  barrio: string  // No existe en schema
  creadaPor: string  // No existe en schema
  madrinasAsignadas: string[]  // No existe en schema
  fotoUrl: string  // No existe en schema
  apellido: string  // Debería estar en "nombre" completo
}
```

## ✅ Soluciones

### Solución 1: Actualizar el Formulario (RECOMENDADO)

Modificar el formulario para que solo envíe los campos que el backend acepta:

**Archivo:** `lib/features/gestante/presentation/pages/create_gestante_page.dart`

**Cambios necesarios:**

1. **Combinar nombre y apellido:**
```dart
nombre: '${_nombresController.text.trim()} ${_apellidosController.text.trim()}',
```

2. **Cambiar `esAltoRiesgo` a `riesgo_alto`:**
```dart
riesgo_alto: _esAltoRiesgo,
```

3. **Eliminar campos no soportados:**
- No enviar `factoresRiesgo`
- No enviar `grupoSanguineo`
- No enviar `contactoEmergenciaNombre`
- No enviar `contactoEmergenciaTelefono`
- No enviar `barrio`
- No enviar `creadaPor`
- No enviar `madrinasAsignadas`
- No enviar `fotoUrl`

### Solución 2: Actualizar el Backend (LARGO PLAZO)

Agregar los campos faltantes al schema de Prisma:

**Archivo:** `prisma/schema.prisma`

```prisma
model gestantes {
  // ... campos existentes ...
  
  // Nuevos campos
  grupo_sanguineo String?
  barrio String?
  foto_url String?
  factores_riesgo Json?
  
  // Relación con contactos de emergencia (ya existe)
  contactos_emergencia contactos_emergencia[]
}
```

Luego ejecutar:
```bash
npx prisma migrate dev --name add_gestante_fields
npx prisma generate
```

## 🔧 Implementación de Solución 1 (Rápida)

Voy a modificar el formulario para que envíe solo los campos correctos:

### Paso 1: Modificar el método `_submitForm`

Cambiar la creación del objeto Gestante para que use el formato correcto del backend:

```dart
// En lugar de crear un objeto Gestante completo,
// crear un Map con solo los campos que el backend acepta
final gestanteData = {
  'nombre': '${_nombresController.text.trim()} ${_apellidosController.text.trim()}',
  'documento': _numeroDocumentoController.text.trim(),
  'tipo_documento': _tipoDocumento,
  'telefono': _telefonoController.text.trim(),
  'direccion': _direccionController.text.trim(),
  'eps': _eps,
  'regimen_salud': _regimen,
  'riesgo_alto': _esAltoRiesgo,
  'activa': true,
};

// Agregar campos opcionales solo si existen
if (_fechaNacimiento != null) {
  gestanteData['fecha_nacimiento'] = _fechaNacimiento!.toIso8601String();
}

if (_fechaUltimaMestruacion != null) {
  gestanteData['fecha_ultima_menstruacion'] = _fechaUltimaMestruacion!.toIso8601String();
}

if (_fechaProbableParto != null) {
  gestanteData['fecha_probable_parto'] = _fechaProbableParto!.toIso8601String();
}

if (_latitud != null && _longitud != null) {
  gestanteData['latitud'] = _latitud;
  gestanteData['longitud'] = _longitud;
}

if (_emailController.text.isNotEmpty) {
  // El email no está en el schema, no enviarlo
  // O agregarlo al schema primero
}

// Asignar madrina automáticamente
final authState = ref.read(authProvider);
if (authState.usuario?.rol == 'madrina') {
  gestanteData['madrina_id'] = authState.usuario!.id;
}
```

### Paso 2: Enviar al backend

```dart
// Usar el servicio API directamente
final apiService = ref.read(apiServiceProvider);
final response = await apiService.post('/api/gestantes', data: gestanteData);
```

## 📝 Campos que se Pueden Agregar al Backend

Si quieres mantener todos los campos del formulario, necesitas agregar al schema:

1. **grupo_sanguineo** - Útil para emergencias
2. **barrio** - Útil para ubicación
3. **foto_url** - Útil para identificación
4. **factores_riesgo** - Útil para seguimiento (como JSON)

Los contactos de emergencia ya tienen su propia tabla (`contactos_emergencia`), así que deberían crearse por separado.

## 🚀 Acción Inmediata

**Opción A: Modificar el formulario** (más rápido)
- Cambiar el código del formulario para enviar solo campos válidos
- Recompilar la app
- Probar

**Opción B: Actualizar el backend** (más completo)
- Agregar campos al schema
- Migrar la base de datos
- Actualizar el backend
- Desplegar

## ⚠️ Nota Importante

El error 400 se debe a que Prisma está rechazando los campos desconocidos. La solución más rápida es modificar el formulario para que no envíe esos campos.

## 🔍 Debugging

Para ver exactamente qué está rechazando el backend, revisa los logs en Vercel:
1. Ir a Vercel Dashboard
2. Seleccionar el proyecto backend
3. Ver logs en tiempo real
4. Intentar crear una gestante
5. Ver el error específico

El log debería mostrar qué campo está causando el problema.
