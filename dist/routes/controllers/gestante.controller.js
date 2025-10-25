"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularRiesgo = exports.asignarMadrina = exports.buscarGestantesCercanas = exports.deleteGestante = exports.updateGestante = exports.createGestante = exports.getGestanteById = exports.getAllGestantes = void 0;
const gestante_service_1 = require("../services/gestante.service");
const auth_utils_1 = require("../utils/auth.utils");
const gestante_dto_1 = require("../types/gestante.dto");
const gestanteService = new gestante_service_1.GestanteService();
/**
 * Búsqueda avanzada de gestantes con filtros y paginación
 */
const getAllGestantes = async (req, res) => {
    try {
        console.log('🔍 Controller: Searching gestantes with query:', req.query);
        // Validar y parsear filtros
        const filtros = gestante_dto_1.filtrosGestanteSchema.parse({
            ...req.query,
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 20,
            activa: req.query.activa === 'true' ? true : req.query.activa === 'false' ? false : undefined,
            riesgo_alto: req.query.riesgo_alto === 'true' ? true : req.query.riesgo_alto === 'false' ? false : undefined,
            sin_madrina: req.query.sin_madrina === 'true',
            sin_ips: req.query.sin_ips === 'true',
        });
        // Aplicar filtro de seguridad por rol
        const user = await (0, auth_utils_1.getUserForFiltering)(req);
        if (!(0, auth_utils_1.canViewAllData)(user.rol)) {
            // Madrinas solo ven sus gestantes
            filtros.madrina_id = user.id;
        }
        const resultado = await gestanteService.buscarGestantes(filtros);
        console.log(`✅ Controller: Returning ${resultado.data.length} gestantes`);
        res.json(resultado);
    }
    catch (error) {
        console.error('❌ Controller: Error searching gestantes:', error);
        if (error instanceof Error && error.name === 'ZodError') {
            return res.status(400).json({
                error: 'Parámetros de búsqueda inválidos',
                details: error.message
            });
        }
        res.status(500).json({
            error: 'Error al buscar gestantes',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getAllGestantes = getAllGestantes;
/**
 * Obtener gestante por ID con información completa
 */
const getGestanteById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🤰 Controller: Fetching gestante ${id}`);
        const gestante = await gestanteService.getGestanteById(id);
        if (!gestante) {
            return res.status(404).json({ error: 'Gestante no encontrada' });
        }
        // Verificar permisos de acceso
        const user = await (0, auth_utils_1.getUserForFiltering)(req);
        if (!(0, auth_utils_1.canViewAllData)(user.rol) && gestante.madrina_id !== user.id) {
            return res.status(403).json({ error: 'No tienes permiso para ver esta gestante' });
        }
        console.log(`✅ Controller: Gestante ${id} found`);
        res.json(gestante);
    }
    catch (error) {
        console.error(`❌ Controller: Error fetching gestante ${req.params.id}:`, error);
        res.status(500).json({
            error: 'Error al obtener gestante',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getGestanteById = getGestanteById;
const createGestante = async (req, res) => {
    try {
        console.log('🤰 Controller: Creating gestante with data:', req.body);
        // Validar datos requeridos
        const { documento, nombre } = req.body;
        if (!documento || !nombre) {
            return res.status(400).json({
                error: 'Los campos documento y nombre son requeridos'
            });
        }
        // Validar formato de documento
        if (documento.length < 6) {
            return res.status(400).json({
                error: 'El documento debe tener al menos 6 caracteres'
            });
        }
        // Validar nombre
        if (nombre.length < 3) {
            return res.status(400).json({
                error: 'El nombre debe tener al menos 3 caracteres'
            });
        }
        const gestante = await gestanteService.createGestanteCompleta(req.body);
        console.log('✅ Controller: Gestante created successfully:', gestante.id);
        res.status(201).json({
            message: 'Gestante creada exitosamente',
            gestante: gestante
        });
    }
    catch (error) {
        console.error('❌ Controller: Error creating gestante:', error);
        if (error instanceof Error && error.message.includes('Ya existe una gestante')) {
            return res.status(409).json({ error: error.message });
        }
        res.status(500).json({
            error: 'Error interno del servidor al crear gestante',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.createGestante = createGestante;
const updateGestante = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🤰 Controller: Updating gestante ${id} with data:`, req.body);
        // Validar que el ID sea válido
        if (!id) {
            return res.status(400).json({ error: 'ID de gestante requerido' });
        }
        // Validar datos si se proporcionan
        const { documento, nombre } = req.body;
        if (documento && documento.length < 6) {
            return res.status(400).json({
                error: 'El documento debe tener al menos 6 caracteres'
            });
        }
        if (nombre && nombre.length < 3) {
            return res.status(400).json({
                error: 'El nombre debe tener al menos 3 caracteres'
            });
        }
        const gestante = await gestanteService.updateGestanteCompleta(id, req.body);
        console.log(`✅ Controller: Gestante ${id} updated successfully`);
        res.json({
            message: 'Gestante actualizada exitosamente',
            gestante: gestante
        });
    }
    catch (error) {
        console.error(`❌ Controller: Error updating gestante ${req.params.id}:`, error);
        if (error instanceof Error) {
            if (error.message.includes('No se encontró gestante')) {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('Ya existe otra gestante')) {
                return res.status(409).json({ error: error.message });
            }
        }
        res.status(500).json({
            error: 'Error interno del servidor al actualizar gestante',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.updateGestante = updateGestante;
const deleteGestante = async (req, res) => {
    try {
        await gestanteService.deleteGestante(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Error al eliminar gestante' });
    }
};
exports.deleteGestante = deleteGestante;
/**
 * Búsqueda geográfica de gestantes cercanas
 */
const buscarGestantesCercanas = async (req, res) => {
    try {
        console.log('📍 Controller: Searching nearby gestantes with params:', req.query);
        const params = gestante_dto_1.busquedaGeograficaSchema.parse({
            latitud: parseFloat(req.query.latitud),
            longitud: parseFloat(req.query.longitud),
            radio_km: req.query.radio_km ? parseFloat(req.query.radio_km) : 5,
            limit: req.query.limit ? parseInt(req.query.limit) : 20,
        });
        const gestantes = await gestanteService.buscarGestantesCercanas(params);
        console.log(`✅ Controller: Found ${gestantes.length} nearby gestantes`);
        res.json({
            total: gestantes.length,
            radio_km: params.radio_km,
            centro: { latitud: params.latitud, longitud: params.longitud },
            gestantes
        });
    }
    catch (error) {
        console.error('❌ Controller: Error searching nearby gestantes:', error);
        res.status(500).json({
            error: 'Error al buscar gestantes cercanas',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.buscarGestantesCercanas = buscarGestantesCercanas;
/**
 * Asignar madrina a gestante
 */
const asignarMadrina = async (req, res) => {
    try {
        console.log('👩‍⚕️ Controller: Assigning madrina:', req.body);
        const datos = gestante_dto_1.asignarMadrinaSchema.parse(req.body);
        const gestante = await gestanteService.asignarMadrina(datos.gestante_id, datos.madrina_id);
        console.log(`✅ Controller: Madrina assigned successfully`);
        res.json({ message: 'Madrina asignada exitosamente', gestante });
    }
    catch (error) {
        console.error('❌ Controller: Error assigning madrina:', error);
        res.status(500).json({
            error: 'Error al asignar madrina',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.asignarMadrina = asignarMadrina;
/**
 * Calcular riesgo de gestante
 */
const calcularRiesgo = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`⚠️ Controller: Calculating risk for gestante ${id}`);
        const riesgo = await gestanteService.calcularRiesgo(id);
        console.log(`✅ Controller: Risk calculated - Level: ${riesgo.nivel_riesgo}`);
        res.json(riesgo);
    }
    catch (error) {
        console.error(`❌ Controller: Error calculating risk:`, error);
        res.status(500).json({
            error: 'Error al calcular riesgo',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.calcularRiesgo = calcularRiesgo;
