# 🧪 Prueba Local Antes de Commit

## ⚠️ Problema Detectado

El método `_buildFloatingActionButton` no se guardó correctamente en el commit anterior, causando que:
- El botón flotante no aparezca en el dashboard
- Posibles errores en tiempo de ejecución

## ✅ Solución Aplicada

Se agregó correctamente el método `_buildFloatingActionButton` y `_showAdminMenu` al archivo:
```
lib/presentation/pages/dashboard/dashboard_page_optimized.dart
```

## 🔍 Verificaciones Realizadas

- ✅ Sin errores de compilación (getDiagnostics)
- ✅ Dashboard de alertas no afectado
- ✅ Código formateado correctamente

## 📋 Pasos para Probar Localmente

### Opción 1: Usando el Script PowerShell (Recomendado)

```powershell
cd S/aplicacionWZC/madres_digitales_flutter_new
.\test_local.ps1
```

### Opción 2: Comandos Manuales

```powershell
# 1. Limpiar proyecto
flutter clean

# 2. Obtener dependencias
flutter pub get

# 3. Analizar código (buscar errores)
flutter analyze

# 4. Ejecutar en Chrome
flutter run -d chrome

# O ejecutar en servidor web
flutter run -d web-server --web-port=8080
```

## 🎯 Qué Probar

### 1. Dashboard Principal
- [ ] El dashboard carga correctamente
- [ ] No hay errores en consola
- [ ] Las estadísticas se muestran

### 2. Botón Flotante

#### Como Super Admin o Admin:
- [ ] Ver botón "Gestión" en la esquina inferior derecha
- [ ] Click abre modal con 4 opciones:
  - Ver Usuarios
  - Crear Usuario
  - Asignar Roles
  - Mi Perfil
- [ ] Cada opción navega correctamente

#### Como Coordinador:
- [ ] Ver botón "Madrinas" en la esquina inferior derecha
- [ ] Click navega a lista de usuarios

#### Como Madrina/Médico:
- [ ] Ver botón de editar (ícono lápiz) en la esquina inferior derecha
- [ ] Click navega a editar perfil

### 3. Botón de Perfil en AppBar
- [ ] Ver ícono de perfil en la barra superior
- [ ] Click navega a página de perfil
- [ ] Desde perfil, botón "Editar Perfil" funciona

### 4. Dashboard de Alertas
- [ ] Navegar a /alertas-dashboard
- [ ] Dashboard de alertas carga correctamente
- [ ] No hay errores

### 5. Navegación General
- [ ] Todas las rutas funcionan
- [ ] No hay errores 404
- [ ] Navegación fluida

## 🐛 Errores Comunes y Soluciones

### Error: "Method not found: _buildFloatingActionButton"
**Solución:** El archivo no se guardó correctamente. Verificar que el método esté presente.

### Error: "context.go is not defined"
**Solución:** Importar go_router correctamente.

### Error: "AppConstants not found"
**Solución:** Verificar imports de constantes.

### Dashboard en blanco
**Solución:** Verificar que el servicio de dashboard esté funcionando.

## 📝 Checklist Pre-Commit

Antes de hacer commit, verificar:

- [ ] `flutter analyze` sin errores
- [ ] Aplicación corre localmente sin errores
- [ ] Botón flotante visible según rol
- [ ] Modal de opciones funciona (admin)
- [ ] Navegación a todas las opciones funciona
- [ ] Dashboard de alertas no afectado
- [ ] No hay errores en consola del navegador

## 🚀 Comandos para Commit (Solo después de probar)

```powershell
cd S/aplicacionWZC/madres_digitales_flutter_new

# Agregar cambios
git add .

# Commit
git commit -m "fix: agregar método faltante _buildFloatingActionButton en dashboard

- Método _buildFloatingActionButton no se guardó en commit anterior
- Agregado método _showAdminMenu para modal de opciones
- Botón flotante ahora funciona correctamente según rol
- Sin errores de compilación
- Probado localmente antes de commit"

# Push
git push origin main
```

## 📊 Estructura del Código Agregado

```dart
// Método principal que decide qué botón mostrar
Widget? _buildFloatingActionButton(String? userRole) {
  if (userRole == superAdmin || userRole == admin) {
    return FloatingActionButton.extended(...); // Botón "Gestión"
  }
  if (userRole == coordinador) {
    return FloatingActionButton.extended(...); // Botón "Madrinas"
  }
  return FloatingActionButton(...); // Botón editar perfil
}

// Modal con opciones para admins
void _showAdminMenu(BuildContext context, String? userRole) {
  showModalBottomSheet(
    context: context,
    builder: (context) => Container(
      child: Column(
        children: [
          ListTile(...), // Ver Usuarios
          ListTile(...), // Crear Usuario
          ListTile(...), // Asignar Roles (solo admin/super_admin)
          ListTile(...), // Mi Perfil
        ],
      ),
    ),
  );
}
```

## 🔗 Archivos Modificados

```
S/aplicacionWZC/madres_digitales_flutter_new/
└── lib/presentation/pages/dashboard/
    └── dashboard_page_optimized.dart
        ├── _buildFloatingActionButton()  [AGREGADO]
        └── _showAdminMenu()              [AGREGADO]
```

## ⏱️ Tiempo Estimado de Prueba

- Limpieza y setup: 2-3 minutos
- Pruebas funcionales: 5-10 minutos
- **Total: 7-13 minutos**

## 📞 Si Encuentras Problemas

1. Verificar que el archivo se guardó correctamente
2. Hacer `flutter clean` y `flutter pub get`
3. Revisar logs de consola en el navegador
4. Verificar que no haya conflictos de merge
5. Comparar con el código en este documento

## ✅ Resultado Esperado

Después de probar localmente:
- ✅ Dashboard carga sin errores
- ✅ Botón flotante visible
- ✅ Modal funciona correctamente
- ✅ Navegación fluida
- ✅ Sin errores en consola

**Solo entonces hacer commit y push.**

---

*Creado: Diciembre 6, 2025*  
*Propósito: Evitar commits con código incompleto*
