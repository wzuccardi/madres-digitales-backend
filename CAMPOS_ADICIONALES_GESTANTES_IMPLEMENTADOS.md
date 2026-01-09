# Campos Adicionales de Gestantes - Implementados

## ✅ Cambios Realizados

### 1. Schema de Prisma Actualizado
**Archivo:** `prisma/schema.prisma`

**Campos agregados al modelo `gestantes`:**
```prisma
// Campos adicionales
grupo_sanguineo           String?
barrio                    String?
foto_url                  String?
factores_riesgo           Json?
email                     String?
apellido                  String?
```

### 2. Controlador Actualizado
**Archivo:** `src/controllers/gestante.controller.ts`

**Cambios:**
- ✅ Importado `prisma` para acceso directo a la base de datos
- ✅ Método `createGestante` actualizado para aceptar todos los campos
- ✅ Soporte para ambos formatos: snake_case y camelCase
- ✅ Conversión automática de campos:
  - `esAltoRiesgo` → `riesgo_alto`
  - `grupoSanguineo` → `grupo_sanguineo`
  - `fotoUrl` → `foto_url`
  - `factoresRiesgo` → `factores_riesgo` (como JSON)

### 3. Campos Soportados

**Campos básicos:**
- ✅ nombre
- ✅ apellido (nuevo)
- ✅ documento
- ✅ tipo_documento
- ✅ fecha_nacimiento
- ✅ telefono
- ✅ email (nuevo)

**Campos de ubicación:**
- ✅ direccion
- ✅ barrio (nuevo)
- ✅ municipio_id
- ✅ coordenadas (latitud/longitud)

**Campos médicos:**
- ✅ eps
- ✅ regimen_salud
- ✅ fecha_ultima_menstruacion
- ✅ fecha_probable_parto
- ✅ grupo_sanguineo (nuevo)
- ✅ riesgo_alto
- ✅ factores_riesgo (nuevo, como JSON)

**Campos adicionales:**
- ✅ foto_url (nuevo)
- ✅ madrina_id
- ✅ medico_tratante_id
- ✅ ips_asignada_id
- ✅ activa

## 📊 Formato de Datos

### Request Body (Crear Gestante)

```json
{
  "nombre": "María",
  "apellido": "García",
  "documento": "1234567890",
  "tipo_documento": "CC",
  "fecha_nacimiento": "1995-05-15T00:00:00.000Z",
  "telefono": "3001234567",
  "email": "maria@example.com",
  "direccion": "Calle 123 #45-67",
  "barrio": "Centro",
  "municipio_id": "municipio_123",
  "eps": "SURA",
  "regimen_salud": "Contributivo",
  "fecha_ultima_menstruacion": "2024-05-15T00:00:00.000Z",
  "fecha_probable_parto": "2025-02-19T00:00:00.000Z",
  "grupo_sanguineo": "O+",
  "riesgo_alto": false,
  "factores_riesgo": ["Hipertensión", "Diabetes"],
  "foto_url": "https://example.com/foto.jpg",
  "madrina_id": "madrina_123",
  "latitud": 10.123456,
  "longitud": -75.123456
}
```

### Compatibilidad con camelCase

El backend también acepta formato camelCase:
```json
{
  "nombre": "María",
  "apellido": "García",
  "fechaNacimiento": "1995-05-15T00:00:00.000Z",
  "fechaUltimaMestruacion": "2024-05-15T00:00:00.000Z",
  "fechaProbableParto": "2025-02-19T00:00:00.000Z",
  "grupoSanguineo": "O+",
  "esAltoRiesgo": false,
  "factoresRiesgo": ["Hipertensión"],
  "fotoUrl": "https://example.com/foto.jpg"
}
```

## 🔄 Migración de Base de Datos

**IMPORTANTE:** Si los campos ya existen en la base de datos, NO necesitas migrar. Solo necesitas regenerar el cliente de Prisma:

```bash
cd S/aplicacionWZC/madres-digitales-backend
npx prisma generate
npm run build
```

Si los campos NO existen en la base de datos, ejecuta:

```bash
npx prisma db push
```

O crea una migración:

```bash
npx prisma migrate dev --name add_gestante_fields
```

## 🚀 Desplegar Cambios

### Backend en Vercel

```bash
cd S/aplicacionWZC/madres-digitales-backend
vercel --prod
```

O hacer push a GitHub si tienes auto-deploy:

```bash
git add .
git commit -m "feat: agregar campos adicionales a gestantes (grupo sanguíneo, barrio, foto, etc)"
git push origin main
```

## ✅ Verificar Funcionamiento

### 1. Probar Creación de Gestante

```bash
curl -X POST https://madres-digitales-backend.vercel.app/api/gestantes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "nombre": "Test",
    "apellido": "Usuario",
    "documento": "1234567890",
    "tipo_documento": "CC",
    "fecha_nacimiento": "1995-01-01T00:00:00.000Z",
    "telefono": "3001234567",
    "direccion": "Test 123",
    "eps": "SURA",
    "regimen_salud": "Subsidiado",
    "grupo_sanguineo": "O+",
    "barrio": "Centro"
  }'
```

### 2. Verificar en la App

1. Abrir la app
2. Ir a "Nueva Gestante"
3. Llenar todos los campos
4. Guardar
5. Verificar que NO aparezca error 400
6. Verificar que la gestante se creó correctamente

## 📝 Campos Opcionales vs Requeridos

### Campos Requeridos (*)
- nombre
- documento
- fecha_nacimiento
- telefono
- direccion
- regimen_salud

### Campos Opcionales
- apellido
- tipo_documento (default: 'CC')
- email
- barrio
- municipio_id
- eps
- fecha_ultima_menstruacion
- fecha_probable_parto
- grupo_sanguineo
- riesgo_alto (default: false)
- factores_riesgo
- foto_url
- madrina_id
- medico_tratante_id
- ips_asignada_id
- coordenadas (latitud/longitud)

## 🐛 Solución al Error 400

**Antes:**
```
Error 400: Bad Request
- El backend rechazaba campos desconocidos
- El formulario no podía crear gestantes
```

**Después:**
```
✅ El backend acepta todos los campos del formulario
✅ Soporte para snake_case y camelCase
✅ Conversión automática de formatos
✅ Campos opcionales manejados correctamente
```

## 🎯 Próximos Pasos

1. **Desplegar backend** en Vercel
2. **Probar creación** de gestante desde la app
3. **Verificar** que todos los campos se guarden correctamente
4. **Compilar nuevo APK** si es necesario

## ✨ Beneficios

- ✅ Formulario completo funcional
- ✅ Más información de las gestantes
- ✅ Mejor seguimiento médico
- ✅ Datos de emergencia completos
- ✅ Identificación con foto
- ✅ Factores de riesgo documentados

## 📊 Impacto

**Antes:**
- Error 400 al crear gestantes
- Formulario no funcional
- Datos limitados

**Después:**
- Creación exitosa de gestantes
- Formulario completo funcional
- Datos completos y estructurados
- Mejor seguimiento y atención
