# Sistema de Contenido Educativo - Madres Digitales

## 📋 Descripción General

Sistema completo de gestión de contenido educativo con CRUD, cargue de archivos, reproductores multimedia (video, audio, documentos), tracking de progreso, calificaciones y recomendaciones personalizadas para gestantes y madrinas.

---

## 🏗️ Arquitectura

### **Backend**
- **Framework**: Express.js + Prisma ORM
- **Base de Datos**: PostgreSQL con 2 tablas principales
- **Autenticación**: JWT tokens con roles
- **Almacenamiento**: URLs de archivos (compatible con S3, Azure, etc.)

### **Frontend**
- **Framework**: Flutter Web/Mobile
- **Reproductores**: 
  - Video: video_player + chewie
  - Audio: audioplayers
  - Documentos: Visor nativo
- **Tracking**: Progreso automático cada 10 segundos

---

## 📊 Modelos de Datos

### **ContenidoEducativo**
```typescript
{
  id: string (UUID)
  titulo: string
  descripcion: string
  tipo: 'video' | 'audio' | 'documento' | 'imagen' | 'articulo' | 'infografia'
  categoria: 'nutricion' | 'cuidado_prenatal' | 'signos_alarma' | 'lactancia' | 'parto' | 'posparto' | 'planificacion' | 'salud_mental' | 'ejercicio' | 'higiene' | 'derechos' | 'otros'
  nivel: 'basico' | 'intermedio' | 'avanzado'
  archivo_url: string
  archivo_nombre: string
  archivo_tipo: string (MIME type)
  archivo_tamano: number (bytes)
  miniatura_url?: string
  duracion?: number (segundos)
  autor?: string
  etiquetas?: string[]
  orden: number
  destacado: boolean
  publico: boolean
  vistas: number
  descargas: number
  calificacion?: number (0-5)
  total_votos: number
  created_by: string (UUID)
  created_at: DateTime
  updated_at: DateTime
}
```

### **ProgresoContenido**
```typescript
{
  id: string (UUID)
  usuario_id: string (UUID)
  contenido_id: string (UUID)
  progreso: number (0-100)
  completado: boolean
  tiempo_visto: number (segundos)
  ultima_posicion?: number (segundos)
  calificacion?: number (1-5)
  favorito: boolean
  notas?: string
  fecha_inicio: DateTime
  fecha_completado?: DateTime
  updated_at: DateTime
}
```

---

## 🔌 API Endpoints

### **CRUD de Contenido**

#### `POST /api/contenido`
Crear contenido educativo (Requiere rol: Coordinador+)

**Body:**
```json
{
  "titulo": "Nutrición en el embarazo",
  "descripcion": "Guía completa sobre nutrición durante el embarazo",
  "tipo": "video",
  "categoria": "nutricion",
  "nivel": "basico",
  "archivoUrl": "https://storage.example.com/videos/nutricion.mp4",
  "archivoNombre": "nutricion.mp4",
  "archivoTipo": "video/mp4",
  "archivoTamano": 52428800,
  "miniaturaUrl": "https://storage.example.com/thumbnails/nutricion.jpg",
  "duracion": 600,
  "autor": "Dr. Juan Pérez",
  "etiquetas": ["nutricion", "embarazo", "alimentacion"],
  "destacado": true,
  "publico": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contenido creado exitosamente",
  "data": { /* ContenidoEducativo */ }
}
```

#### `GET /api/contenido`
Buscar contenido educativo

**Query Params:**
- `query`: string (búsqueda en título, descripción, autor)
- `tipo`: video|audio|documento|imagen|articulo|infografia
- `categoria`: nutricion|cuidado_prenatal|signos_alarma|lactancia|parto|posparto|planificacion|salud_mental|ejercicio|higiene|derechos|otros
- `nivel`: basico|intermedio|avanzado
- `etiquetas`: string (separadas por coma)
- `destacado`: boolean
- `publico`: boolean
- `limit`: number (default: 20, max: 100)
- `offset`: number (default: 0)
- `orderBy`: created_at|titulo|vistas|calificacion|orden
- `orderDir`: asc|desc

**Response:**
```json
{
  "success": true,
  "data": [ /* Array de ContenidoEducativo */ ],
  "total": 50,
  "limit": 20,
  "offset": 0,
  "hasMore": true
}
```

#### `GET /api/contenido/:id`
Obtener contenido por ID

**Response:**
```json
{
  "success": true,
  "data": {
    /* ContenidoEducativo con progreso del usuario */
  }
}
```

#### `PUT /api/contenido/:id`
Actualizar contenido (Requiere rol: Coordinador+)

**Body:** (todos los campos opcionales)
```json
{
  "titulo": "Nuevo título",
  "descripcion": "Nueva descripción",
  "destacado": true
}
```

#### `DELETE /api/contenido/:id`
Eliminar contenido (Requiere rol: Admin+)

### **Contenido Especial**

#### `GET /api/contenido/destacado`
Obtener contenido destacado

**Response:**
```json
{
  "success": true,
  "data": [ /* Array de contenido destacado */ ]
}
```

#### `GET /api/contenido/favoritos`
Obtener favoritos del usuario

### **Progreso y Tracking**

#### `POST /api/contenido/:id/progreso`
Actualizar progreso del usuario

**Body:**
```json
{
  "progreso": 50,
  "completado": false,
  "tiempoVisto": 300,
  "ultimaPosicion": 300,
  "favorito": true,
  "notas": "Muy útil"
}
```

#### `POST /api/contenido/:id/vista`
Registrar vista del contenido

#### `POST /api/contenido/:id/descarga`
Registrar descarga del contenido

#### `POST /api/contenido/:id/calificar`
Calificar contenido

**Body:**
```json
{
  "calificacion": 5
}
```

### **Estadísticas**

#### `GET /api/contenido/estadisticas`
Obtener estadísticas generales

**Response:**
```json
{
  "success": true,
  "data": {
    "totalContenidos": 100,
    "porTipo": {
      "video": 40,
      "audio": 20,
      "documento": 30,
      "imagen": 10
    },
    "porCategoria": {
      "nutricion": 25,
      "cuidado_prenatal": 30,
      "lactancia": 20
    },
    "totalVistas": 5000,
    "totalDescargas": 1200,
    "promedioCalificacion": 4.5
  }
}
```

---

## 💻 Uso en Flutter

### **Inicializar Servicio**
```dart
final contenidoService = ContenidoEducativoService();
contenidoService.initialize(dio);
```

### **Crear Contenido**
```dart
final contenido = await contenidoService.crearContenido(
  titulo: 'Nutrición en el embarazo',
  descripcion: 'Guía completa...',
  tipo: TipoContenido.video,
  categoria: CategoriaContenido.nutricion,
  nivel: NivelDificultad.basico,
  archivoUrl: 'https://...',
  archivoNombre: 'nutricion.mp4',
  archivoTipo: 'video/mp4',
  archivoTamano: 52428800,
);
```

### **Buscar Contenido**
```dart
final contenidos = await contenidoService.buscarContenido(
  query: 'nutrición',
  tipo: TipoContenido.video,
  categoria: CategoriaContenido.nutricion,
  limit: 20,
);
```

### **Abrir Biblioteca**
```dart
Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => const BibliotecaScreen()),
);
```

### **Reproducir Contenido**
```dart
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => ReproductorScreen(contenido: contenido),
  ),
);
```

### **Actualizar Progreso**
```dart
await contenidoService.actualizarProgreso(
  contenidoId: contenido.id,
  progreso: 50,
  tiempoVisto: 300,
  ultimaPosicion: 300,
);
```

---

## 🎬 Reproductores

### **Video Player**
- **Package**: video_player + chewie
- **Características**:
  - Controles nativos
  - Pantalla completa
  - Ajuste de velocidad
  - Subtítulos (opcional)
  - Guardado automático de posición

### **Audio Player**
- **Package**: audioplayers
- **Características**:
  - Controles de reproducción
  - Barra de progreso
  - Adelantar/Retroceder 10s
  - Guardado automático de posición

### **Visor de Documentos**
- **Tipos soportados**: PDF, DOC, DOCX, TXT
- **Características**:
  - Zoom
  - Navegación por páginas
  - Descarga offline

### **Visor de Imágenes**
- **Tipos soportados**: JPG, PNG, GIF, WEBP
- **Características**:
  - Zoom
  - Pantalla completa

---

## 📈 Características Implementadas

✅ **CRUD Completo** - Crear, leer, actualizar, eliminar
✅ **Múltiples Tipos** - Video, audio, documento, imagen, artículo, infografía
✅ **12 Categorías** - Nutrición, cuidado prenatal, signos de alarma, etc.
✅ **3 Niveles** - Básico, intermedio, avanzado
✅ **Reproductores** - Video, audio, documentos, imágenes
✅ **Tracking de Progreso** - Automático cada 10 segundos
✅ **Calificaciones** - Sistema de 1-5 estrellas
✅ **Favoritos** - Marcar contenido favorito
✅ **Estadísticas** - Vistas, descargas, calificaciones
✅ **Búsqueda Avanzada** - Por tipo, categoría, nivel, etiquetas
✅ **Contenido Destacado** - Sección especial
✅ **Filtros** - Por tipo y categoría
✅ **Roles y Permisos** - Coordinador+ para crear/editar
✅ **Miniaturas** - Imágenes de previsualización
✅ **Etiquetas** - Sistema de tags
✅ **Notas** - Notas personales del usuario

---

## 🚀 Características Futuras

⏳ Descarga offline
⏳ Subtítulos para videos
⏳ Transcripciones de audio
⏳ Comentarios y discusiones
⏳ Compartir contenido
⏳ Listas de reproducción
⏳ Recomendaciones personalizadas
⏳ Certificados de completado
⏳ Gamificación (puntos, badges)
⏳ Contenido interactivo (quizzes)

---

## 📝 Notas de Implementación

- Los archivos se almacenan en URLs externas (S3, Azure, etc.)
- El progreso se guarda automáticamente cada 10 segundos
- Las calificaciones actualizan el promedio en tiempo real
- Los reproductores restauran la última posición
- El sistema soporta sincronización offline (integrado con SyncService)

---

**Última actualización**: 2025-01-15
**Versión**: 1.0.0

