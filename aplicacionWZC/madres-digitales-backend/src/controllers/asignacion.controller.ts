import { Request, Response } from 'express';
import AsignacionRepositoryImpl from '../infrastructure/repositories/asignacion.repository.impl';

const repo = new AsignacionRepositoryImpl();

export const listarAsignacionesMadrinas = async (req: Request, res: Response) => {
  try {
    const coordinadorId = (req.query.coordinador_id as string) || '';
    if (!coordinadorId) {
      return res.status(400).json({ success: false, error: 'coordinador_id requerido' });
    }
    const rows = await repo.listarPorCoordinador(coordinadorId);
    return res.json({ success: true, data: rows });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || 'Error' });
  }
};

export const asignarMadrina = async (req: Request, res: Response) => {
  try {
    const { coordinador_id, madrina_id } = req.body || {};
    if (!coordinador_id || !madrina_id) {
      return res.status(400).json({ success: false, error: 'coordinador_id y madrina_id son requeridos' });
    }
    const row = await repo.asignar(coordinador_id, madrina_id);
    return res.status(201).json({ success: true, data: row });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || 'Error' });
  }
};

export const desasignarMadrina = async (req: Request, res: Response) => {
  try {
    const { coordinador_id, madrina_id } = req.body || {};
    if (!coordinador_id || !madrina_id) {
      return res.status(400).json({ success: false, error: 'coordinador_id y madrina_id son requeridos' });
    }
    await repo.desasignar(coordinador_id, madrina_id);
    return res.status(204).send();
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || 'Error' });
  }
};