"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GestanteService = void 0;
// Servicio para gestantes con funcionalidades completas
// Todos los datos provienen de la base de datos real, no se usan mocks
const database_1 = __importDefault(require("../config/database"));
class GestanteService {
    // MÉTODO ORIGINAL - SOLO PARA ADMINISTRADORES
    async getAllGestantes() {
        console.log('🤰 GestanteService: Fetching all gestantes (ADMIN ONLY)...');
        const gestantes = await database_1.default.gestante.findMany({
            orderBy: { fecha_creacion: 'desc' }
        });
        console.log(`🤰 GestanteService: Found ${gestantes.length} gestantes`);
        return gestantes;
    }
    // NUEVO MÉTODO - FILTRADO POR MADRINA (SEGURIDAD)
    async getGestantesByMadrina(madrinaId) {
        console.log(`🤰 GestanteService: Fetching gestantes for madrina ${madrinaId}...`);
        const gestantes = await database_1.default.gestante.findMany({
            where: {
                madrina_id: madrinaId // FILTRO CRÍTICO DE SEGURIDAD
            },
            include: {
                municipio: true,
                ips_asignada: {
                    select: {
                        id: true,
                        nombre: true,
                        telefono: true,
                    }
                }
            },
            orderBy: { fecha_creacion: 'desc' }
        });
        console.log(`🤰 GestanteService: Found ${gestantes.length} gestantes for madrina ${madrinaId}`);
        return gestantes;
    }
    async getGestanteById(id) {
        return database_1.default.gestante.findUnique({
            where: { id },
            include: {
                municipio: true,
                madrina: {
                    select: {
                        id: true,
                        nombre: true,
                        telefono: true,
                    }
                },
                ips_asignada: {
                    select: {
                        id: true,
                        nombre: true,
                        telefono: true,
                        direccion: true,
                    }
                },
                medico_tratante: {
                    select: {
                        id: true,
                        nombre: true,
                        especialidad: true,
                        telefono: true,
                    }
                },
                controles: {
                    orderBy: { fecha_control: 'desc' },
                    take: 5,
                },
                alertas: {
                    where: { resuelta: false },
                    orderBy: { fecha_creacion: 'desc' },
                    take: 10,
                }
            }
        });
    }
    async createGestante(data) {
        return database_1.default.gestante.create({ data });
    }
    async updateGestante(id, data) {
        return database_1.default.gestante.update({ where: { id }, data });
    }
    async deleteGestante(id) {
        return database_1.default.gestante.delete({ where: { id } });
    }
    // Método para crear gestante con validaciones completas
    async createGestanteCompleta(data) {
        console.log('🤰 GestanteService: Creating new gestante...');
        console.log('   Data received:', data);
        try {
            // Validar que el documento no exista
            const existingGestante = await database_1.default.gestante.findFirst({
                where: { documento: data.documento }
            });
            if (existingGestante) {
                throw new Error(`Ya existe una gestante con documento ${data.documento}`);
            }
            // Calcular FPP si se proporciona FUM
            let fechaProbableParto = data.fecha_probable_parto;
            if (data.fecha_ultima_menstruacion && !fechaProbableParto) {
                const fum = new Date(data.fecha_ultima_menstruacion);
                fechaProbableParto = new Date(fum.getTime() + (280 * 24 * 60 * 60 * 1000)); // FUM + 280 días
            }
            // Preparar coordenadas GeoJSON si se proporcionan
            let coordenadas = null;
            if (data.latitud && data.longitud) {
                coordenadas = {
                    type: 'Point',
                    coordinates: [data.longitud, data.latitud]
                };
            }
            // Crear la gestante
            const newGestante = await database_1.default.gestante.create({
                data: {
                    documento: data.documento,
                    tipo_documento: data.tipo_documento || 'cedula',
                    nombre: data.nombre,
                    fecha_nacimiento: data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : new Date(),
                    telefono: data.telefono || null,
                    direccion: data.direccion || null,
                    coordenadas: coordenadas,
                    municipio_id: data.municipio_id || null,
                    madrina_id: data.madrina_id || null,
                    ips_asignada_id: data.ips_asignada_id || null,
                    medico_tratante_id: data.medico_tratante_id || null,
                    eps: data.eps || null,
                    regimen_salud: data.regimen_salud || 'subsidiado',
                    fecha_ultima_menstruacion: data.fecha_ultima_menstruacion ? new Date(data.fecha_ultima_menstruacion) : null,
                    fecha_probable_parto: fechaProbableParto ? new Date(fechaProbableParto) : null,
                    // peso_actual: data.peso_actual || null, // Campo no existe en el esquema
                    // talla: data.talla || null, // Campo no existe en el esquema
                    activa: data.activa !== undefined ? data.activa : true,
                },
            });
            console.log(`✅ GestanteService: Gestante created with ID: ${newGestante.id}`);
            return newGestante;
        }
        catch (error) {
            console.error('❌ GestanteService: Error creating gestante:', error);
            throw error;
        }
    }
    // Método para actualizar gestante con validaciones
    async updateGestanteCompleta(id, data) {
        console.log(`🤰 GestanteService: Updating gestante ${id}...`);
        console.log('   Data received:', data);
        try {
            // Verificar que la gestante existe
            const existingGestante = await database_1.default.gestante.findUnique({
                where: { id }
            });
            if (!existingGestante) {
                throw new Error(`No se encontró gestante con ID ${id}`);
            }
            // Si se está cambiando el documento, verificar que no exista otro con el mismo
            if (data.documento && data.documento !== existingGestante.documento) {
                const duplicateGestante = await database_1.default.gestante.findFirst({
                    where: {
                        documento: data.documento,
                        id: { not: id }
                    }
                });
                if (duplicateGestante) {
                    throw new Error(`Ya existe otra gestante con documento ${data.documento}`);
                }
            }
            // Actualizar la gestante
            const updatedGestante = await database_1.default.gestante.update({
                where: { id },
                data: {
                    documento: data.documento || existingGestante.documento,
                    nombre: data.nombre || existingGestante.nombre,
                    telefono: data.telefono !== undefined ? data.telefono : existingGestante.telefono,
                    direccion: data.direccion !== undefined ? data.direccion : existingGestante.direccion,
                    municipio_id: data.municipio_id !== undefined ? data.municipio_id : existingGestante.municipio_id,
                    eps: data.eps !== undefined ? data.eps : existingGestante.eps,
                    activa: data.activa !== undefined ? data.activa : existingGestante.activa,
                    fecha_probable_parto: data.fecha_probable_parto !== undefined
                        ? (data.fecha_probable_parto ? new Date(data.fecha_probable_parto) : null)
                        : existingGestante.fecha_probable_parto,
                    fecha_nacimiento: data.fecha_nacimiento !== undefined
                        ? (data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : new Date())
                        : existingGestante.fecha_nacimiento,
                }
            });
            console.log(`✅ GestanteService: Gestante ${id} updated successfully`);
            return updatedGestante;
        }
        catch (error) {
            console.error(`❌ GestanteService: Error updating gestante ${id}:`, error);
            throw error;
        }
    }
    /**
     * Búsqueda avanzada con filtros y paginación
     */
    async buscarGestantes(filtros) {
        console.log('🔍 GestanteService: Searching gestantes with filters:', filtros);
        try {
            // Construir condiciones WHERE
            const where = {};
            // Búsqueda por texto (nombre o documento)
            if (filtros.busqueda) {
                where.OR = [
                    { nombre: { contains: filtros.busqueda, mode: 'insensitive' } },
                    { documento: { contains: filtros.busqueda } },
                ];
            }
            // Filtros específicos
            if (filtros.documento) {
                where.documento = { contains: filtros.documento };
            }
            if (filtros.nombre) {
                where.nombre = { contains: filtros.nombre, mode: 'insensitive' };
            }
            if (filtros.municipio_id) {
                where.municipio_id = filtros.municipio_id;
            }
            if (filtros.madrina_id) {
                where.madrina_id = filtros.madrina_id;
            }
            if (filtros.ips_asignada_id) {
                where.ips_asignada_id = filtros.ips_asignada_id;
            }
            if (filtros.activa !== undefined) {
                where.activa = filtros.activa;
            }
            if (filtros.sin_madrina) {
                where.madrina_id = null;
            }
            if (filtros.sin_ips) {
                where.ips_asignada_id = null;
            }
            // Filtros de fecha
            if (filtros.fecha_parto_desde || filtros.fecha_parto_hasta) {
                where.fecha_probable_parto = {};
                if (filtros.fecha_parto_desde) {
                    where.fecha_probable_parto.gte = filtros.fecha_parto_desde;
                }
                if (filtros.fecha_parto_hasta) {
                    where.fecha_probable_parto.lte = filtros.fecha_parto_hasta;
                }
            }
            // Contar total de registros
            const total = await database_1.default.gestante.count({ where });
            // Calcular paginación
            const page = filtros.page || 1;
            const limit = filtros.limit || 20;
            const skip = (page - 1) * limit;
            const totalPages = Math.ceil(total / limit);
            // Construir ordenamiento
            const orderBy = {};
            const orderField = filtros.orderBy || 'fecha_creacion';
            const orderDirection = filtros.orderDirection || 'desc';
            orderBy[orderField] = orderDirection;
            // Ejecutar consulta
            const gestantes = await database_1.default.gestante.findMany({
                where,
                orderBy,
                skip,
                take: limit,
            });
            console.log(`✅ GestanteService: Found ${gestantes.length} gestantes (${total} total)`);
            return {
                data: gestantes,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                }
            };
        }
        catch (error) {
            console.error('❌ GestanteService: Error searching gestantes:', error);
            throw error;
        }
    }
    /**
     * Búsqueda geográfica de gestantes cercanas
     */
    async buscarGestantesCercanas(params) {
        console.log('📍 GestanteService: Searching nearby gestantes:', params);
        try {
            // Usar PostGIS para búsqueda geográfica
            const { latitud, longitud, radio_km, limit } = params;
            // Convertir radio de km a metros
            const radioMetros = radio_km * 1000;
            // Query SQL con PostGIS
            const gestantes = await database_1.default.$queryRaw `
				SELECT
					g.*,
					ST_Distance(
						g.coordenadas::geography,
						ST_SetSRID(ST_MakePoint(${longitud}, ${latitud}), 4326)::geography
					) as distancia_metros
				FROM "Gestante" g
				WHERE g.coordenadas IS NOT NULL
				AND g.activa = true
				AND ST_DWithin(
					g.coordenadas::geography,
					ST_SetSRID(ST_MakePoint(${longitud}, ${latitud}), 4326)::geography,
					${radioMetros}
				)
				ORDER BY distancia_metros ASC
				LIMIT ${limit}
			`;
            console.log(`✅ GestanteService: Found ${gestantes.length} nearby gestantes`);
            // Convertir distancia a km y agregar información adicional
            const gestantesConInfo = await Promise.all(gestantes.map(async (g) => {
                const gestanteCompleta = await database_1.default.gestante.findUnique({
                    where: { id: g.id },
                    include: {
                        municipio: true,
                        madrina: {
                            select: {
                                id: true,
                                nombre: true,
                                telefono: true,
                            }
                        }
                    }
                });
                return {
                    ...gestanteCompleta,
                    distancia_km: (g.distancia_metros / 1000).toFixed(2),
                };
            }));
            return gestantesConInfo;
        }
        catch (error) {
            console.error('❌ GestanteService: Error searching nearby gestantes:', error);
            throw error;
        }
    }
    /**
     * Asignar madrina a gestante
     */
    async asignarMadrina(gestanteId, madrinaId) {
        console.log(`👩‍⚕️ GestanteService: Assigning madrina ${madrinaId} to gestante ${gestanteId}`);
        try {
            // Verificar que la gestante existe
            const gestante = await database_1.default.gestante.findUnique({
                where: { id: gestanteId }
            });
            if (!gestante) {
                throw new Error(`No se encontró gestante con ID ${gestanteId}`);
            }
            // Verificar que la madrina existe
            const madrina = await database_1.default.usuario.findUnique({
                where: { id: madrinaId }
            });
            if (!madrina) {
                throw new Error(`No se encontró madrina con ID ${madrinaId}`);
            }
            if (madrina.rol !== 'madrina') {
                throw new Error(`El usuario ${madrinaId} no es una madrina`);
            }
            // Asignar madrina
            const updatedGestante = await database_1.default.gestante.update({
                where: { id: gestanteId },
                data: { madrina_id: madrinaId },
                include: {
                    madrina: {
                        select: {
                            id: true,
                            nombre: true,
                            telefono: true,
                        }
                    }
                }
            });
            console.log(`✅ GestanteService: Madrina assigned successfully`);
            return updatedGestante;
        }
        catch (error) {
            console.error('❌ GestanteService: Error assigning madrina:', error);
            throw error;
        }
    }
    /**
     * Calcular riesgo de gestante
     */
    async calcularRiesgo(gestanteId) {
        console.log(`⚠️ GestanteService: Calculating risk for gestante ${gestanteId}`);
        try {
            const gestante = await database_1.default.gestante.findUnique({
                where: { id: gestanteId },
                include: {
                    controles: {
                        orderBy: { fecha_control: 'desc' },
                        take: 3,
                    },
                    alertas: {
                        where: { resuelta: false },
                        orderBy: { fecha_creacion: 'desc' },
                    }
                }
            });
            if (!gestante) {
                throw new Error(`No se encontró gestante con ID ${gestanteId}`);
            }
            let puntuacion = 0;
            const factoresDetectados = [];
            const recomendaciones = [];
            // Factores de riesgo registrados
            if (gestante.factores_riesgo && Array.isArray(gestante.factores_riesgo)) {
                // El campo factores_riesgo no existe en el schema actual
                // Se omitirá esta lógica hasta que se agregue el campo
            }
            // Edad
            const edad = new Date().getFullYear() - new Date(gestante.fecha_nacimiento).getFullYear();
            if (edad < 18) {
                puntuacion += 15;
                factoresDetectados.push('Edad menor a 18 años');
                recomendaciones.push('Control prenatal frecuente por edad materna');
            }
            else if (edad > 35) {
                puntuacion += 10;
                factoresDetectados.push('Edad mayor a 35 años');
                recomendaciones.push('Monitoreo especial por edad materna avanzada');
            }
            // Alertas activas
            const gestanteData = gestante;
            if (gestanteData.alertas && Array.isArray(gestanteData.alertas) && gestanteData.alertas.length > 0) {
                const alertas = gestanteData.alertas;
                puntuacion += alertas.length * 20;
                factoresDetectados.push(`${alertas.length} alerta(s) activa(s)`);
                recomendaciones.push('Resolver alertas pendientes urgentemente');
            }
            // Controles prenatales
            if (!gestanteData.controles || !Array.isArray(gestanteData.controles) || gestanteData.controles.length === 0) {
                puntuacion += 15;
                factoresDetectados.push('Sin controles prenatales registrados');
                recomendaciones.push('Programar control prenatal inmediatamente');
            }
            // Sin madrina asignada
            if (!gestante.madrina_id) {
                puntuacion += 10;
                factoresDetectados.push('Sin madrina asignada');
                recomendaciones.push('Asignar madrina para seguimiento');
            }
            // Sin IPS asignada
            if (!gestante.ips_asignada_id) {
                puntuacion += 5;
                factoresDetectados.push('Sin IPS asignada');
                recomendaciones.push('Asignar IPS para atención médica');
            }
            // Determinar nivel de riesgo
            let nivelRiesgo;
            if (puntuacion >= 70) {
                nivelRiesgo = 'critico';
            }
            else if (puntuacion >= 50) {
                nivelRiesgo = 'alto';
            }
            else if (puntuacion >= 30) {
                nivelRiesgo = 'medio';
            }
            else {
                nivelRiesgo = 'bajo';
            }
            const requiereAtencionInmediata = puntuacion >= 50;
            // Actualizar riesgo_alto en la base de datos
            // No se actualiza riesgo_alto porque el campo no existe en el schema
            console.log(`✅ GestanteService: Risk calculated - Level: ${nivelRiesgo}, Score: ${puntuacion}`);
            return {
                gestante_id: gestanteId,
                puntuacion_riesgo: puntuacion,
                nivel_riesgo: nivelRiesgo,
                factores_detectados: factoresDetectados,
                recomendaciones: recomendaciones,
                requiere_atencion_inmediata: requiereAtencionInmediata,
            };
        }
        catch (error) {
            console.error('❌ GestanteService: Error calculating risk:', error);
            throw error;
        }
    }
}
exports.GestanteService = GestanteService;
