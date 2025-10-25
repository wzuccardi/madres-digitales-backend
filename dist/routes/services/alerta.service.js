"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertaService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AlertaService {
    /**
     * Obtener todas las alertas (para administradores)
     */
    async getAllAlertas() {
        try {
            console.log('🔍 AlertaService: Fetching all alertas');
            const alertas = await prisma.alerta.findMany({
                include: {
                    gestante: {
                        select: {
                            id: true,
                            nombre: true,
                            documento: true,
                            telefono: true,
                            municipio: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    departamento: true
                                }
                            }
                        }
                    },
                    madrina: {
                        select: {
                            id: true,
                            nombre: true,
                            telefono: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            });
            console.log(`✅ AlertaService: Found ${alertas.length} alertas`);
            return alertas;
        }
        catch (error) {
            console.error('❌ AlertaService: Error fetching all alertas:', error);
            throw new Error(`Error obteniendo todas las alertas: ${error.message}`);
        }
    }
    /**
     * Obtener alertas por madrina
     */
    async getAlertasByMadrina(madrinaId) {
        try {
            console.log(`🔍 AlertaService: Fetching alertas for madrina ${madrinaId}`);
            const alertas = await prisma.alerta.findMany({
                where: {
                    OR: [
                        { madrina_id: madrinaId },
                        {
                            gestante: {
                                madrina_id: madrinaId
                            }
                        }
                    ]
                },
                include: {
                    gestante: {
                        select: {
                            id: true,
                            nombre: true,
                            documento: true,
                            telefono: true,
                            municipio: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    departamento: true
                                }
                            }
                        }
                    },
                    madrina: {
                        select: {
                            id: true,
                            nombre: true,
                            telefono: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            });
            console.log(`✅ AlertaService: Found ${alertas.length} alertas for madrina ${madrinaId}`);
            return alertas;
        }
        catch (error) {
            console.error(`❌ AlertaService: Error fetching alertas for madrina ${madrinaId}:`, error);
            throw new Error(`Error obteniendo alertas de madrina: ${error.message}`);
        }
    }
    /**
     * Obtener alerta por ID
     */
    async getAlertaById(id) {
        try {
            console.log(`🔍 AlertaService: Fetching alerta ${id}`);
            const alerta = await prisma.alerta.findUnique({
                where: { id },
                include: {
                    gestante: {
                        select: {
                            id: true,
                            nombre: true,
                            documento: true,
                            telefono: true,
                            municipio: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    departamento: true
                                }
                            }
                        }
                    },
                    madrina: {
                        select: {
                            id: true,
                            nombre: true,
                            telefono: true
                        }
                    }
                }
            });
            if (alerta) {
                console.log(`✅ AlertaService: Found alerta ${id}`);
            }
            else {
                console.log(`❌ AlertaService: Alerta ${id} not found`);
            }
            return alerta;
        }
        catch (error) {
            console.error(`❌ AlertaService: Error fetching alerta ${id}:`, error);
            throw new Error(`Error obteniendo alerta: ${error.message}`);
        }
    }
    /**
     * Crear alerta completa
     */
    async createAlertaCompleta(data) {
        try {
            console.log('🚨 AlertaService: Creating complete alert with data:', data);
            // Validar que la gestante existe
            const gestante = await prisma.gestante.findUnique({
                where: { id: data.gestante_id }
            });
            if (!gestante) {
                throw new Error(`No se encontró gestante con ID ${data.gestante_id}`);
            }
            // Crear la alerta
            const alerta = await prisma.alerta.create({
                data: {
                    gestante_id: data.gestante_id,
                    tipo_alerta: data.tipo_alerta || data.tipo,
                    nivel_prioridad: data.nivel_prioridad || 'media',
                    mensaje: data.mensaje || 'Alerta creada',
                    sintomas: data.sintomas || [],
                    madrina_id: data.madrina_id || null,
                    medico_asignado_id: data.medico_asignado_id || null,
                    ips_derivada_id: data.ips_derivada_id || null,
                    generado_por_id: data.generado_por_id || null,
                    coordenadas_alerta: data.coordenadas ? {
                        type: 'Point',
                        coordinates: data.coordenadas
                    } : null,
                    resuelta: false
                },
                include: {
                    gestante: {
                        select: {
                            id: true,
                            nombre: true,
                            documento: true,
                            telefono: true
                        }
                    }
                }
            });
            console.log(`✅ AlertaService: Alert created with ID: ${alerta.id}`);
            return alerta;
        }
        catch (error) {
            console.error('❌ AlertaService: Error creating complete alert:', error);
            throw error;
        }
    }
    /**
     * Actualizar alerta completa
     */
    async updateAlertaCompleta(id, data) {
        try {
            console.log(`🚨 AlertaService: Updating alert ${id} with data:`, data);
            // Verificar que la alerta existe
            const alertaExistente = await prisma.alerta.findUnique({
                where: { id }
            });
            if (!alertaExistente) {
                throw new Error(`No se encontró alerta con ID ${id}`);
            }
            // Actualizar la alerta
            const alerta = await prisma.alerta.update({
                where: { id },
                data: {
                    tipo_alerta: data.tipo_alerta || data.tipo,
                    nivel_prioridad: data.nivel_prioridad,
                    mensaje: data.mensaje,
                    sintomas: data.sintomas,
                    madrina_id: data.madrina_id,
                    medico_asignado_id: data.medico_asignado_id,
                    ips_derivada_id: data.ips_derivada_id,
                    resuelta: data.resuelta,
                    fecha_resolucion: data.resuelta ? new Date() : null,
                    coordenadas_alerta: data.coordenadas ? {
                        type: 'Point',
                        coordinates: data.coordenadas
                    } : undefined
                },
                include: {
                    gestante: {
                        select: {
                            id: true,
                            nombre: true,
                            documento: true,
                            telefono: true
                        }
                    }
                }
            });
            console.log(`✅ AlertaService: Alert ${id} updated successfully`);
            return alerta;
        }
        catch (error) {
            console.error(`❌ AlertaService: Error updating alert ${id}:`, error);
            throw error;
        }
    }
    /**
     * Eliminar alerta
     */
    async deleteAlerta(id) {
        try {
            console.log(`🗑️ AlertaService: Deleting alert ${id}`);
            const alerta = await prisma.alerta.delete({
                where: { id }
            });
            console.log(`✅ AlertaService: Alert ${id} deleted successfully`);
            return alerta;
        }
        catch (error) {
            console.error(`❌ AlertaService: Error deleting alert ${id}:`, error);
            throw new Error(`Error eliminando alerta: ${error.message}`);
        }
    }
    /**
     * Obtener alertas por gestante
     */
    async getAlertasByGestante(gestanteId) {
        try {
            console.log(`🔍 AlertaService: Fetching alertas for gestante ${gestanteId}`);
            const alertas = await prisma.alerta.findMany({
                where: { gestante_id: gestanteId },
                include: {
                    madrina: {
                        select: {
                            id: true,
                            nombre: true,
                            telefono: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            });
            console.log(`✅ AlertaService: Found ${alertas.length} alertas for gestante ${gestanteId}`);
            return alertas;
        }
        catch (error) {
            console.error(`❌ AlertaService: Error fetching alertas for gestante ${gestanteId}:`, error);
            throw new Error(`Error obteniendo alertas de gestante: ${error.message}`);
        }
    }
    /**
     * Obtener alertas activas
     */
    async getAlertasActivas() {
        try {
            console.log('🔍 AlertaService: Fetching active alertas');
            const alertas = await prisma.alerta.findMany({
                where: { resuelta: false },
                include: {
                    gestante: {
                        select: {
                            id: true,
                            nombre: true,
                            documento: true,
                            telefono: true,
                            municipio: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    departamento: true
                                }
                            }
                        }
                    },
                    madrina: {
                        select: {
                            id: true,
                            nombre: true,
                            telefono: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            });
            console.log(`✅ AlertaService: Found ${alertas.length} active alertas`);
            return alertas;
        }
        catch (error) {
            console.error('❌ AlertaService: Error fetching active alertas:', error);
            throw new Error(`Error obteniendo alertas activas: ${error.message}`);
        }
    }
    /**
     * Resolver alerta
     */
    async resolverAlerta(id, observaciones) {
        try {
            console.log(`✅ AlertaService: Resolving alert ${id}`);
            const alerta = await prisma.alerta.update({
                where: { id },
                data: {
                    resuelta: true,
                    fecha_resolucion: new Date()
                },
                include: {
                    gestante: {
                        select: {
                            id: true,
                            nombre: true,
                            documento: true,
                            telefono: true
                        }
                    }
                }
            });
            console.log(`✅ AlertaService: Alert ${id} resolved successfully`);
            return alerta;
        }
        catch (error) {
            console.error(`❌ AlertaService: Error resolving alert ${id}:`, error);
            throw new Error(`Error resolviendo alerta: ${error.message}`);
        }
    }
    /**
     * Crear alerta SOS con notificaciones completas
     */
    async notificarEmergencia(gestanteId, coordenadas) {
        console.log('🚨 AlertaService: Creating SOS emergency alert...');
        console.log(`   Gestante ID: ${gestanteId}`);
        console.log(`   Coordinates: [${coordenadas[0]}, ${coordenadas[1]}]`);
        const startTime = Date.now();
        try {
            // Obtener información completa de la gestante
            const gestanteCompleta = await prisma.gestante.findUnique({
                where: { id: gestanteId },
                include: {
                    municipio: true,
                    madrina: {
                        include: {
                            municipio: true,
                        },
                    },
                    medico_tratante: {
                        include: {
                            ips: true,
                        },
                    },
                    ips_asignada: true,
                },
            });
            if (!gestanteCompleta) {
                throw new Error(`Gestante con ID ${gestanteId} no encontrada`);
            }
            // Construir mensaje descriptivo
            const fechaHora = new Date().toLocaleString('es-CO', {
                timeZone: 'America/Bogota',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            let mensajeDetallado = `🚨 ALERTA DE EMERGENCIA SOS - ${fechaHora}\n\n`;
            mensajeDetallado += `👤 GESTANTE: ${gestanteCompleta.nombre}\n`;
            mensajeDetallado += `📍 COORDENADAS: ${coordenadas[1]}, ${coordenadas[0]}\n`;
            mensajeDetallado += `⚠️ REQUIERE ATENCIÓN MÉDICA INMEDIATA`;
            // Crear alerta de emergencia SOS
            const alertaSOS = await prisma.alerta.create({
                data: {
                    gestante_id: gestanteId,
                    madrina_id: gestanteCompleta.madrina_id || null,
                    tipo_alerta: 'sos',
                    nivel_prioridad: 'critica',
                    mensaje: mensajeDetallado,
                    coordenadas_alerta: {
                        type: 'Point',
                        coordinates: coordenadas
                    },
                    resuelta: false,
                    fecha_resolucion: null,
                }
            });
            console.log(`✅ AlertaService: SOS alert created with ID: ${alertaSOS.id}`);
            const duration = Date.now() - startTime;
            console.log(`⏱️ AlertaService: SOS alert created in ${duration}ms`);
            return alertaSOS;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            console.error('❌ AlertaService: Error creating SOS alert:', error);
            throw new Error(`Error creando alerta SOS: ${error}`);
        }
    }
}
exports.AlertaService = AlertaService;
