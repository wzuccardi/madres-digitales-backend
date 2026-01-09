import { Database } from '../../core/database';
import { IAlertaRepository, AlertaRecord, CreateAlertaData, UpdateAlertaData } from '../../domain/repositories/alerta.repository.interface';

export class AlertaRepositoryImpl implements IAlertaRepository {
  private db = Database.getInstance();

  async findAll(): Promise<AlertaRecord[]> {
    const rows = await (this.db as any).alertas.findMany({
      include: {
        gestante: { select: { id: true, nombre: true, documento: true, telefono: true, municipios: { select: { id: true, nombre: true, departamento: true } } } },
        madrina: { select: { id: true, nombre: true, telefono: true } },
      },
      orderBy: [{ nivel_prioridad: 'desc' }, { fecha_creacion: 'desc' }],
    });
    return rows as AlertaRecord[];
  }

  async findById(id: string): Promise<AlertaRecord | null> {
    const r = await (this.db as any).alertas.findUnique({
      where: { id },
      include: {
        gestante: { select: { id: true, nombre: true, documento: true, telefono: true, municipios: { select: { id: true, nombre: true } } } },
        madrina: { select: { id: true, nombre: true } },
      },
    });
    return r as AlertaRecord | null;
  }

  async findByMadrina(madrinaId: string): Promise<AlertaRecord[]> {
    const rows = await (this.db as any).alertas.findMany({
      where: { OR: [{ madrina_id: madrinaId }, { gestante: { madrina_id: madrinaId } }] },
      include: {
        gestante: { select: { id: true, nombre: true, documento: true, telefono: true, municipios: { select: { id: true, nombre: true, departamento: true } } } },
        madrina: { select: { id: true, nombre: true, telefono: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    return rows as AlertaRecord[];
  }

  async findByGestante(gestanteId: string): Promise<AlertaRecord[]> {
    const rows = await (this.db as any).alertas.findMany({ where: { gestante_id: gestanteId } });
    return rows as AlertaRecord[];
  }

  async findActivas(): Promise<AlertaRecord[]> {
    const rows = await (this.db as any).alertas.findMany({ where: { resuelta: false } });
    return rows as AlertaRecord[];
  }

  async count(where?: any): Promise<number> {
    return (this.db as any).alerta.count({ where });
  }

  async groupByPriority(where?: any): Promise<Array<{ nivel_prioridad: string; _count: { id: number } }>> {
    return (this.db as any).alerta.groupBy({ by: ['nivel_prioridad'], where, _count: { id: true } });
  }

  async groupByType(where?: any): Promise<Array<{ tipo_alerta: string; _count: { id: number } }>> {
    return (this.db as any).alerta.groupBy({ by: ['tipo_alerta'], where, _count: { id: true } });
  }

  async create(data: CreateAlertaData): Promise<AlertaRecord> {
    const r = await (this.db as any).alertas.create({ data, include: { gestante: { select: { id: true, nombre: true, municipios: { select: { id: true, nombre: true } } } }, madrina: { select: { id: true, nombre: true } } } });
    return r as AlertaRecord;
  }

  async update(id: string, data: UpdateAlertaData): Promise<AlertaRecord> {
    const r = await (this.db as any).alertas.update({ where: { id }, data, include: { gestante: { select: { id: true, nombre: true } } } });
    return r as AlertaRecord;
  }

  async delete(id: string): Promise<void> {
    await (this.db as any).alertas.delete({ where: { id } });
  }

  async getGestanteMinimal(id: string): Promise<{ id: string; nombre: string; madrina_id?: string | null; municipio_id?: string | null; medico_tratante_id?: string | null } | null> {
    const g = await (this.db as any).gestantes.findUnique({ where: { id }, select: { id: true, nombre: true, madrina_id: true, medico_tratante_id: true, municipio_id: true } });
    return g || null;
  }
}

export default AlertaRepositoryImpl;