import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as geoController from '../controllers/geolocalizacion.controller';

const router = Router();

/**
 * Todas las rutas de geolocalización requieren autenticación
 */
router.use(authMiddleware);

/**
 * GET /api/geolocalizacion/cercanos
 * Buscar entidades cercanas a una ubicación
 * 
 * Query params:
 * - latitud: number (required)
 * - longitud: number (required)
 * - radio: number (km, default: 10, max: 100)
 * - tipo: 'gestantes' | 'ips' | 'madrinas' | 'todos' (default: 'todos')
 * - limit: number (default: 20, max: 100)
 */
router.get('/cercanos', geoController.buscarCercanos);

/**
 * POST /api/geolocalizacion/ruta
 * Calcular ruta entre dos puntos
 * 
 * Body:
 * {
 *   "origen": { "type": "Point", "coordinates": [lon, lat] },
 *   "destino": { "type": "Point", "coordinates": [lon, lat] },
 *   "optimizar": true,
 *   "evitarPeajes": false
 * }
 */
router.post('/ruta', geoController.calcularRuta);

/**
 * POST /api/geolocalizacion/ruta-multiple
 * Calcular ruta múltiple optimizada
 * 
 * Body:
 * {
 *   "origen": { "type": "Point", "coordinates": [lon, lat] },
 *   "destinos": [
 *     { "type": "Point", "coordinates": [lon, lat] },
 *     { "type": "Point", "coordinates": [lon, lat] }
 *   ],
 *   "optimizar": true,
 *   "retornarAlOrigen": false
 * }
 */
router.post('/ruta-multiple', geoController.calcularRutaMultiple);

/**
 * POST /api/geolocalizacion/zonas
 * Crear zona de cobertura
 * 
 * Body:
 * {
 *   "nombre": "Zona Norte",
 *   "descripcion": "Cobertura zona norte del municipio",
 *   "madrinaId": "uuid",
 *   "municipioId": "uuid",
 *   "poligono": {
 *     "type": "Polygon",
 *     "coordinates": [[[lon, lat], [lon, lat], ...]]
 *   },
 *   "color": "#FF6B6B",
 *   "activo": true
 * }
 */
router.post('/zonas', geoController.crearZonaCobertura);

/**
 * GET /api/geolocalizacion/zonas
 * Obtener zonas de cobertura
 * 
 * Query params:
 * - municipioId: uuid (optional)
 */
router.get('/zonas', geoController.obtenerZonasCobertura);

/**
 * GET /api/geolocalizacion/zonas/:id
 * Obtener zona de cobertura por ID
 */
router.get('/zonas/:id', geoController.obtenerZonaCobertura);

/**
 * PUT /api/geolocalizacion/zonas/:id
 * Actualizar zona de cobertura
 * 
 * Body:
 * {
 *   "nombre": "Zona Norte Actualizada",
 *   "descripcion": "Nueva descripción",
 *   "poligono": { ... },
 *   "color": "#4ECDC4",
 *   "activo": true
 * }
 */
router.put('/zonas/:id', geoController.actualizarZonaCobertura);

/**
 * DELETE /api/geolocalizacion/zonas/:id
 * Eliminar zona de cobertura
 */
router.delete('/zonas/:id', geoController.eliminarZonaCobertura);

/**
 * GET /api/geolocalizacion/estadisticas
 * Obtener estadísticas de geolocalización
 */
router.get('/estadisticas', geoController.obtenerEstadisticas);

/**
 * GET /api/geolocalizacion/heatmap
 * Obtener datos para mapa de calor
 * 
 * Query params:
 * - tipo: 'gestantes' | 'alertas' | 'controles'
 * - municipioId: uuid (optional)
 * - fechaInicio: ISO date (optional)
 * - fechaFin: ISO date (optional)
 */
router.get('/heatmap', geoController.obtenerHeatmap);

/**
 * GET /api/geolocalizacion/clusters
 * Obtener clusters de puntos
 * 
 * Query params:
 * - tipo: 'gestantes' | 'ips' | 'alertas'
 * - municipioId: uuid (optional)
 * - zoom: number (1-20, default: 10)
 */
router.get('/clusters', geoController.obtenerClusters);

/**
 * POST /api/geolocalizacion/analizar-cobertura
 * Analizar cobertura de un municipio
 * 
 * Body:
 * {
 *   "municipioId": "uuid",
 *   "radioCobertura": 5
 * }
 */
router.post('/analizar-cobertura', geoController.analizarCobertura);

export default router;

