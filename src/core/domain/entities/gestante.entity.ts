import { ValidationError } from '../errors/base.error';

/**
 * Entidad de Dominio: Gestante
 * Representa una mujer embarazada en el sistema
 */
export class GestanteEntity {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly apellido: string,
    public readonly documento: string,
    public readonly tipoDocumento: string,
    public readonly fechaNacimiento: Date,
    public readonly telefono: string | null,
    public readonly direccion: string | null,
    public readonly municipioId: string,
    public readonly ipsId: string | null,
    public readonly madrinaId: string | null,
    public readonly fechaUltimaMenstruacion: Date | null,
    public readonly fechaProbableParto: Date | null,
    public readonly numeroEmbarazos: number,
    public readonly numeroPartos: number,
    public readonly numeroAbortos: number,
    public readonly grupoSanguineo: string | null,
    public readonly factorRh: string | null,
    public readonly alergias: string | null,
    public readonly enfermedadesPreexistentes: string | null,
    public readonly observaciones: string | null,
    public readonly latitud: number | null,
    public readonly longitud: number | null,
    public readonly activo: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  /**
   * Validaciones de negocio
   */
  private validate(): void {
    const errors: Record<string, string[]> = {};

    // Validar nombre
    if (!this.nombre || this.nombre.trim().length === 0) {
      errors.nombre = ['El nombre es requerido'];
    } else if (this.nombre.length < 2) {
      errors.nombre = ['El nombre debe tener al menos 2 caracteres'];
    }

    // Validar apellido
    if (!this.apellido || this.apellido.trim().length === 0) {
      errors.apellido = ['El apellido es requerido'];
    } else if (this.apellido.length < 2) {
      errors.apellido = ['El apellido debe tener al menos 2 caracteres'];
    }

    // Validar documento
    if (!this.documento || this.documento.trim().length === 0) {
      errors.documento = ['El documento es requerido'];
    }

    // Validar tipo de documento
    const tiposValidos = ['CC', 'TI', 'RC', 'CE', 'PA'];
    if (!tiposValidos.includes(this.tipoDocumento)) {
      errors.tipoDocumento = [`El tipo de documento debe ser uno de: ${tiposValidos.join(', ')}`];
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

    // Validar números de embarazos, partos y abortos
    if (this.numeroEmbarazos < 0) {
      errors.numeroEmbarazos = ['El número de embarazos no puede ser negativo'];
    }
    if (this.numeroPartos < 0) {
      errors.numeroPartos = ['El número de partos no puede ser negativo'];
    }
    if (this.numeroAbortos < 0) {
      errors.numeroAbortos = ['El número de abortos no puede ser negativo'];
    }

    // Validar que partos + abortos <= embarazos
    if (this.numeroPartos + this.numeroAbortos > this.numeroEmbarazos) {
      errors.numeroEmbarazos = ['La suma de partos y abortos no puede ser mayor que el número de embarazos'];
    }

    // Validar grupo sanguíneo
    if (this.grupoSanguineo) {
      const gruposValidos = ['A', 'B', 'AB', 'O'];
      if (!gruposValidos.includes(this.grupoSanguineo)) {
        errors.grupoSanguineo = [`El grupo sanguíneo debe ser uno de: ${gruposValidos.join(', ')}`];
      }
    }

    // Validar factor RH
    if (this.factorRh) {
      const factoresValidos = ['+', '-'];
      if (!factoresValidos.includes(this.factorRh)) {
        errors.factorRh = ['El factor RH debe ser + o -'];
      }
    }

    // Validar coordenadas
    if (this.latitud !== null && (this.latitud < -90 || this.latitud > 90)) {
      errors.latitud = ['La latitud debe estar entre -90 y 90'];
    }
    if (this.longitud !== null && (this.longitud < -180 || this.longitud > 180)) {
      errors.longitud = ['La longitud debe estar entre -180 y 180'];
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
   * Determina si es un embarazo de alto riesgo
   */
  public esAltoRiesgo(): boolean {
    const edad = this.calcularEdad();
    const semanas = this.calcularSemanasGestacion();

    // Criterios de alto riesgo
    const criterios = [
      edad < 15 || edad > 40, // Edad extrema
      this.numeroEmbarazos >= 5, // Multiparidad
      this.numeroAbortos >= 2, // Abortos previos
      semanas !== null && semanas > 42, // Embarazo prolongado
      this.enfermedadesPreexistentes !== null && this.enfermedadesPreexistentes.length > 0
    ];

    return criterios.some(criterio => criterio);
  }

  /**
   * Obtiene el nombre completo
   */
  public getNombreCompleto(): string {
    return `${this.nombre} ${this.apellido}`;
  }

  /**
   * Verifica si tiene coordenadas GPS
   */
  public tieneCoordenadas(): boolean {
    return this.latitud !== null && this.longitud !== null;
  }

  /**
   * Verifica si está asignada a una madrina
   */
  public tieneAsignacion(): boolean {
    return this.madrinaId !== null;
  }

  /**
   * Crea una copia de la entidad con campos actualizados
   */
  public actualizar(cambios: Partial<Omit<GestanteEntity, 'id' | 'createdAt'>>): GestanteEntity {
    return new GestanteEntity(
      this.id,
      cambios.nombre ?? this.nombre,
      cambios.apellido ?? this.apellido,
      cambios.documento ?? this.documento,
      cambios.tipoDocumento ?? this.tipoDocumento,
      cambios.fechaNacimiento ?? this.fechaNacimiento,
      cambios.telefono ?? this.telefono,
      cambios.direccion ?? this.direccion,
      cambios.municipioId ?? this.municipioId,
      cambios.ipsId ?? this.ipsId,
      cambios.madrinaId ?? this.madrinaId,
      cambios.fechaUltimaMenstruacion ?? this.fechaUltimaMenstruacion,
      cambios.fechaProbableParto ?? this.fechaProbableParto,
      cambios.numeroEmbarazos ?? this.numeroEmbarazos,
      cambios.numeroPartos ?? this.numeroPartos,
      cambios.numeroAbortos ?? this.numeroAbortos,
      cambios.grupoSanguineo ?? this.grupoSanguineo,
      cambios.factorRh ?? this.factorRh,
      cambios.alergias ?? this.alergias,
      cambios.enfermedadesPreexistentes ?? this.enfermedadesPreexistentes,
      cambios.observaciones ?? this.observaciones,
      cambios.latitud ?? this.latitud,
      cambios.longitud ?? this.longitud,
      cambios.activo ?? this.activo,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Convierte la entidad a un objeto plano
   */
  public toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      apellido: this.apellido,
      nombreCompleto: this.getNombreCompleto(),
      documento: this.documento,
      tipoDocumento: this.tipoDocumento,
      fechaNacimiento: this.fechaNacimiento,
      edad: this.calcularEdad(),
      telefono: this.telefono,
      direccion: this.direccion,
      municipioId: this.municipioId,
      ipsId: this.ipsId,
      madrinaId: this.madrinaId,
      fechaUltimaMenstruacion: this.fechaUltimaMenstruacion,
      fechaProbableParto: this.fechaProbableParto,
      semanasGestacion: this.calcularSemanasGestacion(),
      numeroEmbarazos: this.numeroEmbarazos,
      numeroPartos: this.numeroPartos,
      numeroAbortos: this.numeroAbortos,
      grupoSanguineo: this.grupoSanguineo,
      factorRh: this.factorRh,
      alergias: this.alergias,
      enfermedadesPreexistentes: this.enfermedadesPreexistentes,
      observaciones: this.observaciones,
      latitud: this.latitud,
      longitud: this.longitud,
      tieneCoordenadas: this.tieneCoordenadas(),
      tieneAsignacion: this.tieneAsignacion(),
      esAltoRiesgo: this.esAltoRiesgo(),
      activo: this.activo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

