import { BaseModel } from './base.model';
import { ValidationError } from '../core/domain/errors/base.error';

/**
 * Modelo de Gestante - Representa una mujer embarazada en el sistema
 */
export class GestanteModel extends BaseModel {
  constructor(
    id: string,
    public readonly nombre: string,
    public readonly fechaNacimiento: Date,
    public readonly documento?: string,
    public readonly tipoDocumento?: string,
    public readonly telefono?: string,
    public readonly direccion?: string,
    public readonly eps?: string,
    public readonly regimenSalud: 'subsidiado' | 'contributivo' | 'especial' | 'no_asegurado' = 'subsidiado',
    public readonly municipioId?: string,
    public readonly madrinaId?: string,
    public readonly medicoTratanteId?: string,
    public readonly ipsAsignadaId?: string,
    public readonly activa: boolean = true,
    public readonly fechaUltimaMenstruacion?: Date,
    public readonly fechaProbableParto?: Date,
    public readonly riesgoAlto: boolean = false,
    public readonly coordenadas?: { latitud: number; longitud: number },
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  /**
   * Validaciones de negocio para la gestante
   */
  public validate(): void {
    const errors: Record<string, string[]> = {};

    // Validar nombre
    if (!this.nombre || this.nombre.trim().length === 0) {
      errors.nombre = ['El nombre es requerido'];
    } else if (this.nombre.length < 3) {
      errors.nombre = ['El nombre debe tener al menos 3 caracteres'];
    } else if (this.nombre.length > 200) {
      errors.nombre = ['El nombre no puede exceder 200 caracteres'];
    }

    // Validar documento si se proporciona
    if (this.documento && this.documento.length < 6) {
      errors.documento = ['El documento debe tener al menos 6 caracteres'];
    }

    // Validar tipo de documento si se proporciona
    if (this.tipoDocumento) {
      const tiposValidos = ['cedula', 'tarjeta_identidad', 'pasaporte', 'registro_civil'];
      if (!tiposValidos.includes(this.tipoDocumento)) {
        errors.tipoDocumento = [`El tipo de documento debe ser uno de: ${tiposValidos.join(', ')}`];
      }
    }

    // Validar fecha de nacimiento
    if (!this.fechaNacimiento) {
      errors.fechaNacimiento = ['La fecha de nacimiento es requerida'];
    } else {
      const edad = this.calcularEdad();
      if (edad < 10 || edad > 60) {
        errors.fechaNacimiento = ['La edad debe estar entre 10 y 60 años'];
      }
    }

    // Validar teléfono si se proporciona
    if (this.telefono && !/^\d{10}$/.test(this.telefono)) {
      errors.telefono = ['El teléfono debe tener exactamente 10 dígitos'];
    }

    // Validar coordenadas si se proporcionan
    if (this.coordenadas) {
      if (this.coordenadas.latitud < -90 || this.coordenadas.latitud > 90) {
        errors.latitud = ['La latitud debe estar entre -90 y 90'];
      }
      if (this.coordenadas.longitud < -180 || this.coordenadas.longitud > 180) {
        errors.longitud = ['La longitud debe estar entre -180 y 180'];
      }
    }

    // Si hay errores, lanzar excepción
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Datos de gestante inválidos', errors);
    }
  }

  /**
   * Calcula la edad de la gestante
   */
  public calcularEdad(): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - this.fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - this.fechaNacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < this.fechaNacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }

  /**
   * Calcula las semanas de gestación
   */
  public calcularSemanasGestacion(): number | null {
    if (!this.fechaUltimaMenstruacion) {
      return null;
    }

    const hoy = new Date();
    const diferencia = hoy.getTime() - this.fechaUltimaMenstruacion.getTime();
    const semanas = Math.floor(diferencia / (1000 * 60 * 60 * 24 * 7));
    
    return semanas >= 0 ? semanas : null;
  }

  /**
   * Determina si es un embarazo de alto riesgo basado en criterios médicos
   */
  public esAltoRiesgo(): boolean {
    const edad = this.calcularEdad();
    const semanas = this.calcularSemanasGestacion();

    // Criterios de alto riesgo
    const criterios = [
      edad < 15 || edad > 40, // Edad extrema
      semanas !== null && (semanas < 12 || semanas > 42), // Embarazo muy temprano o prolongado
      this.riesgoAlto // Riesgo ya detectado
    ];

    return criterios.some(criterio => criterio);
  }

  /**
   * Verifica si tiene coordenadas GPS
   */
  public tieneCoordenadas(): boolean {
    return this.coordenadas !== undefined && 
           this.coordenadas.latitud !== null && 
           this.coordenadas.longitud !== null;
  }

  /**
   * Verifica si está asignada a una madrina
   */
  public tieneMadrinaAsignada(): boolean {
    return this.madrinaId !== null && this.madrinaId !== undefined;
  }

  /**
   * Verifica si está asignada a una IPS
   */
  public tieneIPSAsignada(): boolean {
    return this.ipsAsignadaId !== null && this.ipsAsignadaId !== undefined;
  }

  /**
   * Verifica si está asignada a un médico
   */
  public tieneMedicoAsignado(): boolean {
    return this.medicoTratanteId !== null && this.medicoTratanteId !== undefined;
  }

  /**
   * Crea una copia del modelo con campos actualizados
   */
  public actualizar(cambios: Partial<Omit<GestanteModel, 'id' | 'createdAt'>>): GestanteModel {
    return new GestanteModel(
      this.id,
      cambios.nombre ?? this.nombre,
      cambios.fechaNacimiento ?? this.fechaNacimiento,
      cambios.documento ?? this.documento,
      cambios.tipoDocumento ?? this.tipoDocumento,
      cambios.telefono ?? this.telefono,
      cambios.direccion ?? this.direccion,
      cambios.eps ?? this.eps,
      cambios.regimenSalud ?? this.regimenSalud,
      cambios.municipioId ?? this.municipioId,
      cambios.madrinaId ?? this.madrinaId,
      cambios.medicoTratanteId ?? this.medicoTratanteId,
      cambios.ipsAsignadaId ?? this.ipsAsignadaId,
      cambios.activa ?? this.activa,
      cambios.fechaUltimaMenstruacion ?? this.fechaUltimaMenstruacion,
      cambios.fechaProbableParto ?? this.fechaProbableParto,
      cambios.riesgoAlto ?? this.riesgoAlto,
      cambios.coordenadas ?? this.coordenadas,
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
      nombre: this.nombre,
      documento: this.documento,
      tipoDocumento: this.tipoDocumento,
      fechaNacimiento: this.fechaNacimiento,
      edad: this.calcularEdad(),
      telefono: this.telefono,
      direccion: this.direccion,
      eps: this.eps,
      regimenSalud: this.regimenSalud,
      municipioId: this.municipioId,
      madrinaId: this.madrinaId,
      medicoTratanteId: this.medicoTratanteId,
      ipsAsignadaId: this.ipsAsignadaId,
      activa: this.activa,
      fechaUltimaMenstruacion: this.fechaUltimaMenstruacion,
      fechaProbableParto: this.fechaProbableParto,
      semanasGestacion: this.calcularSemanasGestacion(),
      riesgoAlto: this.riesgoAlto,
      esAltoRiesgo: this.esAltoRiesgo(),
      coordenadas: this.coordenadas,
      tieneCoordenadas: this.tieneCoordenadas(),
      tieneMadrinaAsignada: this.tieneMadrinaAsignada(),
      tieneIPSAsignada: this.tieneIPSAsignada(),
      tieneMedicoAsignado: this.tieneMedicoAsignado(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Crea un modelo a partir de datos de la base de datos
   */
  public static fromDatabase(data: any): GestanteModel {
    let coordenadas = undefined;
    if (data.coordenadas) {
      try {
        coordenadas = typeof data.coordenadas === 'string' 
          ? JSON.parse(data.coordenadas) 
          : data.coordenadas;
      } catch (e) {
        console.warn('Error parsing coordenadas:', e);
      }
    }

    return new GestanteModel(
      data.id,
      data.nombre,
      data.documento,
      data.tipo_documento,
      data.fecha_nacimiento,
      data.telefono,
      data.direccion,
      data.eps,
      data.regimen_salud,
      data.municipio_id,
      data.madrina_id,
      data.medico_tratante_id,
      data.ips_asignada_id,
      data.activa,
      data.fecha_ultima_menstruacion,
      data.fecha_probable_parto,
      data.riesgo_alto,
      coordenadas,
      data.fecha_creacion,
      data.fecha_actualizacion
    );
  }
}