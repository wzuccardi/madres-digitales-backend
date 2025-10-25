"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandlingService = exports.ErrorHandlingService = void 0;
const client_1 = require("@prisma/client");
const notification_service_1 = require("./notification.service");
const log_service_1 = require("./log.service");
const logger_1 = require("../config/logger");
const prisma = new client_1.PrismaClient();
class ErrorHandlingService {
    constructor() {
        // NUEVO: Mapa para controlar errores críticos y evitar notificaciones duplicadas
        this._erroresCriticosRecientes = new Map();
        // NUEVO: Tiempo mínimo entre notificaciones del mismo error (5 minutos)
        this._tiempoMinimoNotificacion = 5 * 60 * 1000;
        // NUEVO: Contador máximo de notificaciones para el mismo error en el período
        this._maxNotificacionesPorPeriodo = 3;
        this.notificationService = new notification_service_1.NotificationService();
        this.logService = new log_service_1.LogService();
    }
    /**
     * NUEVO: Manejar errores críticos con notificación y logging
     */
    async manejarErrorCritico(error, contexto) {
        const startTime = Date.now();
        const errorKey = `${contexto.componente}:${contexto.accion}:${error.message}`;
        try {
            console.error(`🔴 ErrorHandlingService: Error crítico en ${contexto.componente}.${contexto.accion}:`, error);
            // 1. Verificar si ya se notificó este error recientemente
            const errorReciente = this._erroresCriticosRecientes.get(errorKey);
            const ahora = new Date();
            if (errorReciente) {
                const tiempoTranscurrido = ahora.getTime() - errorReciente.timestamp.getTime();
                // Si el error ocurrió hace menos del tiempo mínimo, incrementar contador
                if (tiempoTranscurrido < this._tiempoMinimoNotificacion) {
                    errorReciente.count++;
                    // Si ya se alcanzó el máximo de notificaciones, solo registrar
                    if (errorReciente.count > this._maxNotificacionesPorPeriodo) {
                        console.log(`⚠️ ErrorHandlingService: Error ya notificado ${errorReciente.count} veces, omitiendo notificación`);
                        await this._registrarErrorSilencioso(error, contexto, errorReciente.count);
                        return;
                    }
                }
                else {
                    // Si pasó el tiempo mínimo, reiniciar contador
                    this._erroresCriticosRecientes.set(errorKey, { timestamp: ahora, count: 1 });
                }
            }
            else {
                // Si es un error nuevo, agregar al mapa
                this._erroresCriticosRecientes.set(errorKey, { timestamp: ahora, count: 1 });
            }
            // 2. Registrar error en base de datos
            await this._registrarErrorEnBaseDatos(error, contexto);
            // 3. Enviar notificación a administradores
            await this._notificarAdministradores(error, contexto);
            // 4. Registrar en logs
            await this._registrarEnLogs(error, contexto);
            // 5. Limpiar errores antiguos del mapa
            this._limpiarErroresAntiguos();
            const duration = Date.now() - startTime;
            console.log(`✅ ErrorHandlingService: Error crítico manejado en ${duration}ms`);
            logger_1.log.error('Error crítico manejado', {
                error: error.message,
                componente: contexto.componente,
                accion: contexto.accion,
                duration: `${duration}ms`,
                timestamp: ahora.toISOString(),
            });
        }
        catch (manejoError) {
            const duration = Date.now() - startTime;
            console.error(`❌ ErrorHandlingService: Error manejando error crítico:`, manejoError);
            // NUEVO: No fallar completamente, intentar registrar el error original
            try {
                await this._registrarErrorSilencioso(error, contexto, 0);
                await this._registrarErrorSilencioso(manejoError, {
                    componente: 'ErrorHandlingService',
                    accion: 'manejarErrorCritico',
                    errorOriginal: error.message,
                }, 0);
            }
            catch (registroError) {
                console.error(`❌ ErrorHandlingService: Error crítico no pudo ser registrado:`, registroError);
            }
            logger_1.log.error('Error manejando error crítico', {
                error: manejoError.message,
                errorOriginal: error.message,
                componente: contexto.componente,
                accion: contexto.accion,
                duration: `${duration}ms`,
                timestamp: new Date().toISOString(),
            });
        }
    }
    /**
     * NUEVO: Registrar error en base de datos
     */
    async _registrarErrorEnBaseDatos(error, contexto) {
        try {
            await prisma.log.create({
                data: {
                    tipo: 'error_critico',
                    mensaje: error.message,
                    datos: {
                        componente: contexto.componente,
                        accion: contexto.accion,
                        datos: contexto.datos,
                        stack: error.stack,
                        usuarioId: contexto.usuarioId,
                        gestanteId: contexto.gestanteId,
                        timestamp: new Date().toISOString(),
                    },
                    nivel: 'critico',
                    usuario_id: contexto.usuarioId,
                    fecha_creacion: new Date(),
                },
            });
        }
        catch (dbError) {
            console.error(`❌ ErrorHandlingService: Error registrando en base de datos:`, dbError);
            throw dbError;
        }
    }
    /**
     * NUEVO: Notificar a administradores sobre el error crítico
     */
    async _notificarAdministradores(error, contexto) {
        try {
            // Obtener administradores y coordinadores
            const administradores = await prisma.usuario.findMany({
                where: {
                    rol: { in: ['admin', 'super_admin'] },
                    activo: true,
                },
            });
            // Preparar mensaje de notificación
            const mensaje = `❌ Error Crítico en ${contexto.componente}\n\n` +
                `Acción: ${contexto.accion}\n` +
                `Error: ${error.message}\n` +
                `Timestamp: ${new Date().toLocaleString('es-CO')}\n` +
                (contexto.usuarioId ? `Usuario ID: ${contexto.usuarioId}\n` : '') +
                (contexto.gestanteId ? `Gestante ID: ${contexto.gestanteId}\n` : '') +
                (contexto.datos ? `Datos: ${JSON.stringify(contexto.datos, null, 2)}` : '');
            // Enviar notificación a cada administrador
            for (const admin of administradores) {
                try {
                    await this.notificationService.enviarNotificacionAdmin({
                        tipo: 'error_critico',
                        titulo: `❌ Error Crítico en ${contexto.componente}`,
                        mensaje,
                        datos: {
                            componente: contexto.componente,
                            accion: contexto.accion,
                            error: error.message,
                            stack: error.stack,
                            datos: contexto.datos,
                            usuarioId: contexto.usuarioId,
                            gestanteId: contexto.gestanteId,
                            timestamp: new Date().toISOString(),
                        },
                        prioridad: 'critica',
                    });
                }
                catch (notifError) {
                    console.error(`❌ ErrorHandlingService: Error notificando a admin ${admin.id}:`, notifError);
                }
            }
        }
        catch (notifError) {
            console.error(`❌ ErrorHandlingService: Error en notificación a administradores:`, notifError);
            throw notifError;
        }
    }
    /**
     * NUEVO: Registrar en logs
     */
    async _registrarEnLogs(error, contexto) {
        try {
            await this.logService.registrarEvento({
                tipo: 'error_critico',
                datos: {
                    componente: contexto.componente,
                    accion: contexto.accion,
                    error: error.message,
                    stack: error.stack,
                    datos: contexto.datos,
                    usuarioId: contexto.usuarioId,
                    gestanteId: contexto.gestanteId,
                    timestamp: new Date().toISOString(),
                },
                nivel: 'critico',
            });
        }
        catch (logError) {
            console.error(`❌ ErrorHandlingService: Error registrando en logs:`, logError);
            throw logError;
        }
    }
    /**
     * NUEVO: Registrar error silenciosamente (sin notificación)
     */
    async _registrarErrorSilencioso(error, contexto, conteo) {
        try {
            await prisma.log.create({
                data: {
                    tipo: 'error_critico_silenciado',
                    mensaje: error.message,
                    datos: {
                        componente: contexto.componente,
                        accion: contexto.accion,
                        datos: contexto.datos,
                        stack: error.stack,
                        usuarioId: contexto.usuarioId,
                        gestanteId: contexto.gestanteId,
                        conteo,
                        timestamp: new Date().toISOString(),
                    },
                    nivel: 'alto',
                    usuario_id: contexto.usuarioId,
                    fecha_creacion: new Date(),
                },
            });
        }
        catch (error) {
            console.error(`❌ ErrorHandlingService: Error registrando error silenciosamente:`, error);
        }
    }
    /**
     * NUEVO: Limpiar errores antiguos del mapa
     */
    _limpiarErroresAntiguos() {
        const ahora = new Date();
        const erroresAEliminar = [];
        for (const [key, error] of this._erroresCriticosRecientes.entries()) {
            const tiempoTranscurrido = ahora.getTime() - error.timestamp.getTime();
            // Eliminar errores que tienen más del doble del tiempo mínimo
            if (tiempoTranscurrido > this._tiempoMinimoNotificacion * 2) {
                erroresAEliminar.push(key);
            }
        }
        for (const key of erroresAEliminar) {
            this._erroresCriticosRecientes.delete(key);
        }
        if (erroresAEliminar.length > 0) {
            console.log(`🧹 ErrorHandlingService: Limpiados ${erroresAEliminar.length} errores antiguos`);
        }
    }
    /**
     * NUEVO: Obtener estadísticas de errores críticos
     */
    obtenerEstadisticasErroresCriticos() {
        const ahora = new Date();
        const recientes = Array.from(this._erroresCriticosRecientes.values()).filter(error => ahora.getTime() - error.timestamp.getTime() < this._tiempoMinimoNotificacion).length;
        const masFrecuentes = Array.from(this._erroresCriticosRecientes.entries())
            .map(([key, error]) => ({ key, count: error.count, ultimo: error.timestamp }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        return {
            total: this._erroresCriticosRecientes.size,
            recientes,
            masFrecuentes,
        };
    }
    /**
     * NUEVO: Limpiar mapa de errores críticos
     */
    limpiarErroresCriticos() {
        const cantidad = this._erroresCriticosRecientes.size;
        this._erroresCriticosRecientes.clear();
        console.log(`🧹 ErrorHandlingService: Limpiados ${cantidad} errores críticos del mapa`);
    }
    /**
     * NUEVO: Manejar advertencias con notificación opcional
     */
    async manejarAdvertencia(advertencia, contexto, notificar = false) {
        try {
            console.warn(`⚠️ ErrorHandlingService: Advertencia en ${contexto.componente}.${contexto.accion}:`, advertencia);
            // Registrar advertencia en base de datos
            await prisma.log.create({
                data: {
                    tipo: 'advertencia',
                    mensaje: advertencia,
                    datos: {
                        componente: contexto.componente,
                        accion: contexto.accion,
                        datos: contexto.datos,
                        usuarioId: contexto.usuarioId,
                        gestanteId: contexto.gestanteId,
                        timestamp: new Date().toISOString(),
                    },
                    nivel: 'medio',
                    usuario_id: contexto.usuarioId,
                    fecha_creacion: new Date(),
                },
            });
            // Si se solicita notificar, enviar a administradores
            if (notificar) {
                const administradores = await prisma.usuario.findMany({
                    where: {
                        rol: { in: ['admin', 'super_admin'] },
                        activo: true,
                    },
                });
                const mensaje = `⚠️ Advertencia en ${contexto.componente}\n\n` +
                    `Acción: ${contexto.accion}\n` +
                    `Mensaje: ${advertencia}\n` +
                    `Timestamp: ${new Date().toLocaleString('es-CO')}`;
                for (const admin of administradores) {
                    try {
                        await this.notificationService.enviarNotificacionAdmin({
                            tipo: 'advertencia',
                            titulo: `⚠️ Advertencia en ${contexto.componente}`,
                            mensaje,
                            datos: {
                                componente: contexto.componente,
                                accion: contexto.accion,
                                advertencia,
                                datos: contexto.datos,
                                usuarioId: contexto.usuarioId,
                                gestanteId: contexto.gestanteId,
                                timestamp: new Date().toISOString(),
                            },
                            prioridad: 'media',
                        });
                    }
                    catch (notifError) {
                        console.error(`❌ ErrorHandlingService: Error notificando advertencia a admin ${admin.id}:`, notifError);
                    }
                }
            }
            logger_1.log.warn('Advertencia manejada', {
                advertencia,
                componente: contexto.componente,
                accion: contexto.accion,
                notificar,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            console.error(`❌ ErrorHandlingService: Error manejando advertencia:`, error);
            logger_1.log.error('Error manejando advertencia', {
                error: error.message,
                advertencia,
                componente: contexto.componento,
                accion: contexto.accion,
                timestamp: new Date().toISOString(),
            });
        }
    }
}
exports.ErrorHandlingService = ErrorHandlingService;
// Singleton del servicio
exports.errorHandlingService = new ErrorHandlingService();
