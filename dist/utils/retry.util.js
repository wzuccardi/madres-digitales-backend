"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryFast = exports.retryCritical = exports.retryExternalApi = exports.retryDatabase = exports.retryNetwork = exports.retryWithConfig = exports.RetryConfigs = exports.RetryUtil = exports.RetryExhaustedError = void 0;
const logger_1 = require("../config/logger");
/**
 * Opciones de reintento por defecto
 */
const defaultRetryConfig = {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    backoffFactor: 2,
    jitter: true,
    retryableErrors: [
        'ECONNRESET',
        'ETIMEDOUT',
        'ECONNREFUSED',
        'EHOSTUNREACH',
        'EPIPE',
        'ENOTFOUND',
        'ENETUNREACH',
        'EAI_AGAIN',
        'NETWORK_ERROR',
        'TIMEOUT',
        'CONNECTION_ERROR',
        'RATE_LIMIT_EXCEEDED',
        'SERVICE_UNAVAILABLE',
        'TEMPORARY_FAILURE',
    ],
};
/**
 * Error de reintento agotado
 */
class RetryExhaustedError extends Error {
    constructor(attempts, lastError, totalDelay) {
        super(`Retry exhausted after ${attempts} attempts. Last error: ${lastError.message}`);
        this.name = 'RetryExhaustedError';
        this.attempts = attempts;
        this.lastError = lastError;
        this.totalDelay = totalDelay;
    }
}
exports.RetryExhaustedError = RetryExhaustedError;
/**
 * Utilidad de reintento con backoff exponencial
 */
class RetryUtil {
    /**
     * NUEVO: Ejecutar función con estrategia de reintento
     */
    static async executeWithRetry(fn, config = {}) {
        const finalConfig = { ...defaultRetryConfig, ...config };
        let lastError;
        let totalDelay = 0;
        for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
            try {
                // NUEVO: Ejecutar la función
                const result = await fn();
                // NUEVO: Si es exitosa y no es el primer intento, registrar recuperación
                if (attempt > 1) {
                    logger_1.log.info('Operación recuperada después de reintentos', {
                        attempt,
                        totalDelay,
                        lastError: lastError?.message,
                    });
                }
                return result;
            }
            catch (error) {
                lastError = error;
                // NUEVO: Verificar si se debe reintentar
                if (!this._shouldRetry(lastError, finalConfig, attempt, finalConfig.maxAttempts)) {
                    throw lastError;
                }
                // NUEVO: Calcular retraso para el próximo intento
                const delay = this._calculateDelay(attempt, finalConfig);
                totalDelay += delay;
                // NUEVO: Ejecutar callback de reintento si está configurado
                if (finalConfig.onRetry) {
                    finalConfig.onRetry(attempt, lastError, delay);
                }
                // NUEVO: Registrar intento de reintento
                logger_1.log.warn('Reintentando operación', {
                    attempt,
                    maxAttempts: finalConfig.maxAttempts,
                    delay,
                    totalDelay,
                    error: lastError.message,
                    errorType: lastError.constructor.name,
                });
                // NUEVO: Esperar antes del próximo intento
                await this._delay(delay);
            }
        }
        // NUEVO: Si se agotaron los reintentos, lanzar error específico
        throw new RetryExhaustedError(finalConfig.maxAttempts, lastError, totalDelay);
    }
    /**
     * NUEVO: Verificar si se debe reintentar
     */
    static _shouldRetry(error, config, currentAttempt, maxAttempts) {
        // NUEVO: Verificar si ya se alcanzó el máximo de intentos
        if (currentAttempt >= maxAttempts) {
            return false;
        }
        // NUEVO: Usar función personalizada si está configurada
        if (config.shouldRetry) {
            return config.shouldRetry(error);
        }
        // NUEVO: Verificar si el error está en la lista de errores reintentables
        if (config.retryableErrors && config.retryableErrors.length > 0) {
            return config.retryableErrors.some(retryableError => error.message.includes(retryableError) ||
                error.name.includes(retryableError) ||
                error.code === retryableError);
        }
        // NUEVO: Por defecto, reintentar todos los errores
        return true;
    }
    /**
     * NUEVO: Calcular retraso con backoff exponencial
     */
    static _calculateDelay(attempt, config) {
        // NUEVO: Calcular retraso base con backoff exponencial
        let delay = config.baseDelayMs * Math.pow(config.backoffFactor || 2, attempt - 1);
        // NUEVO: Aplicar límite máximo
        if (config.maxDelayMs) {
            delay = Math.min(delay, config.maxDelayMs);
        }
        // NUEVO: Agregar variación aleatoria (jitter) si está configurado
        if (config.jitter) {
            // Jitter de ±25% del retraso
            const jitterAmount = delay * 0.25;
            delay = delay + (Math.random() * 2 - 1) * jitterAmount;
        }
        // NUEVO: Asegurar que el retraso no sea negativo
        return Math.max(0, Math.floor(delay));
    }
    /**
     * NUEVO: Función de retraso
     */
    static _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * NUEVO: Crear función con reintento incorporado
     */
    static createRetryableFunction(fn, config = {}) {
        return () => this.executeWithRetry(fn, config);
    }
    /**
     * NUEVO: Envolver método de clase con reintento
     */
    static wrapMethod(target, methodName, config = {}) {
        const originalMethod = target[methodName];
        target[methodName] = (...args) => {
            return this.executeWithRetry(() => originalMethod.apply(target, args), config);
        };
    }
    /**
     * NUEVO: Decorador para métodos con reintento
     */
    static retry(config = {}) {
        return (target, propertyName, descriptor) => {
            const method = descriptor.value;
            descriptor.value = async function (...args) {
                return RetryUtil.executeWithRetry(() => method.apply(this, args), config);
            };
            return descriptor;
        };
    }
}
exports.RetryUtil = RetryUtil;
/**
 * NUEVO: Configuraciones predefinidas para diferentes tipos de operaciones
 */
exports.RetryConfigs = {
    /**
     * Para operaciones de red
     */
    network: {
        maxAttempts: 5,
        baseDelayMs: 1000,
        maxDelayMs: 30000,
        backoffFactor: 2,
        jitter: true,
        retryableErrors: [
            'ECONNRESET',
            'ETIMEDOUT',
            'ECONNREFUSED',
            'EHOSTUNREACH',
            'EPIPE',
            'ENOTFOUND',
            'ENETUNREACH',
            'NETWORK_ERROR',
        ],
    },
    /**
     * Para operaciones de base de datos
     */
    database: {
        maxAttempts: 3,
        baseDelayMs: 500,
        maxDelayMs: 5000,
        backoffFactor: 2,
        jitter: true,
        retryableErrors: [
            'CONNECTION_ERROR',
            'TIMEOUT',
            'DEADLOCK',
            'SERIALIZATION_FAILURE',
            'TEMPORARY_FAILURE',
        ],
    },
    /**
     * Para operaciones de API externas
     */
    externalApi: {
        maxAttempts: 4,
        baseDelayMs: 2000,
        maxDelayMs: 60000,
        backoffFactor: 2.5,
        jitter: true,
        retryableErrors: [
            'RATE_LIMIT_EXCEEDED',
            'SERVICE_UNAVAILABLE',
            'TIMEOUT',
            'NETWORK_ERROR',
        ],
    },
    /**
     * Para operaciones críticas
     */
    critical: {
        maxAttempts: 10,
        baseDelayMs: 500,
        maxDelayMs: 10000,
        backoffFactor: 1.5,
        jitter: true,
        retryableErrors: [
            'NETWORK_ERROR',
            'TIMEOUT',
            'CONNECTION_ERROR',
            'SERVICE_UNAVAILABLE',
        ],
    },
    /**
     * Para operaciones rápidas
     */
    fast: {
        maxAttempts: 2,
        baseDelayMs: 100,
        maxDelayMs: 1000,
        backoffFactor: 2,
        jitter: false,
        retryableErrors: [
            'NETWORK_ERROR',
            'TIMEOUT',
        ],
    },
};
/**
 * NUEVO: Función de conveniencia para reintentos con configuración predefinida
 */
const retryWithConfig = (fn, configName) => {
    return RetryUtil.executeWithRetry(fn, exports.RetryConfigs[configName]);
};
exports.retryWithConfig = retryWithConfig;
/**
 * NUEVO: Función de conveniencia para reintentos de red
 */
const retryNetwork = (fn) => {
    return (0, exports.retryWithConfig)(fn, 'network');
};
exports.retryNetwork = retryNetwork;
/**
 * NUEVO: Función de conveniencia para reintentos de base de datos
 */
const retryDatabase = (fn) => {
    return (0, exports.retryWithConfig)(fn, 'database');
};
exports.retryDatabase = retryDatabase;
/**
 * NUEVO: Función de conveniencia para reintentos de API externa
 */
const retryExternalApi = (fn) => {
    return (0, exports.retryWithConfig)(fn, 'externalApi');
};
exports.retryExternalApi = retryExternalApi;
/**
 * NUEVO: Función de conveniencia para operaciones críticas
 */
const retryCritical = (fn) => {
    return (0, exports.retryWithConfig)(fn, 'critical');
};
exports.retryCritical = retryCritical;
/**
 * NUEVO: Función de conveniencia para operaciones rápidas
 */
const retryFast = (fn) => {
    return (0, exports.retryWithConfig)(fn, 'fast');
};
exports.retryFast = retryFast;
