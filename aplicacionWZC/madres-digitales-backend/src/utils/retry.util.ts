import { log } from '../config/logger';

/**
 * Configuración de reintento
 */
export interface RetryConfig {
  maxAttempts: number;           // Máximo número de intentos
  baseDelayMs: number;           // Retraso base en milisegundos
  maxDelayMs?: number;           // Retraso máximo en milisegundos
  backoffFactor?: number;        // Factor de retroceso exponencial
  jitter?: boolean;              // Agregar variación aleatoria al retraso
  retryableErrors?: string[];    // Errores que se pueden reintentar
  onRetry?: (attempt: number, error: Error, delay: number) => void;  // Callback en cada reintento
  shouldRetry?: (error: Error) => boolean;  // Función para determinar si se debe reintentar
}

/**
 * Opciones de reintento por defecto
 */
const defaultRetryConfig: RetryConfig = {
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
export class RetryExhaustedError extends Error {
  public readonly attempts: number;
  public readonly lastError: Error;
  public readonly totalDelay: number;

  constructor(attempts: number, lastError: Error, totalDelay: number) {
    super(`Retry exhausted after ${attempts} attempts. Last error: ${lastError.message}`);
    this.name = 'RetryExhaustedError';
    this.attempts = attempts;
    this.lastError = lastError;
    this.totalDelay = totalDelay;
  }
}

/**
 * Utilidad de reintento con backoff exponencial
 */
export class RetryUtil {
  /**
   * NUEVO: Ejecutar función con estrategia de reintento
   */
  static async executeWithRetry<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...defaultRetryConfig, ...config };
    let lastError: Error;
    let totalDelay = 0;

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        // NUEVO: Ejecutar la función
        const result = await fn();
        
        // NUEVO: Si es exitosa y no es el primer intento, registrar recuperación
        if (attempt > 1) {
          log.info('Operación recuperada después de reintentos', {
            attempt,
            totalDelay,
            lastError: lastError?.message,
          });
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
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
        log.warn('Reintentando operación', {
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
  private static _shouldRetry(
    error: Error,
    config: RetryConfig,
    currentAttempt: number,
    maxAttempts: number
  ): boolean {
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
      return config.retryableErrors.some(retryableError => 
        error.message.includes(retryableError) ||
        error.name.includes(retryableError) ||
        (error as any).code === retryableError
      );
    }
    
    // NUEVO: Por defecto, reintentar todos los errores
    return true;
  }

  /**
   * NUEVO: Calcular retraso con backoff exponencial
   */
  private static _calculateDelay(attempt: number, config: RetryConfig): number {
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
  private static _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * NUEVO: Crear función con reintento incorporado
   */
  static createRetryableFunction<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): () => Promise<T> {
    return () => this.executeWithRetry(fn, config);
  }

  /**
   * NUEVO: Envolver método de clase con reintento
   */
  static wrapMethod<T extends any, K extends keyof T>(
    target: T,
    methodName: K,
    config: Partial<RetryConfig> = {}
  ): void {
    const originalMethod = target[methodName] as Function;
    
    target[methodName] = (...args: any[]) => {
      return this.executeWithRetry(
        () => originalMethod.apply(target, args),
        config
      );
    };
  }

  /**
   * NUEVO: Decorador para métodos con reintento
   */
  static retry(config: Partial<RetryConfig> = {}) {
    return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
      const method = descriptor.value;
      
      descriptor.value = async function (...args: any[]) {
        return RetryUtil.executeWithRetry(
          () => method.apply(this, args),
          config
        );
      };
      
      return descriptor;
    };
  }
}

/**
 * NUEVO: Configuraciones predefinidas para diferentes tipos de operaciones
 */
export const RetryConfigs = {
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
export const retryWithConfig = <T>(
  fn: () => Promise<T>,
  configName: keyof typeof RetryConfigs
): Promise<T> => {
  return RetryUtil.executeWithRetry(fn, RetryConfigs[configName]);
};

/**
 * NUEVO: Función de conveniencia para reintentos de red
 */
export const retryNetwork = <T>(fn: () => Promise<T>): Promise<T> => {
  return retryWithConfig(fn, 'network');
};

/**
 * NUEVO: Función de conveniencia para reintentos de base de datos
 */
export const retryDatabase = <T>(fn: () => Promise<T>): Promise<T> => {
  return retryWithConfig(fn, 'database');
};

/**
 * NUEVO: Función de conveniencia para reintentos de API externa
 */
export const retryExternalApi = <T>(fn: () => Promise<T>): Promise<T> => {
  return retryWithConfig(fn, 'externalApi');
};

/**
 * NUEVO: Función de conveniencia para operaciones críticas
 */
export const retryCritical = <T>(fn: () => Promise<T>): Promise<T> => {
  return retryWithConfig(fn, 'critical');
};

/**
 * NUEVO: Función de conveniencia para operaciones rápidas
 */
export const retryFast = <T>(fn: () => Promise<T>): Promise<T> => {
  return retryWithConfig(fn, 'fast');
};