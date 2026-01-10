import { Database } from '../../core/database';
import { IControlRepository, ControlRecord, CreateControlData, UpdateControlData } from '../../domain/repositories/control.repository.interface';

export class ControlRepositoryImpl implements IControlRepository {
  private db = Database.getInstance();

  async findMany(filters?: { gestante_id?: string; fecha_gte?: Date; fecha_lte?: Date }): Promise<ControlRecord[]> {
    const where: any = {};
    if (filters?.gestante_id) where.gestante_id = filters.gestante_id;
    if (filters?.fecha_gte || filters?.fecha_lte) where.fecha_control = { gte: filters?.fecha_gte, lte: filters?.fecha_lte };
    const rows = await (this.db as any).control_prenatal.findMany({ where, orderBy: { fecha_control: 'desc' } });
    return rows as ControlRecord[];
  }

  async findById(id: string): Promise<ControlRecord | null> {
    const r = await (this.db as any).control_prenatal.findUnique({ where: { id } });
    return r as ControlRecord | null;
  }

  async findLastForGestante(gestanteId: string, take: number): Promise<ControlRecord[]> {
    const rows = await (this.db as any).control_prenatal.findMany({ where: { gestante_id: gestanteId }, orderBy: { fecha_control: 'desc' }, take });
    return rows as ControlRecord[];
  }

  async create(data: CreateControlData): Promise<ControlRecord> {
    const payload: any = {
      gestante_id: data.gestante_id,
      medico_id: data.medico_id,
      fecha_control: data.fecha_control,
      semanas_gestacion: data.semanas_gestacion,
      peso: data.peso,
      presion_sistolica: data.presion_sistolica,
      presion_diastolica: data.presion_diastolica,
      frecuencia_cardiaca: data.frecuencia_cardiaca,
      frecuencia_respiratoria: data.frecuencia_respiratoria,
      temperatura: data.temperatura,
      altura_uterina: data.altura_uterina,
      movimientos_fetales: data.movimientos_fetales ? 'si' : 'no',
      edemas: data.edemas ? 'si' : 'no',
      recomendaciones: data.recomendaciones,
    };
    const r = await (this.db as any).control_prenatal.create({ data: { id: `control_${Date.now()}_${Math.random().toString(36).slice(2,8)}`, ...payload } });
    return r as ControlRecord;
  }

  async update(id: string, data: UpdateControlData): Promise<ControlRecord> {
    const payload: any = {
      gestante_id: data.gestante_id,
      medico_id: data.medico_id,
      fecha_control: data.fecha_control,
      semanas_gestacion: data.semanas_gestacion,
      peso: data.peso,
      presion_sistolica: data.presion_sistolica,
      presion_diastolica: data.presion_diastolica,
      frecuencia_cardiaca: data.frecuencia_cardiaca,
      frecuencia_respiratoria: data.frecuencia_respiratoria,
      temperatura: data.temperatura,
      altura_uterina: data.altura_uterina,
      movimientos_fetales: data.movimientos_fetales === undefined ? undefined : (data.movimientos_fetales ? 'si' : 'no'),
      edemas: data.edemas === undefined ? undefined : (data.edemas ? 'si' : 'no'),
      recomendaciones: data.recomendaciones,
    };
    const r = await (this.db as any).control_prenatal.update({ where: { id }, data: payload });
    return r as ControlRecord;
  }

  async delete(id: string): Promise<void> {
    await (this.db as any).control_prenatal.delete({ where: { id } });
  }

  async findOverdue(fechaLimite: Date): Promise<ControlRecord[]> {
    const rows = await (this.db as any).control_prenatal.findMany({ where: { fecha_control: { lt: fechaLimite } }, orderBy: { fecha_control: 'asc' } });
    return rows as ControlRecord[];
  }

  async findPending(fechaActual: Date): Promise<ControlRecord[]> {
    const rows = await (this.db as any).control_prenatal.findMany({ where: { fecha_control: { gte: fechaActual } }, orderBy: { fecha_control: 'asc' } });
    return rows as ControlRecord[];
  }
}

export default ControlRepositoryImpl;
