import { BaseModel } from './base.model';

export class ContenidoModel extends BaseModel {
  constructor(
    id: string,
    public readonly titulo: string,
    public readonly categoria: string,
    public readonly tipo: string,
    public readonly descripcion?: string,
    public readonly urlContenido?: string,
    public readonly urlImagen?: string,
    public readonly duracionMinutos?: number,
    public readonly activo: boolean = true,
    public readonly destacado: boolean = false,
    public readonly destacadoEnSemanaGestacion?: boolean,
    public readonly nivel?: string,
    public readonly semanaGestacionFin?: number,
    public readonly semanaGestacionInicio?: number,
    public readonly tags?: any,
    public readonly urlVideo?: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public validate(): void {
    const errors: Record<string, string[]> = {};

    if (!this.titulo || this.titulo.trim().length === 0) {
      errors.titulo = ['El título es requerido'];
    }

    if (!this.categoria || this.categoria.trim().length === 0) {
      errors.categoria = ['La categoría es requerida'];
    }

    if (!this.tipo || this.tipo.trim().length === 0) {
      errors.tipo = ['El tipo es requerido'];
    }

    if (Object.keys(errors).length > 0) {
      throw new Error('Datos de contenido inválidos');
    }
  }

  public esVideo(): boolean {
    return this.tipo === 'video';
  }

  public esArticulo(): boolean {
    return this.tipo === 'articulo';
  }

  public esDestacado(): boolean {
    return this.destacado;
  }

  public estaActivo(): boolean {
    return this.activo;
  }

  public actualizar(cambios: Partial<Omit<ContenidoModel, 'id' | 'createdAt'>>): ContenidoModel {
    return new ContenidoModel(
      this.id,
      cambios.titulo ?? this.titulo,
      cambios.categoria ?? this.categoria,
      cambios.tipo ?? this.tipo,
      cambios.descripcion ?? this.descripcion,
      cambios.urlContenido ?? this.urlContenido,
      cambios.urlImagen ?? this.urlImagen,
      cambios.duracionMinutos ?? this.duracionMinutos,
      cambios.activo ?? this.activo,
      cambios.destacado ?? this.destacado,
      cambios.destacadoEnSemanaGestacion ?? this.destacadoEnSemanaGestacion,
      cambios.nivel ?? this.nivel,
      cambios.semanaGestacionFin ?? this.semanaGestacionFin,
      cambios.semanaGestacionInicio ?? this.semanaGestacionInicio,
      cambios.tags ?? this.tags,
      this.createdAt,
      new Date()
    );
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      titulo: this.titulo,
      descripcion: this.descripcion,
      categoria: this.categoria,
      urlContenido: this.urlContenido,
      urlImagen: this.urlImagen,
      duracionMinutos: this.duracionMinutos,
      activo: this.activo,
      destacado: this.destacado,
      destacadoEnSemanaGestacion: this.destacadoEnSemanaGestacion,
      nivel: this.nivel,
      semanaGestacionFin: this.semanaGestacionFin,
      semanaGestacionInicio: this.semanaGestacionInicio,
      tags: this.tags,
      tipo: this.tipo,
      urlVideo: this.urlVideo,
      esVideo: this.esVideo(),
      esArticulo: this.esArticulo(),
      esDestacado: this.esDestacado(),
      estaActivo: this.estaActivo(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  public static fromDatabase(data: any): ContenidoModel {
    let tags = data.tags;
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        console.warn('Error parsing tags:', e);
      }
    }

    return new ContenidoModel(
      data.id,
      data.titulo,
      data.categoria,
      data.tipo,
      data.descripcion,
      data.url_contenido,
      data.url_imagen,
      data.duracion_minutos,
      data.activo,
      data.destacado,
      data.destacado_en_semana_gestacion,
      data.nivel,
      data.semana_gestacion_fin,
      data.semana_gestacion_inicio,
      tags,
      data.fecha_creacion,
      data.fecha_actualizacion
    );
  }
}