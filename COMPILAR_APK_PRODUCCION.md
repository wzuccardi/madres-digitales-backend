# Compilar APK para Producción

La APK ya está configurada para conectarse automáticamente al backend de Vercel en producción.

## URL del Backend Configurada
```
https://madres-digitales-backend.vercel.app/api
```

## Compilar APK de Producción

### Opción 1: APK Release (Recomendado)
```bash
cd S/aplicacionWZC/madres_digitales_flutter_new
flutter build apk --release
```

La APK se generará en:
```
build/app/outputs/flutter-apk/app-release.apk
```

### Opción 2: APK con Split por ABI (Más pequeñas)
```bash
flutter build apk --release --split-per-abi
```

Genera 3 APKs optimizadas:
- `app-armeabi-v7a-release.apk` (ARM 32-bit)
- `app-arm64-v8a-release.apk` (ARM 64-bit) ← **Recomendada**
- `app-x86_64-release.apk` (x86 64-bit)

### Opción 3: App Bundle (Para Google Play Store)
```bash
flutter build appbundle --release
```

## Verificar Configuración

La APK usará automáticamente:
- **Backend:** https://madres-digitales-backend.vercel.app/api
- **Modo:** Producción
- **Timeout:** 30 segundos

## Probar la APK

1. Instala la APK en un dispositivo Android
2. Abre la app
3. Intenta hacer login con: `wzuccardi@gmail.com`
4. Debería conectarse al backend de Vercel

## Notas Importantes

- ✅ La URL del backend ya está configurada
- ✅ No necesitas cambiar nada en el código
- ✅ La APK se conectará automáticamente a Vercel
- ⚠️ Asegúrate de compilar en modo `--release` (no `--debug`)

## Troubleshooting

Si la APK no se conecta:

1. Verifica que el backend esté funcionando:
   ```
   https://madres-digitales-backend.vercel.app/health
   ```

2. Verifica permisos de internet en `AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.INTERNET"/>
   ```

3. Verifica que no haya errores de CORS en el backend

## Comandos Rápidos

```bash
# Limpiar build anterior
flutter clean

# Obtener dependencias
flutter pub get

# Compilar APK
flutter build apk --release --split-per-abi

# Ubicación de las APKs
cd build/app/outputs/flutter-apk/
ls -lh
```

## Distribución

Para distribuir la APK:

1. **Instalación directa:** Envía `app-arm64-v8a-release.apk` por WhatsApp/Email
2. **Google Play Store:** Usa `app-release.aab` (App Bundle)
3. **Firebase App Distribution:** Sube la APK para testing

---

**Estado:** ✅ Configuración lista para producción
**Backend:** https://madres-digitales-backend.vercel.app
**Frontend Web:** https://madres-digitales-frontend.vercel.app
