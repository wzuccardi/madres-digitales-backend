# 📝 Campos del Formulario de Registro de Usuarios

## ✅ Campos que el Usuario DEBE Diligenciar

### 1. **Información Personal** (Obligatorios)

#### 📧 Email
- **Campo:** `email`
- **Tipo:** String (email válido)
- **Validación:** Formato de email, único en el sistema
- **Ejemplo:** `maria.lopez@example.com`
- **Widget:** `TextFormField` con `keyboardType: TextInputType.emailAddress`

#### 👤 Nombre Completo
- **Campo:** `nombre`
- **Tipo:** String
- **Validación:** Requerido, mínimo 3 caracteres
- **Ejemplo:** `María López García`
- **Widget:** `TextFormField` con `textCapitalization: TextCapitalization.words`

#### 🔒 Contraseña
- **Campo:** `password`
- **Tipo:** String
- **Validación:** Mínimo 6 caracteres
- **Ejemplo:** `********`
- **Widget:** `TextFormField` con `obscureText: true`
- **Nota:** Se convierte automáticamente a `password_hash` en el backend

#### 🎭 Rol
- **Campo:** `rol`
- **Tipo:** Enum/String
- **Opciones:**
  - `madrina` - Madrina comunitaria
  - `coordinador` - Coordinador de madrinas
  - `medico` - Médico
  - `admin` - Administrador
  - `super_admin` - Super administrador (solo para super_admin)
- **Validación:** Requerido, debe ser uno de los valores permitidos
- **Widget:** `DropdownButtonFormField`

### 2. **Información de Contacto** (Opcionales pero Recomendados)

#### 📱 Teléfono
- **Campo:** `telefono`
- **Tipo:** String
- **Validación:** Opcional, formato de teléfono colombiano
- **Ejemplo:** `3001234567`
- **Widget:** `TextFormField` con `keyboardType: TextInputType.phone`

#### 🆔 Documento
- **Campo:** `documento`
- **Tipo:** String
- **Validación:** Opcional
- **Ejemplo:** `1234567890`
- **Widget:** `TextFormField` con `keyboardType: TextInputType.number`

#### 📄 Tipo de Documento
- **Campo:** `tipo_documento`
- **Tipo:** Enum/String
- **Opciones:**
  - `cedula` - Cédula de ciudadanía (por defecto)
  - `tarjeta_identidad` - Tarjeta de identidad
  - `pasaporte` - Pasaporte
  - `registro_civil` - Registro civil
- **Validación:** Opcional, por defecto `cedula`
- **Widget:** `DropdownButtonFormField`

### 3. **Ubicación** (Opcional)

#### 🏘️ Municipio
- **Campo:** `municipio_id`
- **Tipo:** String (ID del municipio)
- **Validación:** Opcional, debe existir en tabla `municipios`
- **Ejemplo:** `13433` (El Carmen de Bolívar)
- **Widget:** `DropdownButtonFormField` con lista de municipios desde API
- **Endpoint:** `GET /api/municipios`

## ❌ Campos del Sistema (NO Visibles en el Formulario)

Estos campos se generan automáticamente en el backend:

- `id` - UUID generado automáticamente
- `password_hash` - Hash bcrypt del password
- `activo` - Por defecto `true`
- `ultimo_acceso` - Se actualiza al hacer login
- `refresh_token` - Token de refresco generado al login
- `reset_token` - Token para recuperación de contraseña
- `reset_token_expires` - Fecha de expiración del reset_token
- `fecha_creacion` - Timestamp automático
- `fecha_actualizacion` - Timestamp automático

## 📋 Estructura del Formulario Recomendada

### Sección 1: Credenciales de Acceso
```dart
// Email
TextFormField(
  decoration: InputDecoration(
    labelText: 'Correo Electrónico *',
    hintText: 'ejemplo@correo.com',
    prefixIcon: Icon(Icons.email),
  ),
  keyboardType: TextInputType.emailAddress,
  validator: (value) {
    if (value == null || value.isEmpty) {
      return 'El correo es requerido';
    }
    if (!value.contains('@')) {
      return 'Ingrese un correo válido';
    }
    return null;
  },
)

// Contraseña
TextFormField(
  decoration: InputDecoration(
    labelText: 'Contraseña *',
    hintText: 'Mínimo 6 caracteres',
    prefixIcon: Icon(Icons.lock),
    suffixIcon: IconButton(
      icon: Icon(_obscurePassword ? Icons.visibility : Icons.visibility_off),
      onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
    ),
  ),
  obscureText: _obscurePassword,
  validator: (value) {
    if (value == null || value.isEmpty) {
      return 'La contraseña es requerida';
    }
    if (value.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return null;
  },
)

// Confirmar Contraseña
TextFormField(
  decoration: InputDecoration(
    labelText: 'Confirmar Contraseña *',
    prefixIcon: Icon(Icons.lock_outline),
  ),
  obscureText: true,
  validator: (value) {
    if (value != _passwordController.text) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  },
)
```

### Sección 2: Información Personal
```dart
// Nombre Completo
TextFormField(
  decoration: InputDecoration(
    labelText: 'Nombre Completo *',
    hintText: 'Nombre y apellidos',
    prefixIcon: Icon(Icons.person),
  ),
  textCapitalization: TextCapitalization.words,
  validator: (value) {
    if (value == null || value.isEmpty) {
      return 'El nombre es requerido';
    }
    if (value.length < 3) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    return null;
  },
)

// Tipo de Documento
DropdownButtonFormField<String>(
  decoration: InputDecoration(
    labelText: 'Tipo de Documento',
    prefixIcon: Icon(Icons.badge),
  ),
  value: _tipoDocumento,
  items: [
    DropdownMenuItem(value: 'cedula', child: Text('Cédula de Ciudadanía')),
    DropdownMenuItem(value: 'tarjeta_identidad', child: Text('Tarjeta de Identidad')),
    DropdownMenuItem(value: 'pasaporte', child: Text('Pasaporte')),
    DropdownMenuItem(value: 'registro_civil', child: Text('Registro Civil')),
  ],
  onChanged: (value) => setState(() => _tipoDocumento = value),
)

// Número de Documento
TextFormField(
  decoration: InputDecoration(
    labelText: 'Número de Documento',
    hintText: '1234567890',
    prefixIcon: Icon(Icons.credit_card),
  ),
  keyboardType: TextInputType.number,
)

// Teléfono
TextFormField(
  decoration: InputDecoration(
    labelText: 'Teléfono',
    hintText: '3001234567',
    prefixIcon: Icon(Icons.phone),
  ),
  keyboardType: TextInputType.phone,
  validator: (value) {
    if (value != null && value.isNotEmpty && value.length < 10) {
      return 'Ingrese un teléfono válido (10 dígitos)';
    }
    return null;
  },
)
```

### Sección 3: Rol y Ubicación
```dart
// Rol
DropdownButtonFormField<String>(
  decoration: InputDecoration(
    labelText: 'Rol *',
    hintText: 'Seleccione el rol del usuario',
    prefixIcon: Icon(Icons.work),
  ),
  value: _rol,
  items: [
    DropdownMenuItem(value: 'madrina', child: Text('Madrina Comunitaria')),
    DropdownMenuItem(value: 'coordinador', child: Text('Coordinador')),
    DropdownMenuItem(value: 'medico', child: Text('Médico')),
    DropdownMenuItem(value: 'admin', child: Text('Administrador')),
    // super_admin solo visible para super_admin
    if (_currentUserRole == 'super_admin')
      DropdownMenuItem(value: 'super_admin', child: Text('Super Administrador')),
  ],
  validator: (value) {
    if (value == null || value.isEmpty) {
      return 'El rol es requerido';
    }
    return null;
  },
  onChanged: (value) => setState(() => _rol = value),
)

// Municipio
FutureBuilder<List<Municipio>>(
  future: _loadMunicipios(),
  builder: (context, snapshot) {
    if (!snapshot.hasData) {
      return CircularProgressIndicator();
    }
    return DropdownButtonFormField<String>(
      decoration: InputDecoration(
        labelText: 'Municipio',
        hintText: 'Seleccione el municipio',
        prefixIcon: Icon(Icons.location_city),
      ),
      value: _municipioId,
      items: snapshot.data!.map((municipio) {
        return DropdownMenuItem(
          value: municipio.id,
          child: Text(municipio.nombre),
        );
      }).toList(),
      onChanged: (value) => setState(() => _municipioId = value),
    );
  },
)
```

## 🔐 Validaciones Importantes

### En el Frontend (Flutter)
```dart
final _formKey = GlobalKey<FormState>();

void _submitForm() {
  if (_formKey.currentState!.validate()) {
    // Preparar datos
    final userData = {
      'email': _emailController.text.trim(),
      'password': _passwordController.text,
      'nombre': _nombreController.text.trim(),
      'documento': _documentoController.text.trim(),
      'tipo_documento': _tipoDocumento ?? 'cedula',
      'telefono': _telefonoController.text.trim(),
      'rol': _rol,
      'municipio_id': _municipioId,
    };
    
    // Enviar al backend
    _authService.register(userData);
  }
}
```

### En el Backend (Ya Implementado)
```typescript
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  nombre: Joi.string().required(),
  documento: Joi.string().optional(),
  tipo_documento: Joi.string().valid('cedula', 'tarjeta_identidad', 'pasaporte', 'registro_civil').optional().default('cedula'),
  telefono: Joi.string().optional(),
  rol: Joi.string().valid('madrina', 'coordinador', 'admin', 'super_admin', 'medico').required(),
  municipio_id: Joi.string().optional(),
});
```

## 📡 Endpoint de Registro

### Request
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "maria.lopez@example.com",
  "password": "password123",
  "nombre": "María López García",
  "documento": "1234567890",
  "tipo_documento": "cedula",
  "telefono": "3001234567",
  "rol": "madrina",
  "municipio_id": "13433"
}
```

### Response (Éxito)
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "user_abc123",
    "email": "maria.lopez@example.com",
    "nombre": "María López García",
    "rol": "madrina",
    "municipio_id": "13433"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Response (Error)
```json
{
  "success": false,
  "error": "El email ya está registrado"
}
```

## 🎨 Diseño UI Recomendado

### Layout
```
┌─────────────────────────────────────┐
│  📝 Registro de Usuario             │
├─────────────────────────────────────┤
│                                     │
│  🔐 CREDENCIALES DE ACCESO          │
│  ├─ Email *                         │
│  ├─ Contraseña *                    │
│  └─ Confirmar Contraseña *          │
│                                     │
│  👤 INFORMACIÓN PERSONAL            │
│  ├─ Nombre Completo *               │
│  ├─ Tipo de Documento               │
│  ├─ Número de Documento             │
│  └─ Teléfono                        │
│                                     │
│  🏢 ROL Y UBICACIÓN                 │
│  ├─ Rol *                           │
│  └─ Municipio                       │
│                                     │
│  [  Registrar Usuario  ]            │
│                                     │
│  * Campos obligatorios              │
└─────────────────────────────────────┘
```

## ✅ Checklist de Implementación

- [ ] Crear formulario con todos los campos listados
- [ ] Agregar validaciones en cada campo
- [ ] Implementar dropdown de municipios (cargar desde API)
- [ ] Implementar dropdown de roles (filtrar según permisos)
- [ ] Agregar toggle para mostrar/ocultar contraseña
- [ ] Validar que las contraseñas coincidan
- [ ] Mostrar indicador de carga al enviar
- [ ] Manejar errores del backend (email duplicado, etc.)
- [ ] Redirigir al login o dashboard después del registro exitoso
- [ ] Agregar mensajes de éxito/error

## 🔗 Referencias

- Endpoint: `POST /api/auth/register`
- Controlador: `src/controllers/auth.controller.ts`
- Schema de validación: `registerSchema` (línea 23)
- Tabla: `usuarios` en PostgreSQL
