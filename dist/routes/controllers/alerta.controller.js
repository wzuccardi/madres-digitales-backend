"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolverAlerta = exports.getAlertasActivas = exports.getAlertasByGestante = exports.notificarEmergencia = exports.deleteAlerta = exports.updateAlerta = exports.createAlerta = exports.getAlertaById = exports.getAllAlertas = void 0;
const alerta_service_1 = require("../services/alerta.service");
const auth_utils_1 = require("../utils/auth.utils");
const alertaService = new alerta_service_1.AlertaService();
const getAllAlertas = async (req, res) => {
    try {
        // IMPLEMENTACIÓN DE SEGURIDAD: Filtrar por madrina o mostrar todas si es admin
        const user = await (0, auth_utils_1.getUserForFiltering)(req);
        console.log(`🔐 Controller: Fetching alertas for user ${user.id} with role ${user.rol}`);
        let alertas;
        if ((0, auth_utils_1.canViewAllData)(user.rol)) {
            // Administradores y coordinadores ven todas las alertas
            console.log(`👑 Admin/Coordinador access: Fetching ALL alertas`);
            alertas = await alertaService.getAllAlertas();
        }
        else {
            // Madrinas solo ven alertas de sus gestantes asignadas
            console.log(`❤️ Madrina access: Fetching alertas for madrina ${user.id}`);
            alertas = await alertaService.getAlertasByMadrina(user.id);
        }
        console.log(`🔐 Controller: Returning ${alertas.length} alertas for ${user.rol}`);
        res.json(alertas);
    }
    catch (error) {
        console.error('❌ Controller: Error fetching alertas:', error);
        res.status(500).json({ error: 'Error al obtener alertas' });
    }
};
exports.getAllAlertas = getAllAlertas;
const getAlertaById = async (req, res) => {
    try {
        const alerta = await alertaService.getAlertaById(req.params.id);
        if (!alerta)
            return res.status(404).json({ error: 'Alerta no encontrada' });
        res.json(alerta);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener alerta' });
    }
};
exports.getAlertaById = getAlertaById;
const createAlerta = async (req, res) => {
    try {
        console.log('🚨 Controller: Creating alert with data:', req.body);
        // Validar datos requeridos
        const { gestante_id, tipo_alerta, tipo } = req.body;
        if (!gestante_id || (!tipo_alerta && !tipo)) {
            return res.status(400).json({
                error: 'Los campos gestante_id y tipo_alerta son requeridos'
            });
        }
        // Validar nivel de prioridad si se proporciona
        const nivelesValidos = ['baja', 'media', 'alta', 'critica'];
        if (req.body.nivel_prioridad && !nivelesValidos.includes(req.body.nivel_prioridad)) {
            return res.status(400).json({
                error: 'El nivel de prioridad debe ser: baja, media, alta o critica'
            });
        }
        // Validar fecha si se proporciona
        if (req.body.fecha_alerta) {
            const fechaAlerta = new Date(req.body.fecha_alerta);
            if (isNaN(fechaAlerta.getTime())) {
                return res.status(400).json({
                    error: 'La fecha de la alerta no es válida'
                });
            }
        }
        const alerta = await alertaService.createAlertaCompleta(req.body);
        console.log('✅ Controller: Alert created successfully:', alerta.id);
        res.status(201).json({
            message: 'Alerta creada exitosamente',
            alerta: alerta
        });
    }
    catch (error) {
        console.error('❌ Controller: Error creating alert:', error);
        if (error instanceof Error && error.message.includes('No se encontró gestante')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({
            error: 'Error interno del servidor al crear alerta',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.createAlerta = createAlerta;
const updateAlerta = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🚨 Controller: Updating alert ${id} with data:`, req.body);
        // Validar que el ID sea válido
        if (!id) {
            return res.status(400).json({ error: 'ID de alerta requerido' });
        }
        // Validar nivel de prioridad si se proporciona
        const nivelesValidos = ['baja', 'media', 'alta', 'critica'];
        if (req.body.nivel_prioridad && !nivelesValidos.includes(req.body.nivel_prioridad)) {
            return res.status(400).json({
                error: 'El nivel de prioridad debe ser: baja, media, alta o critica'
            });
        }
        // Validar fecha si se proporciona
        if (req.body.fecha_alerta) {
            const fechaAlerta = new Date(req.body.fecha_alerta);
            if (isNaN(fechaAlerta.getTime())) {
                return res.status(400).json({
                    error: 'La fecha de la alerta no es válida'
                });
            }
        }
        const alerta = await alertaService.updateAlertaCompleta(id, req.body);
        console.log(`✅ Controller: Alert ${id} updated successfully`);
        res.json({
            message: 'Alerta actualizada exitosamente',
            alerta: alerta
        });
    }
    catch (error) {
        console.error(`❌ Controller: Error updating alert ${req.params.id}:`, error);
        if (error instanceof Error) {
            if (error.message.includes('No se encontró alerta')) {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('No se encontró gestante')) {
                return res.status(404).json({ error: error.message });
            }
        }
        res.status(500).json({
            error: 'Error interno del servidor al actualizar alerta',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.updateAlerta = updateAlerta;
const deleteAlerta = async (req, res) => {
    try {
        await alertaService.deleteAlerta(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Error al eliminar alerta' });
    }
};
exports.deleteAlerta = deleteAlerta;
// Controlador específico para alertas SOS
const notificarEmergencia = async (req, res) => {
    try {
        const { gestanteId, coordenadas } = req.body;
        // Validar datos requeridos
        if (!gestanteId) {
            return res.status(400).json({
                error: 'gestanteId es requerido para la alerta SOS'
            });
        }
        if (!coordenadas || !Array.isArray(coordenadas) || coordenadas.length !== 2) {
            return res.status(400).json({
                error: 'coordenadas debe ser un array de [longitud, latitud]'
            });
        }
        // Validar que las coordenadas sean números válidos
        const [lng, lat] = coordenadas;
        if (typeof lng !== 'number' || typeof lat !== 'number') {
            return res.status(400).json({
                error: 'Las coordenadas deben ser números válidos'
            });
        }
        // Crear alerta SOS
        const alertaSOS = await alertaService.notificarEmergencia(gestanteId, [lng, lat]);
        res.status(201).json({
            message: 'Alerta de emergencia SOS enviada exitosamente',
            alertaId: alertaSOS.id,
            gestanteId: gestanteId,
            coordenadas: coordenadas,
            timestamp: alertaSOS.created_at
        });
    }
    catch (error) {
        console.error('❌ Controller: Error in notificarEmergencia:', error);
        res.status(500).json({
            error: 'Error interno del servidor al procesar alerta SOS',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.notificarEmergencia = notificarEmergencia;
// Controlador para obtener alertas por gestante
const getAlertasByGestante = async (req, res) => {
    try {
        const { gestanteId } = req.params;
        const alertas = await alertaService.getAlertasByGestante(gestanteId);
        res.json(alertas);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener alertas de la gestante' });
    }
};
exports.getAlertasByGestante = getAlertasByGestante;
// Controlador para obtener alertas activas
const getAlertasActivas = async (req, res) => {
    try {
        const alertas = await alertaService.getAlertasActivas();
        res.json(alertas);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener alertas activas' });
    }
};
exports.getAlertasActivas = getAlertasActivas;
// Controlador para resolver una alerta
const resolverAlerta = async (req, res) => {
    try {
        const { id } = req.params;
        const { observaciones } = req.body;
        const alerta = await alertaService.resolverAlerta(id, observaciones);
        res.json({
            message: 'Alerta resuelta exitosamente',
            alerta: alerta
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al resolver alerta' });
    }
};
exports.resolverAlerta = resolverAlerta;
