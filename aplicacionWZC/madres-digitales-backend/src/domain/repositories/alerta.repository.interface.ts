export interface CreateAlertaData {
  gestante_id: string;
  tipo_alerta: string;
  nivel_prioridad: string;
  mensaje: string;
  sintomas?: string[];
  generado_por_id?: string;
  es_automatica?: boolean;
  score_riesgo?: number;
  madrina_id?: string | null;
  coordenadas_alerta?: { type: 'Point'; coordinates: [number, number] } | null;
}

export interface UpdateAlertaData extends Partial<CreateAlertaData> {
  resuelta?: boolean;
  fecha_resolucion?: Date | null;
}

export interface AlertaRecord {
  id: string;
  gestante_id: string;
  tipo_alerta: string;
  nivel_prioridad: string;
  mensaje: string;
  sintomas?: string[];
  generado_por_id?: string;
  es_automatica?: boolean;
  score_riesgo?: number;
  madrina_id?: string | null;
  coordenadas_alerta?: any;
  estado?: string;
  resuelta: boolean;
  fecha_creacion: Date;
  fecha_actualizacion?: Date;
}

export interface IAlertaRepository {
  findAll(): Promise<AlertaRecord[]>;
  findById(id: string): Promise<AlertaRecord | null>;
  findByMadrina(madrinaId: string): Promise<AlertaRecord[]>;
  findByGestante(gestanteId: string): Promise<AlertaRecord[]>;
  findActivas(): Promise<AlertaRecord[]>;
  create(data: CreateAlertaData): Promise<AlertaRecord>;
  update(id: string, data: UpdateAlertaData): Promise<AlertaRecord>;
  delete(id: string): Promise<void>;
  getGestanteMinimal(id: string): Promise<{ id: string; nombre: string; madrina_id?: string | null; municipio_id?: string | null; medico_tratante_id?: string | null } | null>;
}