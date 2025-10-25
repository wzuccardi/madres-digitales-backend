# Sistema de Mensajería - Madres Digitales

## 📋 Descripción General

Sistema completo de mensajería en tiempo real para comunicación entre madrinas, gestantes, médicos y coordinadores. Incluye chat individual, grupal y soporte técnico con WebSocket para actualizaciones en tiempo real.

---

## 🏗️ Arquitectura

### **Backend**
- **Framework**: Express.js + Socket.IO
- **Base de Datos**: PostgreSQL con 2 tablas principales
- **Autenticación**: JWT tokens
- **Tiempo Real**: WebSocket con Socket.IO

### **Frontend**
- **Framework**: Flutter Web/Mobile
- **Estado**: Riverpod (opcional)
- **WebSocket**: socket_io_client
- **UI**: Material Design 3

---

## 📊 Modelos de Datos

### **Conversacion**
```typescript
{
  id: string (UUID)
  titulo?: string
  tipo: 'individual' | 'grupo' | 'soporte'
  participantes: string[] (array de user_ids)
  gestante_id?: string (UUID)
  ultimo_mensaje?: string
  ultimo_mensaje_fecha?: DateTime
  mensajes_no_leidos?: Record<string, number>
  activo: boolean
  created_at: DateTime
  updated_at: DateTime
}
```

### **Mensaje**
```typescript
{
  id: string (UUID)
  conversacion_id: string (UUID)
  remitente_id: string (UUID)
  remitente_nombre: string
  tipo: 'texto' | 'imagen' | 'archivo' | 'ubicacion' | 'alerta'
  contenido: string
  archivo_url?: string
  archivo_nombre?: string
  archivo_tipo?: string
  archivo_tamano?: number
  ubicacion?: GeoJSON Point
  metadata?: any
  estado: 'enviado' | 'entregado' | 'leido'
  leido_por?: string[]
  fecha_leido?: DateTime
  respondiendo_a?: string (UUID)
  editado: boolean
  eliminado: boolean
  created_at: DateTime
  updated_at: DateTime
}
```

---

## 🔌 API Endpoints

### **Conversaciones**

#### `POST /api/mensajes/conversaciones`
Crear nueva conversación

**Body:**
```json
{
  "titulo": "Conversación con María",
  "tipo": "individual",
  "participantes": ["uuid1", "uuid2"],
  "gestanteId": "uuid-opcional"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversación creada exitosamente",
  "data": { /* Conversacion */ }
}
```

#### `GET /api/mensajes/conversaciones`
Obtener conversaciones del usuario

**Query Params:**
- `query`: string (búsqueda)
- `tipo`: individual | grupo | soporte
- `gestanteId`: UUID
- `limit`: number (default: 20)
- `offset`: number (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [ /* Array de Conversaciones */ ],
  "total": 10,
  "limit": 20,
  "offset": 0
}
```

#### `GET /api/mensajes/conversaciones/:id`
Obtener conversación por ID

**Response:**
```json
{
  "success": true,
  "data": {
    /* Conversacion con mensajes y participantesInfo */
  }
}
```

### **Mensajes**

#### `POST /api/mensajes/conversaciones/:id/mensajes`
Enviar mensaje a una conversación

**Body:**
```json
{
  "tipo": "texto",
  "contenido": "Hola, ¿cómo estás?",
  "archivoUrl": "url-opcional",
  "archivoNombre": "nombre-opcional",
  "respondiendoA": "uuid-mensaje-opcional"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mensaje enviado exitosamente",
  "data": { /* Mensaje */ }
}
```

#### `GET /api/mensajes/conversaciones/:id/mensajes`
Obtener mensajes de una conversación

**Query Params:**
- `limit`: number (default: 50, max: 100)
- `offset`: number (default: 0)
- `antes`: timestamp ISO (para paginación)

**Response:**
```json
{
  "success": true,
  "data": [ /* Array de Mensajes */ ],
  "total": 100,
  "hasMore": true
}
```

#### `POST /api/mensajes/:id/leer`
Marcar mensaje como leído

**Response:**
```json
{
  "success": true,
  "message": "Mensaje marcado como leído"
}
```

### **Participantes**

#### `POST /api/mensajes/conversaciones/:id/participantes`
Agregar participante a conversación

**Body:**
```json
{
  "usuarioId": "uuid"
}
```

#### `DELETE /api/mensajes/conversaciones/:id/participantes/:usuarioId`
Eliminar participante de conversación

### **Estadísticas**

#### `GET /api/mensajes/estadisticas`
Obtener estadísticas de mensajería del usuario

**Response:**
```json
{
  "success": true,
  "data": {
    "totalConversaciones": 10,
    "conversacionesActivas": 8,
    "totalMensajes": 150,
    "mensajesNoLeidos": 5,
    "ultimaActividad": "2025-01-15T10:30:00Z"
  }
}
```

---

## 🔄 WebSocket Events

### **Cliente → Servidor**

#### `conversation:join`
Unirse a una conversación
```javascript
socket.emit('conversation:join', conversationId);
```

#### `conversation:leave`
Salir de una conversación
```javascript
socket.emit('conversation:leave', conversationId);
```

#### `typing:start`
Notificar que está escribiendo
```javascript
socket.emit('typing:start', { conversationId });
```

#### `typing:stop`
Notificar que dejó de escribir
```javascript
socket.emit('typing:stop', { conversationId });
```

#### `message:read`
Notificar que leyó un mensaje
```javascript
socket.emit('message:read', { messageId, conversationId });
```

### **Servidor → Cliente**

#### `message:new`
Nuevo mensaje recibido
```javascript
socket.on('message:new', (mensaje) => {
  // Procesar mensaje nuevo
});
```

#### `typing:start`
Usuario está escribiendo
```javascript
socket.on('typing:start', (data) => {
  // data: { userId, userName, conversationId }
});
```

#### `typing:stop`
Usuario dejó de escribir
```javascript
socket.on('typing:stop', (data) => {
  // data: { userId, conversationId }
});
```

#### `message:read`
Mensaje fue leído
```javascript
socket.on('message:read', (data) => {
  // data: { messageId, userId, timestamp }
});
```

#### `user:online`
Usuario se conectó
```javascript
socket.on('user:online', (data) => {
  // data: { userId, userName }
});
```

#### `user:offline`
Usuario se desconectó
```javascript
socket.on('user:offline', (data) => {
  // data: { userId }
});
```

#### `notification`
Notificación general
```javascript
socket.on('notification', (notification) => {
  // Procesar notificación
});
```

---

## 💻 Uso en Flutter

### **Inicializar Servicio**
```dart
final mensajeService = MensajeService();
mensajeService.initialize(dio, userId, token);
```

### **Crear Conversación**
```dart
final conversacion = await mensajeService.crearConversacion(
  titulo: 'Chat con María',
  tipo: 'individual',
  participantes: [userId1, userId2],
);
```

### **Enviar Mensaje**
```dart
final mensaje = await mensajeService.enviarMensaje(
  conversacionId: conversacionId,
  contenido: 'Hola!',
);
```

### **Escuchar Mensajes Nuevos**
```dart
mensajeService.mensajesStream.listen((mensaje) {
  // Actualizar UI con mensaje nuevo
});
```

### **Unirse a Conversación**
```dart
mensajeService.unirseAConversacion(conversacionId);
```

### **Notificar Escribiendo**
```dart
mensajeService.notificarEscribiendo(conversacionId);
```

---

## 🔒 Seguridad

1. **Autenticación**: Todos los endpoints requieren JWT token válido
2. **Autorización**: Solo participantes pueden acceder a conversaciones
3. **WebSocket**: Autenticación mediante token en handshake
4. **Validación**: Zod schemas para validar entrada

---

## 📈 Características Implementadas

✅ Chat individual, grupal y soporte
✅ Mensajes de texto
✅ Tiempo real con WebSocket
✅ Indicadores de "escribiendo"
✅ Estado de mensajes (enviado, leído)
✅ Historial de mensajes con paginación
✅ Búsqueda de conversaciones
✅ Estadísticas de mensajería
✅ Notificaciones en tiempo real
✅ Gestión de participantes

---

## 🚀 Características Futuras

⏳ Mensajes de imagen
⏳ Mensajes de archivo
⏳ Mensajes de ubicación
⏳ Mensajes de alerta
⏳ Editar mensajes
⏳ Eliminar mensajes
⏳ Reacciones a mensajes
⏳ Mensajes de voz
⏳ Videollamadas
⏳ Compartir gestantes
⏳ Búsqueda de mensajes

---

## 📝 Notas de Implementación

- Los mensajes se almacenan en PostgreSQL
- WebSocket mantiene conexiones activas para tiempo real
- Los mensajes no leídos se calculan por usuario
- Las conversaciones inactivas se pueden archivar
- El sistema soporta sincronización offline (integrado con SyncService)

---

## 🐛 Troubleshooting

### WebSocket no conecta
- Verificar que el servidor HTTP esté correcto
- Verificar token de autenticación
- Revisar CORS configuration

### Mensajes no llegan en tiempo real
- Verificar que el usuario se unió a la conversación
- Revisar logs del servidor
- Verificar conexión WebSocket activa

### Error de autenticación
- Verificar que el token JWT sea válido
- Verificar que el usuario sea participante

---

**Última actualización**: 2025-01-15
**Versión**: 1.0.0

