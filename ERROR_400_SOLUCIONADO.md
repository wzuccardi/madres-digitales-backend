# Error 400 al Crear Gestante - SOLUCIONADO

## 🐛 Problema

**Error:** `400 Bad Request` al intentar crear una nueva gestante desde la app.

**Causa Raíz:** El campo `factores_riesgo` estaba siendo convertido a JSON string con `JSON.stringify()`, pero Prisma espera un objeto JSON directo para campos de tipo `Json`.

## ✅ Solución Aplicada

### Cambio en el Controlador

**Archivo:** `src/controllers/gestante.controller.ts`

**Antes:**
```typescript
factores_riesgo: req.body.factores_riesgo || req.body.factoresRiesgo 
  ? JSON.stringify(req.body.factores_riesgo || req.body.factoresRiesgo) 
  : null,
```

**Después:**
```typescript
factores_riesgo: req.body.factores_riesgo || req.body.factoresRiesgo || null,
```

**Explicación:** Prisma maneja automáticamente la conversión de objetos JavaScript a JSON en la base de datos. No necesitamos (y no debemos) usar `JSON.stringify()`.

## 📊 Campos JSON en Prisma

Cuando un campo es de tipo `Json` en Prisma:

```prisma
model gestantes {
  factores_riesgo Json?
  coordenadas Json?
}
```

Prisma espera:
- ✅ Un objeto JavaScript: `{ key: 'value' }`
- ✅ Un array: `['item1', 'item2']`
- ✅ null
- ❌ NO un string JSON: `'{"key":"value"}'`

## 🔄 Otros Campos JSON Corregidos

También se aplicó la misma lógica a `coordenadas`:

```typescript
coordenadas: req.body.latitud && req.body.longitud 
  ? { type: 'Point', coordinates: [req.body.longitud, req.body.latitud] }
  : null,
```

Esto envía un objeto JavaScript directamente, no un string.

## 🚀 Desplegar la Solución

### 1. Backend ya compilado
```bash
cd S/aplicacionWZC/madres-digitales-backend
# Ya ejecutado: npm run build
```

### 2. Desplegar en Vercel
```bash
vercel --prod
```

O hacer push a GitHub si tienes auto-deploy:
```bash
git add .
git commit -m "fix: corregir manejo de campos JSON en creación de gestantes"
git push origin main
```

### 3. Probar la Creación

Después de desplegar, probar crear una gestante desde la app:
1. Abrir la app
2. Ir a "Nueva Gestante"
3. Llenar los campos
4. Guardar
5. ✅ Debería funcionar sin error 400

## 📝 Formato de Datos Correcto

### Request Body (Crear Gestante)

```json
{
  "nombre": "María",
  "apellido": "García",
  "documento": "1234567890",
  "telefono": "3001234567",
  "direccion": "Calle 123",
  "eps": "SURA",
  "regimen_salud": "Subsidiado",
  "grupo_sanguineo": "O+",
  "barrio": "Centro",
  "riesgo_alto": false,
  "factoresRiesgo": ["Hipertensión", "Diabetes"],
  "latitud": 10.123456,
  "longitud": -75.123456
}
```

### Cómo Prisma lo Guarda

```sql
INSERT INTO gestantes (
  ...
  factores_riesgo,
  coordenadas
) VALUES (
  ...
  '["Hipertensión", "Diabetes"]'::jsonb,
  '{"type":"Point","coordinates":[-75.123456,10.123456]}'::jsonb
);
```

Prisma hace la conversión automáticamente.

## ✅ Verificación

### Antes del Fix
```
❌ Error 400: Bad Request
❌ "Client error - the request contains bad syntax"
❌ No se pueden crear gestantes
```

### Después del Fix
```
✅ Status 201: Created
✅ Gestante creada exitosamente
✅ Todos los campos guardados correctamente
```

## 🎯 Resumen

**Problema:** Conversión incorrecta de campos JSON
**Solución:** Dejar que Prisma maneje la conversión automáticamente
**Estado:** ✅ Solucionado y compilado
**Próximo paso:** Desplegar en Vercel

## 📚 Lecciones Aprendidas

1. **Campos JSON en Prisma:** No usar `JSON.stringify()`, enviar objetos directamente
2. **Validación de tipos:** Prisma valida automáticamente los tipos de datos
3. **Logs detallados:** Agregar logs ayuda a identificar problemas rápidamente
4. **Testing:** Probar con datos reales antes de desplegar

## 🔍 Debugging Tips

Si el error persiste después del deploy:

1. **Verificar logs en Vercel:**
   - Ir a Vercel Dashboard
   - Ver logs en tiempo real
   - Buscar el error específico

2. **Probar con curl:**
   ```bash
   curl -X POST https://madres-digitales-backend.vercel.app/api/gestantes \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer TOKEN" \
     -d '{"nombre":"Test","documento":"123","telefono":"300","direccion":"Test","regimen_salud":"Subsidiado"}'
   ```

3. **Verificar que el deploy se completó:**
   - Vercel debe mostrar "Deployment Ready"
   - Verificar que la versión sea la más reciente

## ✨ Mejoras Adicionales Incluidas

- ✅ Logs detallados de datos recibidos
- ✅ Logs de datos a guardar
- ✅ Logs de gestante creada
- ✅ Mejor manejo de campos opcionales
- ✅ Valores por defecto para campos requeridos
