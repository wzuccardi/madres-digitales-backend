import { log } from '../config/logger';
import { IpsRepositoryImpl } from '../infrastructure/repositories/ips.repository.impl';

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
  private readonly repo = new IpsRepositoryImpl();
  constructor() {
    console.log('🏥 IPSService initialized');
  }

  async createIPS(data: CreateIPSData): Promise<{ success: boolean; ips?: any; error?: string }> {
    try {
      console.log('🏥 Creando IPS:', data);

      const ips = await this.repo.create(data);

      console.log(`✅ IPS creada con ID: ${ips.id}`);
      log.info('IPS creada', { ipsId: ips.id, nombre: ips.nombre });

      return { success: true, ips };
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

      const { ips, total } = await this.repo.findMany(filtros);

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

      const ips = await this.repo.findById(id);

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

      const ips = await this.repo.update(id, data);

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
      await this.repo.deleteOrDeactivate(id);
      return { success: true };
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
      const ipsConDistancia = await this.repo.findNearby(coordenadas[0], coordenadas[1], radioKm);
      return { success: true, ips: ipsConDistancia };
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

      const stats = await this.repo.stats();
      const estadisticas = {
        total: stats.total,
        activas: stats.activas,
        inactivas: stats.total - stats.activas,
        por_nivel: stats.porNivel,
        top_municipios: stats.topMunicipios,
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