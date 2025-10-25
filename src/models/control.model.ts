import { BaseModel } from './base.model';

export class ControlModel extends BaseModel {
  constructor(
    id: string,
    public readonly gestanteId: string,
    public readonly fechaControl: Date,
    public readonly medicoId?: string,
    public readonly semanasGestacion?: number,
    public readonly peso?: number,
    public readonly alturaUterina?: number,
    public readonly presionSistolica?: number,
    public readonly presionDiastolica?: number,
    public readonly frecuenciaCardiaca?: number,
    public readonly frecuenciaRespiratoria?: number,
    public readonly temperatura?: number,
    public readonly movimientosFetales?: string,
    public readonly edemas?: string,
    public readonly proteinuria?: string,
    public readonly glucosuria?: string,
    public readonly hallazgos?: any,
    public readonly recomendaciones?: string,
    public readonly proximoControl?: Date,
    public readonly realizado: boolean = false,
    public readonly observaciones?: string,
    public readonly examenesSolicitados?: any,
    public readonly resultadosExamenes?: any,
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

    if (!this.fechaControl) {
      errors.fechaControl = ['La fecha del control es requerida'];
    }

    if (Object.keys(errors).length > 0) {
      throw new Error('Datos de control inválidos');
    }
  }

  public estaRealizado(): boolean {
    return this.realizado;
  }

  public tieneProximoControl(): boolean {
    return this.proximoControl !== null && this.proximoControl !== undefined;
  }

  public calcularPresionArterial(): string | null {
    if (this.presionSistolica && this.presionDiastolica) {
      return `${this.presionSistolica}/${this.presionDiastolica}`;
    }
    return null;
  }

  public actualizar(cambios: Partial<Omit<ControlModel, 'id' | 'createdAt'>>): ControlModel {
    return new ControlModel(
      this.id,
      cambios.gestanteId ?? this.gestanteId,
      cambios.fechaControl ?? this.fechaControl,
      cambios.medicoId ?? this.medicoId,
      cambios.semanasGestacion ?? this.semanasGestacion,
      cambios.peso ?? this.peso,
      cambios.alturaUterina ?? this.alturaUterina,
      cambios.presionSistolica ?? this.presionSistolica,
      cambios.presionDiastolica ?? this.presionDiastolica,
      cambios.frecuenciaCardiaca ?? this.frecuenciaCardiaca,
      cambios.frecuenciaRespiratoria ?? this.frecuenciaRespiratoria,
      cambios.temperatura ?? this.temperatura,
      cambios.movimientosFetales ?? this.movimientosFetales,
      cambios.edemas ?? this.edemas,
      cambios.proteinuria ?? this.proteinuria,
      cambios.glucosuria ?? this.glucosuria,
      cambios.hallazgos ?? this.hallazgos,
      cambios.recomendaciones ?? this.recomendaciones,
      cambios.proximoControl ?? this.proximoControl,
      cambios.realizado ?? this.realizado,
      cambios.observaciones ?? this.observaciones,
      cambios.examenesSolicitados ?? this.examenesSolicitados,
      cambios.resultadosExamenes ?? this.resultadosExamenes,
      this.createdAt,
      new Date()
    );
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      gestanteId: this.gestanteId,
      medicoId: this.medicoId,
      fechaControl: this.fechaControl,
      semanasGestacion: this.semanasGestacion,
      peso: this.peso,
      alturaUterina: this.alturaUterina,
      presionSistolica: this.presionSistolica,
      presionDiastolica: this.presionDiastolica,
      presionArterial: this.calcularPresionArterial(),
      frecuenciaCardiaca: this.frecuenciaCardiaca,
      frecuenciaRespiratoria: this.frecuenciaRespiratoria,
      temperatura: this.temperatura,
      movimientosFetales: this.movimientosFetales,
      edemas: this.edemas,
      proteinuria: this.proteinuria,
      glucosuria: this.glucosuria,
      hallazgos: this.hallazgos,
      recomendaciones: this.recomendaciones,
      proximoControl: this.proximoControl,
      realizado: this.realizado,
      estaRealizado: this.estaRealizado(),
      tieneProximoControl: this.tieneProximoControl(),
      observaciones: this.observaciones,
      examenesSolicitados: this.examenesSolicitados,
      resultadosExamenes: this.resultadosExamenes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  public static fromDatabase(data: any): ControlModel {
    let hallazgos = data.hallazgos;
    let examenesSolicitados = data.examenes_solicitados;
    let resultadosExamenes = data.resultados_examenes;
    
    if (typeof hallazgos === 'string') {
      try {
        hallazgos = JSON.parse(hallazgos);
      } catch (e) {
        console.warn('Error parsing hallazgos:', e);
      }
    }
    
    if (typeof examenesSolicitados === 'string') {
      try {
        examenesSolicitados = JSON.parse(examenesSolicitados);
      } catch (e) {
        console.warn('Error parsing examenes_solicitados:', e);
      }
    }
    
    if (typeof resultadosExamenes === 'string') {
      try {
        resultadosExamenes = JSON.parse(resultadosExamenes);
      } catch (e) {
        console.warn('Error parsing resultados_examenes:', e);
      }
    }

    return new ControlModel(
      data.id,
      data.gestante_id,
      data.medico_id,
      data.fecha_control,
      data.semanas_gestacion,
      data.peso ? parseFloat(data.peso) : undefined,
      data.altura_uterina ? parseFloat(data.altura_uterina) : undefined,
      data.presion_sistolica,
      data.presion_diastolica,
      data.frecuencia_cardiaca,
      data.frecuencia_respiratoria,
      data.temperatura ? parseFloat(data.temperatura) : undefined,
      data.movimientos_fetales,
      data.edemas,
      data.proteinuria,
      data.glucosuria,
      hallazgos,
      data.recomendaciones,
      data.proximo_control,
      data.realizado,
      data.observaciones,
      examenesSolicitados,
      resultadosExamenes,
      data.fecha_creacion,
      data.fecha_actualizacion
    );
  }
}