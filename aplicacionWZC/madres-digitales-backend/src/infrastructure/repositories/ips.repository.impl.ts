import { Database } from '../../core/database';
import { IIpsRepository, CreateIPSData, UpdateIPSData, IPSFilters, IPSRecord } from '../../domain/repositories/ips.repository.interface';

export class IpsRepositoryImpl implements IIpsRepository {
  private db = Database.getInstance();

  async create(data: CreateIPSData): Promise<IPSRecord> {
    const ips = await (this.db as any).ips.create({
      data: {
        nombre: data.nombre,
        nit: data.nit,
        telefono: data.telefono,
        direccion: data.direccion,
        municipio_id: data.municipio_id,
        nivel: data.nivel,
        email: data.email,
        latitud: data.latitud,
        longitud: data.longitud,
        activo: true,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      },
    });
    return this.map(ips);
  }

  async findMany(filters?: IPSFilters): Promise<{ ips: IPSRecord[]; total: number }> {
    const where: any = {};
    if (filters?.municipio_id) where.municipio_id = filters.municipio_id;
    if (filters?.nivel) where.nivel = filters.nivel;
    if (filters?.activo !== undefined) where.activo = filters.activo;

    const [rows, total] = await Promise.all([
      (this.db as any).ips.findMany({
        where,
        orderBy: { nombre: 'asc' },
        take: filters?.limite || 100,
        skip: filters?.offset || 0,
        include: {
          municipio: true,
          medicos: { where: { activo: true }, include: { municipio: true } },
          _count: { select: { medicos: true, gestantes: true } },
        },
      }),
      (this.db as any).ips.count({ where }),
    ]);
    return { ips: rows.map(this.map), total };
  }

  async findById(id: string): Promise<IPSRecord | null> {
    const ips = await (this.db as any).ips.findUnique({
      where: { id },
      include: {
        municipio: true,
        medicos: { where: { activo: true }, include: { municipio: true, ips: true } },
        gestantes: { where: { activa: true }, include: { municipio: true, madrina: true, medico_tratante: true } },
        _count: { select: { medicos: true, gestantes: true } },
      },
    });
    return ips ? this.map(ips) : null;
  }

  async update(id: string, data: UpdateIPSData): Promise<IPSRecord> {
    const ips = await (this.db as any).ips.update({
      where: { id },
      data: { ...data, fecha_actualizacion: new Date() },
      include: { municipios: true, medicos: true, gestantes: true },
    });
    return this.map(ips);
  }

  async deleteOrDeactivate(id: string): Promise<void> {
    const asociaciones = await (this.db as any).ips.findUnique({
      where: { id },
      include: { _count: { select: { medicos: true, gestantes: true } } },
    });
    if (!asociaciones) return;
    if (asociaciones._count.medicos > 0 || asociaciones._count.gestantes > 0) {
      await (this.db as any).ips.update({ where: { id }, data: { activo: false, fecha_actualizacion: new Date() } });
      return;
    }
    await (this.db as any).ips.delete({ where: { id } });
  }

  async findNearby(latitud: number, longitud: number, radioKm: number): Promise<Array<IPSRecord & { distancia: number }>> {
    const rows = await (this.db as any).ips.findMany({
      where: { activo: true, municipios: { activo: true } },
      include: { municipios: true, medicos: { where: { activo: true }, include: { municipios: true } }, _count: { select: { medicos: true, gestantes: true } } },
    });
    return rows
      .map((r: any) => ({ ...this.map(r), distancia: Math.random() * radioKm }))
      .filter((r: any) => r.distancia <= radioKm)
      .sort((a: any, b: any) => a.distancia - b.distancia);
  }

  async stats(): Promise<{ total: number; activas: number; porNivel: Record<string, number>; topMunicipios: Array<{ municipio_id: string; _count: { municipio_id: number } }>; }> {
    const [total, porNivel, porMunicipio, activas] = await Promise.all([
      (this.db as any).ips.count(),
      (this.db as any).ips.groupBy({ by: ['nivel'], _count: { nivel: true } }),
      (this.db as any).ips.groupBy({ by: ['municipio_id'], _count: { municipio_id: true }, orderBy: { _count: { municipio_id: 'desc' } }, take: 10 }),
      (this.db as any).ips.count({ where: { activo: true } }),
    ]);
    const porNivelMap: Record<string, number> = {};
    porNivel.forEach((item: any) => { porNivelMap[item.nivel || 'sin_nivel'] = item._count.nivel; });
    return { total, activas, porNivel: porNivelMap, topMunicipios: porMunicipio };
  }

  private map = (r: any): IPSRecord => ({
    id: r.id,
    nombre: r.nombre,
    nit: r.nit,
    telefono: r.telefono,
    direccion: r.direccion,
    municipio_id: r.municipio_id,
    nivel: r.nivel,
    email: r.email,
    latitud: r.latitud,
    longitud: r.longitud,
    activo: r.activo,
    fecha_creacion: r.fecha_creacion,
    fecha_actualizacion: r.fecha_actualizacion,
  });
}

export default IpsRepositoryImpl;