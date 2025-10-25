"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoverageOverview = exports.reassignFromInactiveMadrina = exports.getAssignmentStats = exports.runAutoAssignment = exports.assignMedico = exports.assignMadrina = void 0;
const assignment_service_1 = require("../services/assignment.service");
const assignmentService = new assignment_service_1.AssignmentService();
/**
 * Asignar madrina a gestante específica
 */
const assignMadrina = async (req, res) => {
    try {
        const { gestanteId } = req.params;
        if (!gestanteId) {
            return res.status(400).json({
                success: false,
                error: 'ID de gestante requerido',
            });
        }
        console.log('🎯 AssignmentController: Asignando madrina a gestante:', gestanteId);
        const madrinaId = await assignmentService.assignMadrinaToGestante(gestanteId);
        if (!madrinaId) {
            return res.status(404).json({
                success: false,
                error: 'No se pudo asignar madrina. No hay madrinas disponibles.',
            });
        }
        res.json({
            success: true,
            message: 'Madrina asignada exitosamente',
            data: {
                gestanteId,
                madrinaId,
            },
        });
    }
    catch (error) {
        console.error('❌ AssignmentController: Error asignando madrina:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.assignMadrina = assignMadrina;
/**
 * Asignar médico a gestante específica
 */
const assignMedico = async (req, res) => {
    try {
        const { gestanteId } = req.params;
        if (!gestanteId) {
            return res.status(400).json({
                success: false,
                error: 'ID de gestante requerido',
            });
        }
        console.log('🏥 AssignmentController: Asignando médico a gestante:', gestanteId);
        const medicoId = await assignmentService.assignMedicoToGestante(gestanteId);
        if (!medicoId) {
            return res.status(404).json({
                success: false,
                error: 'No se pudo asignar médico. No hay médicos disponibles.',
            });
        }
        res.json({
            success: true,
            message: 'Médico asignado exitosamente',
            data: {
                gestanteId,
                medicoId,
            },
        });
    }
    catch (error) {
        console.error('❌ AssignmentController: Error asignando médico:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.assignMedico = assignMedico;
/**
 * Ejecutar asignación automática masiva
 */
const runAutoAssignment = async (req, res) => {
    try {
        console.log('🚀 AssignmentController: Iniciando asignación automática masiva...');
        const result = await assignmentService.runAutoAssignment();
        res.json({
            success: true,
            message: 'Asignación automática completada',
            data: result,
        });
    }
    catch (error) {
        console.error('❌ AssignmentController: Error en asignación automática:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.runAutoAssignment = runAutoAssignment;
/**
 * Obtener estadísticas de asignación
 */
const getAssignmentStats = async (req, res) => {
    try {
        const { municipioId } = req.query;
        console.log('📊 AssignmentController: Obteniendo estadísticas de asignación...');
        const stats = await assignmentService.getAssignmentStatsByMunicipio(municipioId);
        res.json({
            success: true,
            message: 'Estadísticas obtenidas exitosamente',
            data: stats,
        });
    }
    catch (error) {
        console.error('❌ AssignmentController: Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.getAssignmentStats = getAssignmentStats;
/**
 * Reasignar gestantes de madrina inactiva
 */
const reassignFromInactiveMadrina = async (req, res) => {
    try {
        const { madrinaId } = req.params;
        if (!madrinaId) {
            return res.status(400).json({
                success: false,
                error: 'ID de madrina requerido',
            });
        }
        console.log('🔄 AssignmentController: Reasignando gestantes de madrina inactiva:', madrinaId);
        const reasignadas = await assignmentService.reassignGestantesFromInactiveMadrina(madrinaId);
        res.json({
            success: true,
            message: `${reasignadas} gestantes reasignadas exitosamente`,
            data: {
                madrinaId,
                gestantesReasignadas: reasignadas,
            },
        });
    }
    catch (error) {
        console.error('❌ AssignmentController: Error reasignando gestantes:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.reassignFromInactiveMadrina = reassignFromInactiveMadrina;
/**
 * Obtener resumen de cobertura general
 */
const getCoverageOverview = async (req, res) => {
    try {
        console.log('📈 AssignmentController: Obteniendo resumen de cobertura...');
        const stats = await assignmentService.getAssignmentStatsByMunicipio();
        // Calcular totales generales
        const totals = stats.reduce((acc, municipio) => {
            acc.gestantes += municipio.gestantes.total;
            acc.conMadrina += municipio.gestantes.conMadrina;
            acc.conMedico += municipio.gestantes.conMedico;
            acc.madrinas += municipio.recursos.madrinas;
            acc.medicos += municipio.recursos.medicos;
            return acc;
        }, {
            gestantes: 0,
            conMadrina: 0,
            conMedico: 0,
            madrinas: 0,
            medicos: 0,
        });
        const overview = {
            resumen: {
                totalGestantes: totals.gestantes,
                totalMadrinas: totals.madrinas,
                totalMedicos: totals.medicos,
                coberturaGlobalMadrinas: totals.gestantes > 0 ?
                    ((totals.conMadrina / totals.gestantes) * 100).toFixed(1) + '%' : '0%',
                coberturaGlobalMedicos: totals.gestantes > 0 ?
                    ((totals.conMedico / totals.gestantes) * 100).toFixed(1) + '%' : '0%',
                gestantesSinMadrina: totals.gestantes - totals.conMadrina,
                gestantesSinMedico: totals.gestantes - totals.conMedico,
            },
            porMunicipio: stats,
        };
        res.json({
            success: true,
            message: 'Resumen de cobertura obtenido exitosamente',
            data: overview,
        });
    }
    catch (error) {
        console.error('❌ AssignmentController: Error obteniendo resumen:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.getCoverageOverview = getCoverageOverview;
