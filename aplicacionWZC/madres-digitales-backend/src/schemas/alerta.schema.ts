import { z } from 'zod';

export const crearAlertaSchema = z.object({
  gestante_id: z.string().min(1, 'gestante_id requerido'),
  tipo_alerta: z.string().min(1, 'tipo_alerta requerido'),
  nivel_prioridad: z.enum(['baja', 'media', 'alta', 'critica']),
  mensaje: z.string().min(10, 'mensaje muy corto'),
  sintomas: z.array(z.string()).optional(),
  coordenadas_alerta: z
    .tuple([z.number(), z.number()])
    .optional(), // [lng,lat]
});

export const crearAlertaConEvaluacionSchema = crearAlertaSchema.extend({
  presion_sistolica: z.number().optional(),
  presion_diastolica: z.number().optional(),
  frecuencia_cardiaca: z.number().optional(),
  frecuencia_respiratoria: z.number().optional(),
  temperatura: z.number().optional(),
  semanas_gestacion: z.number().optional(),
  evaluar_automaticamente: z.boolean().optional(),
  sobrescribir_con_automatica: z.boolean().optional(),
});

