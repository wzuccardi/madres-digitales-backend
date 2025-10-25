"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMedicosByEspecialidad = exports.getMedicosByIPS = exports.deleteMedico = exports.updateMedico = exports.createMedico = exports.getMedicoById = exports.getAllMedicos = void 0;
const database_1 = __importDefault(require("../config/database"));
const getAllMedicos = async (req, res) => {
    try {
        console.log('🩺 Controller: Fetching all medicos...');
        const medicos = await database_1.default.medico.findMany({
            where: { activo: true }, // Solo médicos activos
            orderBy: { nombre: 'asc' }
        });
        console.log(`🩺 Controller: Found ${medicos.length} active medicos`);
        res.json(medicos);
    }
    catch (error) {
        console.error('❌ Controller: Error in getAllMedicos:', error);
        res.status(500).json({ error: 'Error al obtener médicos' });
    }
};
exports.getAllMedicos = getAllMedicos;
const getMedicoById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🩺 Controller: Fetching medico with id: ${id}`);
        const medico = await database_1.default.medico.findUnique({
            where: { id }
        });
        if (!medico) {
            return res.status(404).json({ error: 'Médico no encontrado' });
        }
        console.log(`🩺 Controller: Found medico: ${medico.nombre}`);
        res.json(medico);
    }
    catch (error) {
        console.error('❌ Controller: Error in getMedicoById:', error);
        res.status(500).json({ error: 'Error al obtener médico' });
    }
};
exports.getMedicoById = getMedicoById;
const createMedico = async (req, res) => {
    try {
        const data = req.body;
        console.log('🩺 Controller: Creating new medico:', data.nombre);
        // Validar campos requeridos
        if (!data.nombre || !data.documento || !data.registro_medico || !data.especialidad) {
            return res.status(400).json({
                error: 'Campos requeridos: nombre, documento, registro_medico, especialidad'
            });
        }
        const medico = await database_1.default.medico.create({
            data: {
                nombre: data.nombre,
                documento: data.documento,
                registro_medico: data.registro_medico,
                especialidad: data.especialidad,
                telefono: data.telefono || null,
                email: data.email || null,
                ips_id: data.ips_id || null,
                activo: data.activo !== undefined ? data.activo : true,
            }
        });
        console.log(`✅ Controller: Created medico with id: ${medico.id}`);
        res.status(201).json(medico);
    }
    catch (error) {
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
exports.createMedico = createMedico;
const updateMedico = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        console.log(`🩺 Controller: Updating medico with id: ${id}`);
        // Verificar que el médico existe
        const existingMedico = await database_1.default.medico.findUnique({ where: { id } });
        if (!existingMedico) {
            return res.status(404).json({ error: 'Médico no encontrado' });
        }
        const medico = await database_1.default.medico.update({
            where: { id },
            data: {
                nombre: data.nombre || existingMedico.nombre,
                documento: data.documento || existingMedico.documento,
                registro_medico: data.registro_medico || existingMedico.registro_medico,
                especialidad: data.especialidad || existingMedico.especialidad,
                telefono: data.telefono !== undefined ? data.telefono : existingMedico.telefono,
                email: data.email !== undefined ? data.email : existingMedico.email,
                ips_id: data.ips_id !== undefined ? data.ips_id : existingMedico.ips_id,
                activo: data.activo !== undefined ? data.activo : existingMedico.activo,
                fecha_actualizacion: new Date(),
            }
        });
        console.log(`✅ Controller: Updated medico: ${medico.nombre}`);
        res.json(medico);
    }
    catch (error) {
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
exports.updateMedico = updateMedico;
const deleteMedico = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🩺 Controller: Deleting medico with id: ${id}`);
        // Verificar que el médico existe
        const existingMedico = await database_1.default.medico.findUnique({ where: { id } });
        if (!existingMedico) {
            return res.status(404).json({ error: 'Médico no encontrado' });
        }
        // En lugar de eliminar físicamente, marcar como inactivo
        await database_1.default.medico.update({
            where: { id },
            data: {
                activo: false,
                fecha_actualizacion: new Date()
            }
        });
        console.log(`✅ Controller: Deactivated medico: ${existingMedico.nombre}`);
        res.status(204).send();
    }
    catch (error) {
        console.error('❌ Controller: Error in deleteMedico:', error);
        res.status(500).json({ error: 'Error al eliminar médico' });
    }
};
exports.deleteMedico = deleteMedico;
// Controlador para obtener médicos por IPS
const getMedicosByIPS = async (req, res) => {
    try {
        const { ipsId } = req.params;
        console.log(`🩺 Controller: Fetching medicos for IPS: ${ipsId}`);
        const medicos = await database_1.default.medico.findMany({
            where: {
                ips_id: ipsId,
                activo: true
            },
            orderBy: { nombre: 'asc' }
        });
        console.log(`🩺 Controller: Found ${medicos.length} medicos for IPS`);
        res.json(medicos);
    }
    catch (error) {
        console.error('❌ Controller: Error in getMedicosByIPS:', error);
        res.status(500).json({ error: 'Error al obtener médicos de la IPS' });
    }
};
exports.getMedicosByIPS = getMedicosByIPS;
// Controlador para obtener médicos por especialidad
const getMedicosByEspecialidad = async (req, res) => {
    try {
        const { especialidad } = req.params;
        console.log(`🩺 Controller: Fetching medicos with especialidad: ${especialidad}`);
        const medicos = await database_1.default.medico.findMany({
            where: {
                especialidad: {
                    contains: especialidad,
                    mode: 'insensitive'
                },
                activo: true
            },
            orderBy: { nombre: 'asc' }
        });
        console.log(`🩺 Controller: Found ${medicos.length} medicos with especialidad ${especialidad}`);
        res.json(medicos);
    }
    catch (error) {
        console.error('❌ Controller: Error in getMedicosByEspecialidad:', error);
        res.status(500).json({ error: 'Error al obtener médicos por especialidad' });
    }
};
exports.getMedicosByEspecialidad = getMedicosByEspecialidad;
