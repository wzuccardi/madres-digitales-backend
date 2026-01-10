import { Database } from '../../core/database';
import { IContenidoRepository, CrearContenidoData, ActualizarContenidoData, BuscarContenidoFilters, ProgresoRecord, ProgresoUpdateData, ContenidoRecord } from '../../domain/repositories/contenido.repository.interface';

export class ContenidoRepositoryImpl implements IContenidoRepository {
  private db = Database.getInstance();

  async crear(data: CrearContenidoData): Promise<ContenidoRecord> {
    const contenido = await (this.db as any).contenido.create({
      data: {
        titulo: data.titulo,
        descripcion: data.descripcion,
        tipo: data.tipo,
        categoria: data.categoria,
        nivel: data.nivel || 'basico',
        url_contenido: data.archivoUrl,
        url_imagen: data.miniaturaUrl,
        duracion_minutos: data.duracion,
        tags: data.etiquetas || [],
        destacado: data.destacado || false,
        activo: data.publico !== undefined ? data.publico : true,
      },
    });
    return this.mapContenido(contenido);
  }

  async obtenerPorId(id: string): Promise<ContenidoRecord | null> {
    const contenido = await (this.db as any).contenido.findUnique({ where: { id } });
    return contenido ? this.mapContenido(contenido) : null;
  }

  async buscar(filters: BuscarContenidoFilters): Promise<{ contenidos: ContenidoRecord[]; total: number }> {
    const where: any = {};
    if (filters.query) {
      where.OR = [
        { titulo: { contains: filters.query, mode: 'insensitive' } },
        { descripcion: { contains: filters.query, mode: 'insensitive' } },
        { autor: { contains: filters.query, mode: 'insensitive' } },
      ];
    }
    if (filters.tipo) where.tipo = filters.tipo;
    if (filters.categoria) where.categoria = filters.categoria;
    if (filters.nivel) where.nivel = filters.nivel;
    if (filters.destacado !== undefined) where.destacado = filters.destacado;
    if (filters.publico !== undefined) where.publico = filters.publico;

    const orderBy: any = {};
    const fieldMap: any = {
      'created_at': 'fecha_creacion',
      'updated_at': 'fecha_actualizacion',
      'titulo': 'titulo',
      'vistas': 'vistas',
      'calificacion': 'calificacion',
      'orden': 'orden'
    };
    const actualField = fieldMap[filters.orderBy || 'fecha_creacion'] || filters.orderBy || 'fecha_creacion';
    orderBy[actualField] = filters.orderDir || 'desc';

    const [contenidos, total] = await Promise.all([
      (this.db as any).contenido.findMany({
        where,
        orderBy,
        take: filters.limit,
        skip: filters.offset,
      }),
      (this.db as any).contenido.count({ where }),
    ]);

    return { contenidos: contenidos.map(this.mapContenido), total };
  }

  async actualizar(id: string, data: ActualizarContenidoData): Promise<ContenidoRecord> {
    const contenido = await (this.db as any).contenido.update({
      where: { id },
      data: {
        titulo: data.titulo,
        descripcion: data.descripcion,
        tipo: data.tipo,
        categoria: data.categoria,
        nivel: data.nivel,
        url_contenido: data.archivoUrl,
        url_imagen: data.miniaturaUrl,
        duracion_minutos: data.duracion,
        tags: data.etiquetas,
        destacado: data.destacado,
        activo: data.publico,
      },
    });
    return this.mapContenido(contenido);
  }

  async eliminar(id: string): Promise<void> {
    await (this.db as any).contenido.delete({ where: { id } });
  }

  async obtenerProgreso(usuarioId: string, contenidoId: string): Promise<ProgresoRecord | null> {
    const progreso = await (this.db as any).progresoContenido.findUnique({
      where: { usuario_id_contenido_id: { usuario_id: usuarioId, contenido_id: contenidoId } },
    });
    return progreso ? this.mapProgreso(progreso) : null;
  }

  async upsertProgreso(usuarioId: string, contenidoId: string, data: ProgresoUpdateData): Promise<ProgresoRecord> {
    const payload: any = {
      progreso: data.progreso,
      completado: data.completado,
      tiempo_visto: data.tiempoVisto,
      ultima_posicion: data.ultimaPosicion,
      favorito: data.favorito,
      notas: data.notas,
      updated_at: new Date(),
    };
    if (data.completado && !payload.fecha_completado) {
      payload.fecha_completado = new Date();
    }
    const progreso = await (this.db as any).progresoContenido.upsert({
      where: { usuario_id_contenido_id: { usuario_id: usuarioId, contenido_id: contenidoId } },
      create: { usuario_id: usuarioId, contenido_id: contenidoId, ...payload },
      update: payload,
    });
    return this.mapProgreso(progreso);
  }

  async registrarVista(contenidoId: string): Promise<void> {
    await (this.db as any).contenido.update({
      where: { id: contenidoId },
      data: { duracion_minutos: { increment: 1 } },
    });
  }

  async registrarDescarga(contenidoId: string): Promise<void> {
    await (this.db as any).contenido.update({
      where: { id: contenidoId },
      data: { semana_gestacion_inicio: { increment: 1 } },
    });
  }

  async obtenerProgresosCompletados(contenidoId: string): Promise<Array<{ id: string }>> {
    const progresos = await (this.db as any).progresoContenido.findMany({
      where: { contenido_id: contenidoId, completado: true },
      select: { id: true },
    });
    return progresos;
  }

  async actualizarMetadata(contenidoId: string): Promise<void> {
    await (this.db as any).contenido.update({
      where: { id: contenidoId },
      data: { fecha_actualizacion: new Date() },
    });
  }

  private mapContenido = (c: any): ContenidoRecord => ({
    id: c.id,
    titulo: c.titulo,
    descripcion: c.descripcion,
    tipo: c.tipo,
    categoria: c.categoria,
    nivel: c.nivel,
    archivo_url: c.url_contenido,
    miniatura_url: c.url_imagen,
    duracion_minutos: c.duracion_minutos,
    etiquetas: c.tags,
    publico: c.activo,
    destacado: c.destacado,
    fecha_creacion: c.fecha_creacion,
    fecha_actualizacion: c.fecha_actualizacion,
  });

  private mapProgreso = (p: any): ProgresoRecord => ({
    id: p.id,
    usuario_id: p.usuario_id,
    contenido_id: p.contenido_id,
    completado: p.completado,
    progreso: p.progreso,
    tiempo_visto: p.tiempo_visto,
    ultima_posicion: p.ultima_posicion,
    fecha_inicio: p.fecha_inicio,
    fecha_completado: p.fecha_completado,
    created_at: p.created_at,
    updated_at: p.updated_at,
  });
}

export default ContenidoRepositoryImpl;