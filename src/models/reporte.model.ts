import { BaseModel } from './base.model';
import { ValidationError } from '../core/domain/errors/base.error';

/**
 * Modelo de Reporte - Representa un reporte o estadística del sistema
 */
export class ReporteModel extends BaseModel {
  constructor(
    id: string,
    public readonly tipo: string,
    public readonly titulo: string,
    public readonly descripcion: string,
    public readonly datos: any,
    public readonly fechaGeneracion: Date = new Date(),
    public readonly periodoInicio?: Date,
    public readonly periodoFin?: Date,
    public readonly generadoPor?: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  /**
   * Validaciones de negocio para el reporte
   */
  public validate(): void {
    const errors: Record<string, string[]> = {};

    // Validar tipo
    if (!this.tipo || this.tipo.trim().length === 0) {
      errors.tipo = ['El tipo de reporte es requerido'];
    }

    // Validar título
    if (!this.titulo || this.titulo.trim().length === 0) {
      errors.titulo = ['El título es requerido'];
    } else if (this.titulo.length < 3) {
      errors.titulo = ['El título debe tener al menos 3 caracteres'];
    } else if (this.titulo.length > 200) {
      errors.titulo = ['El título no puede exceder 200 caracteres'];
    }

    // Validar descripción
    if (!this.descripcion || this.descripcion.trim().length === 0) {
      errors.descripcion = ['La descripción es requerida'];
    } else if (this.descripcion.length < 10) {
      errors.descripcion = ['La descripción debe tener al menos 10 caracteres'];
    } else if (this.descripcion.length > 1000) {
      errors.descripcion = ['La descripción no puede exceder 1000 caracteres'];
    }

    // Validar datos
    if (!this.datos) {
      errors.datos = ['Los datos del reporte son requeridos'];
    }

    // Validar período si se proporciona
    if (this.periodoInicio && this.periodoFin) {
      if (this.periodoInicio > this.periodoFin) {
        errors.periodo = ['La fecha de inicio no puede ser posterior a la fecha de fin'];
      }
    }

    // Si hay errores, lanzar excepción
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Datos de reporte inválidos', errors);
    }
  }

  /**
   * Verifica si el reporte es de un tipo específico
   */
  public esTipo(tipo: string): boolean {
    return this.tipo === tipo;
  }

  /**
   * Verifica si el reporte cubre un período específico
   */
  public cubrePeriodo(fecha: Date): boolean {
    if (!this.periodoInicio || !this.periodoFin) {
      return false;
    }
    return fecha >= this.periodoInicio && fecha <= this.periodoFin;
  }

  /**
   * Obtiene la duración del período en días
   */
  public getDuracionPeriodoDias(): number | null {
    if (!this.periodoInicio || !this.periodoFin) {
      return null;
    }
    const diferencia = this.periodoFin.getTime() - this.periodoInicio.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }

  /**
   * Crea una copia del modelo con campos actualizados
   */
  public actualizar(cambios: Partial<Omit<ReporteModel, 'id' | 'createdAt'>>): ReporteModel {
    return new ReporteModel(
      this.id,
      cambios.tipo ?? this.tipo,
      cambios.titulo ?? this.titulo,
      cambios.descripcion ?? this.descripcion,
      cambios.datos ?? this.datos,
      cambios.fechaGeneracion ?? this.fechaGeneracion,
      cambios.periodoInicio ?? this.periodoInicio,
      cambios.periodoFin ?? this.periodoFin,
      cambios.generadoPor ?? this.generadoPor,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Convierte el modelo a un objeto plano
   */
  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      tipo: this.tipo,
      titulo: this.titulo,
      descripcion: this.descripcion,
      datos: this.datos,
      fechaGeneracion: this.fechaGeneracion,
      periodoInicio: this.periodoInicio,
      periodoFin: this.periodoFin,
      generadoPor: this.generadoPor,
      duracionPeriodoDias: this.getDuracionPeriodoDias(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Crea un modelo a partir de datos de la base de datos
   */
  public static fromDatabase(data: any): ReporteModel {
    let datos = data.datos;
    if (typeof datos === 'string') {
      try {
        datos = JSON.parse(datos);
      } catch (e) {
        console.warn('Error parsing datos del reporte:', e);
        datos = {};
      }
    }

    return new ReporteModel(
      data.id,
      data.tipo,
      data.titulo,
      data.descripcion,
      datos,
      data.fecha_generacion,
      data.periodo_inicio,
      data.periodo_fin,
      data.generado_por,
      data.fecha_creacion,
      data.fecha_actualizacion
    );
  }
}

/**
 * Tipos de reportes disponibles
 */
export const TIPOS_REPORTE = {
  RESUMEN_GENERAL: 'resumen_general',
  ESTADISTICAS_GESTANTES: 'estadisticas_gestantes',
  ESTADISTICAS_CONTROLES: 'estadisticas_controles',
  ESTADISTICAS_ALERTAS: 'estadisticas_alertas',
  ESTADISTICAS_RIESGO: 'estadisticas_riesgo',
  TENDENCIAS: 'tendencias',
  REPORTES_MENSUALES: 'reportes_mensuales',
  REPORTES_ANUALES: 'reportes_anuales'
} as const;

/**
 * Interfaz para datos de resumen general
 */
export interface ResumenGeneralData {
  total_gestantes: number;
  total_controles: number;
  total_alertas_activas: number;
  gestantes_alto_riesgo: number;
  controles_este_mes: number;
  alertas_criticas: number;
  promedio_controles_por_gestante: number;
}

/**
 * Interfaz para datos de estadísticas por municipio
 */
export interface EstadisticasMunicipioData {
  municipio_id: string;
  municipio_nombre: string;
  total_gestantes: number;
  gestantes_alto_riesgo: number;
  porcentaje_riesgo: string;
}

/**
 * Interfaz para datos de tendencias
 */
export interface TendenciaData {
  periodo: string;
  total_controles: number;
  total_alertas: number;
}