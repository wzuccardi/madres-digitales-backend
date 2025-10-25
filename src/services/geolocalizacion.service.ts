import prisma from '../config/database';
import {
  BuscarCercanosDTO,
  CalcularRutaDTO,
  CalcularRutaMultipleDTO,
  CrearZonaCoberturaDTO,
  ActualizarZonaCoberturaDTO,
  VerificarPuntoEnZonaDTO,
  ObtenerHeatmapDTO,
  ObtenerClustersDTO,
  AnalizarCoberturaDTO,
  EntidadCercana,
  RutaCalculada,
  RutaMultipleCalculada,
  ZonaCobertura,
  EstadisticasGeolocalizacion,
  MapaHeatmap,
  Cluster,
  AnalisisCobertura,
  PuntoGeoDTO,
} from '../core/application/dtos/geolocalizacion.dto';
import { logger } from '../config/logger';
import { NotFoundError } from '../core/domain/errors/not-found.error';

export class GeolocalizacionService {
  /**
   * Buscar entidades cercanas usando fórmula de Haversine
   */
  async buscarCercanos(dto: BuscarCercanosDTO): Promise<EntidadCercana[]> {
    try {
      const resultados: EntidadCercana[] = [];

      // Buscar gestantes cercanas
      if (dto.tipo === 'gestantes' || dto.tipo === 'todos') {
        const gestantes = await prisma.$queryRaw<any[]>`
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

        resultados.push(
          ...gestantes.map((g) => ({
            id: g.id,
            tipo: 'gestante' as const,
            nombre: g.nombre,
            ubicacion: g.ubicacion,
            distancia: parseFloat(g.distancia),
            direccion: g.direccion,
            telefono: g.telefono,
          }))
        );
      }

      // Buscar IPS cercanas
      if (dto.tipo === 'ips' || dto.tipo === 'todos') {
        const ips = await prisma.$queryRaw<any[]>`
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

        resultados.push(
          ...ips.map((i) => ({
            id: i.id,
            tipo: 'ips' as const,
            nombre: i.nombre,
            ubicacion: i.ubicacion,
            distancia: parseFloat(i.distancia),
            direccion: i.direccion,
            telefono: i.telefono,
          }))
        );
      }

      // Buscar madrinas cercanas
      if (dto.tipo === 'madrinas' || dto.tipo === 'todos') {
        const madrinas = await prisma.$queryRaw<any[]>`
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

        resultados.push(
          ...madrinas.map((m) => ({
            id: m.id,
            tipo: 'madrina' as const,
            nombre: m.nombre,
            ubicacion: m.ubicacion,
            distancia: parseFloat(m.distancia),
            telefono: m.telefono,
          }))
        );
      }

      // Ordenar por distancia y limitar
      resultados.sort((a, b) => a.distancia - b.distancia);
      return resultados.slice(0, dto.limit);
    } catch (error: any) {
      logger.error('Error buscando entidades cercanas', { error, dto });
      throw error;
    }
  }

  /**
   * Calcular ruta entre dos puntos (simplificado)
   */
  async calcularRuta(dto: CalcularRutaDTO): Promise<RutaCalculada> {
    try {
      // Calcular distancia usando Haversine
      const distancia = this._calcularDistanciaHaversine(
        dto.origen.coordinates[1],
        dto.origen.coordinates[0],
        dto.destino.coordinates[1],
        dto.destino.coordinates[0]
      );

      // Estimar duración (asumiendo 40 km/h promedio en zona rural)
      const duracion = (distancia / 40) * 60; // minutos

      // Generar puntos intermedios (simplificado - línea recta)
      const puntos: PuntoGeoDTO[] = [
        dto.origen,
        dto.destino,
      ];

      logger.info('Ruta calculada', { distancia, duracion });

      return {
        distancia,
        duracion,
        puntos,
        instrucciones: [
          `Dirigirse hacia el destino (${distancia.toFixed(2)} km)`,
          'Llegada al destino',
        ],
      };
    } catch (error: any) {
      logger.error('Error calculando ruta', { error, dto });
      throw error;
    }
  }

  /**
   * Calcular ruta múltiple optimizada
   */
  async calcularRutaMultiple(dto: CalcularRutaMultipleDTO): Promise<RutaMultipleCalculada> {
    try {
      let destinos = [...dto.destinos];
      let orden: number[] = [];
      let distanciaTotal = 0;
      let duracionTotal = 0;
      const rutas: RutaCalculada[] = [];

      if (dto.optimizar) {
        // Algoritmo del vecino más cercano
        let puntoActual = dto.origen;
        const destinosRestantes = destinos.map((d, i) => ({ destino: d, indice: i }));

        while (destinosRestantes.length > 0) {
          let menorDistancia = Infinity;
          let indiceMasCercano = 0;

          destinosRestantes.forEach((item, idx) => {
            const distancia = this._calcularDistanciaHaversine(
              puntoActual.coordinates[1],
              puntoActual.coordinates[0],
              item.destino.coordinates[1],
              item.destino.coordinates[0]
            );

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
      } else {
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

      logger.info('Ruta múltiple calculada', { distanciaTotal, duracionTotal, paradas: orden.length });

      return {
        distanciaTotal,
        duracionTotal,
        orden,
        rutas,
      };
    } catch (error: any) {
      logger.error('Error calculando ruta múltiple', { error, dto });
      throw error;
    }
  }

  /**
   * Crear zona de cobertura
   */
  async crearZonaCobertura(dto: CrearZonaCoberturaDTO): Promise<ZonaCobertura> {
    try {
      const zona = await prisma.zonaCobertura.create({
        data: {
          nombre: dto.nombre,
          descripcion: dto.descripcion,
          municipio_id: dto.madrinaId,
          municipio_id: dto.municipioId,
          poligono: dto.poligono,
          color: dto.color || this._generarColorAleatorio(),
          activo: dto.activo,
        },
      });

      logger.info('Zona de cobertura creada', { zonaId: zona.id });

      return this._mapZonaCobertura(zona);
    } catch (error: any) {
      logger.error('Error creando zona de cobertura', { error, dto });
      throw error;
    }
  }

  /**
   * Obtener zonas de cobertura
   */
  async obtenerZonasCobertura(municipioId?: string): Promise<ZonaCobertura[]> {
    try {
      const where: any = { activo: true };
      if (municipioId) {
        where.municipio_id = municipioId;
      }

      const zonas = await prisma.zonaCobertura.findMany({
        where,
        orderBy: { fecha_creacion: 'desc' },
      });

      return zonas.map(this._mapZonaCobertura);
    } catch (error: any) {
      logger.error('Error obteniendo zonas de cobertura', { error });
      throw error;
    }
  }

  /**
   * Calcular distancia usando fórmula de Haversine
   */
  private _calcularDistanciaHaversine(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this._toRad(lat2 - lat1);
    const dLon = this._toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this._toRad(lat1)) *
        Math.cos(this._toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private _toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private _generarColorAleatorio(): string {
    const colores = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    return colores[Math.floor(Math.random() * colores.length)];
  }

  private _mapZonaCobertura(zona: any): ZonaCobertura {
    return {
      id: zona.id,
      nombre: zona.nombre,
      descripcion: zona.descripcion,
      madrinaId: zona.municipio_id,
      municipioId: zona.municipio_id,
      poligono: zona.poligono,
      color: zona.color,
      activo: zona.activo,
      createdAt: zona.fecha_creacion,
      updatedAt: zona.updated_at,
    };
  }
}

