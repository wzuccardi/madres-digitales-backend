"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResumenIntegrado = exports.importarMunicipiosBolivar = exports.buscarIPSCercanas = exports.buscarMunicipiosCercanos = exports.getEstadisticasMunicipios = exports.desactivarMunicipio = exports.activarMunicipio = exports.getMunicipio = exports.getMunicipios = exports.getMunicipiosIntegrados = void 0;
const database_1 = __importDefault(require("../config/database"));
const import_municipios_bolivar_1 = require("../scripts/import-municipios-bolivar");
/**
 * Obtener municipios con estadísticas integradas (para super admin)
 */
const getMunicipiosIntegrados = async (req, res) => {
    try {
        console.log('🏛️ MunicipiosController: Obteniendo municipios integrados con datos reales (optimizado)...');
        const municipios = await database_1.default.municipio.findMany({
            orderBy: [
                { departamento: 'asc' },
                { nombre: 'asc' },
            ]
        });
        // Obtener todos los datos en paralelo (optimizado)
        const [gestantesPorMunicipio, gestantesActivasPorMunicipio, gestantesRiesgoAltoPorMunicipio, medicosPorMunicipio, madrinasPorMunicipio, ipsPorMunicipio, todasGestantes, alertasActivas] = await Promise.all([
            // Agrupar gestantes por municipio
            database_1.default.gestante.groupBy({
                by: ['municipio_id'],
                _count: { id: true },
                where: { municipio_id: { not: null } }
            }),
            // Agrupar gestantes activas por municipio
            database_1.default.gestante.groupBy({
                by: ['municipio_id'],
                _count: { id: true },
                where: { municipio_id: { not: null }, activa: true }
            }),
            // Agrupar gestantes de alto riesgo por municipio
            database_1.default.gestante.groupBy({
                by: ['municipio_id'],
                _count: { id: true },
                where: { municipio_id: { not: null }, riesgo_alto: true }
            }),
            // Agrupar médicos por municipio
            database_1.default.usuario.groupBy({
                by: ['municipio_id'],
                _count: { id: true },
                where: { municipio_id: { not: null }, rol: 'medico' }
            }),
            // Agrupar madrinas por municipio
            database_1.default.usuario.groupBy({
                by: ['municipio_id'],
                _count: { id: true },
                where: { municipio_id: { not: null }, rol: 'madrina' }
            }),
            // Agrupar IPS por municipio
            database_1.default.iPS.groupBy({
                by: ['municipio_id'],
                _count: { id: true },
                where: { municipio_id: { not: null } }
            }),
            // Obtener todas las gestantes con su municipio_id
            database_1.default.gestante.findMany({
                where: { municipio_id: { not: null } },
                select: { id: true, municipio_id: true }
            }),
            // Obtener todas las alertas activas
            database_1.default.alerta.findMany({
                where: { resuelta: false },
                select: { gestante_id: true }
            })
        ]);
        // Crear mapas para acceso rápido
        const gestantesMap = new Map(gestantesPorMunicipio.map(g => [g.municipio_id, g._count.id]));
        const gestantesActivasMap = new Map(gestantesActivasPorMunicipio.map(g => [g.municipio_id, g._count.id]));
        const gestantesRiesgoAltoMap = new Map(gestantesRiesgoAltoPorMunicipio.map(g => [g.municipio_id, g._count.id]));
        const medicosMap = new Map(medicosPorMunicipio.map(m => [m.municipio_id, m._count.id]));
        const madrinasMap = new Map(madrinasPorMunicipio.map(m => [m.municipio_id, m._count.id]));
        const ipsMap = new Map(ipsPorMunicipio.map(i => [i.municipio_id, i._count.id]));
        // Crear mapa de gestantes por municipio para contar alertas
        const gestantesPorMunicipioMap = new Map();
        todasGestantes.forEach(g => {
            if (!gestantesPorMunicipioMap.has(g.municipio_id)) {
                gestantesPorMunicipioMap.set(g.municipio_id, []);
            }
            gestantesPorMunicipioMap.get(g.municipio_id).push(g.id);
        });
        // Crear set de gestantes con alertas activas
        const gestantesConAlertasActivas = new Set(alertasActivas.map(a => a.gestante_id));
        // Construir respuesta
        const municipiosConEstadisticas = municipios.map(municipio => {
            const gestantesIds = gestantesPorMunicipioMap.get(municipio.id) || [];
            const alertasActivasCount = gestantesIds.filter(id => gestantesConAlertasActivas.has(id)).length;
            return {
                id: municipio.id,
                codigo: municipio.codigo_dane,
                nombre: municipio.nombre,
                departamento: municipio.departamento,
                activo: municipio.activo,
                poblacion: null,
                latitud: municipio.latitud,
                longitud: municipio.longitud,
                fecha_creacion: municipio.fecha_creacion,
                fecha_actualizacion: municipio.fecha_actualizacion,
                estadisticas: {
                    gestantes: gestantesMap.get(municipio.id) || 0,
                    medicos: medicosMap.get(municipio.id) || 0,
                    ips: ipsMap.get(municipio.id) || 0,
                    madrinas: madrinasMap.get(municipio.id) || 0,
                    gestantes_activas: gestantesActivasMap.get(municipio.id) || 0,
                    gestantes_riesgo_alto: gestantesRiesgoAltoMap.get(municipio.id) || 0,
                    alertas_activas: alertasActivasCount
                }
            };
        });
        console.log(`✅ MunicipiosController: ${municipiosConEstadisticas.length} municipios integrados con datos reales obtenidos (optimizado)`);
        res.json({
            success: true,
            data: municipiosConEstadisticas,
        });
    }
    catch (error) {
        console.error('❌ MunicipiosController: Error obteniendo municipios integrados:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getMunicipiosIntegrados = getMunicipiosIntegrados;
/**
 * Obtener todos los municipios
 */
const getMunicipios = async (req, res) => {
    try {
        const { activo, departamento, search, page = 1, limit = 50 } = req.query;
        console.log('🏛️ MunicipiosController: Obteniendo municipios...');
        // Construir filtros
        const whereClause = {};
        if (activo !== undefined) {
            whereClause.activo = activo === 'true';
        }
        if (departamento) {
            whereClause.departamento = {
                contains: departamento,
                mode: 'insensitive',
            };
        }
        if (search) {
            whereClause.OR = [
                {
                    nombre: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    codigo_dane: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ];
        }
        // Calcular paginación
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Obtener municipios con paginación
        const [municipios, total] = await Promise.all([
            database_1.default.municipio.findMany({
                where: whereClause,
                orderBy: [
                    { departamento: 'asc' },
                    { nombre: 'asc' },
                ],
                skip,
                take: limitNum,
            }),
            database_1.default.municipio.count({ where: whereClause }),
        ]);
        console.log(`✅ MunicipiosController: ${municipios.length} municipios obtenidos de ${total} total`);
        res.json({
            success: true,
            data: municipios,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('❌ MunicipiosController: Error obteniendo municipios:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.getMunicipios = getMunicipios;
/**
 * Obtener municipio por ID
 */
const getMunicipio = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🏛️ MunicipiosController: Obteniendo municipio:', id);
        const municipio = await database_1.default.municipio.findUnique({
            where: { id },
            include: {
                gestantes: {
                    where: { activa: true },
                    select: {
                        id: true,
                        nombre: true,
                        documento: true,
                        riesgo_alto: true,
                    },
                },
                medicos: {
                    where: { activo: true },
                    select: {
                        id: true,
                        nombre: true,
                        especialidad: true,
                        telefono: true,
                    },
                },
                _count: {
                    select: {
                        gestantes: true,
                        medicos: true,
                    },
                },
            },
        });
        if (!municipio) {
            return res.status(404).json({
                success: false,
                error: 'Municipio no encontrado',
            });
        }
        console.log(`✅ MunicipiosController: Municipio obtenido: ${municipio.nombre}`);
        res.json({
            success: true,
            data: municipio,
        });
    }
    catch (error) {
        console.error('❌ MunicipiosController: Error obteniendo municipio:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.getMunicipio = getMunicipio;
/**
 * Activar municipio (solo super_admin o admin)
 */
const activarMunicipio = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        // Verificar permisos de super admin únicamente
        if (user.rol !== 'super_admin') {
            return res.status(403).json({
                success: false,
                error: 'Solo el super administrador puede activar municipios',
            });
        }
        console.log('✅ MunicipiosController: Activando municipio:', id);
        const municipio = await database_1.default.municipio.update({
            where: { id },
            data: {
                activo: true,
                fecha_actualizacion: new Date(),
            },
        });
        console.log(`✅ MunicipiosController: Municipio activado: ${municipio.nombre}`);
        res.json({
            success: true,
            message: `Municipio ${municipio.nombre} activado exitosamente`,
            data: municipio,
        });
    }
    catch (error) {
        console.error('❌ MunicipiosController: Error activando municipio:', error);
        if (error instanceof Error && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: 'Municipio no encontrado',
            });
        }
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.activarMunicipio = activarMunicipio;
/**
 * Desactivar municipio (solo super_admin o admin)
 */
const desactivarMunicipio = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        // Verificar permisos de super admin únicamente
        if (user.rol !== 'super_admin') {
            return res.status(403).json({
                success: false,
                error: 'Solo el super administrador puede desactivar municipios',
            });
        }
        console.log('❌ MunicipiosController: Desactivando municipio:', id);
        // Verificar si el municipio tiene gestantes activas
        const gestantesActivas = await database_1.default.gestante.count({
            where: {
                municipio_id: id,
                activa: true,
            },
        });
        if (gestantesActivas > 0) {
            return res.status(400).json({
                success: false,
                error: `No se puede desactivar el municipio porque tiene ${gestantesActivas} gestantes activas`,
            });
        }
        const municipio = await database_1.default.municipio.update({
            where: { id },
            data: {
                activo: false,
                fecha_actualizacion: new Date(),
            },
        });
        console.log(`❌ MunicipiosController: Municipio desactivado: ${municipio.nombre}`);
        res.json({
            success: true,
            message: `Municipio ${municipio.nombre} desactivado exitosamente`,
            data: municipio,
        });
    }
    catch (error) {
        console.error('❌ MunicipiosController: Error desactivando municipio:', error);
        if (error instanceof Error && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: 'Municipio no encontrado',
            });
        }
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.desactivarMunicipio = desactivarMunicipio;
/**
 * Obtener estadísticas de municipios
 */
const getEstadisticasMunicipios = async (req, res) => {
    try {
        console.log('📊 MunicipiosController: Obteniendo estadísticas...');
        const [totalMunicipios, municipiosActivos, municipiosInactivos, estadisticasPorDepartamento,] = await Promise.all([
            database_1.default.municipio.count(),
            database_1.default.municipio.count({ where: { activo: true } }),
            database_1.default.municipio.count({ where: { activo: false } }),
            database_1.default.municipio.groupBy({
                by: ['departamento'],
                _count: {
                    id: true,
                },
                orderBy: {
                    _count: {
                        id: 'desc',
                    },
                },
            }),
        ]);
        // Contar municipios con gestantes activas
        const gestantesConMunicipio = await database_1.default.gestante.findMany({
            where: { activa: true, municipio_id: { not: null } },
            select: { municipio_id: true },
            distinct: ['municipio_id']
        });
        const municipiosConGestantes = gestantesConMunicipio.length;
        // Contar municipios con madrinas activas
        const madrinasConMunicipio = await database_1.default.usuario.findMany({
            where: { rol: 'madrina', activo: true, municipio_id: { not: null } },
            select: { municipio_id: true },
            distinct: ['municipio_id']
        });
        const municipiosConMadrinas = madrinasConMunicipio.length;
        // Contar municipios con médicos activos
        const medicosConMunicipio = await database_1.default.usuario.findMany({
            where: { rol: 'medico', activo: true, municipio_id: { not: null } },
            select: { municipio_id: true },
            distinct: ['municipio_id']
        });
        const municipiosConMedicos = medicosConMunicipio.length;
        const estadisticas = {
            resumen: {
                total: totalMunicipios,
                activos: municipiosActivos,
                inactivos: municipiosInactivos,
                conGestantes: municipiosConGestantes,
                conMadrinas: municipiosConMadrinas,
                conMedicos: municipiosConMedicos,
            },
            porDepartamento: estadisticasPorDepartamento.map((stat) => ({
                departamento: stat.departamento,
                cantidad: stat._count.id,
            })),
        };
        console.log('✅ MunicipiosController: Estadísticas obtenidas');
        res.json({
            success: true,
            data: estadisticas,
        });
    }
    catch (error) {
        console.error('❌ MunicipiosController: Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.getEstadisticasMunicipios = getEstadisticasMunicipios;
/**
 * Buscar municipios por proximidad geográfica
 */
const buscarMunicipiosCercanos = async (req, res) => {
    try {
        const { latitude, longitude, radius = 50 } = req.query;
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: 'Se requieren parámetros latitude y longitude',
            });
        }
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        const radiusKm = parseFloat(radius);
        console.log(`🔍 MunicipiosController: Buscando municipios cerca de ${lat}, ${lon} en radio de ${radiusKm}km`);
        // Usar función PostGIS para búsqueda optimizada
        const municipiosCercanos = await database_1.default.$queryRaw `
      SELECT
        id,
        codigo,
        nombre,
        departamento,
        coordenadas,
        activo,
        fecha_creacion,
        fecha_actualizacion,
        distancia_metros
      FROM encontrar_municipios_cercanos(${lat}, ${lon}, ${radiusKm * 1000})
    `;
        // Formatear respuesta
        const municipiosFormateados = municipiosCercanos.map(municipio => ({
            ...municipio,
            distancia: municipio.distancia_metros / 1000, // Convertir a km
            distanciaFormateada: `${(municipio.distancia_metros / 1000).toFixed(1)} km`,
        }));
        console.log(`✅ MunicipiosController: ${municipiosFormateados.length} municipios cercanos encontrados`);
        res.json({
            success: true,
            data: municipiosFormateados,
        });
    }
    catch (error) {
        console.error('❌ MunicipiosController: Error buscando municipios cercanos:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.buscarMunicipiosCercanos = buscarMunicipiosCercanos;
/**
 * Buscar IPS cercanas usando PostGIS
 */
const buscarIPSCercanas = async (req, res) => {
    try {
        const { latitude, longitude, radius = 50 } = req.query;
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: 'Se requieren parámetros latitude y longitude',
            });
        }
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        const radiusKm = parseFloat(radius);
        console.log(`🏥 MunicipiosController: Buscando IPS cerca de ${lat}, ${lon} en radio de ${radiusKm}km`);
        // Usar función PostGIS para búsqueda optimizada de IPS
        const ipsCercanas = await database_1.default.$queryRaw `
      SELECT
        id,
        nombre,
        direccion,
        telefono,
        municipio_nombre,
        distancia_metros
      FROM encontrar_ips_cercanas(${lat}, ${lon}, ${radiusKm * 1000})
    `;
        // Formatear respuesta
        const ipsFormateadas = ipsCercanas.map(ips => ({
            ...ips,
            distancia: ips.distancia_metros / 1000, // Convertir a km
            distanciaFormateada: `${(ips.distancia_metros / 1000).toFixed(1)} km`,
        }));
        console.log(`✅ MunicipiosController: ${ipsFormateadas.length} IPS cercanas encontradas`);
        res.json({
            success: true,
            data: ipsFormateadas,
        });
    }
    catch (error) {
        console.error('❌ MunicipiosController: Error buscando IPS cercanas:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.buscarIPSCercanas = buscarIPSCercanas;
/**
 * Importar municipios desde archivo Bolivar.txt (solo super_admin)
 */
const importarMunicipiosBolivar = async (req, res) => {
    try {
        const user = req.user;
        // Verificar permisos de super admin únicamente
        if (user.rol !== 'super_admin') {
            return res.status(403).json({
                success: false,
                error: 'Solo el super administrador puede importar municipios',
            });
        }
        console.log('📥 MunicipiosController: Iniciando importación de municipios de Bolívar...');
        // Ejecutar importación
        await (0, import_municipios_bolivar_1.importMunicipiosBolivar)();
        // Obtener estadísticas actualizadas
        const totalMunicipios = await database_1.default.municipio.count({
            where: {
                departamento: 'BOLÍVAR',
            },
        });
        console.log('✅ MunicipiosController: Importación completada exitosamente');
        res.json({
            success: true,
            message: `Importación de municipios de Bolívar completada exitosamente. Total: ${totalMunicipios} municipios`,
            data: {
                totalMunicipios,
                departamento: 'BOLÍVAR',
            },
        });
    }
    catch (error) {
        console.error('❌ MunicipiosController: Error importando municipios:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor durante la importación',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.importarMunicipiosBolivar = importarMunicipiosBolivar;
/**
 * Obtener resumen integrado del sistema (para super admin)
 */
const getResumenIntegrado = async (req, res) => {
    try {
        console.log('📊 MunicipiosController: Obteniendo resumen integrado...');
        console.log('🔍 Ejecutando consultas de conteo...');
        // Ejecutar consultas una por una para identificar cuál falla
        const totalMunicipios = await database_1.default.municipio.count();
        console.log('✅ totalMunicipios:', totalMunicipios);
        const municipiosActivos = await database_1.default.municipio.count({ where: { activo: true } });
        console.log('✅ municipiosActivos:', municipiosActivos);
        const totalIPS = await database_1.default.iPS.count();
        console.log('✅ totalIPS:', totalIPS);
        const ipsActivas = await database_1.default.iPS.count({ where: { activo: true } });
        console.log('✅ ipsActivas:', ipsActivas);
        const totalMedicos = await database_1.default.medico.count();
        console.log('✅ totalMedicos:', totalMedicos);
        const medicosActivos = await database_1.default.medico.count({ where: { activo: true } });
        console.log('✅ medicosActivos:', medicosActivos);
        const totalGestantes = await database_1.default.gestante.count();
        console.log('✅ totalGestantes:', totalGestantes);
        const gestantesActivas = await database_1.default.gestante.count({ where: { activa: true } });
        console.log('✅ gestantesActivas:', gestantesActivas);
        const alertasActivas = await database_1.default.alerta.count({ where: { resuelta: false } });
        console.log('✅ alertasActivas:', alertasActivas);
        const controlesEsteMes = await database_1.default.controlPrenatal.count({
            where: {
                fecha_control: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            }
        });
        console.log('✅ controlesEsteMes:', controlesEsteMes);
        console.log('✅ Todas las consultas de conteo completadas');
        console.log('🔍 Obteniendo distribución por niveles de atención...');
        // Obtener distribución por niveles de atención
        const distribucionNiveles = await database_1.default.iPS.groupBy({
            by: ['nivel'],
            _count: {
                id: true
            },
            where: { activo: true }
        });
        console.log('✅ Distribución niveles obtenida:', distribucionNiveles);
        console.log('🔍 Obteniendo distribución por especialidades...');
        // Obtener distribución por especialidades
        const distribucionEspecialidades = await database_1.default.medico.groupBy({
            by: ['especialidad'],
            _count: {
                id: true
            },
            where: {
                activo: true,
                especialidad: { not: null }
            }
        });
        console.log('✅ Distribución especialidades obtenida:', distribucionEspecialidades);
        console.log('🔍 Obteniendo municipios principales...');
        // Obtener los primeros 5 municipios activos
        const municipiosTopActividad = await database_1.default.municipio.findMany({
            where: { activo: true },
            take: 5,
            orderBy: {
                nombre: 'asc'
            }
        });
        console.log('✅ Municipios principales obtenidos:', municipiosTopActividad.length);
        console.log('🔍 Construyendo resumen...');
        const resumen = {
            total_municipios: totalMunicipios,
            municipios_activos: municipiosActivos,
            total_ips: totalIPS,
            ips_activas: ipsActivas,
            total_medicos: totalMedicos,
            medicos_activos: medicosActivos,
            total_gestantes: totalGestantes,
            gestantes_activas: gestantesActivas,
            alertas_activas: alertasActivas,
            controles_este_mes: controlesEsteMes,
            distribucion_niveles_atencion: distribucionNiveles.reduce((acc, item) => {
                acc[item.nivel] = item._count.id;
                return acc;
            }, {}),
            distribucion_especialidades: distribucionEspecialidades.reduce((acc, item) => {
                acc[item.especialidad] = item._count.id;
                return acc;
            }, {}),
            municipios_top_actividad: municipiosTopActividad.map(m => ({
                id: m.id,
                codigo: m.codigo_dane,
                nombre: m.nombre,
                departamento: m.departamento,
                activo: m.activo,
                fecha_creacion: m.fecha_creacion,
                fecha_actualizacion: m.fecha_actualizacion,
                estadisticas: {
                    gestantes: 0,
                    medicos: 0,
                    ips: 0,
                    madrinas: 0,
                    gestantes_activas: 0,
                    gestantes_riesgo_alto: 0,
                    alertas_activas: 0
                }
            }))
        };
        console.log('✅ MunicipiosController: Resumen integrado obtenido');
        res.json({
            success: true,
            data: resumen,
        });
    }
    catch (error) {
        console.error('❌ MunicipiosController: Error obteniendo resumen integrado:', error);
        console.error('❌ Detalles del error:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            code: error?.code,
            meta: error?.meta
        });
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getResumenIntegrado = getResumenIntegrado;
// Función auxiliar para calcular distancia usando fórmula de Haversine
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
