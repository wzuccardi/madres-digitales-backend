// src/types/alerta-automatica.dto.ts
import { AlertaTipo, PrioridadNivel } from './prisma-enums';

// ==================== DTOs PARA ENTRADA DE DATOS ====================

/**
 * DTO para datos clínicos de entrada para evaluación de alertas
 */
export interface DatosClinicosDTO {
  // Signos vitales
  presion_sistolica?: number;
  presion_diastolica?: number;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
  temperatura?: number;
  
  // Datos obstétricos
  peso?: number;
  talla?: number;
  semanas_gestacion?: number;
  altura_uterina?: number;
  
  // Evaluación clínica
  movimientos_fetales?: boolean;
  edemas?: boolean;
  presentacion_fetal?: string;
  
  // Síntomas reportados
  sintomas?: string[];
  
  // Observaciones adicionales
  observaciones?: string;
  
  // Coordenadas para geolocalización
  coordenadas?: [number, number]; // [longitud, latitud]
}

/**
 * DTO para crear control prenatal con evaluación automática
 */
export interface CrearControlConEvaluacionDTO extends DatosClinicosDTO {
  gestante_id: string;
  medico_id?: string;
  // realizado_por_id eliminado - usar medico_id consistentemente
  fecha_control: string | Date;
  proxima_cita?: string | Date;
  recomendaciones?: string;
  
  // Campos específicos para evaluación automática
  evaluar_automaticamente?: boolean;
  incluir_historial?: boolean;
}

/**
 * DTO para crear alerta manual con evaluación automática
 */
export interface CrearAlertaManualDTO extends DatosClinicosDTO {
  gestante_id: string;
  generado_por_id: string;
  tipo_alerta: AlertaTipo;
  nivel_prioridad: PrioridadNivel;
  mensaje: string;
  
  // Asignaciones
  madrina_id?: string;
  medico_tratante_id?: string;
  ips_derivada_id?: string;
  
  // Evaluación automática adicional
  evaluar_automaticamente?: boolean;
  sobrescribir_con_automatica?: boolean;
}

// ==================== DTOs PARA SALIDA DE DATOS ====================

/**
 * DTO para resultado de evaluación automática
 */
export interface ResultadoEvaluacionDTO {
  // Resultado principal
  alerta_detectada: boolean;
  tipo_alerta?: AlertaTipo;
  nivel_prioridad?: PrioridadNivel;
  mensaje?: string;
  
  // Detalles de la evaluación
  puntuacion_riesgo: number;
  sintomas_detectados: string[];
  factores_riesgo: string[];
  recomendaciones: string[];
  
  // Metadatos
  evaluado_en: Date;
  version_algoritmo: string;
  tiempo_evaluacion_ms: number;
}

/**
 * DTO para alerta automática creada
 */
export interface AlertaAutomaticaDTO {
  id: string;
  gestante_id: string;
  tipo_alerta: AlertaTipo;
  nivel_prioridad: PrioridadNivel;
  mensaje: string;
  
  // Detalles de la evaluación
  sintomas: string[];
  puntuacion_riesgo: number;
  factores_riesgo: string[];
  recomendaciones: string[];
  
  // Origen de la alerta
  es_automatica: boolean;
  control_origen_id?: string;
  algoritmo_version: string;
  
  // Asignaciones automáticas
  madrina_id?: string;
  medico_tratante_id?: string;
  ips_derivada_id?: string;
  
  // Geolocalización
  coordenadas_alerta?: any; // GeoJSON Point
  
  // Timestamps
  created_at: Date;
  fecha_resolucion?: Date;
  resuelta: boolean;
}

/**
 * DTO para respuesta de control con evaluación
 */
export interface ControlConEvaluacionDTO {
  // Datos del control
  control: {
    id: string;
    gestante_id: string;
    fecha_control: Date;
    semanas_gestacion?: number;
    peso?: number;
    presion_sistolica?: number;
    presion_diastolica?: number;
    frecuencia_cardiaca?: number;
    temperatura?: number;
    observaciones?: string;
    recomendaciones?: string;
    created_at: Date;
  };
  
  // Resultado de la evaluación automática
  evaluacion: ResultadoEvaluacionDTO;
  
  // Alertas generadas (si las hay)
  alertas_generadas: AlertaAutomaticaDTO[];
}

// ==================== DTOs PARA CONFIGURACIÓN ====================

/**
 * DTO para configuración de umbrales personalizados
 */
export interface ConfiguracionUmbralesDTO {
  // Umbrales de presión arterial
  ta_sistolica_alta?: number;
  ta_diastolica_alta?: number;
  ta_sistolica_muy_alta?: number;
  ta_diastolica_muy_alta?: number;
  ta_sistolica_baja?: number;
  ta_diastolica_baja?: number;
  
  // Umbrales de frecuencia cardíaca
  fc_alta?: number;
  fc_muy_alta?: number;
  fc_baja?: number;
  
  // Umbrales de temperatura
  temperatura_alta?: number;
  temperatura_muy_alta?: number;
  temperatura_baja?: number;
  
  // Umbrales obstétricos
  semanas_parto_prematuro?: number;
  semanas_parto_muy_prematuro?: number;
  ganancia_peso_semanal_alta?: number;
  
  // Configuración de puntuación
  puntuacion_minima_alerta?: number;
  puntuacion_critica?: number;
  puntuacion_alta?: number;
  puntuacion_media?: number;
}

/**
 * DTO para configuración de notificaciones automáticas
 */
export interface ConfiguracionNotificacionesDTO {
  // Notificaciones por nivel de prioridad
  notificar_critica: boolean;
  notificar_alta: boolean;
  notificar_media: boolean;
  notificar_baja: boolean;
  
  // Canales de notificación
  usar_sms: boolean;
  usar_email: boolean;
  usar_push: boolean;
  usar_whatsapp: boolean;
  
  // Destinatarios automáticos
  notificar_madrina: boolean;
  notificar_medico: boolean;
  notificar_coordinador: boolean;
  notificar_emergencias: boolean;
  
  // Configuración de escalamiento
  tiempo_escalamiento_minutos: number;
  escalamiento_automatico: boolean;
}

// ==================== DTOs PARA ESTADÍSTICAS ====================

/**
 * DTO para estadísticas de alertas automáticas
 */
export interface EstadisticasAlertasAutomaticasDTO {
  periodo: {
    fecha_inicio: Date;
    fecha_fin: Date;
  };
  
  totales: {
    alertas_generadas: number;
    alertas_criticas: number;
    alertas_altas: number;
    alertas_medias: number;
    alertas_bajas: number;
  };
  
  por_tipo: {
    [key in AlertaTipo]: number;
  };
  
  efectividad: {
    alertas_confirmadas: number;
    falsos_positivos: number;
    falsos_negativos: number;
    precision: number;
    recall: number;
  };
  
  tiempos_respuesta: {
    promedio_minutos: number;
    mediana_minutos: number;
    maximo_minutos: number;
    minimo_minutos: number;
  };
  
  tendencias: {
    alertas_por_dia: { fecha: string; cantidad: number }[];
    tipos_mas_frecuentes: { tipo: AlertaTipo; cantidad: number }[];
  };
}

/**
 * DTO para análisis de rendimiento del algoritmo
 */
export interface AnalisisRendimientoDTO {
  version_algoritmo: string;
  periodo_analisis: {
    fecha_inicio: Date;
    fecha_fin: Date;
  };
  
  metricas_rendimiento: {
    tiempo_promedio_evaluacion_ms: number;
    evaluaciones_por_segundo: number;
    memoria_utilizada_mb: number;
  };
  
  metricas_clinicas: {
    sensibilidad: number;
    especificidad: number;
    valor_predictivo_positivo: number;
    valor_predictivo_negativo: number;
  };
  
  recomendaciones_mejora: string[];
}
