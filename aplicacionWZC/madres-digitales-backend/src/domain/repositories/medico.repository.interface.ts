export interface CreateMedicoData {
  nombre: string;
  documento: string;
  registro_medico: string;
  especialidad?: string;
  telefono?: string;
  email?: string;
  ips_id?: string;
  municipio_id?: string;
}

export interface UpdateMedicoData extends Partial<CreateMedicoData> {
  activo?: boolean;
}

export interface MedicoRecord {
  id: string;
  nombre: string;
  documento: string;
  registro_medico: string;
  especialidad?: string;
  telefono?: string;
  email?: string;
  ips_id?: string;
  municipio_id?: string;
  activo: boolean;
  fecha_creacion: Date;
  fecha_actualizacion?: Date;
}

export interface IMedicoRepository {
  findMany(): Promise<MedicoRecord[]>;
  findActive(): Promise<MedicoRecord[]>;
  findById(id: string): Promise<MedicoRecord | null>;
  findByIPS(ipsId: string): Promise<MedicoRecord[]>;
  findByEspecialidad(especialidad: string): Promise<MedicoRecord[]>;
  searchByName(term: string): Promise<MedicoRecord[]>;
  create(data: CreateMedicoData): Promise<MedicoRecord>;
  update(id: string, data: UpdateMedicoData): Promise<MedicoRecord>;
  softDelete(id: string): Promise<MedicoRecord>;
}