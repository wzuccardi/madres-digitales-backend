"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeolocalizacionService = void 0;
const database_1 = __importDefault(require("../config/database"));
const logger_1 = require("../config/logger");
class GeolocalizacionService {
    /**
     * Buscar entidades cercanas usando fórmula de Haversine
     */
    async buscarCercanos(dto) {
        try {
            const resultados = [];
            // Buscar gestantes cercanas
            if (dto.tipo === 'gestantes' || dto.tipo === 'todos') {
                const gestantes = await database_1.default.$queryRaw `
          SELECT 
            id,
            nombre,
            ubicacion,
            direccion,
            telefono,
            (
              6371 * acos(
                cos(radians(${dto.latitud})) * 
                cos(radians((ubicacion->>'coordinates')::json->1::text::float)) * 
                cos(radians((ubicacion->>'coordinates')::json->0::text::float) - radians(${dto.longitud})) + 
                sin(radians(${dto.latitud})) * 
                sin(radians((ubicacion->>'coordinates')::json->1::text::float))
              )
            ) AS distancia
          FROM gestantes
          WHERE ubicacion IS NOT NULL
          HAVING distancia <= ${dto.radio}
          ORDER BY distancia
          LIMIT ${dto.limit}
        `;
                resultados.push(...gestantes.map((g) => ({
                    id: g.id,
                    tipo: 'gestante',
                    nombre: g.nombre,
                    ubicacion: g.ubicacion,
                    distancia: parseFloat(g.distancia),
                    direccion: g.direccion,
                    telefono: g.telefono,
                })));
            }
            // Buscar IPS cercanas
            if (dto.tipo === 'ips' || dto.tipo === 'todos') {
                const ips = await database_1.default.$queryRaw `
          SELECT 
            id,
            nombre,
            ubicacion,
            direccion,
            telefono,
            (
              6371 * acos(
                cos(radians(${dto.latitud})) * 
                cos(radians((ubicacion->>'coordinates')::json->1::text::float)) * 
                cos(radians((ubicacion->>'coordinates')::json->0::text::float) - radians(${dto.longitud})) + 
                sin(radians(${dto.latitud})) * 
                sin(radians((ubicacion->>'coordinates')::json->1::text::float))
              )
            ) AS distancia
          FROM ips
          WHERE ubicacion IS NOT NULL AND activo = true
          HAVING distancia <= ${dto.radio}
          ORDER BY distancia
          LIMIT ${dto.limit}
        `;
                resultados.push(...ips.map((i) => ({
                    id: i.id,
                    tipo: 'ips',
                    nombre: i.nombre,
                    ubicacion: i.ubicacion,
                    distancia: parseFloat(i.distancia),
                    direccion: i.direccion,
                    telefono: i.telefono,
                })));
            }
            // Buscar madrinas cercanas
            if (dto.tipo === 'madrinas' || dto.tipo === 'todos') {
                const madrinas = await database_1.default.$queryRaw `
          SELECT 
            u.id,
            u.nombre,
            u.ubicacion,
            u.telefono,
            (
              6371 * acos(
                cos(radians(${dto.latitud})) * 
                cos(radians((u.ubicacion->>'coordinates')::json->1::text::float)) * 
                cos(radians((u.ubicacion->>'coordinates')::json->0::text::float) - radians(${dto.longitud})) + 
                sin(radians(${dto.latitud})) * 
                sin(radians((u.ubicacion->>'coordinates')::json->1::text::float))
              )
            ) AS distancia
          FROM usuarios u
          WHERE u.ubicacion IS NOT NULL AND u.rol = 'madrina'
          HAVING distancia <= ${dto.radio}
          ORDER BY distancia
          LIMIT ${dto.limit}
        `;
                resultados.push(...madrinas.map((m) => ({
                    id: m.id,
                    tipo: 'madrina',
                    nombre: m.nombre,
                    ubicacion: m.ubicacion,
                    distancia: parseFloat(m.distancia),
                    telefono: m.telefono,
                })));
            }
            // Ordenar por distancia y limitar
            resultados.sort((a, b) => a.distancia - b.distancia);
            return resultados.slice(0, dto.limit);
        }
        catch (error) {
            logger_1.logger.error('Error buscando entidades cercanas', { error, dto });
            throw error;
        }
    }
    /**
     * Calcular ruta entre dos puntos (simplificado)
     */
    async calcularRuta(dto) {
        try {
            // Calcular distancia usando Haversine
            const distancia = this._calcularDistanciaHaversine(dto.origen.coordinates[1], dto.origen.coordinates[0], dto.destino.coordinates[1], dto.destino.coordinates[0]);
            // Estimar duración (asumiendo 40 km/h promedio en zona rural)
            const duracion = (distancia / 40) * 60; // minutos
            // Generar puntos intermedios (simplificado - línea recta)
            const puntos = [
                dto.origen,
                dto.destino,
            ];
            logger_1.logger.info('Ruta calculada', { distancia, duracion });
            return {
                distancia,
                duracion,
                puntos,
                instrucciones: [
                    `Dirigirse hacia el destino (${distancia.toFixed(2)} km)`,
                    'Llegada al destino',
                ],
            };
        }
        catch (error) {
            logger_1.logger.error('Error calculando ruta', { error, dto });
            throw error;
        }
    }
    /**
     * Calcular ruta múltiple optimizada
     */
    async calcularRutaMultiple(dto) {
        try {
            let destinos = [...dto.destinos];
            let orden = [];
            let distanciaTotal = 0;
            let duracionTotal = 0;
            const rutas = [];
            if (dto.optimizar) {
                // Algoritmo del vecino más cercano
                let puntoActual = dto.origen;
                const destinosRestantes = destinos.map((d, i) => ({ destino: d, indice: i }));
                while (destinosRestantes.length > 0) {
                    let menorDistancia = Infinity;
                    let indiceMasCercano = 0;
                    destinosRestantes.forEach((item, idx) => {
                        const distancia = this._calcularDistanciaHaversine(puntoActual.coordinates[1], puntoActual.coordinates[0], item.destino.coordinates[1], item.destino.coordinates[0]);
                        if (distancia < menorDistancia) {
                            menorDistancia = distancia;
                            indiceMasCercano = idx;
                        }
                    });
                    const destinoMasCercano = destinosRestantes[indiceMasCercano];
                    orden.push(destinoMasCercano.indice);
                    const ruta = await this.calcularRuta({
                        origen: puntoActual,
                        destino: destinoMasCercano.destino,
                        optimizar: true,
                        evitarPeajes: dto.optimizar,
                    });
                    rutas.push(ruta);
                    distanciaTotal += ruta.distancia;
                    duracionTotal += ruta.duracion;
                    puntoActual = destinoMasCercano.destino;
                    destinosRestantes.splice(indiceMasCercano, 1);
                }
                // Si debe retornar al origen
                if (dto.retornarAlOrigen) {
                    const rutaRetorno = await this.calcularRuta({
                        origen: puntoActual,
                        destino: dto.origen,
                        optimizar: true,
                        evitarPeajes: dto.optimizar,
                    });
                    rutas.push(rutaRetorno);
                    distanciaTotal += rutaRetorno.distancia;
                    duracionTotal += rutaRetorno.duracion;
                }
            }
            else {
                // Sin optimizar - orden original
                orden = destinos.map((_, i) => i);
                let puntoActual = dto.origen;
                for (const destino of destinos) {
                    const ruta = await this.calcularRuta({
                        origen: puntoActual,
                        destino,
                        optimizar: false,
                        evitarPeajes: false,
                    });
                    rutas.push(ruta);
                    distanciaTotal += ruta.distancia;
                    duracionTotal += ruta.duracion;
                    puntoActual = destino;
                }
            }
            logger_1.logger.info('Ruta múltiple calculada', { distanciaTotal, duracionTotal, paradas: orden.length });
            return {
                distanciaTotal,
                duracionTotal,
                orden,
                rutas,
            };
        }
        catch (error) {
            logger_1.logger.error('Error calculando ruta múltiple', { error, dto });
            throw error;
        }
    }
    /**
     * Crear zona de cobertura
     */
    async crearZonaCobertura(dto) {
        try {
            const zona = await database_1.default.zonaCobertura.create({
                data: {
                    nombre: dto.nombre,
                    descripcion: dto.descripcion,
                    madrina_id: dto.madrinaId,
                    municipio_id: dto.municipioId,
                    poligono: dto.poligono,
                    color: dto.color || this._generarColorAleatorio(),
                    activo: dto.activo,
                },
            });
            logger_1.logger.info('Zona de cobertura creada', { zonaId: zona.id });
            return this._mapZonaCobertura(zona);
        }
        catch (error) {
            logger_1.logger.error('Error creando zona de cobertura', { error, dto });
            throw error;
        }
    }
    /**
     * Obtener zonas de cobertura
     */
    async obtenerZonasCobertura(municipioId) {
        try {
            const where = { activo: true };
            if (municipioId) {
                where.municipio_id = municipioId;
            }
            const zonas = await database_1.default.zonaCobertura.findMany({
                where,
                orderBy: { created_at: 'desc' },
            });
            return zonas.map(this._mapZonaCobertura);
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo zonas de cobertura', { error });
            throw error;
        }
    }
    /**
     * Calcular distancia usando fórmula de Haversine
     */
    _calcularDistanciaHaversine(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = this._toRad(lat2 - lat1);
        const dLon = this._toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this._toRad(lat1)) *
                Math.cos(this._toRad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    _toRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    _generarColorAleatorio() {
        const colores = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
        return colores[Math.floor(Math.random() * colores.length)];
    }
    _mapZonaCobertura(zona) {
        return {
            id: zona.id,
            nombre: zona.nombre,
            descripcion: zona.descripcion,
            madrinaId: zona.madrina_id,
            municipioId: zona.municipio_id,
            poligono: zona.poligono,
            color: zona.color,
            activo: zona.activo,
            createdAt: zona.created_at,
            updatedAt: zona.updated_at,
        };
    }
}
exports.GeolocalizacionService = GeolocalizacionService;
