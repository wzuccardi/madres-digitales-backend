import { Database } from '../../core/database';
import { IReporteRepository, ControlRecord, AlertaRecord, MunicipioRecord, GestanteBasic, ReporteFilters } from '../../domain/repositories/reporte.repository.interface';

export class ReporteRepositoryImpl implements IReporteRepository {
  private db = Database.getInstance();

  async countGestantes(where?: any): Promise<number> {
    return (this.db as any).gestante.count({ where });
  }

  async countControles(where?: any): Promise<number> {
    return (this.db as any).controlPrenatal.count({ where });
  }

  async countAlertas(where?: any): Promise<number> {
    return (this.db as any).alerta.count({ where });
  }

  async findControles(fechaInicio: Date, fechaFin: Date): Promise<ControlRecord[]> {
    const rows = await (this.db as any).controlPrenatal.findMany({
      where: { fecha_control: { gte: fechaInicio, lte: fechaFin } },
      select: { id: true, fecha_control: true, gestante_id: true },
      orderBy: { fecha_control: 'asc' },
    });
    return rows as ControlRecord[];
  }

  async findGestantes(filters?: ReporteFilters): Promise<GestanteBasic[]> {
    const where: any = {};
    if (filters?.municipio_id) where.municipio_id = filters.municipio_id;
    if (filters?.riesgo === 'alto') where.riesgo_alto = true; else if (filters?.riesgo === 'bajo') where.riesgo_alto = false;
    if (filters?.madrina_id) where.madrina_id = filters.madrina_id;
    if ((filters as any)?.madrina_ids && Array.isArray((filters as any).madrina_ids)) where.madrina_id = { in: (filters as any).madrina_ids };
    const rows = await (this.db as any).gestante.findMany({ where, select: { id: true, municipio_id: true, riesgo_alto: true } });
    return rows as GestanteBasic[];
  }

  async findMunicipios(): Promise<MunicipioRecord[]> {
    const rows = await (this.db as any).municipio.findMany();
    return rows as MunicipioRecord[];
  }

  async findAlertasSince(fechaInicio: Date): Promise<AlertaRecord[]> {
    const rows = await (this.db as any).alerta.findMany({ where: { created_at: { gte: fechaInicio } }, select: { id: true, created_at: true } });
    return rows as AlertaRecord[];
  }

  async findAlertasAll(): Promise<AlertaRecord[]> {
    const rows = await (this.db as any).alerta.findMany({ select: { id: true, tipo_alerta: true, nivel_prioridad: true, resuelta: true } });
    return rows as AlertaRecord[];
  }
}

export default ReporteRepositoryImpl;