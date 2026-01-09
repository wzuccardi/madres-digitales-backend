import { Database } from '../../core/database';
import { IMedicoRepository, MedicoRecord, CreateMedicoData, UpdateMedicoData } from '../../domain/repositories/medico.repository.interface';

export class MedicoRepositoryImpl implements IMedicoRepository {
  private db = Database.getInstance();

  async findMany(): Promise<MedicoRecord[]> {
    const rows = await (this.db as any).medico.findMany({ include: { ips: true, municipio: true }, orderBy: { nombre: 'asc' } });
    return rows.map(this.map);
  }

  async findActive(): Promise<MedicoRecord[]> {
    const rows = await (this.db as any).medico.findMany({ where: { activo: true }, include: { ips: true, municipio: true }, orderBy: { nombre: 'asc' } });
    return rows.map(this.map);
  }

  async findById(id: string): Promise<MedicoRecord | null> {
    const r = await (this.db as any).medico.findUnique({ where: { id }, include: { ips: true, municipio: true } });
    return r ? this.map(r) : null;
  }

  async findByIPS(ipsId: string): Promise<MedicoRecord[]> {
    const rows = await (this.db as any).medico.findMany({ where: { ips_id: ipsId, activo: true }, include: { ips: true, municipio: true }, orderBy: { nombre: 'asc' } });
    return rows.map(this.map);
  }

  async findByEspecialidad(especialidad: string): Promise<MedicoRecord[]> {
    const rows = await (this.db as any).medico.findMany({ where: { especialidad: { contains: especialidad, mode: 'insensitive' }, activo: true }, include: { ips: true, municipio: true }, orderBy: { nombre: 'asc' } });
    return rows.map(this.map);
  }

  async searchByName(term: string): Promise<MedicoRecord[]> {
    const rows = await (this.db as any).medico.findMany({ where: { nombre: { contains: term, mode: 'insensitive' }, activo: true }, include: { ips: true, municipio: true }, orderBy: { nombre: 'asc' } });
    return rows.map(this.map);
  }

  async create(data: CreateMedicoData): Promise<MedicoRecord> {
    const exists = await (this.db as any).medico.findFirst({ where: { documento: data.documento } });
    if (exists) throw new Error(`Ya existe un médico con documento ${data.documento}`);
    const r = await (this.db as any).medico.create({
      data: {
        nombre: data.nombre,
        documento: data.documento,
        registro_medico: data.registro_medico,
        especialidad: data.especialidad,
        telefono: data.telefono,
        email: data.email,
        ips_id: data.ips_id,
        municipio_id: data.municipio_id,
        activo: true,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      },
      include: { ips: true, municipio: true },
    });
    return this.map(r);
  }

  async update(id: string, data: UpdateMedicoData): Promise<MedicoRecord> {
    const r = await (this.db as any).medico.update({ where: { id }, data: { ...data, fecha_actualizacion: new Date() }, include: { ips: true, municipio: true } });
    return this.map(r);
  }

  async softDelete(id: string): Promise<MedicoRecord> {
    const r = await (this.db as any).medico.update({ where: { id }, data: { activo: false, fecha_actualizacion: new Date() }, include: { ips: true, municipio: true } });
    return this.map(r);
  }

  private map = (m: any): MedicoRecord => ({
    id: m.id,
    nombre: m.nombre,
    documento: m.documento,
    registro_medico: m.registro_medico,
    especialidad: m.especialidad,
    telefono: m.telefono,
    email: m.email,
    ips_id: m.ips_id,
    municipio_id: m.municipio_id,
    activo: m.activo,
    fecha_creacion: m.fecha_creacion,
    fecha_actualizacion: m.fecha_actualizacion,
  });
}

export default MedicoRepositoryImpl;