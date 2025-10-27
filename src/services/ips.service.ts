import { PrismaClient, Prisma } from '@prisma/client';
import { log } from '../config/logger';

const prisma = new PrismaClient();

export interface CreateIPSData {
  nombre: string;
  nit?: string;
  telefono?: string;
  direccion?: string;
  municipio_id?: string;
  nivel?: string;
  email?: string;
  latitud?: number;
  longitud?: number;
}

export interface UpdateIPSData {
  nombre?: string;
  nit?: string;
  telefono?: string;
  direccion?: string;
  municipio_id?: string;
  nivel?: string;
  email?: string;
  activo?: boolean;
  latitud?: number;
  longitud?: number;
}

export class IPSService {
  constructor() {
    console.log('🏥 IPSService initialized');
  }

  async createIPS(data: CreateIPSData): Promise<{ success: boolean; ips?: any; error?: string }> {
    try {
      console.log('🏥 Creando IPS:', data);

      const ips = await prisma.ips.create({
        data: {
          nombre: data.nombre,
          nit: data.nit,
          telefono: data.telefono,
          direccion: data.direccion,
          municipio_id: data.municipio_id,
          nivel: data.nivel,
          email: data.email,
          latitud: data.latitud,
          longitud: data.longitud,
          activo: true,
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date()
        } as any,
        include: {
          municipios: true,
          medicos: true,
          gestantes: true
        }
      });

      console.log(`✅ IPS creada con ID: ${ips.id}`);
      log.info('IPS creada', { ipsId: ips.id, nombre: ips.nombre });

      return {
        success: true,
        ips
      };
    } catch (error) {
      console.error('❌ Error creando IPS:', error);
      log.error('Error creando IPS', { error: error.message, data });

      return {
        success: false,
        error: error.message
      };
    }
  }

  async getAllIPS(filtros?: {
    municipio_id?: string;
    nivel?: string;
    activo?: boolean;
    limite?: number;
    offset?: number;
  }): Promise<{ success: boolean; ips?: any[]; total?: number; error?: string }> {
    try {
      console.log('🏥 Obteniendo lista de IPS con filtros:', filtros);

      const where: any = {};
      
      if (filtros?.municipio_id) {
        where.municipio_id = filtros.municipio_id;
      }
      
      if (filtros?.nivel) {
        where.nivel = filtros.nivel;
      }
      
      if (filtros?.activo !== undefined) {
        where.activo = filtros.activo;
      }

      const [ips, total] = await Promise.all([
        prisma.ips.findMany({
          where,
          include: {
            municipio: true,
            medicos: {
              where: { activo: true },
              include: { municipio: true }
            },
            _count: {
              select: {
                medicos: true,
                gestantes: true
              }
            }
          },
          orderBy: { nombre: 'asc' },
          take: filtros?.limite || 100,
          skip: filtros?.offset || 0
        }),
        prisma.ips.count({ where })
      ]);

      console.log(`🏥 Consulta completada: ${ips.length} IPS encontradas de ${total} totales`);

      return {
        success: true,
        ips,
        total
      };
    } catch (error) {
      console.error('❌ Error obteniendo IPS:', error);
      log.error('Error obteniendo IPS', { error: error.message, filtros });

      return {
        success: false,
        error: error.message
      };
    }
  }

  async getIPSById(id: string): Promise<{ success: boolean; ips?: any; error?: string }> {
    try {
      console.log(`🏥 Buscando IPS con ID: ${id}`);

      const ips = await prisma.ips.findUnique({
        where: { id },
        include: {
          municipio: true,
          medicos: {
            where: { activo: true },
            include: { 
              municipio: true,
              ips: true
            }
          },
          gestantes: {
            where: { activa: true },
            include: {
              municipio: true,
              madrina: true,
              medico_tratante: true
            }
          },
          _count: {
            select: {
              medicos: true,
              gestantes: true
            }
          }
        }
      });

      if (!ips) {
        return {
          success: false,
          error: 'IPS no encontrada'
        };
      }

      console.log(`✅ IPS encontrada: ${ips.nombre}`);
      return {
        success: true,
        ips
      };
    } catch (error) {
      console.error('❌ Error obteniendo IPS:', error);
      log.error('Error obteniendo IPS por ID', { error: error.message, id });

      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateIPS(id: string, data: UpdateIPSData): Promise<{ success: boolean; ips?: any; error?: string }> {
    try {
      console.log(`🏥 Actualizando IPS ${id} con datos:`, data);

      const ips = await prisma.ips.update({
        where: { id },
        data: {
          ...data,
          fecha_actualizacion: new Date()
        },
        include: {
          municipios: true,
          medicos: true,
          gestantes: true
        }
      });

      console.log(`✅ IPS actualizada: ${ips.nombre}`);
      log.info('IPS actualizada', { ipsId: ips.id, nombre: ips.nombre, cambios: data });

      return {
        success: true,
        ips
      };
    } catch (error) {
      console.error('❌ Error actualizando IPS:', error);
      log.error('Error actualizando IPS', { error: error.message, id, data });

      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteIPS(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🏥 Eliminando IPS con ID: ${id}`);

      // Verificar si hay médicos o gestantes asociados
      const asociaciones = await prisma.ips.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              medicos: true,
              gestantes: true
            }
          }
        }
      });

      if (!asociaciones) {
        return {
          success: false,
          error: 'IPS no encontrada'
        };
      }

      if (asociaciones._count.medicos > 0 || asociaciones._count.gestantes > 0) {
        // En lugar de eliminar, desactivar
        await prisma.ips.update({
          where: { id },
          data: {
            activo: false,
            fecha_actualizacion: new Date()
          }
        });

        console.log(`🏥 IPS desactivada (tenía asociaciones): ${asociaciones.nombre}`);
        log.info('IPS desactivada', { 
          ipsId: id, 
          nombre: asociaciones.nombre,
          medicos: asociaciones._count.medicos,
          gestantes: asociaciones._count.gestantes
        });

        return {
          success: true
        };
      }

      // Si no hay asociaciones, eliminar completamente
      await prisma.ips.delete({
        where: { id }
      });

      console.log(`✅ IPS eliminada: ${asociaciones.nombre}`);
      log.info('IPS eliminada', { ipsId: id, nombre: asociaciones.nombre });

      return {
        success: true
      };
    } catch (error) {
      console.error('❌ Error eliminando IPS:', error);
      log.error('Error eliminando IPS', { error: error.message, id });

      return {
        success: false,
        error: error.message
      };
    }
  }

  async getIPSCercanas(coordenadas: [number, number], radioKm: number = 10): Promise<{ success: boolean; ips?: any[]; error?: string }> {
    try {
      console.log(`🏥 Buscando IPS cercanas a coordenadas [${coordenadas[0]}, ${coordenadas[1]}] en radio de ${radioKm}km`);

      // Esta es una consulta simplificada. En producción se usaría PostGIS para consultas geográficas
      const ips = await prisma.ips.findMany({
        where: {
          activo: true,
          municipios: {
            activo: true
          }
        },
        include: {
          municipios: true,
          medicos: {
            where: { activo: true },
            include: { municipios: true }
          },
          _count: {
            select: {
              medicos: true,
              gestantes: true
            }
          }
        }
      });

      // Simular cálculo de distancia (en producción usar PostGIS)
      const ipsConDistancia = ips.map(ipsActual => ({
        ...ipsActual,
        distancia: Math.random() * radioKm // Simulación de distancia
      })).filter(ipsActual => ipsActual.distancia <= radioKm)
        .sort((a, b) => a.distancia - b.distancia);

      console.log(`🏥 Se encontraron ${ipsConDistancia.length} IPS cercanas`);

      return {
        success: true,
        ips: ipsConDistancia
      };
    } catch (error) {
      console.error('❌ Error buscando IPS cercanas:', error);
      log.error('Error buscando IPS cercanas', { error: error.message, coordenadas, radioKm });

      return {
        success: false,
        error: error.message
      };
    }
  }

  async getEstadisticasIPS(): Promise<{ success: boolean; estadisticas?: any; error?: string }> {
    try {
      console.log('🏥 Obteniendo estadísticas de IPS');

      const [total, porNivel, porMunicipio, activas] = await Promise.all([
        prisma.ips.count(),
        
        prisma.ips.groupBy({
          by: ['nivel'],
          _count: { nivel: true }
        }),
        
        prisma.ips.groupBy({
          by: ['municipio_id'],
          _count: { municipio_id: true },
          orderBy: { _count: { municipio_id: 'desc' } },
          take: 10
        }),
        
        prisma.ips.count({
          where: { activo: true }
        })
      ]);

      const estadisticas = {
        total,
        activas,
        inactivas: total - activas,
        por_nivel: porNivel.reduce((acc, item) => {
          acc[item.nivel || 'sin_nivel'] = item._count.nivel;
          return acc;
        }, {}),
        top_municipios: porMunicipio
      };

      console.log('🏥 Estadísticas obtenidas:', estadisticas);

      return {
        success: true,
        estadisticas
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de IPS:', error);
      log.error('Error obteniendo estadísticas de IPS', { error: error.message });

      return {
        success: false,
        error: error.message
      };
    }
  }
}