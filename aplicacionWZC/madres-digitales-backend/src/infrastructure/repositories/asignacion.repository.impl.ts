import Database from '../../core/database';

export class AsignacionRepositoryImpl {
  private db = Database.getInstance();

  async listarPorCoordinador(coordinadorId: string) {
    const rows = await (this.db as any).$queryRawUnsafe(
      'SELECT coordinador_id, madrina_id, fecha_asignacion FROM coordinadores_madrinas WHERE coordinador_id = $1',
      coordinadorId
    );
    return rows as Array<{ coordinador_id: string; madrina_id: string; fecha_asignacion: Date }>;
  }

  async asignar(coordinadorId: string, madrinaId: string) {
    await (this.db as any).$executeRawUnsafe(
      'INSERT INTO coordinadores_madrinas (id, coordinador_id, madrina_id, fecha_asignacion) VALUES ($1, $2, $3, NOW()) ON CONFLICT (coordinador_id, madrina_id) DO NOTHING',
      `${coordinadorId}_${madrinaId}`,
      coordinadorId,
      madrinaId
    );
    return { coordinador_id: coordinadorId, madrina_id: madrinaId };
  }

  async desasignar(coordinadorId: string, madrinaId: string) {
    await (this.db as any).$executeRawUnsafe(
      'DELETE FROM coordinadores_madrinas WHERE coordinador_id = $1 AND madrina_id = $2',
      coordinadorId,
      madrinaId
    );
  }
}

export default AsignacionRepositoryImpl;