import prisma from '../config/database';
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
  /**
   * Crear contenido educativo
   */
  async crearContenido(dto: CrearContenidoDTO, usuarioId: string): Promise<any> {
    try {
      const contenido = await prisma.contenido.create({
        data: {
          titulo: dto.titulo,
          descripcion: dto.descripcion,
          tipo: dto.tipo,
          categoria: dto.categoria,
          nivel: dto.nivel || 'basico',
          url_contenido: dto.archivoUrl,
          // archivo_nombre: dto.archivoNombre || 'archivo', // Field not in schema
          // archivo_tipo: dto.archivoTipo || 'application/octet-stream', // Field not in schema
          // archivo_tamano: dto.archivoTamano || 0, // Field not in schema
          url_imagen: dto.miniaturaUrl,
          duracion_minutos: dto.duracion,
          tags: dto.etiquetas || [],
          destacado: dto.destacado || false,
          activo: dto.publico !== undefined ? dto.publico : true,
        },
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
      const contenido = await prisma.contenido.findUnique({
        where: { id },
      });

      if (!contenido) {
        throw new NotFoundError('Contenido no encontrado');
      }

      const contenidoMapped = this._mapContenido(contenido);

      // Obtener progreso si hay usuario
      if (usuarioId) {
        const progreso = await prisma.progresoContenido.findUnique({
          where: {
            usuario_id_contenido_id: {
              usuario_id: usuarioId,
              contenido_id: id,
            },
          },
        });

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

      const where: any = {};

      if (dto.query) {
        where.OR = [
          { titulo: { contains: dto.query, mode: 'insensitive' } },
          { descripcion: { contains: dto.query, mode: 'insensitive' } },
          { autor: { contains: dto.query, mode: 'insensitive' } },
        ];
      }

      if (dto.tipo) where.tipo = dto.tipo;
      if (dto.categoria) where.categoria = dto.categoria;
      if (dto.nivel) where.nivel = dto.nivel;
      if (dto.destacado !== undefined) where.destacado = dto.destacado;
      if (dto.publico !== undefined) where.publico = dto.publico;

      console.log('🔍 Where clause:', JSON.stringify(where, null, 2));

      const orderBy: any = {};
      
      // Mapear nombres de campos si es necesario
      const fieldMap: any = {
        'created_at': 'fecha_creacion',
        'updated_at': 'fecha_actualizacion',
        'titulo': 'titulo',
        'vistas': 'vistas',
        'calificacion': 'calificacion',
        'orden': 'orden'
      };
      
      // Usar el campo mapeado si existe
      const actualField = fieldMap[dto.orderBy] || dto.orderBy;
      orderBy[actualField] = dto.orderDir;

      console.log('🔍 Query params:', { where, orderBy, take: dto.limit, skip: dto.offset });

      const [contenidos, total] = await Promise.all([
        prisma.contenido.findMany({
          where,
          orderBy,
          take: dto.limit,
          skip: dto.offset,
        }),
        prisma.contenido.count({ where }),
      ]);

      console.log('✅ Contenidos encontrados:', contenidos.length, 'Total:', total);

      if (contenidos.length > 0) {
        console.log('📄 Primer contenido:', JSON.stringify(contenidos[0], null, 2));
      }

      // Obtener progreso si hay usuario
      let contenidosConProgreso: ContenidoConProgreso[] = contenidos.map(this._mapContenido);

      if (usuarioId) {
        const contenidoIds = contenidos.map((c) => c.id);
        const progresos = await prisma.progresoContenido.findMany({
          where: {
            usuario_id: usuarioId,
            contenido_id: { in: contenidoIds },
          },
        });

        const progresoMap = new Map(progresos.map((p) => [p.contenido_id, this._mapProgreso(p)]));

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
      const contenido = await prisma.contenido.update({
        where: { id },
        data: {
          titulo: dto.titulo,
          descripcion: dto.descripcion,
          tipo: dto.tipo,
          categoria: dto.categoria,
          nivel: dto.nivel,
          url_contenido: dto.archivoUrl,
          // archivo_nombre: dto.archivoNombre, // Field not in schema
          // archivo_tipo: dto.archivoTipo, // Field not in schema
          // archivo_tamano: dto.archivoTamano, // Field not in schema
          url_imagen: dto.miniaturaUrl,
          duracion_minutos: dto.duracion,
          tags: dto.etiquetas,
          destacado: dto.destacado,
          activo: dto.publico,
        },
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
      await prisma.contenido.delete({
        where: { id },
      });

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

      const progreso = await prisma.progresoContenido.upsert({
        where: {
          usuario_id_contenido_id: {
            usuario_id: usuarioId,
            contenido_id: dto.contenidoId,
          },
        },
        create: {
          usuario_id: usuarioId,
          contenido_id: dto.contenidoId,
          ...data,
        },
        update: data,
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
      await prisma.contenido.update({
        where: { id: contenidoId },
        data: {
          duracion_minutos: { increment: 1 },
        },
      });

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
      await prisma.contenido.update({
        where: { id: contenidoId },
        data: {
          semana_gestacion_inicio: { increment: 1 },
        },
      });

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
      const progresos = await prisma.progresoContenido.findMany({
        where: {
          contenido_id: contenidoId,
          completado: true,
        },
        select: { id: true },
      });

      const totalVotos = progresos.length;
      // Calificación simplificada - por ahora solo contamos los votos
      const promedioCalificacion = totalVotos;

      await prisma.contenido.update({
        where: { id: contenidoId },
        data: {
          // Actualizar campos disponibles en el schema
          fecha_actualizacion: new Date(),
        },
      });

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
  private _mapContenido(contenido: any): any {
    return {
      id: contenido.id,
      titulo: contenido.titulo,
      descripcion: contenido.descripcion,
      tipo: contenido.tipo,
      categoria: contenido.categoria,
      nivel: contenido.nivel,
      archivo_url: contenido.url_contenido,
      miniatura_url: contenido.url_imagen,
      duracion: contenido.duracion_minutos,
      autor_id: contenido.autor_id,
      etiquetas: contenido.tags,
      publico: contenido.activo,
      destacado: contenido.destacado,
      duracion_minutos: contenido.duracion_minutos,
      semana_gestacion_inicio: contenido.semana_gestacion_inicio,
      tags_promedio: contenido.tags,
      created_at: contenido.fecha_creacion,
      updated_at: contenido.fecha_actualizacion,
    };
  }

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

