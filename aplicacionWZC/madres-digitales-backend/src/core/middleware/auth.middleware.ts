import { Request, Response, NextFunction } from 'express';
import { JwtService, JwtPayload } from '../security/jwt';
import { IUserRepository } from '../../repositories/user.repository.interface';
import { UnauthorizedError, ForbiddenError } from '../errors/app-error';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticate = (
  jwtService: JwtService,
  userRepository: IUserRepository
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Obtener token del header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
      }

      const token = authHeader.substring(7);
      
      // Verificar token
      const payload = jwtService.verifyAccessToken(token);
      
      // Verificar que el usuario existe y está activo
      const user = await userRepository.findById(payload.sub);
      if (!user || !user.active) {
        throw new UnauthorizedError('Invalid or expired token');
      }

      // Añadir usuario al request
      req.user = payload;
      
      logger.info(`User authenticated: ${user.email} with role ${user.role}`);
      next();
    } catch (error) {
      logger.error('Authentication error:', error);
      throw new UnauthorizedError('Invalid or expired token');
    }
  };
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      // Verificar que el usuario está autenticado
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      // Verificar que el usuario tiene el rol requerido
      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError('Insufficient permissions');
      }

      logger.info(`User authorized: ${req.user.email} with role ${req.user.role}`);
      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      throw error instanceof Error ? error : new ForbiddenError('Authorization failed');
    }
  };
};

export const authorizeResourceOwner = (
  userRepository: IUserRepository,
  resourceIdParam: string = 'id'
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Verificar que el usuario está autenticado
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      // Super admins pueden acceder a todo
      if (req.user.role === 'super_admin') {
        return next();
      }

      // Obtener ID del recurso
      const resourceId = req.params[resourceIdParam];
      if (!resourceId) {
        throw new ForbiddenError('Resource ID required');
      }

      // Verificar que el recurso pertenece al usuario
      const resource = await userRepository.findById(resourceId);
      if (!resource) {
        throw new ForbiddenError('Resource not found');
      }

      // Verificar que el recurso pertenece al usuario
      if (resource.id !== req.user.sub) {
        throw new ForbiddenError('Access denied to this resource');
      }

      logger.info(`User authorized to access resource: ${req.user.email} -> ${resourceId}`);
      next();
    } catch (error) {
      logger.error('Resource authorization error:', error);
      throw error instanceof Error ? error : new ForbiddenError('Resource authorization failed');
    }
  };
};

export const authorizeRole = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      // Verificar que el usuario está autenticado
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      // Verificar que el usuario tiene el rol requerido
      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError('Insufficient permissions');
      }

      logger.info(`User authorized by role: ${req.user.email} with role ${req.user.role}`);
      next();
    } catch (error) {
      logger.error('Role authorization error:', error);
      throw error instanceof Error ? error : new ForbiddenError('Role authorization failed');
    }
  };
};

// Middleware para validar tokens sin requerir autenticación completa
export const optionalAuthenticate = (
  jwtService: JwtService
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Obtener token del header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
      }

      const token = authHeader.substring(7);
      
      try {
        // Verificar token sin lanzar error
        const payload = jwtService.verifyAccessToken(token);
        
        // Añadir usuario al request si el token es válido
        req.user = payload;
        
        logger.debug(`User optionally authenticated: ${payload.email}`);
      } catch (error) {
        // Token inválido, continuar sin autenticar
        logger.debug('Optional authentication failed:', error);
        next();
      }
    } catch (error) {
      logger.error('Optional authentication error:', error);
      next();
    }
  };
};