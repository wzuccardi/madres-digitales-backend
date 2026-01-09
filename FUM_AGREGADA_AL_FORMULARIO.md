# Campo FUM Agregado al Formulario de Edición

## ✅ Cambios Implementados

### 1. Backend - Servicio de Gestantes
**Archivo:** `src/services/gestante.service.ts`

**Cambios:**
- ✅ Agregado campo `lastMenstruation` (FUM) al método `updateGestanteCompleta`
- ✅ **Cálculo automático de FPP**: Si se proporciona FUM pero no FPP, el backend calcula automáticamente FPP = FUM + 280 días
- ✅ El campo FUM se retorna en la respuesta de actualización

```typescript
// Si se proporciona FUM, calcular automáticamente FPP (FUM + 280 días)
if (data.fecha_ultima_menstruacion && !data.fecha_probable_parto) {
  const fum = new Date(data.fecha_ultima_menstruacion);
  const fpp = new Date(fum);
  fpp.setDate(fpp.getDate() + 280);
  dto.probableDelivery = fpp;
  log.info(`GestanteService: FPP calculada automáticamente desde FUM: ${fpp.toISOString()}`);
}
```

### 2. Frontend - Formulario de Edición
**Archivo:** `lib/features/gestante/presentation/pages/gestante_edit_page.dart`

**Cambios:**
- ✅ Agregadas variables de estado: `_fechaUltimaMenstruacion` y `_fechaProbableParto`
- ✅ Carga de FUM desde la gestante existente
- ✅ Nueva sección "Datos Obstétricos" en la interfaz
- ✅ Campo de selección de FUM con DatePicker
- ✅ Indicador visual: rojo si no está registrada, azul si existe
- ✅ Cálculo y visualización automática de FPP
- ✅ Envío de FUM al backend en el método `_save()`

**Interfaz:**
```dart
Card(
  child: Column(
    children: [
      Text('Datos Obstétricos'),
      ListTile(
        title: Text('Fecha Última Menstruación (FUM)'),
        subtitle: Text(FUM o 'No registrada'),
        trailing: Icon(Icons.calendar_today),
        onTap: () => _selectFUM(),
      ),
      if (FUM != null)
        Container(
          // Muestra FPP calculada automáticamente
          child: Text('Fecha Probable de Parto: ${FPP}'),
        ),
    ],
  ),
)
```

## 🎯 Funcionalidad

### Flujo de Edición

1. **Usuario abre el formulario de edición**
   - Se carga la FUM existente (si existe)
   - Se muestra en rojo "No registrada" si falta
   - Se muestra en azul la fecha si existe

2. **Usuario selecciona FUM**
   - Se abre un DatePicker
   - Rango permitido: último año hasta hoy
   - Al seleccionar, se calcula automáticamente FPP (FUM + 280 días)

3. **Usuario guarda**
   - Se envía FUM al backend
   - Backend calcula FPP si no se proporcionó
   - Se actualiza la gestante en la base de datos

4. **Resultado**
   - Los nuevos controles calcularán correctamente las semanas de gestación
   - Las alertas automáticas funcionarán correctamente

## 📊 Impacto

### Problema Resuelto
- **191 gestantes sin FUM** pueden ahora ser actualizadas
- **95 controles con 24 semanas** se corregirán con los nuevos datos
- **20 gestantes prioritarias** (con controles pero sin FUM) pueden actualizarse inmediatamente

### Cálculos Automáticos

**Backend:**
- FPP = FUM + 280 días (si no se proporciona FPP)

**Frontend:**
- FPP se muestra automáticamente al seleccionar FUM
- Validación de fechas (no futuras, dentro del último año)

**Controles Prenatales:**
- Semanas de gestación = (Fecha Control - FUM) / 7
- Ahora funcionará correctamente con la FUM actualizada

## 🔧 Endpoints Actualizados

### PUT /api/gestantes/:id

**Request Body (ahora acepta FUM):**
```json
{
  "nombre": "Nombre Completo",
  "apellido": "Apellido",
  "documento": "1234567890",
  "telefono": "3001234567",
  "email": "email@example.com",
  "municipio_id": "municipio_123",
  "fecha_ultima_menstruacion": "2024-05-15T00:00:00.000Z",
  "fecha_probable_parto": "2025-02-19T00:00:00.000Z"
}
```

**Response:**
```json
{
  "message": "Gestante actualizada exitosamente",
  "gestante": {
    "id": "gestante_123",
    "nombre": "Nombre Completo",
    "fecha_ultima_menstruacion": "2024-05-15T00:00:00.000Z",
    "fecha_probable_parto": "2025-02-19T00:00:00.000Z",
    ...
  }
}
```

## 📝 Validaciones

### Frontend
- ✅ FUM no puede ser futura
- ✅ FUM debe estar dentro del último año
- ✅ FPP se calcula automáticamente
- ✅ Indicador visual de estado (rojo/azul)

### Backend
- ✅ FUM se convierte a Date correctamente
- ✅ FPP se calcula si no se proporciona
- ✅ Se registra en logs el cálculo automático
- ✅ Se retorna en la respuesta

## 🚀 Próximos Pasos

1. **Compilar y desplegar:**
   ```bash
   # Backend
   cd S/aplicacionWZC/madres-digitales-backend
   npm run build
   
   # Frontend
   cd S/aplicacionWZC/madres_digitales_flutter_new
   flutter build apk --release
   ```

2. **Actualizar gestantes prioritarias:**
   - Usar el script `analizar_gestantes_sin_fum.js` para identificarlas
   - Actualizar las 20 gestantes con controles primero
   - Continuar por municipio

3. **Verificar:**
   - Crear un nuevo control prenatal
   - Verificar que las semanas de gestación se calculen correctamente
   - Confirmar que las alertas automáticas funcionen

## ✨ Características

- **Cálculo automático de FPP** en backend y frontend
- **Indicadores visuales** para FUM faltante
- **Validación de fechas** apropiada
- **Sincronización** entre FUM y FPP
- **Logs detallados** para debugging
- **Compatibilidad** con datos existentes

## 🐛 Troubleshooting

### Si la FUM no se guarda:
1. Verificar que el campo se envíe en el request
2. Revisar logs del backend para ver si llega
3. Verificar formato de fecha (ISO 8601)

### Si la FPP no se calcula:
1. Verificar que la FUM sea válida
2. Revisar logs del backend para ver el cálculo
3. Confirmar que el método `_calcularFPP()` funcione en Flutter

### Si los controles siguen sin calcular semanas:
1. Verificar que la gestante tenga FUM registrada
2. Los controles antiguos mantienen su valor (histórico)
3. Solo los nuevos controles calcularán correctamente
