"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContenidoService = void 0;
const database_1 = __importDefault(require("../config/database"));
const logger_1 = require("../config/logger");
const not_found_error_1 = require("../core/domain/errors/not-found.error");
class ContenidoService {
    /**
     * Crear contenido educativo
     */
    async crearContenido(dto, usuarioId) {
        try {
            const contenido = await database_1.default.contenido.create({
                data: {
                    titulo: dto.titulo,
                    descripcion: dto.descripcion,
                    tipo: dto.tipo,
                    categoria: dto.categoria,
                    nivel: dto.nivel || 'basico',
                    url_contenido: dto.archivoUrl,
                    // archivo_nombre: dto.archivoNombre || 'archivo', // Field not in schema
                    // archivo_tipo: dto.archivoTipo || 'application/octet-stream', // Field not in schema
                    // archivo_tamano: dto.archivoTamano || 0, // Field not in schema
                    url_imagen: dto.miniaturaUrl,
                    duracion_minutos: dto.duracion,
                    tags: dto.etiquetas || [],
                    destacado: dto.destacado || false,
                    activo: dto.publico !== undefined ? dto.publico : true,
                },
            });
            logger_1.logger.info('Contenido educativo creado', { contenidoId: contenido.id });
            return contenido;
        }
        catch (error) {
            logger_1.logger.error('Error creando contenido', { error, dto });
            throw error;
        }
    }
    /**
     * Obtener contenido por ID
     */
    async obtenerContenido(id, usuarioId) {
        try {
            const contenido = await database_1.default.contenido.findUnique({
                where: { id },
            });
            if (!contenido) {
                throw new not_found_error_1.NotFoundError('Contenido no encontrado');
            }
            const contenidoMapped = this._mapContenido(contenido);
            // Obtener progreso si hay usuario
            if (usuarioId) {
                const progreso = await database_1.default.progresoContenido.findUnique({
                    where: {
                        usuario_id_contenido_id: {
                            usuario_id: usuarioId,
                            contenido_id: id,
                        },
                    },
                });
                return {
                    ...contenidoMapped,
                    progreso: progreso ? this._mapProgreso(progreso) : undefined,
                };
            }
            return contenidoMapped;
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo contenido', { error, id });
            throw error;
        }
    }
    /**
     * Buscar contenido
     */
    async buscarContenido(dto, usuarioId) {
        try {
            console.log('🔍 ContenidoService.buscarContenido - DTO recibido:', JSON.stringify(dto, null, 2));
            const where = {};
            if (dto.query) {
                where.OR = [
                    { titulo: { contains: dto.query, mode: 'insensitive' } },
                    { descripcion: { contains: dto.query, mode: 'insensitive' } },
                    { autor: { contains: dto.query, mode: 'insensitive' } },
                ];
            }
            if (dto.tipo)
                where.tipo = dto.tipo;
            if (dto.categoria)
                where.categoria = dto.categoria;
            if (dto.nivel)
                where.nivel = dto.nivel;
            if (dto.destacado !== undefined)
                where.destacado = dto.destacado;
            if (dto.publico !== undefined)
                where.publico = dto.publico;
            console.log('🔍 Where clause:', JSON.stringify(where, null, 2));
            const orderBy = {};
            // Mapear nombres de campos si es necesario
            const fieldMap = {
                'created_at': 'fecha_creacion',
                'updated_at': 'fecha_actualizacion',
                'titulo': 'titulo',
                'vistas': 'vistas',
                'calificacion': 'calificacion',
                'orden': 'orden'
            };
            // Usar el campo mapeado si existe
            const actualField = fieldMap[dto.orderBy] || dto.orderBy;
            orderBy[actualField] = dto.orderDir;
            console.log('🔍 Query params:', { where, orderBy, take: dto.limit, skip: dto.offset });
            const [contenidos, total] = await Promise.all([
                database_1.default.contenido.findMany({
                    where,
                    orderBy,
                    take: dto.limit,
                    skip: dto.offset,
                }),
                database_1.default.contenido.count({ where }),
            ]);
            console.log('✅ Contenidos encontrados:', contenidos.length, 'Total:', total);
            if (contenidos.length > 0) {
                console.log('📄 Primer contenido:', JSON.stringify(contenidos[0], null, 2));
            }
            // Obtener progreso si hay usuario
            let contenidosConProgreso = contenidos.map(this._mapContenido);
            if (usuarioId) {
                const contenidoIds = contenidos.map((c) => c.id);
                const progresos = await database_1.default.progresoContenido.findMany({
                    where: {
                        usuario_id: usuarioId,
                        contenido_id: { in: contenidoIds },
                    },
                });
                const progresoMap = new Map(progresos.map((p) => [p.contenido_id, this._mapProgreso(p)]));
                contenidosConProgreso = contenidosConProgreso.map((c) => ({
                    ...c,
                    progreso: progresoMap.get(c.id),
                }));
            }
            return { contenidos: contenidosConProgreso, total };
        }
        catch (error) {
            logger_1.logger.error('Error buscando contenido', { error, dto });
            throw error;
        }
    }
    /**
     * Actualizar contenido
     */
    async actualizarContenido(id, dto) {
        try {
            const contenido = await database_1.default.contenido.update({
                where: { id },
                data: {
                    titulo: dto.titulo,
                    descripcion: dto.descripcion,
                    tipo: dto.tipo,
                    categoria: dto.categoria,
                    nivel: dto.nivel,
                    url_contenido: dto.archivoUrl,
                    // archivo_nombre: dto.archivoNombre, // Field not in schema
                    // archivo_tipo: dto.archivoTipo, // Field not in schema
                    // archivo_tamano: dto.archivoTamano, // Field not in schema
                    url_imagen: dto.miniaturaUrl,
                    duracion_minutos: dto.duracion,
                    tags: dto.etiquetas,
                    destacado: dto.destacado,
                    activo: dto.publico,
                },
            });
            logger_1.logger.info('Contenido actualizado', { contenidoId: id });
            return this._mapContenido(contenido);
        }
        catch (error) {
            logger_1.logger.error('Error actualizando contenido', { error, id, dto });
            throw error;
        }
    }
    /**
     * Eliminar contenido
     */
    async eliminarContenido(id) {
        try {
            await database_1.default.contenido.delete({
                where: { id },
            });
            logger_1.logger.info('Contenido eliminado', { contenidoId: id });
        }
        catch (error) {
            logger_1.logger.error('Error eliminando contenido', { error, id });
            throw error;
        }
    }
    /**
     * Actualizar progreso de usuario
     */
    async actualizarProgreso(dto, usuarioId) {
        try {
            const data = {
                progreso: dto.progreso,
                completado: dto.completado,
                tiempo_visto: dto.tiempoVisto,
                ultima_posicion: dto.ultimaPosicion,
                favorito: dto.favorito,
                notas: dto.notas,
                updated_at: new Date(),
            };
            if (dto.completado && !data.fecha_completado) {
                data.fecha_completado = new Date();
            }
            const progreso = await database_1.default.progresoContenido.upsert({
                where: {
                    usuario_id_contenido_id: {
                        usuario_id: usuarioId,
                        contenido_id: dto.contenidoId,
                    },
                },
                create: {
                    usuario_id: usuarioId,
                    contenido_id: dto.contenidoId,
                    ...data,
                },
                update: data,
            });
            logger_1.logger.info('Progreso actualizado', { usuarioId, contenidoId: dto.contenidoId });
            return this._mapProgreso(progreso);
        }
        catch (error) {
            logger_1.logger.error('Error actualizando progreso', { error, dto });
            throw error;
        }
    }
    /**
     * Registrar vista
     */
    async registrarVista(contenidoId) {
        try {
            await database_1.default.contenido.update({
                where: { id: contenidoId },
                data: {
                    duracion_minutos: { increment: 1 },
                },
            });
            logger_1.logger.info('Vista registrada', { contenidoId });
        }
        catch (error) {
            logger_1.logger.error('Error registrando vista', { error, contenidoId });
            throw error;
        }
    }
    /**
     * Registrar descarga
     */
    async registrarDescarga(contenidoId) {
        try {
            await database_1.default.contenido.update({
                where: { id: contenidoId },
                data: {
                    semana_gestacion_inicio: { increment: 1 },
                },
            });
            logger_1.logger.info('Descarga registrada', { contenidoId });
        }
        catch (error) {
            logger_1.logger.error('Error registrando descarga', { error, contenidoId });
            throw error;
        }
    }
    /**
     * Calificar contenido
     */
    async calificarContenido(contenidoId, calificacion, usuarioId) {
        try {
            // Actualizar progreso con calificación
            await this.actualizarProgreso({ contenidoId, calificacion }, usuarioId);
            // Recalcular calificación promedio
            const progresos = await database_1.default.progresoContenido.findMany({
                where: {
                    contenido_id: contenidoId,
                    completado: true,
                },
                select: { id: true },
            });
            const totalVotos = progresos.length;
            // Calificación simplificada - por ahora solo contamos los votos
            const promedioCalificacion = totalVotos;
            await database_1.default.contenido.update({
                where: { id: contenidoId },
                data: {
                    // Actualizar campos disponibles en el schema
                    fecha_actualizacion: new Date(),
                },
            });
            logger_1.logger.info('Contenido calificado', { contenidoId, calificacion });
        }
        catch (error) {
            logger_1.logger.error('Error calificando contenido', { error, contenidoId });
            throw error;
        }
    }
    /**
     * Obtener estadísticas generales
     */
    async obtenerEstadisticas() {
        try {
            const [totalContenidos, contenidos] = await Promise.all([
                database_1.default.contenido.count(),
                database_1.default.contenido.findMany({
                    select: {
                        tipo: true,
                        categoria: true,
                        duracion_minutos: true,
                        semana_gestacion_inicio: true,
                        tags: true,
                    },
                }),
            ]);
            const porTipo = {};
            const porCategoria = {};
            let totalduracion_minutos = 0;
            let totalsemana_gestacion_inicio = 0;
            let sumatagses = 0;
            let totalCalificados = 0;
            contenidos.forEach((c) => {
                porTipo[c.tipo] = (porTipo[c.tipo] || 0) + 1;
                porCategoria[c.categoria] = (porCategoria[c.categoria] || 0) + 1;
                totalduracion_minutos += c.duracion_minutos;
                totalsemana_gestacion_inicio += c.semana_gestacion_inicio;
                if (c.tags) {
                    // sumatagses += c.tags; // Field not in schema
                    totalCalificados++;
                }
            });
            const promediotags = totalCalificados > 0 ? sumatagses / totalCalificados : 0;
            return {
                total: totalContenidos,
                activos: totalContenidos,
                inactivos: 0,
                porTipo: Object.entries(porTipo).map(([tipo, cantidad]) => ({ tipo, cantidad: Number(cantidad) })),
                porCategoria: Object.entries(porCategoria).map(([categoria, cantidad]) => ({ categoria, cantidad: Number(cantidad) })),
                porNivel: [],
                porSemanaGestacion: [],
                totalArchivos: totalContenidos,
                tamañoTotalArchivos: 0,
                ultimosContenidos: [],
                contenidoMasVisto: null,
                contenidoMejorCalificado: null,
                contenidoMasDescargado: null,
                estadisticasPorMes: [],
            };
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo estadísticas', { error });
            throw error;
        }
    }
    // Métodos auxiliares privados
    _mapContenido(contenido) {
        return {
            id: contenido.id,
            titulo: contenido.titulo,
            descripcion: contenido.descripcion,
            tipo: contenido.tipo,
            categoria: contenido.categoria,
            nivel: contenido.nivel,
            archivo_url: contenido.url_contenido,
            miniatura_url: contenido.url_imagen,
            duracion: contenido.duracion_minutos,
            autor_id: contenido.autor_id,
            etiquetas: contenido.tags,
            publico: contenido.activo,
            destacado: contenido.destacado,
            duracion_minutos: contenido.duracion_minutos,
            semana_gestacion_inicio: contenido.semana_gestacion_inicio,
            tags_promedio: contenido.tags,
            created_at: contenido.fecha_creacion,
            updated_at: contenido.fecha_actualizacion,
        };
    }
    _mapProgreso(progreso) {
        return {
            id: progreso.id,
            usuario_id: progreso.usuario_id,
            contenido_id: progreso.contenido_id,
            completado: progreso.completado,
            progreso_porcentaje: progreso.progreso || 0,
            tiempo_visto: progreso.tiempo_visto,
            ultima_posicion: progreso.ultima_posicion,
            fecha_inicio: progreso.fecha_inicio,
            fecha_completado: progreso.fecha_completado,
            created_at: progreso.created_at,
            updated_at: progreso.updated_at,
        };
    }
}
exports.ContenidoService = ContenidoService;
