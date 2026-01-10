export interface CreateIPSData {
  nombre: string;
  nit?: string;
  telefono?: string;
  direccion?: string;
  municipio_id?: string;
  nivel?: string;
  email?: string;
  latitud?: number;
  longitud?: number;
}

export interface UpdateIPSData extends Partial<CreateIPSData> {
  activo?: boolean;
}

export interface IPSFilters {
  municipio_id?: string;
  nivel?: string;
  activo?: boolean;
  limite?: number;
  offset?: number;
}

export interface IPSRecord {
  id: string;
  nombre: string;
  nit?: string;
  telefono?: string;
  direccion?: string;
  municipio_id?: string;
  nivel?: string;
  email?: string;
  latitud?: number;
  longitud?: number;
  activo: boolean;
  fecha_creacion: Date;
  fecha_actualizacion?: Date;
}

export interface IIpsRepository {
  create(data: CreateIPSData): Promise<IPSRecord>;
  findMany(filters?: IPSFilters): Promise<{ ips: IPSRecord[]; total: number }>;
  findById(id: string): Promise<IPSRecord | null>;
  update(id: string, data: UpdateIPSData): Promise<IPSRecord>;
  deleteOrDeactivate(id: string): Promise<void>;
  findNearby(latitud: number, longitud: number, radioKm: number): Promise<Array<IPSRecord & { distancia: number }>>;
  stats(): Promise<{ total: number; activas: number; porNivel: Record<string, number>; topMunicipios: Array<{ municipio_id: string; _count: { municipio_id: number } }>; }>;
}