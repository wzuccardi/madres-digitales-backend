import { ContenidoRepositoryImpl } from '../infrastructure/repositories/contenido.repository.impl';
import {
  CrearContenidoDTO,
  ActualizarContenidoDTO,
  BuscarContenidoDTO,
  ActualizarProgresoDTO,
  ProgresoContenido,
  ContenidoConProgreso,
  EstadisticasContenido,
  EstadisticasUsuario,
} from '../core/application/dtos/contenido.dto';
import { logger } from '../config/logger';
import { NotFoundError } from '../core/domain/errors/not-found.error';

export class ContenidoService {
  private readonly repo = new ContenidoRepositoryImpl();
  /**
   * Crear contenido educativo
   */
  async crearContenido(dto: CrearContenidoDTO, usuarioId: string): Promise<any> {
    try {
      const contenido = await this.repo.crear({
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        tipo: dto.tipo,
        categoria: dto.categoria,
        nivel: dto.nivel,
        archivoUrl: dto.archivoUrl,
        miniaturaUrl: dto.miniaturaUrl,
        duracion: dto.duracion,
        etiquetas: dto.etiquetas,
        destacado: dto.destacado,
        publico: dto.publico,
      });

      logger.info('Contenido educativo creado', { contenidoId: contenido.id });

      return contenido;
    } catch (error: any) {
      logger.error('Error creando contenido', { error, dto });
      throw error;
    }
  }

  /**
   * Obtener contenido por ID
   */
  async obtenerContenido(id: string, usuarioId?: string): Promise<ContenidoConProgreso> {
    try {
      const contenido = await this.repo.obtenerPorId(id);

      if (!contenido) {
        throw new NotFoundError('Contenido no encontrado');
      }

      const contenidoMapped = contenido;

      // Obtener progreso si hay usuario
      if (usuarioId) {
        const progreso = await this.repo.obtenerProgreso(usuarioId, id);

        return {
          ...contenidoMapped,
          progreso: progreso ? this._mapProgreso(progreso) : undefined,
        };
      }

      return contenidoMapped;
    } catch (error: any) {
      logger.error('Error obteniendo contenido', { error, id });
      throw error;
    }
  }

  /**
   * Buscar contenido
   */
  async buscarContenido(
    dto: BuscarContenidoDTO,
    usuarioId?: string
  ): Promise<{ contenidos: ContenidoConProgreso[]; total: number }> {
    try {
      console.log('🔍 ContenidoService.buscarContenido - DTO recibido:', JSON.stringify(dto, null, 2));

      const { contenidos, total } = await this.repo.buscar({
        query: dto.query,
        tipo: dto.tipo,
        categoria: dto.categoria,
        nivel: dto.nivel,
        destacado: dto.destacado,
        publico: dto.publico,
        limit: dto.limit,
        offset: dto.offset,
        orderBy: dto.orderBy,
        orderDir: dto.orderDir as any,
      });

      console.log('✅ Contenidos encontrados:', contenidos.length, 'Total:', total);

      // Obtener progreso si hay usuario
      let contenidosConProgreso: ContenidoConProgreso[] = contenidos as any;

      if (usuarioId) {
        const contenidoIds = contenidos.map((c) => c.id);
        const progresos = await Promise.all(
          contenidoIds.map(async (cid) => {
            const p = await this.repo.obtenerProgreso(usuarioId!, cid);
            return p ? { contenido_id: cid, ...p } : null;
          })
        );

        const progresoMap = new Map(progresos.filter(Boolean).map((p: any) => [p.contenido_id, p]));

        contenidosConProgreso = contenidosConProgreso.map((c) => ({
          ...c,
          progreso: progresoMap.get(c.id),
        }));
      }

      return { contenidos: contenidosConProgreso, total };
    } catch (error: any) {
      logger.error('Error buscando contenido', { error, dto });
      throw error;
    }
  }

  /**
   * Actualizar contenido
   */
  async actualizarContenido(id: string, dto: ActualizarContenidoDTO): Promise<any> {
    try {
      const contenido = await this.repo.actualizar(id, {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        tipo: dto.tipo,
        categoria: dto.categoria,
        nivel: dto.nivel,
        archivoUrl: dto.archivoUrl,
        miniaturaUrl: dto.miniaturaUrl,
        duracion: dto.duracion,
        etiquetas: dto.etiquetas,
        destacado: dto.destacado,
        publico: dto.publico,
      });

      logger.info('Contenido actualizado', { contenidoId: id });

      return this._mapContenido(contenido);
    } catch (error: any) {
      logger.error('Error actualizando contenido', { error, id, dto });
      throw error;
    }
  }

  /**
   * Eliminar contenido
   */
  async eliminarContenido(id: string): Promise<void> {
    try {
      await this.repo.eliminar(id);

      logger.info('Contenido eliminado', { contenidoId: id });
    } catch (error: any) {
      logger.error('Error eliminando contenido', { error, id });
      throw error;
    }
  }

  /**
   * Actualizar progreso de usuario
   */
  async actualizarProgreso(dto: ActualizarProgresoDTO, usuarioId: string): Promise<ProgresoContenido> {
    try {
      const data: any = {
        progreso: dto.progreso,
        completado: dto.completado,
        tiempo_visto: dto.tiempoVisto,
        ultima_posicion: dto.ultimaPosicion,

        favorito: dto.favorito,
        notas: dto.notas,
        updated_at: new Date(),
      };

      if (dto.completado && !data.fecha_completado) {
        data.fecha_completado = new Date();
      }

      const progreso = await this.repo.upsertProgreso(usuarioId, dto.contenidoId, {
        progreso: dto.progreso,
        completado: dto.completado,
        tiempoVisto: dto.tiempoVisto,
        ultimaPosicion: dto.ultimaPosicion,
        favorito: dto.favorito,
        notas: dto.notas,
      });

      logger.info('Progreso actualizado', { usuarioId, contenidoId: dto.contenidoId });

      return this._mapProgreso(progreso);
    } catch (error: any) {
      logger.error('Error actualizando progreso', { error, dto });
      throw error;
    }
  }

  /**
   * Registrar vista
   */
  async registrarVista(contenidoId: string): Promise<void> {
    try {
      await this.repo.registrarVista(contenidoId);

      logger.info('Vista registrada', { contenidoId });
    } catch (error: any) {
      logger.error('Error registrando vista', { error, contenidoId });
      throw error;
    }
  }

  /**
   * Registrar descarga
   */
  async registrarDescarga(contenidoId: string): Promise<void> {
    try {
      await this.repo.registrarDescarga(contenidoId);

      logger.info('Descarga registrada', { contenidoId });
    } catch (error: any) {
      logger.error('Error registrando descarga', { error, contenidoId });
      throw error;
    }
  }

  /**
   * Calificar contenido
   */
  async calificarContenido(contenidoId: string, calificacion: number, usuarioId: string): Promise<void> {
    try {
      // Actualizar progreso con calificación
      await this.actualizarProgreso({ contenidoId, calificacion }, usuarioId);

      // Recalcular calificación promedio
      const progresos = await this.repo.obtenerProgresosCompletados(contenidoId);

      const totalVotos = progresos.length;
      // Calificación simplificada - por ahora solo contamos los votos
      const promedioCalificacion = totalVotos;

      await this.repo.actualizarMetadata(contenidoId);

      logger.info('Contenido calificado', { contenidoId, calificacion });
    } catch (error: any) {
      logger.error('Error calificando contenido', { error, contenidoId });
      throw error;
    }
  }

  /**
   * Obtener estadísticas generales
   */
  async obtenerEstadisticas(): Promise<EstadisticasContenido> {
    try {
      const [totalContenidos, contenidos] = await Promise.all([
        prisma.contenido.count(),
        prisma.contenido.findMany({
          select: {
            tipo: true,
            categoria: true,
            duracion_minutos: true,
            semana_gestacion_inicio: true,
            tags: true,
          },
        }),
      ]);

      const porTipo: any = {};
      const porCategoria: any = {};
      let totalduracion_minutos = 0;
      let totalsemana_gestacion_inicio = 0;
      let sumatagses = 0;
      let totalCalificados = 0;

      contenidos.forEach((c) => {
        porTipo[c.tipo] = (porTipo[c.tipo] || 0) + 1;
        porCategoria[c.categoria] = (porCategoria[c.categoria] || 0) + 1;
        totalduracion_minutos += c.duracion_minutos;
        totalsemana_gestacion_inicio += c.semana_gestacion_inicio;
        if (c.tags) {
          // sumatagses += c.tags; // Field not in schema
          totalCalificados++;
        }
      });

      const promediotags = totalCalificados > 0 ? sumatagses / totalCalificados : 0;

      return {
        total: totalContenidos,
        activos: totalContenidos,
        inactivos: 0,
        porTipo: Object.entries(porTipo).map(([tipo, cantidad]) => ({ tipo, cantidad: Number(cantidad) })),
        porCategoria: Object.entries(porCategoria).map(([categoria, cantidad]) => ({ categoria, cantidad: Number(cantidad) })),
        porNivel: [],
        porSemanaGestacion: [],
        totalArchivos: totalContenidos,
        tamañoTotalArchivos: 0,
        ultimosContenidos: [],
        contenidoMasVisto: null,
        contenidoMejorCalificado: null,
        contenidoMasDescargado: null,
        estadisticasPorMes: [],
      };
    } catch (error: any) {
      logger.error('Error obteniendo estadísticas', { error });
      throw error;
    }
  }

  // Métodos auxiliares privados
  private _mapProgreso(progreso: any): any {
    return {
      id: progreso.id,
      usuario_id: progreso.usuario_id,
      contenido_id: progreso.contenido_id,
      completado: progreso.completado,
      progreso_porcentaje: progreso.progreso || 0,
      tiempo_visto: progreso.tiempo_visto,
      ultima_posicion: progreso.ultima_posicion,
      fecha_inicio: progreso.fecha_inicio,
      fecha_completado: progreso.fecha_completado,
      created_at: progreso.created_at,
      updated_at: progreso.updated_at,
    };
  }
}

