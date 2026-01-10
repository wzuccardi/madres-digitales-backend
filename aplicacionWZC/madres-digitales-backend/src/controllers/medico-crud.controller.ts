// Controlador CRUD para Médicos
import { Request, Response } from 'express';
import medicoCrudService from '../services/medico-crud.service';

// Obtener todos los médicos
export const getAllMedicos = async (req: Request, res: Response) => {
    try {
        console.log('👨‍⚕️ Controller: Fetching all medicos...');
        const medicosList = await medicoCrudService.getAllMedicos();
        res.json(medicosList);
    } catch (error) {
        console.error('❌ Controller: Error fetching medicos:', error);
        res.status(500).json({
            error: 'Error al obtener médicos',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Obtener médicos activos
export const getActiveMedicos = async (req: Request, res: Response) => {
    try {
        console.log('👨‍⚕️ Controller: Fetching active medicos...');
        const medicosList = await medicoCrudService.getActiveMedicos();
        res.json(medicosList);
    } catch (error) {
        console.error('❌ Controller: Error fetching active medicos:', error);
        res.status(500).json({
            error: 'Error al obtener médicos activos',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Obtener médico por ID
export const getMedicoById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        console.log(`👨‍⚕️ Controller: Fetching medico ${id}...`);
        
        const medico = await medicoCrudService.getMedicoById(id);
        res.json(medico);
    } catch (error) {
        console.error('❌ Controller: Error fetching medico:', error);
        res.status(404).json({
            error: 'Médico no encontrado',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Obtener médicos por IPS
export const getMedicosByIps = async (req: Request, res: Response) => {
    try {
        const { ipsId } = req.params;
        console.log(`👨‍⚕️ Controller: Fetching medicos for IPS ${ipsId}...`);
        
        const medicosList = await medicoCrudService.getMedicosByIps(ipsId);
        res.json(medicosList);
    } catch (error) {
        console.error('❌ Controller: Error fetching medicos by IPS:', error);
        res.status(500).json({
            error: 'Error al obtener médicos por IPS',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Obtener médicos por especialidad
export const getMedicosByEspecialidad = async (req: Request, res: Response) => {
    try {
        const { especialidad } = req.params;
        console.log(`👨‍⚕️ Controller: Fetching medicos with especialidad ${especialidad}...`);
        
        const medicosList = await medicoCrudService.getMedicosByEspecialidad(especialidad);
        res.json(medicosList);
    } catch (error) {
        console.error('❌ Controller: Error fetching medicos by especialidad:', error);
        res.status(500).json({
            error: 'Error al obtener médicos por especialidad',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Crear nuevo médico
export const createMedico = async (req: Request, res: Response) => {
    try {
        console.log('👨‍⚕️ Controller: Creating new medico...');
        
        const newMedico = await medicoCrudService.createMedico(req.body);
        res.status(201).json(newMedico);
    } catch (error) {
        console.error('❌ Controller: Error creating medico:', error);
        res.status(400).json({
            error: 'Error al crear médico',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Actualizar médico
export const updateMedico = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        console.log(`👨‍⚕️ Controller: Updating medico ${id}...`);
        
        const updatedMedico = await medicoCrudService.updateMedico(id, req.body);
        res.json(updatedMedico);
    } catch (error) {
        console.error('❌ Controller: Error updating medico:', error);
        res.status(400).json({
            error: 'Error al actualizar médico',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Eliminar médico (soft delete)
export const deleteMedico = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        console.log(`👨‍⚕️ Controller: Deleting medico ${id}...`);
        
        const deletedMedico = await medicoCrudService.deleteMedico(id);
        res.json({
            message: 'Médico eliminado exitosamente',
            medico: deletedMedico
        });
    } catch (error) {
        console.error('❌ Controller: Error deleting medico:', error);
        res.status(400).json({
            error: 'Error al eliminar médico',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Buscar médicos por nombre
export const searchMedicos = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        
        if (!q || typeof q !== 'string') {
            return res.status(400).json({
                error: 'Parámetro de búsqueda requerido'
            });
        }

        console.log(`👨‍⚕️ Controller: Searching medicos with term: ${q}...`);
        const medicosList = await medicoCrudService.searchMedicosByName(q);
        res.json(medicosList);
    } catch (error) {
        console.error('❌ Controller: Error searching medicos:', error);
        res.status(500).json({
            error: 'Error al buscar médicos',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

