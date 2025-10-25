"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPSService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../config/logger");
const prisma = new client_1.PrismaClient();
class IPSService {
    constructor() {
        console.log('🏥 IPSService initialized');
    }
    async createIPS(data) {
        try {
            console.log('🏥 Creando IPS:', data);
            const ips = await prisma.iPS.create({
                data: {
                    nombre: data.nombre,
                    nit: data.nit,
                    telefono: data.telefono,
                    direccion: data.direccion,
                    municipio_id: data.municipio_id,
                    nivel: data.nivel,
                    email: data.email,
                    latitud: data.latitud,
                    longitud: data.longitud,
                    activo: true,
                    fecha_creacion: new Date(),
                    fecha_actualizacion: new Date()
                },
                include: {
                    municipio: true,
                    medicos: true,
                    gestantes: true
                }
            });
            console.log(`✅ IPS creada con ID: ${ips.id}`);
            logger_1.log.info('IPS creada', { ipsId: ips.id, nombre: ips.nombre });
            return {
                success: true,
                ips
            };
        }
        catch (error) {
            console.error('❌ Error creando IPS:', error);
            logger_1.log.error('Error creando IPS', { error: error.message, data });
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getAllIPS(filtros) {
        try {
            console.log('🏥 Obteniendo lista de IPS con filtros:', filtros);
            const where = {};
            if (filtros?.municipio_id) {
                where.municipio_id = filtros.municipio_id;
            }
            if (filtros?.nivel) {
                where.nivel = filtros.nivel;
            }
            if (filtros?.activo !== undefined) {
                where.activo = filtros.activo;
            }
            const [ips, total] = await Promise.all([
                prisma.iPS.findMany({
                    where,
                    include: {
                        municipio: true,
                        medicos: {
                            where: { activo: true },
                            include: { municipio: true }
                        },
                        _count: {
                            select: {
                                medicos: true,
                                gestantes: true
                            }
                        }
                    },
                    orderBy: { nombre: 'asc' },
                    take: filtros?.limite || 100,
                    skip: filtros?.offset || 0
                }),
                prisma.iPS.count({ where })
            ]);
            console.log(`🏥 Consulta completada: ${ips.length} IPS encontradas de ${total} totales`);
            return {
                success: true,
                ips,
                total
            };
        }
        catch (error) {
            console.error('❌ Error obteniendo IPS:', error);
            logger_1.log.error('Error obteniendo IPS', { error: error.message, filtros });
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getIPSById(id) {
        try {
            console.log(`🏥 Buscando IPS con ID: ${id}`);
            const ips = await prisma.iPS.findUnique({
                where: { id },
                include: {
                    municipio: true,
                    medicos: {
                        where: { activo: true },
                        include: {
                            municipio: true,
                            ips: true
                        }
                    },
                    gestantes: {
                        where: { activa: true },
                        include: {
                            municipio: true,
                            madrina: true,
                            medico_tratante: true
                        }
                    },
                    _count: {
                        select: {
                            medicos: true,
                            gestantes: true
                        }
                    }
                }
            });
            if (!ips) {
                return {
                    success: false,
                    error: 'IPS no encontrada'
                };
            }
            console.log(`✅ IPS encontrada: ${ips.nombre}`);
            return {
                success: true,
                ips
            };
        }
        catch (error) {
            console.error('❌ Error obteniendo IPS:', error);
            logger_1.log.error('Error obteniendo IPS por ID', { error: error.message, id });
            return {
                success: false,
                error: error.message
            };
        }
    }
    async updateIPS(id, data) {
        try {
            console.log(`🏥 Actualizando IPS ${id} con datos:`, data);
            const ips = await prisma.iPS.update({
                where: { id },
                data: {
                    ...data,
                    fecha_actualizacion: new Date()
                },
                include: {
                    municipio: true,
                    medicos: true,
                    gestantes: true
                }
            });
            console.log(`✅ IPS actualizada: ${ips.nombre}`);
            logger_1.log.info('IPS actualizada', { ipsId: ips.id, nombre: ips.nombre, cambios: data });
            return {
                success: true,
                ips
            };
        }
        catch (error) {
            console.error('❌ Error actualizando IPS:', error);
            logger_1.log.error('Error actualizando IPS', { error: error.message, id, data });
            return {
                success: false,
                error: error.message
            };
        }
    }
    async deleteIPS(id) {
        try {
            console.log(`🏥 Eliminando IPS con ID: ${id}`);
            // Verificar si hay médicos o gestantes asociados
            const asociaciones = await prisma.iPS.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            medicos: true,
                            gestantes: true
                        }
                    }
                }
            });
            if (!asociaciones) {
                return {
                    success: false,
                    error: 'IPS no encontrada'
                };
            }
            if (asociaciones._count.medicos > 0 || asociaciones._count.gestantes > 0) {
                // En lugar de eliminar, desactivar
                await prisma.iPS.update({
                    where: { id },
                    data: {
                        activo: false,
                        fecha_actualizacion: new Date()
                    }
                });
                console.log(`🏥 IPS desactivada (tenía asociaciones): ${asociaciones.nombre}`);
                logger_1.log.info('IPS desactivada', {
                    ipsId: id,
                    nombre: asociaciones.nombre,
                    medicos: asociaciones._count.medicos,
                    gestantes: asociaciones._count.gestantes
                });
                return {
                    success: true
                };
            }
            // Si no hay asociaciones, eliminar completamente
            await prisma.iPS.delete({
                where: { id }
            });
            console.log(`✅ IPS eliminada: ${asociaciones.nombre}`);
            logger_1.log.info('IPS eliminada', { ipsId: id, nombre: asociaciones.nombre });
            return {
                success: true
            };
        }
        catch (error) {
            console.error('❌ Error eliminando IPS:', error);
            logger_1.log.error('Error eliminando IPS', { error: error.message, id });
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getIPSCercanas(coordenadas, radioKm = 10) {
        try {
            console.log(`🏥 Buscando IPS cercanas a coordenadas [${coordenadas[0]}, ${coordenadas[1]}] en radio de ${radioKm}km`);
            // Esta es una consulta simplificada. En producción se usaría PostGIS para consultas geográficas
            const ips = await prisma.iPS.findMany({
                where: {
                    activo: true,
                    municipio: {
                        activo: true
                    }
                },
                include: {
                    municipio: true,
                    medicos: {
                        where: { activo: true },
                        include: { municipio: true }
                    },
                    _count: {
                        select: {
                            medicos: true,
                            gestantes: true
                        }
                    }
                }
            });
            // Simular cálculo de distancia (en producción usar PostGIS)
            const ipsConDistancia = ips.map(ipsActual => ({
                ...ipsActual,
                distancia: Math.random() * radioKm // Simulación de distancia
            })).filter(ipsActual => ipsActual.distancia <= radioKm)
                .sort((a, b) => a.distancia - b.distancia);
            console.log(`🏥 Se encontraron ${ipsConDistancia.length} IPS cercanas`);
            return {
                success: true,
                ips: ipsConDistancia
            };
        }
        catch (error) {
            console.error('❌ Error buscando IPS cercanas:', error);
            logger_1.log.error('Error buscando IPS cercanas', { error: error.message, coordenadas, radioKm });
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getEstadisticasIPS() {
        try {
            console.log('🏥 Obteniendo estadísticas de IPS');
            const [total, porNivel, porMunicipio, activas] = await Promise.all([
                prisma.iPS.count(),
                prisma.iPS.groupBy({
                    by: ['nivel'],
                    _count: { nivel: true }
                }),
                prisma.iPS.groupBy({
                    by: ['municipio_id'],
                    _count: { municipio_id: true },
                    orderBy: { _count: { municipio_id: 'desc' } },
                    take: 10
                }),
                prisma.iPS.count({
                    where: { activo: true }
                })
            ]);
            const estadisticas = {
                total,
                activas,
                inactivas: total - activas,
                por_nivel: porNivel.reduce((acc, item) => {
                    acc[item.nivel || 'sin_nivel'] = item._count.nivel;
                    return acc;
                }, {}),
                top_municipios: porMunicipio
            };
            console.log('🏥 Estadísticas obtenidas:', estadisticas);
            return {
                success: true,
                estadisticas
            };
        }
        catch (error) {
            console.error('❌ Error obteniendo estadísticas de IPS:', error);
            logger_1.log.error('Error obteniendo estadísticas de IPS', { error: error.message });
            return {
                success: false,
                error: error.message
            };
        }
    }
}
exports.IPSService = IPSService;
