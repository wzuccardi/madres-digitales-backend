import { BaseModel } from './base.model';
import { ValidationError } from '../core/domain/errors/base.error';

/**
 * Modelo de Alerta - Representa una alerta en el sistema
 */
export class AlertaModel extends BaseModel {
  constructor(
    id: string,
    public readonly gestanteId: string,
    public readonly tipoAlerta: string,
    public readonly nivelPrioridad: 'baja' | 'media' | 'alta' | 'critica',
    public readonly mensaje: string,
    public readonly madrinaId?: string,
    public readonly medicoAsignadoId?: string,
    public readonly ipsDerivadaId?: string,
    public readonly sintomas?: any,
    public readonly coordenadasAlerta?: { latitud: number; longitud: number },
    public readonly resuelta: boolean = false,
    public readonly fechaResolucion?: Date,
    public readonly generadoPorId?: string,
    public readonly automatica: boolean = false,
    public readonly scoreRiesgo?: number,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public validate(): void {
    const errors: Record<string, string[]> = {};

    if (!this.gestanteId) {
      errors.gestanteId = ['El ID de la gestante es requerido'];
    }

    if (!this.tipoAlerta) {
      errors.tipoAlerta = ['El tipo de alerta es requerido'];
    }

    if (!this.nivelPrioridad) {
      errors.nivelPrioridad = ['El nivel de prioridad es requerido'];
    }

    if (!this.mensaje || this.mensaje.trim().length === 0) {
      errors.mensaje = ['El mensaje es requerido'];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Datos de alerta inválidos', errors);
    }
  }

  public esCritica(): boolean {
    return this.nivelPrioridad === 'critica';
  }

  public estaResuelta(): boolean {
    return this.resuelta;
  }

  public esAutomatica(): boolean {
    return this.automatica;
  }

  public actualizar(cambios: Partial<Omit<AlertaModel, 'id' | 'createdAt'>>): AlertaModel {
    return new AlertaModel(
      this.id,
      cambios.gestanteId ?? this.gestanteId,
      cambios.tipoAlerta ?? this.tipoAlerta,
      cambios.nivelPrioridad ?? this.nivelPrioridad,
      cambios.mensaje ?? this.mensaje,
      cambios.madrinaId ?? this.madrinaId,
      cambios.medicoAsignadoId ?? this.medicoAsignadoId,
      cambios.ipsDerivadaId ?? this.ipsDerivadaId,
      cambios.sintomas ?? this.sintomas,
      cambios.coordenadasAlerta ?? this.coordenadasAlerta,
      cambios.resuelta ?? this.resuelta,
      cambios.fechaResolucion ?? this.fechaResolucion,
      cambios.generadoPorId ?? this.generadoPorId,
      cambios.automatica ?? this.automatica,
      cambios.scoreRiesgo ?? this.scoreRiesgo,
      this.createdAt,
      new Date()
    );
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      gestanteId: this.gestanteId,
      tipoAlerta: this.tipoAlerta,
      nivelPrioridad: this.nivelPrioridad,
      mensaje: this.mensaje,
      madrinaId: this.madrinaId,
      medicoAsignadoId: this.medicoAsignadoId,
      ipsDerivadaId: this.ipsDerivadaId,
      sintomas: this.sintomas,
      coordenadasAlerta: this.coordenadasAlerta,
      resuelta: this.resuelta,
      fechaResolucion: this.fechaResolucion,
      generadoPorId: this.generadoPorId,
      esAutomatica: this.esAutomatica,
      scoreRiesgo: this.scoreRiesgo,
      esCritica: this.esCritica(),
      estaResuelta: this.estaResuelta(),
      esAutomatica: this.esAutomatica(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  public static fromDatabase(data: any): AlertaModel {
    let sintomas = data.sintomas;
    let coordenadasAlerta = data.coordenadas_alerta;
    
    if (typeof sintomas === 'string') {
      try {
        sintomas = JSON.parse(sintomas);
      } catch (e) {
        console.warn('Error parsing sintomas:', e);
      }
    }
    
    if (typeof coordenadasAlerta === 'string') {
      try {
        coordenadasAlerta = JSON.parse(coordenadasAlerta);
      } catch (e) {
        console.warn('Error parsing coordenadas_alerta:', e);
      }
    }

    return new AlertaModel(
      data.id,
      data.gestante_id,
      data.tipo_alerta,
      data.nivel_prioridad,
      data.mensaje,
      data.madrina_id,
      data.medico_asignado_id,
      data.ips_derivada_id,
      sintomas,
      coordenadasAlerta,
      data.resuelta,
      data.fecha_resolucion,
      data.generado_por_id,
      data.es_automatica,
      data.score_riesgo,
      data.fecha_creacion,
      data.fecha_actualizacion
    );
  }
}