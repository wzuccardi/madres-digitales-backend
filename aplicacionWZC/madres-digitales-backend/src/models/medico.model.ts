import { BaseModel } from './base.model';

export class MedicoModel extends BaseModel {
  constructor(
    id: string,
    public readonly nombre: string,
    public readonly documento?: string,
    public readonly telefono?: string,
    public readonly especialidad?: string,
    public readonly email?: string,
    public readonly registroMedico?: string,
    public readonly ipsId?: string,
    public readonly municipioId?: string,
    public readonly activo: boolean = true,
    public readonly tipoDocumento: string = 'cedula',
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
      throw new Error('Datos de médico inválidos');
    }
  }

  public actualizar(cambios: Partial<Omit<MedicoModel, 'id' | 'createdAt'>>): MedicoModel {
    return new MedicoModel(
      this.id,
      cambios.nombre ?? this.nombre,
      cambios.documento ?? this.documento,
      cambios.telefono ?? this.telefono,
      cambios.especialidad ?? this.especialidad,
      cambios.email ?? this.email,
      cambios.registroMedico ?? this.registroMedico,
      cambios.ipsId ?? this.ipsId,
      cambios.municipioId ?? this.municipioId,
      cambios.activo ?? this.activo,
      cambios.tipoDocumento ?? this.tipoDocumento,
      this.createdAt,
      new Date()
    );
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      nombre: this.nombre,
      documento: this.documento,
      telefono: this.telefono,
      especialidad: this.especialidad,
      email: this.email,
      registroMedico: this.registroMedico,
      ipsId: this.ipsId,
      municipioId: this.municipioId,
      activo: this.activo,
      tipoDocumento: this.tipoDocumento,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  public static fromDatabase(data: any): MedicoModel {
    return new MedicoModel(
      data.id,
      data.nombre,
      data.documento,
      data.telefono,
      data.especialidad,
      data.email,
      data.registro_medico,
      data.ips_id,
      data.municipio_id,
      data.activo,
      data.tipo_documento,
      data.fecha_creacion,
      data.fecha_actualizacion
    );
  }
}