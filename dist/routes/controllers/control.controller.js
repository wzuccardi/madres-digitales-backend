"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getControlesPendientes = exports.getControlesVencidos = exports.getProximoControl = exports.getControlConGestante = exports.getEvolucionGestante = exports.getHistorialControles = exports.deleteControl = exports.updateControl = exports.createControl = exports.getControlById = exports.getAllControles = void 0;
const control_service_1 = require("../services/control.service");
const auth_utils_1 = require("../utils/auth.utils");
const controlService = new control_service_1.ControlService();
const getAllControles = async (req, res) => {
    try {
        // IMPLEMENTACIÓN DE SEGURIDAD: Filtrar por madrina o mostrar todas si es admin
        const user = await (0, auth_utils_1.getUserForFiltering)(req);
        console.log(`🔐 Controller: Fetching controles for user ${user.id} with role ${user.rol}`);
        let controles;
        if ((0, auth_utils_1.canViewAllData)(user.rol)) {
            // Administradores y coordinadores ven todos los controles
            console.log(`👑 Admin/Coordinador access: Fetching ALL controles`);
            controles = await controlService.getAllControles();
        }
        else {
            // Madrinas solo ven controles de sus gestantes asignadas
            console.log(`❤️ Madrina access: Fetching controles for madrina ${user.id}`);
            controles = await controlService.getControlesByMadrina(user.id);
        }
        console.log(`🔐 Controller: Returning ${controles.length} controles for ${user.rol}`);
        res.json(controles);
    }
    catch (error) {
        console.error('❌ Controller: Error fetching controles:', error);
        res.status(500).json({ error: 'Error al obtener controles' });
    }
};
exports.getAllControles = getAllControles;
const getControlById = async (req, res) => {
    try {
        const control = await controlService.getControlById(req.params.id);
        if (!control)
            return res.status(404).json({ error: 'Control no encontrado' });
        res.json(control);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener control' });
    }
};
exports.getControlById = getControlById;
const createControl = async (req, res) => {
    try {
        console.log('🏥 Controller: Creating control with data:', req.body);
        // Validar datos requeridos
        const { gestante_id, fecha_control } = req.body;
        if (!gestante_id || !fecha_control) {
            return res.status(400).json({
                error: 'Los campos gestante_id y fecha_control son requeridos'
            });
        }
        // Validar fecha
        const fechaControl = new Date(fecha_control);
        if (isNaN(fechaControl.getTime())) {
            return res.status(400).json({
                error: 'La fecha del control no es válida'
            });
        }
        // Validar rangos médicos si se proporcionan
        if (req.body.peso && (req.body.peso < 30 || req.body.peso > 200)) {
            return res.status(400).json({
                error: 'El peso debe estar entre 30 y 200 kg'
            });
        }
        if (req.body.presion_sistolica && (req.body.presion_sistolica < 70 || req.body.presion_sistolica > 250)) {
            return res.status(400).json({
                error: 'La presión sistólica debe estar entre 70 y 250 mmHg'
            });
        }
        if (req.body.presion_diastolica && (req.body.presion_diastolica < 40 || req.body.presion_diastolica > 150)) {
            return res.status(400).json({
                error: 'La presión diastólica debe estar entre 40 y 150 mmHg'
            });
        }
        if (req.body.semanas_gestacion && (req.body.semanas_gestacion < 1 || req.body.semanas_gestacion > 42)) {
            return res.status(400).json({
                error: 'Las semanas de gestación deben estar entre 1 y 42'
            });
        }
        const control = await controlService.createControlCompleto(req.body);
        console.log('✅ Controller: Control created successfully:', control.id);
        res.status(201).json({
            message: 'Control creado exitosamente',
            control: control
        });
    }
    catch (error) {
        console.error('❌ Controller: Error creating control:', error);
        if (error instanceof Error && error.message.includes('No se encontró gestante')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({
            error: 'Error interno del servidor al crear control',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.createControl = createControl;
const updateControl = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🏥 Controller: Updating control ${id} with data:`, req.body);
        // Validar que el ID sea válido
        if (!id) {
            return res.status(400).json({ error: 'ID de control requerido' });
        }
        // Validar rangos médicos si se proporcionan
        if (req.body.peso && (req.body.peso < 30 || req.body.peso > 200)) {
            return res.status(400).json({
                error: 'El peso debe estar entre 30 y 200 kg'
            });
        }
        if (req.body.presion_sistolica && (req.body.presion_sistolica < 70 || req.body.presion_sistolica > 250)) {
            return res.status(400).json({
                error: 'La presión sistólica debe estar entre 70 y 250 mmHg'
            });
        }
        if (req.body.presion_diastolica && (req.body.presion_diastolica < 40 || req.body.presion_diastolica > 150)) {
            return res.status(400).json({
                error: 'La presión diastólica debe estar entre 40 y 150 mmHg'
            });
        }
        if (req.body.semanas_gestacion && (req.body.semanas_gestacion < 1 || req.body.semanas_gestacion > 42)) {
            return res.status(400).json({
                error: 'Las semanas de gestación deben estar entre 1 y 42'
            });
        }
        // Validar fecha si se proporciona
        if (req.body.fecha_control) {
            const fechaControl = new Date(req.body.fecha_control);
            if (isNaN(fechaControl.getTime())) {
                return res.status(400).json({
                    error: 'La fecha del control no es válida'
                });
            }
        }
        const control = await controlService.updateControlCompleto(id, req.body);
        console.log(`✅ Controller: Control ${id} updated successfully`);
        res.json({
            message: 'Control actualizado exitosamente',
            control: control
        });
    }
    catch (error) {
        console.error(`❌ Controller: Error updating control ${req.params.id}:`, error);
        if (error instanceof Error) {
            if (error.message.includes('No se encontró control')) {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('No se encontró gestante')) {
                return res.status(404).json({ error: error.message });
            }
        }
        res.status(500).json({
            error: 'Error interno del servidor al actualizar control',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.updateControl = updateControl;
const deleteControl = async (req, res) => {
    try {
        await controlService.deleteControl(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Error al eliminar control' });
    }
};
exports.deleteControl = deleteControl;
// NUEVO: Obtener historial de controles de una gestante
const getHistorialControles = async (req, res) => {
    try {
        const { gestanteId } = req.params;
        console.log(`📊 Controller: Fetching historial for gestante ${gestanteId}`);
        const historial = await controlService.getHistorialControles(gestanteId);
        res.json({
            gestante_id: gestanteId,
            total_controles: historial.length,
            controles: historial
        });
    }
    catch (error) {
        console.error('❌ Controller: Error fetching historial:', error);
        res.status(500).json({
            error: 'Error al obtener historial de controles',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getHistorialControles = getHistorialControles;
// NUEVO: Obtener evolución de gestante para gráficas
const getEvolucionGestante = async (req, res) => {
    try {
        const { gestanteId } = req.params;
        console.log(`📈 Controller: Fetching evolution for gestante ${gestanteId}`);
        const evolucion = await controlService.getEvolucionGestante(gestanteId);
        res.json(evolucion);
    }
    catch (error) {
        console.error('❌ Controller: Error fetching evolution:', error);
        res.status(500).json({
            error: 'Error al obtener evolución de gestante',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getEvolucionGestante = getEvolucionGestante;
// NUEVO: Obtener control con datos de gestante
const getControlConGestante = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Controller: Fetching control ${id} with gestante data`);
        const control = await controlService.getControlConGestante(id);
        res.json(control);
    }
    catch (error) {
        console.error('❌ Controller: Error fetching control with gestante:', error);
        if (error instanceof Error && error.message.includes('not found')) {
            return res.status(404).json({ error: 'Control no encontrado' });
        }
        res.status(500).json({
            error: 'Error al obtener control',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getControlConGestante = getControlConGestante;
// NUEVO: Calcular próximo control recomendado
const getProximoControl = async (req, res) => {
    try {
        const { gestanteId } = req.params;
        console.log(`📅 Controller: Calculating next control for gestante ${gestanteId}`);
        const proximoControl = await controlService.calcularProximoControl(gestanteId);
        res.json(proximoControl);
    }
    catch (error) {
        console.error('❌ Controller: Error calculating next control:', error);
        res.status(500).json({
            error: 'Error al calcular próximo control',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getProximoControl = getProximoControl;
// NUEVO: Obtener controles vencidos o próximos a vencer
const getControlesVencidos = async (req, res) => {
    try {
        console.log(`⏰ Controller: Fetching overdue controls`);
        // IMPLEMENTACIÓN DE SEGURIDAD: Filtrar por madrina o mostrar todas si es admin
        const user = await (0, auth_utils_1.getUserForFiltering)(req);
        let controles;
        if ((0, auth_utils_1.canViewAllData)(user.rol)) {
            // Administradores y coordinadores ven todos los controles vencidos
            console.log(`👑 Admin/Coordinador access: Fetching ALL overdue controls`);
            controles = await controlService.getControlesVencidos();
        }
        else {
            // Madrinas solo ven controles vencidos de sus gestantes asignadas
            console.log(`❤️ Madrina access: Fetching overdue controls for madrina ${user.id}`);
            controles = await controlService.getControlesVencidosByMadrina(user.id);
        }
        console.log(`⏰ Controller: Returning ${controles.length} overdue controls for ${user.rol}`);
        res.json(controles);
    }
    catch (error) {
        console.error('❌ Controller: Error fetching overdue controls:', error);
        res.status(500).json({
            error: 'Error al obtener controles vencidos',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getControlesVencidos = getControlesVencidos;
// NUEVO: Obtener controles pendientes (no realizados)
const getControlesPendientes = async (req, res) => {
    try {
        console.log(`📋 Controller: Fetching pending controls`);
        // IMPLEMENTACIÓN DE SEGURIDAD: Filtrar por madrina o mostrar todas si es admin
        const user = await (0, auth_utils_1.getUserForFiltering)(req);
        let controles;
        if ((0, auth_utils_1.canViewAllData)(user.rol)) {
            // Administradores y coordinadores ven todos los controles pendientes
            console.log(`👑 Admin/Coordinador access: Fetching ALL pending controls`);
            controles = await controlService.getControlesPendientes();
        }
        else {
            // Madrinas solo ven controles pendientes de sus gestantes asignadas
            console.log(`❤️ Madrina access: Fetching pending controls for madrina ${user.id}`);
            controles = await controlService.getControlesPendientesByMadrina(user.id);
        }
        console.log(`📋 Controller: Returning ${controles.length} pending controls for ${user.rol}`);
        res.json(controles);
    }
    catch (error) {
        console.error('❌ Controller: Error fetching pending controls:', error);
        res.status(500).json({
            error: 'Error al obtener controles pendientes',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getControlesPendientes = getControlesPendientes;
