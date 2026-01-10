// Controlador para Médicos
// Todos los datos provienen de la base de datos real, no se usan mocks
import { Request, Response } from 'express';
import MedicoCrudService from '../services/medico-crud.service';

export const getAllMedicos = async (req: Request, res: Response) => {
  try {
    console.log('🩺 Controller: Fetching all medicos...');
    const medicos = await MedicoCrudService.getActiveMedicos();
    console.log(`🩺 Controller: Found ${medicos.length} active medicos`);
    res.json(medicos);
  } catch (error) {
    console.error('❌ Controller: Error in getAllMedicos:', error);
    res.status(500).json({ error: 'Error al obtener médicos' });
  }
};

export const getMedicoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🩺 Controller: Fetching medico with id: ${id}`);
    
    const medico = await MedicoCrudService.getMedicoById(id);
    
    if (!medico) {
      return res.status(404).json({ error: 'Médico no encontrado' });
    }
    
    console.log(`🩺 Controller: Found medico: ${medico.nombre}`);
    res.json(medico);
  } catch (error) {
    console.error('❌ Controller: Error in getMedicoById:', error);
    res.status(500).json({ error: 'Error al obtener médico' });
  }
};

export const createMedico = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    console.log('🩺 Controller: Creating new medico:', data.nombre);
    
    // Validar campos requeridos
    if (!data.nombre || !data.documento || !data.registro_medico || !data.especialidad) {
      return res.status(400).json({ 
        error: 'Campos requeridos: nombre, documento, registro_medico, especialidad' 
      });
    }
    
    const medico = await MedicoCrudService.createMedico(data);
    
    console.log(`✅ Controller: Created medico with id: ${medico.id}`);
    res.status(201).json(medico);
  } catch (error) {
    console.error('❌ Controller: Error in createMedico:', error);
    
    // Manejar errores específicos de Prisma
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return res.status(400).json({ 
        error: 'Ya existe un médico con ese documento o registro médico' 
      });
    }
    
    res.status(500).json({ error: 'Error al crear médico' });
  }
};

export const updateMedico = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    console.log(`🩺 Controller: Updating medico with id: ${id}`);
    
    // Verificar que el médico existe
    const existingMedico = await MedicoCrudService.getMedicoById(id);
    if (!existingMedico) {
      return res.status(404).json({ error: 'Médico no encontrado' });
    }
    
    const medico = await MedicoCrudService.updateMedico(id, data);
    
    console.log(`✅ Controller: Updated medico: ${medico.nombre}`);
    res.json(medico);
  } catch (error) {
    console.error('❌ Controller: Error in updateMedico:', error);
    
    // Manejar errores específicos de Prisma
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return res.status(400).json({ 
        error: 'Ya existe un médico con ese documento o registro médico' 
      });
    }
    
    res.status(500).json({ error: 'Error al actualizar médico' });
  }
};

export const deleteMedico = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🩺 Controller: Deleting medico with id: ${id}`);
    
    // Verificar que el médico existe
    const existingMedico = await MedicoCrudService.getMedicoById(id);
    if (!existingMedico) {
      return res.status(404).json({ error: 'Médico no encontrado' });
    }
    
    // En lugar de eliminar físicamente, marcar como inactivo
    await MedicoCrudService.deleteMedico(id);
    
    console.log(`✅ Controller: Deactivated medico: ${existingMedico.nombre}`);
    res.status(204).send();
  } catch (error) {
    console.error('❌ Controller: Error in deleteMedico:', error);
    res.status(500).json({ error: 'Error al eliminar médico' });
  }
};

// Controlador para obtener médicos por IPS
export const getMedicosByIPS = async (req: Request, res: Response) => {
  try {
    const { ipsId } = req.params;
    console.log(`🩺 Controller: Fetching medicos for IPS: ${ipsId}`);
    
    const medicos = await MedicoCrudService.getMedicosByIps(ipsId);
    
    console.log(`🩺 Controller: Found ${medicos.length} medicos for IPS`);
    res.json(medicos);
  } catch (error) {
    console.error('❌ Controller: Error in getMedicosByIPS:', error);
    res.status(500).json({ error: 'Error al obtener médicos de la IPS' });
  }
};

// Controlador para obtener médicos por especialidad
export const getMedicosByEspecialidad = async (req: Request, res: Response) => {
  try {
    const { especialidad } = req.params;
    console.log(`🩺 Controller: Fetching medicos with especialidad: ${especialidad}`);
    
    const medicos = await MedicoCrudService.getMedicosByEspecialidad(especialidad);
    
    console.log(`🩺 Controller: Found ${medicos.length} medicos with especialidad ${especialidad}`);
    res.json(medicos);
  } catch (error) {
    console.error('❌ Controller: Error in getMedicosByEspecialidad:', error);
    res.status(500).json({ error: 'Error al obtener médicos por especialidad' });
  }
};
