# Geolocalización Avanzada - Madres Digitales

## 📋 Descripción General

Sistema completo de geolocalización avanzada con mapas interactivos, cálculo de rutas, zonas de cobertura y análisis espacial para optimizar la atención de gestantes en zonas rurales de Bolívar, Colombia.

---

## 🏗️ Arquitectura

### **Backend**
- **Framework**: Express.js + PostGIS
- **Base de Datos**: PostgreSQL con extensión PostGIS
- **Cálculos**: Fórmula de Haversine para distancias
- **Optimización**: Algoritmo del vecino más cercano

### **Frontend**
- **Framework**: Flutter Web/Mobile
- **Mapas**: Flutter Map + OpenStreetMap
- **Geolocalización**: Geolocator package
- **Coordenadas**: LatLong2 package

---

## 📊 Modelos de Datos

### **ZonaCobertura**
```typescript
{
  id: string (UUID)
  nombre: string
  descripcion?: string
  madrina_id: string (UUID)
  municipio_id: string (UUID)
  poligono: GeoJSON Polygon
  color?: string (hex)
  activo: boolean
  created_at: DateTime
  updated_at: DateTime
}
```

### **PuntoGeo**
```typescript
{
  type: 'Point'
  coordinates: [longitud, latitud]
}
```

### **Poligono**
```typescript
{
  type: 'Polygon'
  coordinates: [[[lon, lat], [lon, lat], ...]]
}
```

---

## 🔌 API Endpoints

### **Búsqueda de Entidades Cercanas**

#### `GET /api/geolocalizacion/cercanos`
Buscar gestantes, IPS o madrinas cercanas a una ubicación

**Query Params:**
- `latitud`: number (required)
- `longitud`: number (required)
- `radio`: number (km, default: 10, max: 100)
- `tipo`: 'gestantes' | 'ips' | 'madrinas' | 'todos' (default: 'todos')
- `limit`: number (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tipo": "gestante",
      "nombre": "María García",
      "ubicacion": { "type": "Point", "coordinates": [-75.5, 10.4] },
      "distancia": 2.5,
      "direccion": "Calle 10 #20-30",
      "telefono": "3001234567"
    }
  ],
  "total": 10
}
```

### **Cálculo de Rutas**

#### `POST /api/geolocalizacion/ruta`
Calcular ruta entre dos puntos

**Body:**
```json
{
  "origen": { "type": "Point", "coordinates": [-75.5, 10.4] },
  "destino": { "type": "Point", "coordinates": [-75.6, 10.5] },
  "optimizar": true,
  "evitarPeajes": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "distancia": 15.5,
    "duracion": 23.25,
    "puntos": [
      { "type": "Point", "coordinates": [-75.5, 10.4] },
      { "type": "Point", "coordinates": [-75.6, 10.5] }
    ],
    "instrucciones": [
      "Dirigirse hacia el destino (15.50 km)",
      "Llegada al destino"
    ]
  }
}
```

#### `POST /api/geolocalizacion/ruta-multiple`
Calcular ruta múltiple optimizada (problema del viajante)

**Body:**
```json
{
  "origen": { "type": "Point", "coordinates": [-75.5, 10.4] },
  "destinos": [
    { "type": "Point", "coordinates": [-75.6, 10.5] },
    { "type": "Point", "coordinates": [-75.7, 10.6] },
    { "type": "Point", "coordinates": [-75.8, 10.7] }
  ],
  "optimizar": true,
  "retornarAlOrigen": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "distanciaTotal": 45.8,
    "duracionTotal": 68.7,
    "orden": [0, 2, 1],
    "rutas": [
      { "distancia": 15.5, "duracion": 23.25, "puntos": [...] },
      { "distancia": 18.3, "duracion": 27.45, "puntos": [...] },
      { "distancia": 12.0, "duracion": 18.0, "puntos": [...] }
    ]
  }
}
```

### **Zonas de Cobertura**

#### `POST /api/geolocalizacion/zonas`
Crear zona de cobertura

**Body:**
```json
{
  "nombre": "Zona Norte",
  "descripcion": "Cobertura zona norte del municipio",
  "madrinaId": "uuid",
  "municipioId": "uuid",
  "poligono": {
    "type": "Polygon",
    "coordinates": [
      [
        [-75.5, 10.4],
        [-75.6, 10.4],
        [-75.6, 10.5],
        [-75.5, 10.5],
        [-75.5, 10.4]
      ]
    ]
  },
  "color": "#FF6B6B",
  "activo": true
}
```

#### `GET /api/geolocalizacion/zonas`
Obtener zonas de cobertura

**Query Params:**
- `municipioId`: uuid (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nombre": "Zona Norte",
      "descripcion": "Cobertura zona norte",
      "madrinaId": "uuid",
      "madrinaNombre": "Ana López",
      "municipioId": "uuid",
      "municipioNombre": "Cartagena",
      "poligono": { ... },
      "color": "#FF6B6B",
      "activo": true,
      "gestantesEnZona": 15,
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ],
  "total": 5
}
```

#### `GET /api/geolocalizacion/zonas/:id`
Obtener zona de cobertura por ID

#### `PUT /api/geolocalizacion/zonas/:id`
Actualizar zona de cobertura

#### `DELETE /api/geolocalizacion/zonas/:id`
Eliminar zona de cobertura

### **Estadísticas y Análisis**

#### `GET /api/geolocalizacion/estadisticas`
Obtener estadísticas de geolocalización

**Response:**
```json
{
  "success": true,
  "data": {
    "totalGestantes": 100,
    "gestantesConUbicacion": 85,
    "gestantesSinUbicacion": 15,
    "totalIPS": 20,
    "ipsConUbicacion": 18,
    "totalZonasCobertura": 10,
    "zonasActivas": 8,
    "distanciaPromedioIPS": 5.5,
    "coberturaPorcentaje": 85.0
  }
}
```

#### `GET /api/geolocalizacion/heatmap`
Obtener datos para mapa de calor

**Query Params:**
- `tipo`: 'gestantes' | 'alertas' | 'controles'
- `municipioId`: uuid (optional)
- `fechaInicio`: ISO date (optional)
- `fechaFin`: ISO date (optional)

#### `GET /api/geolocalizacion/clusters`
Obtener clusters de puntos

**Query Params:**
- `tipo`: 'gestantes' | 'ips' | 'alertas'
- `municipioId`: uuid (optional)
- `zoom`: number (1-20, default: 10)

#### `POST /api/geolocalizacion/analizar-cobertura`
Analizar cobertura de un municipio

**Body:**
```json
{
  "municipioId": "uuid",
  "radioCobertura": 5
}
```

---

## 💻 Uso en Flutter

### **Inicializar Servicio**
```dart
final geoService = GeolocalizacionService();
geoService.initialize(dio);
```

### **Obtener Ubicación Actual**
```dart
final ubicacion = await geoService.obtenerUbicacionActual();
if (ubicacion != null) {
  print('Lat: ${ubicacion.latitud}, Lon: ${ubicacion.longitud}');
}
```

### **Buscar Entidades Cercanas**
```dart
final entidades = await geoService.buscarCercanos(
  latitud: 10.4,
  longitud: -75.5,
  radio: 10,
  tipo: 'gestantes',
  limit: 20,
);
```

### **Calcular Ruta**
```dart
final ruta = await geoService.calcularRuta(
  origen: PuntoGeo(coordinates: [-75.5, 10.4]),
  destino: PuntoGeo(coordinates: [-75.6, 10.5]),
  optimizar: true,
);

print('Distancia: ${ruta.distanciaFormateada}');
print('Duración: ${ruta.duracionFormateada}');
```

### **Calcular Ruta Múltiple**
```dart
final rutaMultiple = await geoService.calcularRutaMultiple(
  origen: PuntoGeo(coordinates: [-75.5, 10.4]),
  destinos: [
    PuntoGeo(coordinates: [-75.6, 10.5]),
    PuntoGeo(coordinates: [-75.7, 10.6]),
  ],
  optimizar: true,
  retornarAlOrigen: false,
);
```

### **Crear Zona de Cobertura**
```dart
final zona = await geoService.crearZonaCobertura(
  nombre: 'Zona Norte',
  madrinaId: 'uuid',
  municipioId: 'uuid',
  poligono: Poligono(coordinates: [...]),
  color: '#FF6B6B',
);
```

### **Mostrar Mapa**
```dart
Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => const MapaScreen()),
);
```

---

## 🗺️ Características del Mapa

### **Capas del Mapa**
- ✅ Tiles de OpenStreetMap
- ✅ Marcadores de gestantes (rosa)
- ✅ Marcadores de IPS (rojo)
- ✅ Marcadores de madrinas (verde)
- ✅ Ubicación actual del usuario (azul)
- ✅ Zonas de cobertura (polígonos)
- ✅ Rutas calculadas (líneas)

### **Interacciones**
- ✅ Zoom in/out
- ✅ Pan (arrastrar)
- ✅ Tap en marcadores (ver detalles)
- ✅ Centrar en ubicación actual
- ✅ Filtros de capas
- ✅ Calcular ruta a entidad

### **Leyenda**
- 🟣 Gestantes
- 🔴 IPS
- 🔵 Mi ubicación
- 🟢 Madrinas

---

## 📐 Algoritmos Implementados

### **Fórmula de Haversine**
Cálculo de distancia entre dos puntos en la esfera terrestre:

```typescript
const R = 6371; // Radio de la Tierra en km
const dLat = toRad(lat2 - lat1);
const dLon = toRad(lon2 - lon1);

const a = 
  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
  Math.sin(dLon / 2) * Math.sin(dLon / 2);

const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
const distancia = R * c;
```

### **Algoritmo del Vecino Más Cercano**
Optimización de rutas múltiples (problema del viajante):

1. Empezar en el origen
2. Encontrar el destino más cercano no visitado
3. Moverse a ese destino
4. Repetir hasta visitar todos los destinos
5. Opcionalmente retornar al origen

---

## 🔒 Seguridad

1. **Autenticación**: Todos los endpoints requieren JWT token
2. **Validación**: Zod schemas para validar coordenadas
3. **Límites**: Radio máximo de búsqueda (100 km)
4. **Permisos**: Verificación de permisos de ubicación en dispositivo

---

## 📈 Características Implementadas

✅ Búsqueda de entidades cercanas (Haversine)
✅ Cálculo de rutas simples
✅ Cálculo de rutas múltiples optimizadas
✅ Zonas de cobertura con polígonos
✅ Mapa interactivo con Flutter Map
✅ Marcadores personalizados
✅ Ubicación en tiempo real
✅ Filtros de capas
✅ Leyenda del mapa
✅ Cálculo de distancias
✅ Estadísticas geoespaciales

---

## 🚀 Características Futuras

⏳ Geocodificación (dirección → coordenadas)
⏳ Geocodificación inversa (coordenadas → dirección)
⏳ Heatmaps (mapas de calor)
⏳ Clustering de marcadores
⏳ Análisis de cobertura avanzado
⏳ Rutas con API externa (Google Maps, Mapbox)
⏳ Navegación turn-by-turn
⏳ Compartir ubicación en tiempo real
⏳ Geofencing (alertas por zona)
⏳ Tracking de rutas recorridas

---

**Última actualización**: 2025-01-15
**Versión**: 1.0.0

