# 📱 Guía de Generación de APK - Madres Digitales

## 🎯 Objetivo

Generar el archivo APK de la aplicación Flutter para distribución en Android.

## ⚙️ Pre-requisitos

- ✅ Flutter SDK instalado
- ✅ Android SDK instalado
- ✅ Java JDK 11 o superior
- ✅ Variables de entorno configuradas

## 🔧 Configuración Inicial

### 1. Verificar Instalación

```bash
flutter doctor -v
```

Debe mostrar:
- ✅ Flutter (Channel stable)
- ✅ Android toolchain
- ✅ Android Studio / VS Code

### 2. Actualizar Dependencias

```bash
cd S/aplicacionWZC/madres_digitales_flutter_new
flutter pub get
flutter pub upgrade
```

## 📦 Tipos de Build

### APK (Android Package)

#### Debug APK (para testing)
```bash
flutter build apk --debug
```
- Tamaño: ~40-60 MB
- Incluye símbolos de debug
- No optimizado

#### Release APK (para producción)
```bash
flutter build apk --release
```
- Tamaño: ~20-30 MB
- Optimizado y ofuscado
- Listo para distribución

#### Split APKs (por arquitectura)
```bash
flutter build apk --split-per-abi
```
Genera APKs separados para:
- `app-armeabi-v7a-release.apk` (ARM 32-bit)
- `app-arm64-v8a-release.apk` (ARM 64-bit)
- `app-x86_64-release.apk` (x86 64-bit)

**Ventaja**: APKs más pequeños (~15-20 MB cada uno)

### App Bundle (AAB) - Recomendado para Play Store

```bash
flutter build appbundle --release
```
- Formato requerido por Google Play Store
- Google genera APKs optimizados por dispositivo
- Tamaño de descarga reducido

## 🚀 Proceso de Generación

### Paso 1: Limpiar Build Anterior

```bash
flutter clean
flutter pub get
```

### Paso 2: Generar APK Release

```bash
flutter build apk --release
```

### Paso 3: Ubicación del APK

El APK generado estará en:
```
S/aplicacionWZC/madres_digitales_flutter_new/build/app/outputs/flutter-apk/app-release.apk
```

### Paso 4: Verificar APK

```bash
# Ver información del APK
flutter build apk --release --analyze-size

# Instalar en dispositivo conectado
flutter install
```

## 🔐 Firma de APK (Producción)

### 1. Generar Keystore

```bash
keytool -genkey -v -keystore madres-digitales-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias madres-digitales
```

Guardar:
- Contraseña del keystore
- Contraseña de la key
- Alias: `madres-digitales`

### 2. Configurar key.properties

Crear archivo `android/key.properties`:

```properties
storePassword=tu_password_keystore
keyPassword=tu_password_key
keyAlias=madres-digitales
storeFile=../madres-digitales-key.jks
```

⚠️ **IMPORTANTE**: Agregar `key.properties` a `.gitignore`

### 3. Actualizar build.gradle

En `android/app/build.gradle`:

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### 4. Build con Firma

```bash
flutter build apk --release
```

## 📊 Optimizaciones

### Reducir Tamaño del APK

#### 1. Habilitar Obfuscación

En `android/app/build.gradle`:

```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

#### 2. Excluir Arquitecturas No Usadas

```bash
flutter build apk --target-platform android-arm64
```

#### 3. Comprimir Assets

En `pubspec.yaml`:

```yaml
flutter:
  assets:
    - assets/images/
  # Habilitar compresión
  uses-material-design: true
```

### Mejorar Performance

#### 1. Compilación AOT

```bash
flutter build apk --release --no-tree-shake-icons
```

#### 2. Optimizar Imágenes

- Usar WebP en lugar de PNG
- Comprimir imágenes antes de incluirlas
- Usar `cached_network_image` para imágenes remotas

## 🧪 Testing del APK

### 1. Instalar en Dispositivo

```bash
# Conectar dispositivo Android por USB
adb devices

# Instalar APK
adb install build/app/outputs/flutter-apk/app-release.apk
```

### 2. Testing Manual

- [ ] Login funciona
- [ ] Navegación entre pantallas
- [ ] Formularios funcionan
- [ ] Cámara funciona
- [ ] Permisos se solicitan correctamente
- [ ] Notificaciones funcionan
- [ ] Modo offline funciona
- [ ] Performance es aceptable

### 3. Testing Automatizado

```bash
flutter test
flutter drive --target=test_driver/app.dart
```

## 📤 Distribución

### Opción 1: Google Play Store

1. Crear cuenta de desarrollador ($25 único pago)
2. Generar App Bundle:
   ```bash
   flutter build appbundle --release
   ```
3. Subir a Play Console
4. Completar información de la app
5. Publicar

### Opción 2: Distribución Directa

1. Compartir APK por:
   - Email
   - Google Drive
   - Dropbox
   - Servidor web

2. Usuario debe:
   - Habilitar "Instalar apps de fuentes desconocidas"
   - Descargar APK
   - Instalar

### Opción 3: Firebase App Distribution

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Distribuir
firebase appdistribution:distribute build/app/outputs/flutter-apk/app-release.apk \
  --app YOUR_APP_ID \
  --groups testers
```

## 🐛 Troubleshooting

### Error: "NDK version mismatch"

**Solución**: Actualizar NDK en `android/app/build.gradle`:

```gradle
android {
    ndkVersion = "27.0.12077973"
}
```

### Error: "Execution failed for task ':app:lintVitalRelease'"

**Solución**: Deshabilitar lint en `android/app/build.gradle`:

```gradle
android {
    lintOptions {
        checkReleaseBuilds false
        abortOnError false
    }
}
```

### Error: "Out of memory"

**Solución**: Aumentar memoria de Gradle en `android/gradle.properties`:

```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
```

### APK muy grande

**Solución**:
1. Usar split APKs por arquitectura
2. Habilitar minifyEnabled y shrinkResources
3. Remover dependencias no usadas
4. Comprimir assets

## 📋 Checklist de Release

- [ ] Versión actualizada en `pubspec.yaml`
- [ ] Changelog actualizado
- [ ] Tests pasando
- [ ] APK firmado
- [ ] APK probado en dispositivos reales
- [ ] Performance aceptable
- [ ] Tamaño de APK < 50 MB
- [ ] Permisos correctos en AndroidManifest.xml
- [ ] Iconos y splash screen configurados
- [ ] Nombre de app correcto
- [ ] Package name único

## 📝 Información del APK Generado

### Ubicación
```
build/app/outputs/flutter-apk/app-release.apk
```

### Tamaño Esperado
- Sin optimizar: ~40-50 MB
- Optimizado: ~20-30 MB
- Split por ABI: ~15-20 MB cada uno

### Versión
Definida en `pubspec.yaml`:
```yaml
version: 1.0.0+1
```
- `1.0.0` = Version name (visible para usuarios)
- `+1` = Version code (número interno)

## 🔗 Recursos

- [Flutter Build Modes](https://docs.flutter.dev/testing/build-modes)
- [Android App Bundle](https://developer.android.com/guide/app-bundle)
- [Signing Android Apps](https://docs.flutter.dev/deployment/android#signing-the-app)
- [Optimizing APK Size](https://docs.flutter.dev/perf/app-size)

---

**Última actualización**: 24 de Noviembre, 2025
**Versión**: 1.0.0
