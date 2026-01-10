import { Gestante, CreateGestanteData, UpdateGestanteData, GestanteFilters, GestanteStats, GestanteSummary } from '../../../domain/entities/gestante.entity';
import { IGestanteRepository } from '../../../domain/repositories/gestante.repository.interface';
import { Database } from '../../../core/database';
import { ConflictError, NotFoundError } from '../../../core/errors/app-error';
import { logger } from '../../../core/utils/logger';

export class GestanteRepositoryImpl implements IGestanteRepository {
  private db = Database.getInstance();

  async findById(id: string): Promise<Gestante | null> {
    try {
      const gestante = await this.db.gestantes.findUnique({
        where: { id },
        include: {
          municipios: {
            select: {
              id: true,
              nombre: true,
              departamento: true,
            },
          },
          madrina: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
            },
          },
          medico_tratante: {
            select: {
              id: true,
              nombre: true,
              especialidad: true,
              telefono: true,
            },
          },
          ips_asignada: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
              direccion: true,
            },
          },
        },
      });

      if (!gestante) {
        return null;
      }

      return this.mapToDomain(gestante);
    } catch (error) {
      logger.error('Error finding gestante by ID:', error);
      throw new Error('Database error when finding gestante by ID');
    }
  }

  async findByMadrinaId(madrinaId: string): Promise<Gestante[]> {
    try {
      const gestantes = await this.db.gestantes.findMany({
        where: { madrina_id: madrinaId },
        include: {
          municipios: {
            select: {
              id: true,
              nombre: true,
              departamento: true,
            },
          },
          madrina: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
            },
          },
          medico_tratante: {
            select: {
              id: true,
              nombre: true,
              especialidad: true,
              telefono: true,
            },
          },
          ips_asignada: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
              direccion: true,
            },
          },
        },
        orderBy: {
          fecha_creacion: 'desc',
        },
      });

      return gestantes.map(gestante => this.mapToDomain(gestante));
    } catch (error) {
      logger.error('Error finding gestantes by madrina ID:', error);
      throw new Error('Database error when finding gestantes by madrina ID');
    }
  }

  async create(gestanteData: CreateGestanteData): Promise<Gestante> {
    try {
      // Calcular fecha probable de parto si no se proporciona
      let probableDelivery = gestanteData.probableDelivery;
      if (!probableDelivery && gestanteData.lastMenstruation) {
        probableDelivery = new Date(gestanteData.lastMenstruation.getTime() + (280 * 24 * 60 * 60 * 1000));
      }

      const gestante = await this.db.gestantes.create({
        data: {
          id: this.generateId(),
          nombre: gestanteData.name,
          documento: gestanteData.document,
          tipo_documento: gestanteData.documentType || 'cedula',
          fecha_nacimiento: gestanteData.birthDate,
          telefono: gestanteData.phone,
          direccion: gestanteData.address,
          coordenadas: gestanteData.coordinates,
          fecha_ultima_menstruacion: gestanteData.lastMenstruation,
          fecha_probable_parto: probableDelivery,
          eps: gestanteData.eps,
          regimen_salud: gestanteData.healthRegime,
          municipio_id: gestanteData.municipalityId,
          madrina_id: gestanteData.madrinaId,
          medico_tratante_id: gestanteData.medicoTratanteId,
          ips_asignada_id: gestanteData.ipsAsignadaId,
          activa: true,
          riesgo_alto: false,
          fecha_creacion: new Date(),
        },
        include: {
          municipios: {
            select: {
              id: true,
              nombre: true,
              departamento: true,
            },
          },
          madrina: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
            },
          },
          medico_tratante: {
            select: {
              id: true,
              nombre: true,
              especialidad: true,
              telefono: true,
            },
          },
          ips_asignada: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
              direccion: true,
            },
          },
        },
      });

      logger.info(`Gestante created: ${gestante.nombre} with ID ${gestante.id}`);
      return this.mapToDomain(gestante);
    } catch (error) {
      logger.error('Error creating gestante:', error);
      if (error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Database error when creating gestante');
    }
  }

  async update(id: string, gestanteData: UpdateGestanteData): Promise<Gestante> {
    try {
      // Verificar si la gestante existe
      const existingGestante = await this.findById(id);
      if (!existingGestante) {
        throw new NotFoundError('Gestante', id);
      }

      const gestante = await this.db.gestantes.update({
        where: { id },
        data: {
          ...(gestanteData.name && { nombre: gestanteData.name }),
          ...(gestanteData.phone && { telefono: gestanteData.phone }),
          ...(gestanteData.address && { direccion: gestanteData.address }),
          ...(gestanteData.coordinates && { coordenadas: gestanteData.coordinates }),
          ...(gestanteData.eps && { eps: gestanteData.eps }),
          ...(gestanteData.healthRegime && { regimen_salud: gestanteData.healthRegime }),
          ...(gestanteData.municipalityId && { municipio_id: gestanteData.municipalityId }),
          ...(gestanteData.madrinaId && { madrina_id: gestanteData.madrinaId }),
          ...(gestanteData.medicoTratanteId && { medico_tratante_id: gestanteData.medicoTratanteId }),
          ...(gestanteData.ipsAsignadaId && { ips_asignada_id: gestanteData.ipsAsignadaId }),
          ...(gestanteData.active !== undefined && { activa: gestanteData.active }),
          ...(gestanteData.highRisk !== undefined && { riesgo_alto: gestanteData.highRisk }),
          fecha_actualizacion: new Date(),
        },
        include: {
          municipios: {
            select: {
              id: true,
              nombre: true,
              departamento: true,
            },
          },
          madrina: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
            },
          },
          medico_tratante: {
            select: {
              id: true,
              nombre: true,
              especialidad: true,
              telefono: true,
            },
          },
          ips_asignada: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
              direccion: true,
            },
          },
        },
      });

      logger.info(`Gestante updated: ${gestante.nombre} with ID ${gestante.id}`);
      return this.mapToDomain(gestante);
    } catch (error) {
      logger.error('Error updating gestante:', error);
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Database error when updating gestante');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Verificar si la gestante existe
      const existingGestante = await this.findById(id);
      if (!existingGestante) {
        throw new NotFoundError('Gestante', id);
      }

      await this.db.gestantes.delete({
        where: { id },
      });

      logger.info(`Gestante deleted: ${id}`);
    } catch (error) {
      logger.error('Error deleting gestante:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Database error when deleting gestante');
    }
  }

  async findMany(filters?: GestanteFilters): Promise<Gestante[]> {
    try {
      const where: any = {};

      if (filters?.madrinaId) {
        where.madrina_id = filters.madrinaId;
        logger.info(`🔍 REPOSITORY: Aplicando filtro madrina_id = ${filters.madrinaId}`);
      }

      if (filters?.medicoTratanteId) {
        where.medico_tratante_id = filters.medicoTratanteId;
      }

      if (filters?.municipalityId) {
        where.municipio_id = filters.municipalityId;
      }

      if (filters?.active !== undefined) {
        where.activa = filters.active;
      }

      if (filters?.highRisk !== undefined) {
        where.riesgo_alto = filters.highRisk;
      }

      if (filters?.search) {
        where.OR = [
          { nombre: { contains: filters.search, mode: 'insensitive' } },
          { documento: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const gestantes = await this.db.gestantes.findMany({
        where,
        include: {
          municipios: {
            select: {
              id: true,
              nombre: true,
              departamento: true,
            },
          },
          madrina: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
            },
          },
          medico_tratante: {
            select: {
              id: true,
              nombre: true,
              especialidad: true,
              telefono: true,
            },
          },
          ips_asignada: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
              direccion: true,
            },
          },
        },
        ...(filters?.page && filters?.limit && {
          skip: (filters.page - 1) * filters.limit,
          take: filters.limit,
        }),
        orderBy: {
          fecha_creacion: 'desc',
        },
      });

      return gestantes.map(gestante => this.mapToDomain(gestante));
    } catch (error) {
      logger.error('Error finding gestantes:', error);
      throw new Error('Database error when finding gestantes');
    }
  }

  async count(filters?: GestanteFilters): Promise<number> {
    try {
      const where: any = {};

      if (filters?.madrinaId) {
        where.madrina_id = filters.madrinaId;
      }

      if (filters?.medicoTratanteId) {
        where.medico_tratante_id = filters.medicoTratanteId;
      }

      if (filters?.municipalityId) {
        where.municipio_id = filters.municipalityId;
      }

      if (filters?.active !== undefined) {
        where.activa = filters.active;
      }

      if (filters?.highRisk !== undefined) {
        where.riesgo_alto = filters.highRisk;
      }

      if (filters?.search) {
        where.OR = [
          { nombre: { contains: filters.search, mode: 'insensitive' } },
          { documento: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      return await this.db.gestantes.count({ where });
    } catch (error) {
      logger.error('Error counting gestantes:', error);
      throw new Error('Database error when counting gestantes');
    }
  }

  async findActiveGestantes(): Promise<Gestante[]> {
    try {
      const gestantes = await this.db.gestantes.findMany({
        where: { activa: true },
        include: {
          municipios: {
            select: {
              id: true,
              nombre: true,
              departamento: true,
            },
          },
          madrina: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
            },
          },
          medico_tratante: {
            select: {
              id: true,
              nombre: true,
              especialidad: true,
              telefono: true,
            },
          },
          ips_asignada: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
              direccion: true,
            },
          },
        },
        orderBy: {
          fecha_creacion: 'desc',
        },
      });

      return gestantes.map(gestante => this.mapToDomain(gestante));
    } catch (error) {
      logger.error('Error finding active gestantes:', error);
      throw new Error('Database error when finding active gestantes');
    }
  }

  async findHighRiskGestantes(): Promise<Gestante[]> {
    try {
      const gestantes = await this.db.gestantes.findMany({
        where: { riesgo_alto: true, activa: true },
        include: {
          municipios: {
            select: {
              id: true,
              nombre: true,
              departamento: true,
            },
          },
          madrina: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
            },
          },
          medico_tratante: {
            select: {
              id: true,
              nombre: true,
              especialidad: true,
              telefono: true,
            },
          },
          ips_asignada: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
              direccion: true,
            },
          },
        },
        orderBy: {
          fecha_creacion: 'desc',
        },
      });

      return gestantes.map(gestante => this.mapToDomain(gestante));
    } catch (error) {
      logger.error('Error finding high risk gestantes:', error);
      throw new Error('Database error when finding high risk gestantes');
    }
  }

  async searchGestantes(query: string, filters?: GestanteFilters): Promise<Gestante[]> {
    return this.findMany({
      ...filters,
      search: query,
    });
  }

  async getStats(filters?: GestanteFilters): Promise<GestanteStats> {
    try {
      const where: any = {};

      if (filters?.madrinaId) {
        where.madrina_id = filters.madrinaId;
      }

      if (filters?.medicoTratanteId) {
        where.medico_tratante_id = filters.medicoTratanteId;
      }

      if (filters?.municipalityId) {
        where.municipio_id = filters.municipalityId;
      }

      if (filters?.active !== undefined) {
        where.activa = filters.active;
      }

      if (filters?.highRisk !== undefined) {
        where.riesgo_alto = filters.highRisk;
      }

      const [total, active, highRisk] = await Promise.all([
        this.db.gestantes.count({ where }),
        this.db.gestantes.count({ where: { ...where, activa: true } }),
        this.db.gestantes.count({ where: { ...where, riesgo_alto: true } }),
      ]);

      // Estadísticas por madrina
      const gestantesByMadrina = await this.db.gestantes.groupBy({
        by: ['madrina_id'],
        where,
        _count: {
          id: true,
        },
      });

      const byMadrina = gestantesByMadrina.reduce((acc, group) => {
        acc[group.madrina_id] = group._count.id;
        return acc;
      }, {});

      // Estadísticas por municipio
      const gestantesByMunicipality = await this.db.gestantes.groupBy({
        by: ['municipio_id'],
        where,
        _count: {
          id: true,
        },
      });

      const byMunicipality = gestantesByMunicipality.reduce((acc, group) => {
        acc[group.municipio_id] = group._count.id;
        return acc;
      }, {});

      // Estadísticas por régimen de salud
      const gestantesByHealthRegime = await this.db.gestantes.groupBy({
        by: ['regimen_salud'],
        where,
        _count: {
          id: true,
        },
      });

      const byHealthRegime = gestantesByHealthRegime.reduce((acc, group) => {
        acc[group.regimen_salud] = group._count.id;
        return acc;
      }, {});

      return {
        total,
        active,
        highRisk,
        byMadrina,
        byMunicipality,
        byHealthRegime,
      };
    } catch (error) {
      logger.error('Error getting gestante stats:', error);
      throw new Error('Database error when getting gestante stats');
    }
  }

  async getGestanteSummary(id: string): Promise<GestanteSummary | null> {
    try {
      const gestante = await this.findById(id);
      if (!gestante) {
        return null;
      }

      // Calcular edad y semanas de gestación
      const now = new Date();
      const age = Math.floor((now.getTime() - gestante.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      let weeksGestation = 0;

      if (gestante.lastMenstruation) {
        const weeksSinceLastMenstruation = Math.floor((now.getTime() - gestante.lastMenstruation.getTime()) / (7 * 24 * 60 * 60 * 1000));
        weeksGestation = weeksSinceLastMenstruation;
      } else if (gestante.probableDelivery) {
        const weeksUntilDelivery = Math.floor((gestante.probableDelivery.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000));
        weeksGestation = 40 - weeksUntilDelivery; // Aproximadamente 40 semanas
      }

      return {
        id: gestante.id,
        name: gestante.name,
        age,
        weeksGestation,
        highRisk: gestante.highRisk,
        madrinaName: gestante.madrina?.nombre,
        medicoName: gestante.medicoTratante?.nombre,
        epsName: gestante.eps,
        municipalityName: gestante.municipality?.nombre,
      };
    } catch (error) {
      logger.error('Error getting gestante summary:', error);
      throw new Error('Database error when getting gestante summary');
    }
  }

  async updateRiskStatus(id: string, highRisk: boolean): Promise<void> {
    try {
      await this.db.gestantes.update({
        where: { id },
        data: {
          riesgo_alto: highRisk,
          fecha_actualizacion: new Date(),
        },
      });

      logger.info(`Gestante risk status updated: ${id} to ${highRisk ? 'high' : 'normal'} risk`);
    } catch (error) {
      logger.error('Error updating gestante risk status:', error);
      throw new Error('Database error when updating gestante risk status');
    }
  }

  async assignMadrina(gestanteId: string, madrinaId: string): Promise<void> {
    try {
      await this.db.gestantes.update({
        where: { id },
        data: {
          madrina_id: madrinaId,
          fecha_actualizacion: new Date(),
        },
      });

      logger.info(`Madrina assigned to gestante: ${gestanteId} -> ${madrinaId}`);
    } catch (error) {
      logger.error('Error assigning madrina to gestante:', error);
      throw new Error('Database error when assigning madrina to gestante');
    }
  }

  async assignMedico(gestanteId: string, medicoId: string): Promise<void> {
    try {
      await this.db.gestantes.update({
        where: { id },
        data: {
          medico_tratante_id: medicoId,
          fecha_actualizacion: new Date(),
        },
      });

      logger.info(`Medico assigned to gestante: ${gestanteId} -> ${medicoId}`);
    } catch (error) {
      logger.error('Error assigning medico to gestante:', error);
      throw new Error('Database error when assigning medico to gestante');
    }
  }

  async unassignMadrina(gestanteId: string): Promise<void> {
    try {
      await this.db.gestantes.update({
        where: { id },
        data: {
          madrina_id: null,
          fecha_actualizacion: new Date(),
        },
      });

      logger.info(`Madrina unassigned from gestante: ${gestanteId}`);
    } catch (error) {
      logger.error('Error unassigning madrina from gestante:', error);
      throw new Error('Database error when unassigning madrina from gestante');
    }
  }

  async unassignMedico(gestanteId: string): Promise<void> {
    try {
      await this.db.gestantes.update({
        where: { id },
        data: {
          medico_tratante_id: null,
          fecha_actualizacion: new Date(),
        },
      });

      logger.info(`Medico unassigned from gestante: ${gestanteId}`);
    } catch (error) {
      logger.error('Error unassigning medico from gestante:', error);
      throw new Error('Database error when unassigning medico from gestante');
    }
  }

  async findByMunicipality(municipalityId: string): Promise<Gestante[]> {
    try {
      const gestantes = await this.db.gestantes.findMany({
        where: { municipio_id: municipalityId },
        include: {
          municipios: {
            select: {
              id: true,
              nombre: true,
              departamento: true,
            },
          },
          madrina: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
            },
          },
          medico_tratante: {
            select: {
              id: true,
              nombre: true,
              especialidad: true,
              telefono: true,
            },
          },
          ips_asignada: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
              direccion: true,
            },
          },
        },
        orderBy: {
          fecha_creacion: 'desc',
        },
      });

      return gestantes.map(gestante => this.mapToDomain(gestante));
    } catch (error) {
      logger.error('Error finding gestantes by municipality:', error);
      throw new Error('Database error when finding gestantes by municipality');
    }
  }

  async findByHealthRegime(healthRegime: string): Promise<Gestante[]> {
    try {
      const gestantes = await this.db.gestantes.findMany({
        where: { regimen_salud: healthRegime },
        include: {
          municipios: {
            select: {
              id: true,
              nombre: true,
              departamento: true,
            },
          },
          madrina: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
            },
          },
          medico_tratante: {
            select: {
              id: true,
              nombre: true,
              especialidad: true,
              telefono: true,
            },
          },
          ips_asignada: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
              direccion: true,
            },
          },
        },
        orderBy: {
          fecha_creacion: 'desc',
        },
      });

      return gestantes.map(gestante => this.mapToDomain(gestante));
    } catch (error) {
      logger.error('Error finding gestantes by health regime:', error);
      throw new Error('Database error when finding gestantes by health regime');
    }
  }

  async getGestantesByAgeRange(minAge: number, maxAge: number): Promise<Gestante[]> {
    try {
      const now = new Date();
      const minBirthDate = new Date(now.getFullYear() - maxAge, now.getMonth(), now.getDate());
      const maxBirthDate = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());

      const gestantes = await this.db.gestantes.findMany({
        where: {
          fecha_nacimiento: {
            gte: minBirthDate,
            lte: maxBirthDate,
          },
        },
        include: {
          municipios: {
            select: {
              id: true,
              nombre: true,
              departamento: true,
            },
          },
          madrina: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
            },
          },
          medico_tratante: {
            select: {
              id: true,
              nombre: true,
              especialidad: true,
              telefono: true,
            },
          },
          ips_asignada: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
              direccion: true,
            },
          },
        },
        orderBy: {
          fecha_nacimiento: 'asc',
        },
      });

      return gestantes.map(gestante => this.mapToDomain(gestante));
    } catch (error) {
      logger.error('Error finding gestantes by age range:', error);
      throw new Error('Database error when finding gestantes by age range');
    }
  }

  async getGestantesByWeeksGestation(weeksMin: number, weeksMax: number): Promise<Gestante[]> {
    try {
      const now = new Date();
      const gestantes = await this.db.gestantes.findMany({
        where: {
          fecha_probable_parto: {
            gte: new Date(now.getTime() - (weeksMax * 7 * 24 * 60 * 60 * 1000)),
            lte: new Date(now.getTime() - (weeksMin * 7 * 24 * 60 * 60 * 1000)),
          },
        },
        include: {
          municipios: {
            select: {
              id: true,
              nombre: true,
              departamento: true,
            },
          },
          madrina: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
            },
          },
          medico_tratante: {
            select: {
              id: true,
              nombre: true,
              especialidad: true,
              telefono: true,
            },
          },
          ips_asignada: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
              direccion: true,
            },
          },
        },
        orderBy: {
          fecha_probable_parto: 'asc',
        },
      });

      return gestantes.map(gestante => this.mapToDomain(gestante));
    } catch (error) {
      logger.error('Error finding gestantes by weeks gestation:', error);
      throw new Error('Database error when finding gestantes by weeks gestation');
    }
  }

  async updateLastControl(id: string, controlDate: Date): Promise<void> {
    try {
      // Aquí podríamos actualizar un campo de último control en la tabla de gestantes
      // o en una tabla separada de controles
      logger.info(`Last control updated for gestante: ${id} -> ${controlDate}`);
    } catch (error) {
      logger.error('Error updating last control:', error);
      throw new Error('Database error when updating last control');
    }
  }

  async getNextControls(days: number): Promise<Array<{ gestanteId: string; gestanteName: string; nextControl: Date; }>> {
    try {
      // Esta es una implementación básica, podría mejorarse con una tabla de controles
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const gestantes = await this.db.gestantes.findMany({
        where: {
          activa: true,
          // Solo gestantes que necesiten control pronto
          OR: [
            {
              fecha_probable_parto: {
                lte: futureDate,
              },
            },
            {
              // O si no tienen fecha probable, usar las que tienen control reciente
              NOT: {
                control_prenatal: {
                  some: {
                    fecha_control: {
                      gte: new Date(futureDate.getTime() - (30 * 24 * 60 * 60 * 1000)),
                    },
                  },
                },
              },
            },
          ],
        },
        select: {
          id: true,
          nombre: true,
          fecha_probable_parto: true,
        },
        orderBy: {
          fecha_probable_parto: 'asc',
        },
        take: 50, // Limitar para no sobrecargar
      });

      return gestantes.map(gestante => ({
        gestanteId: gestante.id,
        gestanteName: gestante.nombre,
        nextControl: gestante.fecha_probable_parto || futureDate,
      }));
    } catch (error) {
      logger.error('Error getting next controls:', error);
      throw new Error('Database error when getting next controls');
    }
  }

  async findNearbyGestantes(latitud: number, longitud: number, radioKm: number, limit: number): Promise<Array<{ id: string; distancia_metros: number }>> {
    const radioMetros = radioKm * 1000;
    const rows = await (this.db as any).$queryRaw<any[]>`
      SELECT
        g.id,
        ST_Distance(
          g.coordenadas::geography,
          ST_SetSRID(ST_MakePoint(${longitud}, ${latitud}), 4326)::geography
        ) as distancia_metros
      FROM "Gestante" g
      WHERE g.coordenadas IS NOT NULL
      AND g.activa = true
      AND ST_DWithin(
        g.coordenadas::geography,
        ST_SetSRID(ST_MakePoint(${longitud}, ${latitud}), 4326)::geography,
        ${radioMetros}
      )
      ORDER BY distancia_metros ASC
      LIMIT ${limit}
    `;
    return rows.map(r => ({ id: r.id, distancia_metros: Number(r.distancia_metros) }));
  }

  private mapToDomain(prismaGestante: any): Gestante {
    return {
      id: prismaGestante.id,
      name: prismaGestante.nombre,
      document: prismaGestante.documento,
      documentType: prismaGestante.tipo_documento,
      birthDate: prismaGestante.fecha_nacimiento,
      phone: prismaGestante.telefono,
      address: prismaGestante.direccion,
      coordinates: prismaGestante.coordenadas,
      lastMenstruation: prismaGestante.fecha_ultima_menstruacion,
      probableDelivery: prismaGestante.fecha_probable_parto,
      eps: prismaGestante.eps,
      healthRegime: prismaGestante.regimen_salud,
      municipalityId: prismaGestante.municipio_id,
      madrinaId: prismaGestante.madrina_id,
      medicoTratanteId: prismaGestante.medico_tratante_id,
      ipsAsignadaId: prismaGestante.ips_asignada_id,
      active: prismaGestante.activa,
      highRisk: prismaGestante.riesgo_alto,
      createdAt: prismaGestante.fecha_creacion,
      updatedAt: prismaGestante.fecha_actualizacion,
    };
  }

  private generateId(): string {
    return `gestante_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}