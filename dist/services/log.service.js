"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../config/logger");
const prisma = new client_1.PrismaClient();
class LogService {
    constructor() {
        console.log('📝 LogService initialized');
    }
    async registrarEvento(evento) {
        try {
            console.log('📝 Registrando evento:', {
                tipo: evento.tipo,
                nivel: evento.nivel,
                usuario_id: evento.usuario_id
            });
            // Registrar en base de datos
            const logDB = await prisma.log.create({
                data: {
                    tipo: evento.tipo,
                    mensaje: evento.datos?.mensaje || `Evento: ${evento.tipo}`,
                    datos: evento.datos,
                    nivel: evento.nivel,
                    usuario_id: evento.usuario_id,
                    fecha_creacion: new Date()
                }
            });
            console.log(`✅ Evento registrado en BD con ID: ${logDB.id}`);
            // También registrar en Winston logger
            const logMessage = `[${evento.nivel.toUpperCase()}] ${evento.tipo}`;
            const logMeta = {
                logId: logDB.id,
                tipo: evento.tipo,
                datos: evento.datos,
                usuario_id: evento.usuario_id,
                timestamp: new Date().toISOString()
            };
            // Usar el nivel apropiado de Winston
            switch (evento.nivel) {
                case 'critico':
                    logger_1.log.error(logMessage, logMeta);
                    break;
                case 'alto':
                    logger_1.log.warn(logMessage, logMeta);
                    break;
                case 'medio':
                    logger_1.log.info(logMessage, logMeta);
                    break;
                case 'bajo':
                default:
                    logger_1.log.debug(logMessage, logMeta);
                    break;
            }
            return {
                success: true,
                logId: logDB.id
            };
        }
        catch (error) {
            console.error('❌ Error registrando evento:', error);
            // Si falla la BD, al menos registrar en Winston
            logger_1.log.error(`[ERROR_LOG_SERVICE] ${evento.tipo}`, {
                error: error.message,
                evento: evento,
                timestamp: new Date().toISOString()
            });
            return {
                success: false,
                error: error.message
            };
        }
    }
    async registrarEventoBatch(eventos) {
        console.log(`📝 Registrando batch de ${eventos.length} eventos`);
        const resultados = [];
        for (const evento of eventos) {
            try {
                const resultado = await this.registrarEvento(evento);
                resultados.push({
                    tipo: evento.tipo,
                    ...resultado
                });
            }
            catch (error) {
                resultados.push({
                    tipo: evento.tipo,
                    success: false,
                    error: error.message
                });
            }
        }
        const successCount = resultados.filter(r => r.success).length;
        console.log(`📝 Batch completado: ${successCount}/${eventos.length} exitosos`);
        return {
            success: successCount > 0,
            resultados
        };
    }
    async consultarLogs(filtros) {
        try {
            console.log('📝 Consultando logs con filtros:', filtros);
            const where = {};
            if (filtros?.tipo) {
                where.tipo = filtros.tipo;
            }
            if (filtros?.nivel) {
                where.nivel = filtros.nivel;
            }
            if (filtros?.usuario_id) {
                where.usuario_id = filtros.usuario_id;
            }
            if (filtros?.fecha_inicio || filtros?.fecha_fin) {
                where.fecha_creacion = {};
                if (filtros.fecha_inicio) {
                    where.fecha_creacion.gte = filtros.fecha_inicio;
                }
                if (filtros.fecha_fin) {
                    where.fecha_creacion.lte = filtros.fecha_fin;
                }
            }
            const [logs, total] = await Promise.all([
                prisma.log.findMany({
                    where,
                    orderBy: { fecha_creacion: 'desc' },
                    take: filtros?.limite || 100,
                    skip: filtros?.offset || 0,
                }),
                prisma.log.count({ where })
            ]);
            console.log(`📝 Consulta completada: ${logs.length} logs encontrados de ${total} totales`);
            return {
                success: true,
                logs,
                total
            };
        }
        catch (error) {
            console.error('❌ Error consultando logs:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async limpiarLogsAntigues(dias = 30) {
        try {
            console.log(`📝 Limpiando logs más antiguos que ${dias} días`);
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - dias);
            const resultado = await prisma.log.deleteMany({
                where: {
                    fecha_creacion: {
                        lt: fechaLimite
                    }
                }
            });
            console.log(`📝 Limpieza completada: ${resultado.count} logs eliminados`);
            logger_1.log.info(`Limpieza automática de logs`, {
                dias,
                eliminados: resultado.count,
                fecha_limite: fechaLimite.toISOString()
            });
            return {
                success: true,
                eliminados: resultado.count
            };
        }
        catch (error) {
            console.error('❌ Error limpiando logs:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async obtenerEstadisticasLogs() {
        try {
            console.log('📝 Obteniendo estadísticas de logs');
            const [total, porNivel, porTipo, recientes] = await Promise.all([
                prisma.log.count(),
                prisma.log.groupBy({
                    by: ['nivel'],
                    _count: { nivel: true }
                }),
                prisma.log.groupBy({
                    by: ['tipo'],
                    _count: { tipo: true },
                    orderBy: { _count: { tipo: 'desc' } },
                    take: 10
                }),
                prisma.log.findMany({
                    orderBy: { fecha_creacion: 'desc' },
                    take: 5
                })
            ]);
            const estadisticas = {
                total,
                por_nivel: porNivel.reduce((acc, item) => {
                    acc[item.nivel] = item._count.nivel;
                    return acc;
                }, {}),
                por_tipo: porTipo.reduce((acc, item) => {
                    acc[item.tipo] = item._count.tipo;
                    return acc;
                }, {}),
                recientes
            };
            console.log('📝 Estadísticas obtenidas:', estadisticas);
            return {
                success: true,
                estadisticas
            };
        }
        catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}
exports.LogService = LogService;
