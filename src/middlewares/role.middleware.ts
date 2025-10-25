import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../core/domain/errors/forbidden.error';
import { UnauthorizedError } from '../core/domain/errors/unauthorized.error';
import { logger } from '../config/logger';

/**
 * Roles disponibles en el sistema
 */
export enum UsuarioRol {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  COORDINADOR = 'coordinador',
  MADRINA = 'madrina',
  MEDICO = 'medico',
  GESTANTE = 'gestante',
}

/**
 * Jerarquía de roles (de mayor a menor privilegio)
 */
const ROLE_HIERARCHY: Record<UsuarioRol, number> = {
  [UsuarioRol.SUPER_ADMIN]: 5,
  [UsuarioRol.ADMIN]: 4,
  [UsuarioRol.COORDINADOR]: 3,
  [UsuarioRol.MADRINA]: 2,
  [UsuarioRol.MEDICO]: 1,
  [UsuarioRol.GESTANTE]: 0,
};

/**
 * Middleware para requerir uno o más roles específicos
 * 
 * @param roles - Roles permitidos para acceder al endpoint
 * @returns Middleware function
 * 
 * @example
 * router.post('/gestantes', requireRole(UsuarioRol.ADMIN, UsuarioRol.MADRINA), crearGestante);
 */
export const requireRole = (...roles: UsuarioRol[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        throw new UnauthorizedError('Usuario no autenticado');
      }

      const userRole = req.user.rol as UsuarioRol;

      // Verificar que el rol del usuario esté en la lista de roles permitidos
      if (!roles.includes(userRole)) {
        logger.warn('Acceso denegado por rol', {
          userId: req.user.id,
          userRole,
          requiredRoles: roles,
          endpoint: req.path,
          method: req.method,
        });

        throw new ForbiddenError(
          `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`
        );
      }

      // Log de acceso exitoso
      logger.info('Acceso autorizado', {
        userId: req.user.id,
        userRole,
        endpoint: req.path,
        method: req.method,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para requerir un rol mínimo en la jerarquía
 * 
 * @param minRole - Rol mínimo requerido
 * @returns Middleware function
 * 
 * @example
 * router.get('/usuarios', requireMinRole(UsuarioRol.COORDINADOR), listarUsuarios);
 */
export const requireMinRole = (minRole: UsuarioRol) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Usuario no autenticado');
      }

      const userRole = req.user.rol as UsuarioRol;
      const userLevel = ROLE_HIERARCHY[userRole];
      const minLevel = ROLE_HIERARCHY[minRole];

      if (userLevel < minLevel) {
        logger.warn('Acceso denegado por nivel de rol insuficiente', {
          userId: req.user.id,
          userRole,
          userLevel,
          minRole,
          minLevel,
          endpoint: req.path,
          method: req.method,
        });

        throw new ForbiddenError(
          `Acceso denegado. Se requiere rol ${minRole} o superior`
        );
      }

      logger.info('Acceso autorizado por nivel de rol', {
        userId: req.user.id,
        userRole,
        endpoint: req.path,
        method: req.method,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para permitir solo super_admin
 * 
 * @returns Middleware function
 * 
 * @example
 * router.delete('/usuarios/:id', requireSuperAdmin(), eliminarUsuario);
 */
export const requireSuperAdmin = () => {
  return requireRole(UsuarioRol.SUPER_ADMIN);
};

/**
 * Middleware para permitir admin o super_admin
 * 
 * @returns Middleware function
 * 
 * @example
 * router.post('/usuarios', requireAdmin(), crearUsuario);
 */
export const requireAdmin = () => {
  return requireRole(UsuarioRol.ADMIN, UsuarioRol.SUPER_ADMIN);
};

/**
 * Middleware para permitir coordinador, admin o super_admin
 * 
 * @returns Middleware function
 * 
 * @example
 * router.get('/reportes', requireCoordinador(), obtenerReportes);
 */
export const requireCoordinador = () => {
  return requireRole(
    UsuarioRol.COORDINADOR,
    UsuarioRol.ADMIN,
    UsuarioRol.SUPER_ADMIN
  );
};

/**
 * Middleware para permitir madrina, coordinador, admin o super_admin
 * 
 * @returns Middleware function
 * 
 * @example
 * router.post('/gestantes', requireMadrina(), crearGestante);
 */
export const requireMadrina = () => {
  return requireRole(
    UsuarioRol.MADRINA,
    UsuarioRol.COORDINADOR,
    UsuarioRol.ADMIN,
    UsuarioRol.SUPER_ADMIN
  );
};

/**
 * Middleware para verificar que el usuario accede a sus propios datos
 * 
 * @param userIdParam - Nombre del parámetro que contiene el ID del usuario
 * @returns Middleware function
 * 
 * @example
 * router.get('/usuarios/:id', requireOwnData('id'), obtenerUsuario);
 */
export const requireOwnData = (userIdParam: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Usuario no autenticado');
      }

      const requestedUserId = req.params[userIdParam];
      const currentUserId = req.user.id;
      const userRole = req.user.rol as UsuarioRol;

      // Admins y super_admins pueden acceder a cualquier dato
      if (
        userRole === UsuarioRol.ADMIN ||
        userRole === UsuarioRol.SUPER_ADMIN
      ) {
        return next();
      }

      // Otros usuarios solo pueden acceder a sus propios datos
      if (requestedUserId !== currentUserId) {
        logger.warn('Intento de acceso a datos de otro usuario', {
          userId: currentUserId,
          requestedUserId,
          endpoint: req.path,
          method: req.method,
        });

        throw new ForbiddenError(
          'No tienes permiso para acceder a estos datos'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para verificar que el usuario pertenece al mismo municipio
 * 
 * @param municipioIdParam - Nombre del parámetro que contiene el ID del municipio
 * @returns Middleware function
 * 
 * @example
 * router.get('/gestantes/municipio/:municipioId', requireSameMunicipio('municipioId'), listarGestantes);
 */
export const requireSameMunicipio = (municipioIdParam: string = 'municipioId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Usuario no autenticado');
      }

      const requestedMunicipioId = req.params[municipioIdParam];
      const userMunicipioId = (req.user as any).municipio_id;
      const userRole = req.user.rol as UsuarioRol;

      // Admins, super_admins y coordinadores pueden acceder a cualquier municipio
      if (
        userRole === UsuarioRol.ADMIN ||
        userRole === UsuarioRol.SUPER_ADMIN ||
        userRole === UsuarioRol.COORDINADOR
      ) {
        return next();
      }

      // Otros usuarios solo pueden acceder a su propio municipio
      if (!userMunicipioId || requestedMunicipioId !== userMunicipioId) {
        logger.warn('Intento de acceso a datos de otro municipio', {
          userId: req.user.id,
          userMunicipioId,
          requestedMunicipioId,
          endpoint: req.path,
          method: req.method,
        });

        throw new ForbiddenError(
          'No tienes permiso para acceder a datos de este municipio'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Helper para verificar si un usuario tiene un rol específico
 * 
 * @param user - Usuario a verificar
 * @param role - Rol a verificar
 * @returns true si el usuario tiene el rol
 */
export const hasRole = (user: any, role: UsuarioRol): boolean => {
  return user?.rol === role;
};

/**
 * Helper para verificar si un usuario tiene uno de varios roles
 * 
 * @param user - Usuario a verificar
 * @param roles - Roles a verificar
 * @returns true si el usuario tiene alguno de los roles
 */
export const hasAnyRole = (user: any, roles: UsuarioRol[]): boolean => {
  return roles.includes(user?.rol);
};

/**
 * Helper para verificar si un usuario tiene un rol mínimo
 * 
 * @param user - Usuario a verificar
 * @param minRole - Rol mínimo requerido
 * @returns true si el usuario tiene el rol mínimo o superior
 */
export const hasMinRole = (user: any, minRole: UsuarioRol): boolean => {
  const userLevel = ROLE_HIERARCHY[user?.rol as UsuarioRol];
  const minLevel = ROLE_HIERARCHY[minRole];
  return userLevel >= minLevel;
};

