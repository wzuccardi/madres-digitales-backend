export interface CreateControlData {
  gestante_id: string;
  medico_id?: string;
  fecha_control: Date;
  semanas_gestacion?: number | null;
  peso?: number | null;
  presion_sistolica?: number | null;
  presion_diastolica?: number | null;
  frecuencia_cardiaca?: number | null;
  frecuencia_respiratoria?: number | null;
  temperatura?: number | null;
  altura_uterina?: number | null;
  movimientos_fetales?: boolean;
  edemas?: boolean;
  recomendaciones?: string | null;
}

export interface UpdateControlData extends Partial<CreateControlData> {}

export interface ControlRecord {
  id: string;
  gestante_id: string;
  medico_id?: string | null;
  fecha_control: Date;
  semanas_gestacion?: number | null;
  peso?: number | null;
  presion_sistolica?: number | null;
  presion_diastolica?: number | null;
  frecuencia_cardiaca?: number | null;
  frecuencia_respiratoria?: number | null;
  temperatura?: number | null;
  altura_uterina?: number | null;
  movimientos_fetales?: string | null;
  edemas?: string | null;
  recomendaciones?: string | null;
  fecha_creacion?: Date;
}

export interface ControlFilters {
  gestante_id?: string;
  fecha_gte?: Date;
  fecha_lte?: Date;
}

export interface IControlRepository {
  findMany(filters?: ControlFilters): Promise<ControlRecord[]>;
  findById(id: string): Promise<ControlRecord | null>;
  findLastForGestante(gestanteId: string, take: number): Promise<ControlRecord[]>;
  create(data: CreateControlData): Promise<ControlRecord>;
  update(id: string, data: UpdateControlData): Promise<ControlRecord>;
  delete(id: string): Promise<void>;
  findOverdue(fechaLimite: Date): Promise<ControlRecord[]>;
  findPending(fechaActual: Date): Promise<ControlRecord[]>;
}