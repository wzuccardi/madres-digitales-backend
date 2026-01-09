export interface ControlRecord { id: string; fecha_control: Date; gestante_id: string }
export interface AlertaRecord { id: string; tipo_alerta: string; nivel_prioridad: string; resuelta: boolean; created_at?: Date }
export interface MunicipioRecord { id: string; nombre: string }
export interface GestanteBasic { id: string; municipio_id: string; riesgo_alto: boolean }

export interface ReporteFilters {
  municipio_id?: string;
  riesgo?: 'alto' | 'bajo';
  madrina_id?: string;
}

export interface IReporteRepository {
  countGestantes(where?: any): Promise<number>;
  countControles(where?: any): Promise<number>;
  countAlertas(where?: any): Promise<number>;
  findControles(fechaInicio: Date, fechaFin: Date): Promise<ControlRecord[]>;
  findGestantes(filters?: ReporteFilters): Promise<GestanteBasic[]>;
  findMunicipios(): Promise<MunicipioRecord[]>;
  findAlertasSince(fechaInicio: Date): Promise<AlertaRecord[]>;
  findAlertasAll(): Promise<AlertaRecord[]>;
}