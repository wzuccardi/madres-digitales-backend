import { BaseModel } from './base.model';

export class IPSModel extends BaseModel {
  constructor(
    id: string,
    public readonly nombre: string,
    public readonly nit?: string,
    public readonly telefono?: string,
    public readonly direccion?: string,
    public readonly municipioId?: string,
    public readonly nivel?: string,
    public readonly email?: string,
    public readonly activo: boolean = true,
    public readonly latitud?: number,
    public readonly longitud?: number,
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

    if (Object.keys(errors).length > 0) {
      throw new Error('Datos de IPS inválidos');
    }
  }

  public tieneCoordenadas(): boolean {
    return this.latitud !== null && this.longitud !== null;
  }

  public actualizar(cambios: Partial<Omit<IPSModel, 'id' | 'createdAt'>>): IPSModel {
    return new IPSModel(
      this.id,
      cambios.nombre ?? this.nombre,
      cambios.nit ?? this.nit,
      cambios.telefono ?? this.telefono,
      cambios.direccion ?? this.direccion,
      cambios.municipioId ?? this.municipioId,
      cambios.nivel ?? this.nivel,
      cambios.email ?? this.email,
      cambios.activo ?? this.activo,
      cambios.latitud ?? this.latitud,
      cambios.longitud ?? this.longitud,
      this.createdAt,
      new Date()
    );
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      nombre: this.nombre,
      nit: this.nit,
      telefono: this.telefono,
      direccion: this.direccion,
      municipioId: this.municipioId,
      nivel: this.nivel,
      email: this.email,
      activo: this.activo,
      latitud: this.latitud,
      longitud: this.longitud,
      tieneCoordenadas: this.tieneCoordenadas(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  public static fromDatabase(data: any): IPSModel {
    return new IPSModel(
      data.id,
      data.nombre,
      data.nit,
      data.telefono,
      data.direccion,
      data.municipio_id,
      data.nivel,
      data.email,
      data.activo,
      data.latitud ? parseFloat(data.latitud) : undefined,
      data.longitud ? parseFloat(data.longitud) : undefined,
      data.fecha_creacion,
      data.fecha_actualizacion
    );
  }
}