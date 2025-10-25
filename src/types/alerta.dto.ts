// Tipos para alertas

export interface CreateAlertaData {
  gestante_id: string;
  tipo_alerta: string;
  nivel_prioridad: string;
  mensaje: string;
  sintomas?: string[];
  coordenadas_alerta?: [number, number];
  generado_por_id?: string;
  es_automatica?: boolean;
  score_riesgo?: number;
}

export interface AlertaResponse {
  id: string;
  gestante_id: string;
  tipo_alerta: string;
  nivel_prioridad: string;
  mensaje: string;
  sintomas?: any;
  coordenadas_alerta?: any;
  resuelta: boolean;
  fecha_resolucion?: Date;
  generado_por_id?: string;
  estado: string;
  score_riesgo?: number;
  es_automatica: boolean;
  created_at: Date;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  gestante?: {
    id: string;
    nombre: string;
    documento?: string;
    telefono?: string;
  };
  madrina?: {
    id: string;
    nombre: string;
    telefono?: string;
  };
}

export enum AlertaTipo {
  SOS = 'sos',
  MEDICA = 'medica',
  CONTROL = 'control',
  RECORDATORIO = 'recordatorio',
  HIPERTENSION = 'hipertension',
  PREECLAMPSIA = 'preeclampsia',
  DIABETES = 'diabetes',
  SANGRADO = 'sangrado',
  CONTRACCIONES = 'contracciones',
  FALTA_MOVIMIENTO_FETAL = 'falta_movimiento_fetal'
}

export enum PrioridadNivel {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica'
}
