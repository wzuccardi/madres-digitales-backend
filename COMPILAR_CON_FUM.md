# Compilar App con Campo FUM

## ✅ Cambios Aplicados

Los cambios ya están en el código:
- ✅ Backend: Campo FUM agregado al servicio de actualización
- ✅ Frontend: Sección "Datos Obstétricos" con campo FUM agregada al formulario

## 🔨 Compilar la App

### Opción 1: Compilar APK para Producción

```bash
cd S/aplicacionWZC/madres_digitales_flutter_new
flutter clean
flutter pub get
flutter build apk --release
```

El APK estará en: `build/app/outputs/flutter-apk/app-release.apk`

### Opción 2: Ejecutar en Modo Debug (más rápido para probar)

```bash
cd S/aplicacionWZC/madres_digitales_flutter_new
flutter run
```

### Opción 3: Hot Reload (si ya está corriendo)

Si la app ya está corriendo en tu dispositivo:
1. Presiona `r` en la terminal para hot reload
2. O presiona `R` para hot restart

## 🔄 Actualizar Backend en Vercel

```bash
cd S/aplicacionWZC/madres-digitales-backend
npm run build
vercel --prod
```

O hacer push a GitHub si tienes auto-deploy configurado:
```bash
git add .
git commit -m "feat: agregar campo FUM al formulario de edición"
git push origin main
```

## 📱 Probar los Cambios

1. **Abrir la app compilada**
2. **Ir a Gestantes**
3. **Seleccionar una gestante** (preferiblemente una sin FUM)
4. **Presionar el botón de editar** (ícono de lápiz)
5. **Verificar que aparezca la sección "Datos Obstétricos"**
6. **Presionar en "Fecha Última Menstruación"**
7. **Seleccionar una fecha**
8. **Verificar que se muestre la FPP calculada automáticamente**
9. **Guardar**
10. **Verificar que se guardó correctamente**

## 🎯 Qué Esperar

### Antes de Guardar
- Sección "Datos Obstétricos" visible
- Campo FUM con texto rojo "No registrada" (si no tiene FUM)
- O fecha en azul (si ya tiene FUM)
- Ícono de calendario a la derecha

### Al Seleccionar FUM
- Se abre DatePicker
- Rango: último año hasta hoy
- Al seleccionar, aparece un cuadro azul con la FPP calculada

### Después de Guardar
- Mensaje: "Gestante actualizada exitosamente"
- La gestante ahora tiene FUM registrada
- Los nuevos controles calcularán correctamente las semanas

## 🐛 Si No Ves los Cambios

### 1. Verificar que el código se actualizó
```bash
cd S/aplicacionWZC/madres_digitales_flutter_new/lib/features/gestante/presentation/pages
grep -n "Datos Obstétricos" gestante_edit_page.dart
```

Debería mostrar la línea donde está el texto.

### 2. Limpiar caché de Flutter
```bash
cd S/aplicacionWZC/madres_digitales_flutter_new
flutter clean
flutter pub get
```

### 3. Recompilar completamente
```bash
flutter build apk --release
```

### 4. Desinstalar app anterior del dispositivo
- Desinstalar la app del dispositivo
- Instalar el nuevo APK

## 📊 Verificar en Base de Datos

Después de actualizar una gestante, verificar en la base de datos:

```sql
SELECT 
    id,
    nombre,
    documento,
    fecha_ultima_menstruacion,
    fecha_probable_parto
FROM gestantes
WHERE id = 'ID_DE_LA_GESTANTE_ACTUALIZADA';
```

Debería mostrar la FUM y FPP actualizadas.

## ✨ Próximos Pasos

1. **Compilar y probar** la app
2. **Actualizar las 20 gestantes prioritarias** (con controles pero sin FUM)
3. **Verificar que los nuevos controles** calculen correctamente las semanas
4. **Continuar actualizando** gestantes por municipio

## 📝 Notas

- Los cambios están en el código pero necesitas recompilar
- El backend ya está listo para recibir y procesar la FUM
- El cálculo de FPP es automático (FUM + 280 días)
- Los controles antiguos mantienen sus valores (histórico)
- Solo los nuevos controles calcularán correctamente
