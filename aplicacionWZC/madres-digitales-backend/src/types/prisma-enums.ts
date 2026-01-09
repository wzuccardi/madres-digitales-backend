// Enums personalizados para reemplazar los de Prisma que no se generan correctamente

export enum AlertaTipo {
  SOS = 'SOS',
  MEDICA = 'MEDICA',
  CONTROL = 'CONTROL',
  RECORDATORIO = 'RECORDATORIO',
  HIPERTENSION = 'HIPERTENSION',
  PREECLAMPSIA = 'PREECLAMPSIA',
  DIABETES = 'DIABETES',
  SANGRADO = 'SANGRADO',
  CONTRACCIONES = 'CONTRACCIONES',
  FALTA_MOVIMIENTO_FETAL = 'FALTA_MOVIMIENTO_FETAL',
  // Tipos adicionales usados en el código
  EMERGENCIA_OBSTETRICA = 'emergencia_obstetrica',
  RIESGO_ALTO = 'riesgo_alto',
  TRABAJO_PARTO = 'trabajo_parto',
  SINTOMA_ALARMA = 'sintoma_alarma'
}

export enum PrioridadNivel {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA',
  // Valores en minúsculas usados en el código
  baja = 'baja',
  media = 'media',
  alta = 'alta',
  critica = 'critica'
}

export enum TipoContenido {
  VIDEO = 'VIDEO',
  ARTICULO = 'ARTICULO',
  INFOGRAFIA = 'INFOGRAFIA',
  PODCAST = 'PODCAST',
  EJERCICIO = 'EJERCICIO',
  RECETA = 'RECETA'
}

export enum CategoriaContenido {
  NUTRICION = 'NUTRICION',
  EJERCICIO = 'EJERCICIO',
  CUIDADOS_PRENATALES = 'CUIDADOS_PRENATALES',
  PREPARACION_PARTO = 'PREPARACION_PARTO',
  LACTANCIA = 'LACTANCIA',
  CUIDADOS_BEBE = 'CUIDADOS_BEBE',
  SALUD_MENTAL = 'SALUD_MENTAL',
  EMERGENCIAS = 'EMERGENCIAS'
}

export enum NivelDificultad {
  BASICO = 'BASICO',
  INTERMEDIO = 'INTERMEDIO',
  AVANZADO = 'AVANZADO'
}