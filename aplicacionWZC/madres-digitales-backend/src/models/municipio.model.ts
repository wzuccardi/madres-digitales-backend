import { BaseModel } from './base.model';

export class MunicipioModel extends BaseModel {
  constructor(
    id: string,
    public readonly nombre: string,
    public readonly departamento: string,
    public readonly codigoDane?: string,
    public readonly latitud?: number,
    public readonly longitud?: number,
    public readonly poblacion?: number,
    public readonly areaKm2?: number,
    public readonly altitudMsnm?: number,
    public readonly esCapital: boolean = false,
    public readonly activo: boolean = true,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public validate(): void {
    const errors: Record<string, string[]> = {};

    if (!this.nombre || this.nombre.trim().length === 0) {
      errors.nombre = ['El nombre es requerido'];
    }

    if (!this.departamento || this.departamento.trim().length === 0) {
      errors.departamento = ['El departamento es requerido'];
    }

    if (Object.keys(errors).length > 0) {
      throw new Error('Datos de municipio inválidos');
    }
  }

  public tieneCoordenadas(): boolean {
    return this.latitud !== null && this.longitud !== null;
  }

  public esCapitalDepartamental(): boolean {
    return this.esCapital;
  }

  public actualizar(cambios: Partial<Omit<MunicipioModel, 'id' | 'createdAt'>>): MunicipioModel {
    return new MunicipioModel(
      this.id,
      cambios.nombre ?? this.nombre,
      cambios.departamento ?? this.departamento,
      cambios.codigoDane ?? this.codigoDane,
      cambios.latitud ?? this.latitud,
      cambios.longitud ?? this.longitud,
      cambios.poblacion ?? this.poblacion,
      cambios.areaKm2 ?? this.areaKm2,
      cambios.altitudMsnm ?? this.altitudMsnm,
      cambios.esCapital ?? this.esCapital,
      cambios.activo ?? this.activo,
      this.createdAt,
      new Date()
    );
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      nombre: this.nombre,
      departamento: this.departamento,
      codigoDane: this.codigoDane,
      latitud: this.latitud,
      longitud: this.longitud,
      poblacion: this.poblacion,
      areaKm2: this.areaKm2,
      altitudMsnm: this.altitudMsnm,
      esCapital: this.esCapital,
      activo: this.activo,
      tieneCoordenadas: this.tieneCoordenadas(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  public static fromDatabase(data: any): MunicipioModel {
    return new MunicipioModel(
      data.id,
      data.nombre,
      data.departamento,
      data.codigo_dane,
      data.latitud ? parseFloat(data.latitud) : undefined,
      data.longitud ? parseFloat(data.longitud) : undefined,
      data.poblacion,
      data.area_km2 ? parseFloat(data.area_km2) : undefined,
      data.altitud_msnm,
      data.es_capital,
      data.activo,
      data.fecha_creacion,
      data.fecha_actualizacion
    );
  }
}