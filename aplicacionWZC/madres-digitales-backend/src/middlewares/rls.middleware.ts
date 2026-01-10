/**
 * Middleware para Row Level Security (RLS)
 * Establece el contexto de seguridad en PostgreSQL antes de cada consulta
 */

import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { log } from '../config/logger';

/**
 * Interface para el usuario autenticado en el request
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    rol: string;
    email?: string;
    nombre?: string;
  };
}

/**
 * Middleware principal de RLS
 * Establece el contexto de seguridad en PostgreSQL usando las variables de sesión
 */
export const rlsMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user || !req.user.id || !req.user.rol) {
      log.warn('RLS Middleware: Usuario no autenticado o sin rol', {
        path: req.path,
        method: req.method,
        hasUser: !!req.user,
        userId: req.user?.id,
        userRol: req.user?.rol
      });
      
      // No establecer contexto si no hay usuario autenticado
      // Las políticas RLS bloquearán el acceso automáticamente
      return next();
    }

    const { id: userId, rol: userRol } = req.user;
    
    // Convertir rol a mayúsculas para que coincida con las políticas RLS
    const userRolUpper = userRol.toUpperCase();

    log.debug('RLS Middleware: Estableciendo contexto de seguridad', {
      userId,
      userRol: userRolUpper,
      path: req.path,
      method: req.method
    });

    // Establecer contexto de seguridad en PostgreSQL
    await prisma.$executeRawUnsafe(
      `SELECT public.set_app_context($1, $2)`,
      userId,
      userRolUpper
    );

    log.debug('RLS Middleware: Contexto establecido exitosamente', {
      userId,
      userRol
    });

    // Continuar con la siguiente función
    next();
  } catch (error) {
    log.error('RLS Middleware: Error estableciendo contexto de seguridad', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      userId: req.user?.id,
      userRol: req.user?.rol,
      path: req.path,
      method: req.method
    });

    // En caso de error, continuar sin contexto
    // Las políticas RLS bloquearán el acceso por seguridad
    next();
  }
};

/**
 * Middleware para limpiar el contexto de seguridad después de la respuesta
 * Se ejecuta después de que se envía la respuesta al cliente
 */
export const rlsCleanupMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Guardar la función original de res.send
  const originalSend = res.send;

  // Sobrescribir res.send para limpiar el contexto después de enviar la respuesta
  res.send = function (data: any): Response {
    // Limpiar contexto de forma asíncrona (no bloquear la respuesta)
    prisma.$executeRawUnsafe(`SELECT public.clear_app_context()`)
      .then(() => {
        log.debug('RLS Cleanup: Contexto limpiado exitosamente', {
          userId: req.user?.id,
          path: req.path
        });
      })
      .catch((error) => {
        log.error('RLS Cleanup: Error limpiando contexto', {
          error: error instanceof Error ? error.message : 'Error desconocido',
          userId: req.user?.id,
          path: req.path
        });
      });

    // Llamar a la función original de send
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Middleware combinado que establece y limpia el contexto
 * Uso recomendado: app.use(rlsCombinedMiddleware)
 */
export const rlsCombinedMiddleware = [
  rlsCleanupMiddleware,
  rlsMiddleware
];

/**
 * Función auxiliar para establecer contexto manualmente en operaciones específicas
 * Útil para operaciones fuera del flujo de request/response
 */
export const setSecurityContext = async (
  userId: string,
  userRol: string
): Promise<void> => {
  try {
    await prisma.$executeRawUnsafe(
      `SELECT public.set_app_context($1, $2)`,
      userId,
      userRol
    );
    log.debug('Security Context: Contexto establecido manualmente', {
      userId,
      userRol
    });
  } catch (error) {
    log.error('Security Context: Error estableciendo contexto manualmente', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      userId,
      userRol
    });
    throw error;
  }
};

/**
 * Función auxiliar para limpiar contexto manualmente
 */
export const clearSecurityContext = async (): Promise<void> => {
  try {
    await prisma.$executeRawUnsafe(`SELECT public.clear_app_context()`);
    log.debug('Security Context: Contexto limpiado manualmente');
  } catch (error) {
    log.error('Security Context: Error limpiando contexto manualmente', {
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
    throw error;
  }
};

/**
 * Función auxiliar para obtener el contexto actual
 */
export const getSecurityContext = async (): Promise<{
  user_id: string;
  user_rol: string;
}> => {
  try {
    const result = await prisma.$queryRawUnsafe<Array<{
      user_id: string;
      user_rol: string;
    }>>(`SELECT * FROM public.get_app_context()`);
    
    return result[0] || { user_id: '', user_rol: '' };
  } catch (error) {
    log.error('Security Context: Error obteniendo contexto', {
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
    throw error;
  }
};

/**
 * Función auxiliar para verificar si el usuario puede ver todos los datos
 */
export const canViewAllData = async (): Promise<boolean> => {
  try {
    const result = await prisma.$queryRawUnsafe<Array<{ can_view_all_data: boolean }>>(
      `SELECT public.can_view_all_data()`
    );
    
    return result[0]?.can_view_all_data || false;
  } catch (error) {
    log.error('Security Context: Error verificando permisos', {
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
    return false;
  }
};

/**
 * Función auxiliar para verificar si el usuario puede acceder a una gestante específica
 */
export const canAccessGestante = async (gestanteId: string): Promise<boolean> => {
  try {
    const result = await prisma.$queryRawUnsafe<Array<{ can_access_gestante: boolean }>>(
      `SELECT public.can_access_gestante($1)`,
      gestanteId
    );
    
    return result[0]?.can_access_gestante || false;
  } catch (error) {
    log.error('Security Context: Error verificando acceso a gestante', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      gestanteId
    });
    return false;
  }
};

export default {
  rlsMiddleware,
  rlsCleanupMiddleware,
  rlsCombinedMiddleware,
  setSecurityContext,
  clearSecurityContext,
  getSecurityContext,
  canViewAllData,
  canAccessGestante
};
