"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchMedicos = exports.deleteMedico = exports.updateMedico = exports.createMedico = exports.getMedicosByEspecialidad = exports.getMedicosByIps = exports.getMedicoById = exports.getActiveMedicos = exports.getAllMedicos = void 0;
const medico_crud_service_1 = __importDefault(require("../services/medico-crud.service"));
// Obtener todos los médicos
const getAllMedicos = async (req, res) => {
    try {
        console.log('👨‍⚕️ Controller: Fetching all medicos...');
        const medicosList = await medico_crud_service_1.default.getAllMedicos();
        res.json(medicosList);
    }
    catch (error) {
        console.error('❌ Controller: Error fetching medicos:', error);
        res.status(500).json({
            error: 'Error al obtener médicos',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getAllMedicos = getAllMedicos;
// Obtener médicos activos
const getActiveMedicos = async (req, res) => {
    try {
        console.log('👨‍⚕️ Controller: Fetching active medicos...');
        const medicosList = await medico_crud_service_1.default.getActiveMedicos();
        res.json(medicosList);
    }
    catch (error) {
        console.error('❌ Controller: Error fetching active medicos:', error);
        res.status(500).json({
            error: 'Error al obtener médicos activos',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getActiveMedicos = getActiveMedicos;
// Obtener médico por ID
const getMedicoById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`👨‍⚕️ Controller: Fetching medico ${id}...`);
        const medico = await medico_crud_service_1.default.getMedicoById(id);
        res.json(medico);
    }
    catch (error) {
        console.error('❌ Controller: Error fetching medico:', error);
        res.status(404).json({
            error: 'Médico no encontrado',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getMedicoById = getMedicoById;
// Obtener médicos por IPS
const getMedicosByIps = async (req, res) => {
    try {
        const { ipsId } = req.params;
        console.log(`👨‍⚕️ Controller: Fetching medicos for IPS ${ipsId}...`);
        const medicosList = await medico_crud_service_1.default.getMedicosByIps(ipsId);
        res.json(medicosList);
    }
    catch (error) {
        console.error('❌ Controller: Error fetching medicos by IPS:', error);
        res.status(500).json({
            error: 'Error al obtener médicos por IPS',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getMedicosByIps = getMedicosByIps;
// Obtener médicos por especialidad
const getMedicosByEspecialidad = async (req, res) => {
    try {
        const { especialidad } = req.params;
        console.log(`👨‍⚕️ Controller: Fetching medicos with especialidad ${especialidad}...`);
        const medicosList = await medico_crud_service_1.default.getMedicosByEspecialidad(especialidad);
        res.json(medicosList);
    }
    catch (error) {
        console.error('❌ Controller: Error fetching medicos by especialidad:', error);
        res.status(500).json({
            error: 'Error al obtener médicos por especialidad',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getMedicosByEspecialidad = getMedicosByEspecialidad;
// Crear nuevo médico
const createMedico = async (req, res) => {
    try {
        console.log('👨‍⚕️ Controller: Creating new medico...');
        const newMedico = await medico_crud_service_1.default.createMedico(req.body);
        res.status(201).json(newMedico);
    }
    catch (error) {
        console.error('❌ Controller: Error creating medico:', error);
        res.status(400).json({
            error: 'Error al crear médico',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.createMedico = createMedico;
// Actualizar médico
const updateMedico = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`👨‍⚕️ Controller: Updating medico ${id}...`);
        const updatedMedico = await medico_crud_service_1.default.updateMedico(id, req.body);
        res.json(updatedMedico);
    }
    catch (error) {
        console.error('❌ Controller: Error updating medico:', error);
        res.status(400).json({
            error: 'Error al actualizar médico',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.updateMedico = updateMedico;
// Eliminar médico (soft delete)
const deleteMedico = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`👨‍⚕️ Controller: Deleting medico ${id}...`);
        const deletedMedico = await medico_crud_service_1.default.deleteMedico(id);
        res.json({
            message: 'Médico eliminado exitosamente',
            medico: deletedMedico
        });
    }
    catch (error) {
        console.error('❌ Controller: Error deleting medico:', error);
        res.status(400).json({
            error: 'Error al eliminar médico',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.deleteMedico = deleteMedico;
// Buscar médicos por nombre
const searchMedicos = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({
                error: 'Parámetro de búsqueda requerido'
            });
        }
        console.log(`👨‍⚕️ Controller: Searching medicos with term: ${q}...`);
        const medicosList = await medico_crud_service_1.default.searchMedicosByName(q);
        res.json(medicosList);
    }
    catch (error) {
        console.error('❌ Controller: Error searching medicos:', error);
        res.status(500).json({
            error: 'Error al buscar médicos',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.searchMedicos = searchMedicos;
