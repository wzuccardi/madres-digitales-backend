# Solución: Límite de Tamaño de Archivos en GitHub

## Problema
Al intentar hacer push al repositorio de GitHub, se rechazó porque los archivos de build de Flutter excedían el límite de 100MB:
- `libflutter.so` (arm64-v8a): 143.59 MB
- `libflutter.so` (armeabi-v7a): 130.04 MB  
- `libflutter.so` (x86_64): 142.94 MB

## Causa
Los archivos de compilación de Flutter (especialmente las bibliotecas nativas) son muy grandes y no deben estar en el repositorio de Git. Estos archivos se generan durante el build y no son necesarios en el control de versiones.

## Solución Aplicada

### 1. Deshacer el commit problemático
```bash
git reset --soft HEAD~1
```

### 2. Limpiar el staging area
```bash
git reset HEAD .
```

### 3. Actualizar .gitignore
Agregamos la exclusión de `.dart_tool/` al archivo `.gitignore`:
```
# Ignore build artifacts (too large for GitHub)
build/

# Keep only web build for Vercel
!build/web/

# Ignore dart tool cache
.dart_tool/
```

### 4. Commit limpio solo con código
```bash
git add .gitignore lib/core/router/app_router.dart
git commit -m "Add register route and update gitignore"
git push origin main
```

## Resultado
✅ Push exitoso con solo 685 bytes de cambios
✅ Archivos de build excluidos del repositorio
✅ Código fuente actualizado correctamente

## Archivos Excluidos del Repositorio
- `build/` - Todos los archivos de compilación (excepto build/web para Vercel)
- `.dart_tool/` - Cache y herramientas de Dart/Flutter

## Nota Importante
Para deployment en Vercel, solo necesitamos `build/web/` que se genera durante el proceso de build en Vercel. Los archivos de build de Android (APK) se generan localmente y no deben estar en el repositorio.
