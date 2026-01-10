# 📝 Formulario de Registro de Usuarios - Campos Completos

## 🎯 Objetivo

Actualizar el formulario de registro de usuarios para incluir TODOS los campos de la tabla `usuarios`:

### Campos de la Tabla `usuarios`

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | String | Auto | ID generado automáticamente |
| `nombre` | String | ✅ Sí | Nombre completo del usuario |
| `email` | String | ✅ Sí | Correo electrónico (único) |
| `password_hash` | String | ✅ Sí | Contraseña (hasheada en backend) |
| `documento` | String | ⚠️ Opcional | Número de documento |
| `tipo_documento` | String | ⚠️ Opcional | Tipo: cedula, tarjeta_identidad, pasaporte, registro_civil |
| `rol` | Enum | ✅ Sí | madrina, coordinador, admin, super_admin, medico, gestante |
| `municipio_id` | String | ⚠️ Opcional | ID del municipio (FK) |
| `telefono` | String | ⚠️ Opcional | Número de teléfono |
| `activo` | Boolean | Auto | true por defecto |
| `ultimo_acceso` | DateTime | Auto | Última vez que inició sesión |
| `refresh_token` | String | Auto | Token de refresco |
| `reset_token` | String | Auto | Token para recuperar contraseña |
| `reset_token_expires` | DateTime | Auto | Expiración del token de reset |
| `fecha_creacion` | DateTime | Auto | Fecha de creación |
| `fecha_actualizacion` | DateTime | Auto | Fecha de última actualización |

## 🔧 Backend - Ya Implementado

### Endpoint de Registro
```
POST /api/auth/register
POST /api/auth/register-admin (requiere autenticación)
```

### Campos Aceptados por el Backend
```typescript
{
  email: string (requerido),
  password: string (requerido, mín 6 caracteres),
  nombre: string (requerido),
  documento: string (opcional),
  tipo_documento: 'cedula' | 'tarjeta_identidad' | 'pasaporte' | 'registro_civil' (opcional, default: 'cedula'),
  telefono: string (opcional),
  rol: 'madrina' | 'coordinador' | 'admin' | 'super_admin' | 'medico' | 'gestante' (requerido),
  municipioId: string (opcional),
  direccion: string (opcional)
}
```

### Endpoint de Municipios (Ya Existe)
```
GET /api/municipios
```

**Respuesta:**
```json
[
  {
    "id": "13433",
    "nombre": "EL CARMEN DE BOLÍVAR",
    "departamento": "BOLÍVAR",
    "codigo_dane": "13433",
    "activo": true
  },
  {
    "id": "13244",
    "nombre": "MAGANGUÉ",
    "departamento": "BOLÍVAR",
    "codigo_dane": "13244",
    "activo": true
  }
]
```

## 📱 Frontend - Actualización Necesaria

### 1. Crear Servicio de Municipios

**Archivo:** `lib/data/services/municipio_service.dart`

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class MunicipioService {
  final String baseUrl;

  MunicipioService({required this.baseUrl});

  Future<List<Municipio>> getMunicipios() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/municipios'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Municipio.fromJson(json)).toList();
      } else {
        throw Exception('Error al cargar municipios');
      }
    } catch (e) {
      print('Error en getMunicipios: $e');
      rethrow;
    }
  }
}

class Municipio {
  final String id;
  final String nombre;
  final String? departamento;
  final String? codigoDane;
  final bool activo;

  Municipio({
    required this.id,
    required this.nombre,
    this.departamento,
    this.codigoDane,
    required this.activo,
  });

  factory Municipio.fromJson(Map<String, dynamic> json) {
    return Municipio(
      id: json['id'],
      nombre: json['nombre'],
      departamento: json['departamento'],
      codigoDane: json['codigo_dane'],
      activo: json['activo'] ?? true,
    );
  }
}
```

### 2. Actualizar Formulario de Registro

**Archivo:** `lib/presentation/pages/auth/register_screen.dart` (o similar)

```dart
class RegisterScreen extends StatefulWidget {
  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  
  // Controladores para todos los campos
  final _nombreController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _documentoController = TextEditingController();
  final _telefonoController = TextEditingController();
  
  // Variables para selección
  String? _selectedRol;
  String? _selectedTipoDocumento = 'cedula';
  String? _selectedMunicipioId;
  List<Municipio> _municipios = [];
  bool _isLoadingMunicipios = false;

  @override
  void initState() {
    super.initState();
    _loadMunicipios();
  }

  Future<void> _loadMunicipios() async {
    setState(() => _isLoadingMunicipios = true);
    try {
      final municipioService = MunicipioService(
        baseUrl: 'https://madres-digitales-backend.vercel.app'
      );
      final municipios = await municipioService.getMunicipios();
      setState(() {
        _municipios = municipios.where((m) => m.activo).toList();
        _isLoadingMunicipios = false;
      });
    } catch (e) {
      print('Error cargando municipios: $e');
      setState(() => _isLoadingMunicipios = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Registrar Usuario')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: EdgeInsets.all(16),
          children: [
            // 1. Nombre (Requerido)
            TextFormField(
              controller: _nombreController,
              decoration: InputDecoration(
                labelText: 'Nombre Completo *',
                prefixIcon: Icon(Icons.person),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'El nombre es requerido';
                }
                return null;
              },
            ),
            SizedBox(height: 16),

            // 2. Email (Requerido)
            TextFormField(
              controller: _emailController,
              decoration: InputDecoration(
                labelText: 'Correo Electrónico *',
                prefixIcon: Icon(Icons.email),
              ),
              keyboardType: TextInputType.emailAddress,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'El email es requerido';
                }
                if (!value.contains('@')) {
                  return 'Email inválido';
                }
                return null;
              },
            ),
            SizedBox(height: 16),

            // 3. Contraseña (Requerido)
            TextFormField(
              controller: _passwordController,
              decoration: InputDecoration(
                labelText: 'Contraseña *',
                prefixIcon: Icon(Icons.lock),
              ),
              obscureText: true,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'La contraseña es requerida';
                }
                if (value.length < 6) {
                  return 'Mínimo 6 caracteres';
                }
                return null;
              },
            ),
            SizedBox(height: 16),

            // 4. Tipo de Documento (Opcional)
            DropdownButtonFormField<String>(
              value: _selectedTipoDocumento,
              decoration: InputDecoration(
                labelText: 'Tipo de Documento',
                prefixIcon: Icon(Icons.badge),
              ),
              items: [
                DropdownMenuItem(value: 'cedula', child: Text('Cédula de Ciudadanía')),
                DropdownMenuItem(value: 'tarjeta_identidad', child: Text('Tarjeta de Identidad')),
                DropdownMenuItem(value: 'pasaporte', child: Text('Pasaporte')),
                DropdownMenuItem(value: 'registro_civil', child: Text('Registro Civil')),
              ],
              onChanged: (value) {
                setState(() => _selectedTipoDocumento = value);
              },
            ),
            SizedBox(height: 16),

            // 5. Número de Documento (Opcional)
            TextFormField(
              controller: _documentoController,
              decoration: InputDecoration(
                labelText: 'Número de Documento',
                prefixIcon: Icon(Icons.credit_card),
              ),
              keyboardType: TextInputType.number,
            ),
            SizedBox(height: 16),

            // 6. Teléfono (Opcional)
            TextFormField(
              controller: _telefonoController,
              decoration: InputDecoration(
                labelText: 'Teléfono',
                prefixIcon: Icon(Icons.phone),
              ),
              keyboardType: TextInputType.phone,
            ),
            SizedBox(height: 16),

            // 7. Rol (Requerido)
            DropdownButtonFormField<String>(
              value: _selectedRol,
              decoration: InputDecoration(
                labelText: 'Rol *',
                prefixIcon: Icon(Icons.work),
              ),
              items: [
                DropdownMenuItem(value: 'madrina', child: Text('Madrina')),
                DropdownMenuItem(value: 'coordinador', child: Text('Coordinador')),
                DropdownMenuItem(value: 'medico', child: Text('Médico')),
                DropdownMenuItem(value: 'admin', child: Text('Administrador')),
                DropdownMenuItem(value: 'gestante', child: Text('Gestante')),
              ],
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'El rol es requerido';
                }
                return null;
              },
              onChanged: (value) {
                setState(() => _selectedRol = value);
              },
            ),
            SizedBox(height: 16),

            // 8. Municipio (Opcional) - DROPDOWN CON NOMBRES
            _isLoadingMunicipios
                ? Center(child: CircularProgressIndicator())
                : DropdownButtonFormField<String>(
                    value: _selectedMunicipioId,
                    decoration: InputDecoration(
                      labelText: 'Municipio',
                      prefixIcon: Icon(Icons.location_city),
                      hintText: 'Seleccione un municipio',
                    ),
                    items: _municipios.map((municipio) {
                      return DropdownMenuItem<String>(
                        value: municipio.id, // Guarda el ID
                        child: Text(municipio.nombre), // Muestra el nombre
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() => _selectedMunicipioId = value);
                    },
                  ),
            SizedBox(height: 24),

            // Botón de Registro
            ElevatedButton(
              onPressed: _register,
              child: Text('Registrar Usuario'),
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    try {
      final response = await http.post(
        Uri.parse('https://madres-digitales-backend.vercel.app/api/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'nombre': _nombreController.text,
          'email': _emailController.text,
          'password': _passwordController.text,
          'documento': _documentoController.text.isNotEmpty ? _documentoController.text : null,
          'tipo_documento': _selectedTipoDocumento,
          'telefono': _telefonoController.text.isNotEmpty ? _telefonoController.text : null,
          'rol': _selectedRol,
          'municipioId': _selectedMunicipioId, // Envía el ID del municipio
        }),
      );

      if (response.statusCode == 201) {
        // Registro exitoso
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Usuario registrado exitosamente')),
        );
        Navigator.pop(context);
      } else {
        final error = json.decode(response.body);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error['error'] ?? 'Error al registrar')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error de conexión: $e')),
      );
    }
  }

  @override
  void dispose() {
    _nombreController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _documentoController.dispose();
    _telefonoController.dispose();
    super.dispose();
  }
}
```

## 🎨 Mejoras de UX

### 1. Búsqueda de Municipios
```dart
// Agregar un campo de búsqueda para filtrar municipios
TextFormField(
  decoration: InputDecoration(
    labelText: 'Buscar Municipio',
    prefixIcon: Icon(Icons.search),
  ),
  onChanged: (value) {
    setState(() {
      _filteredMunicipios = _municipios
          .where((m) => m.nombre.toLowerCase().contains(value.toLowerCase()))
          .toList();
    });
  },
)
```

### 2. Autocompletado
```dart
// Usar Autocomplete widget de Flutter
Autocomplete<Municipio>(
  optionsBuilder: (TextEditingValue textEditingValue) {
    if (textEditingValue.text.isEmpty) {
      return const Iterable<Municipio>.empty();
    }
    return _municipios.where((Municipio municipio) {
      return municipio.nombre
          .toLowerCase()
          .contains(textEditingValue.text.toLowerCase());
    });
  },
  displayStringForOption: (Municipio municipio) => municipio.nombre,
  onSelected: (Municipio municipio) {
    setState(() {
      _selectedMunicipioId = municipio.id;
    });
  },
)
```

### 3. Mostrar Municipio Seleccionado
```dart
if (_selectedMunicipioId != null)
  Chip(
    label: Text(
      _municipios.firstWhere((m) => m.id == _selectedMunicipioId).nombre
    ),
    onDeleted: () {
      setState(() => _selectedMunicipioId = null);
    },
  )
```

## ✅ Validaciones Recomendadas

### Frontend
```dart
// Documento
validator: (value) {
  if (value != null && value.isNotEmpty) {
    if (value.length < 6) {
      return 'Documento debe tener al menos 6 dígitos';
    }
  }
  return null;
}

// Teléfono
validator: (value) {
  if (value != null && value.isNotEmpty) {
    if (value.length < 10) {
      return 'Teléfono debe tener al menos 10 dígitos';
    }
  }
  return null;
}
```

## 📊 Flujo Completo

1. **Usuario abre formulario de registro**
2. **App carga lista de municipios** desde `/api/municipios`
3. **Usuario llena el formulario:**
   - Nombre ✅
   - Email ✅
   - Contraseña ✅
   - Tipo de documento (opcional)
   - Número de documento (opcional)
   - Teléfono (opcional)
   - Rol ✅
   - Municipio (opcional) - **Ve el nombre, se guarda el ID**
4. **App envía datos** a `/api/auth/register`
5. **Backend valida y crea usuario**
6. **App muestra confirmación**

## 🔐 Permisos de Registro

Según el backend, los permisos son:

| Rol a Crear | Puede ser creado por |
|-------------|---------------------|
| `super_admin` | Solo `super_admin` |
| `admin` | `super_admin`, `admin` |
| `coordinador` | `super_admin`, `admin` |
| `madrina` | `super_admin`, `admin`, `madrina` |
| `medico` | Cualquier usuario autenticado |
| `gestante` | Cualquier usuario autenticado |

## 📝 Ejemplo de Request Completo

```json
POST /api/auth/register
{
  "nombre": "María García",
  "email": "maria.garcia@example.com",
  "password": "password123",
  "documento": "1234567890",
  "tipo_documento": "cedula",
  "telefono": "3001234567",
  "rol": "madrina",
  "municipioId": "13433"
}
```

## ✅ Conclusión

Con esta implementación:

- ✅ El usuario **ve el nombre del municipio** en el dropdown
- ✅ El sistema **guarda el municipio_id** en la base de datos
- ✅ Todos los campos de la tabla `usuarios` están disponibles
- ✅ Validaciones apropiadas en frontend y backend
- ✅ UX mejorada con búsqueda y autocompletado

El formulario está completo y listo para usar. 🎉
