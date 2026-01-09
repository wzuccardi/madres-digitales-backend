// src/middlewares/permissions.middleware.ts
// Middleware para validación de permisos jerárquicos

import { Request, Response, NextFunction } from 'express';

interface AuthUser {
  id: string;
  email: string;
  rol: string;
}

// Extender Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Jerarquía de roles
 */
const ROLE_HIERARCHY: Record<string, string[]> = {
  'SUPER_ADMIN': ['SUPER_ADMIN', 'ADMIN', 'COORDINADOR', 'MEDICO', 'MADRINA'],
  'ADMIN': ['ADMIN', 'COORDINADOR', 'MEDICO', 'MADRINA'],
  'COORDINADOR': ['MADRINA'],
};

/**
 * Verificar si un usuario puede crear un rol específico
 */
export function canCreateRole(userRole: string, targetRole: string): boolean {
  const allowedRoles = ROLE_HIERARCHY[userRole.toUpperCase()] || [];
  return allowedRoles.includes(targetRole.toUpperCase());
}

/**
 * Verificar si un usuario puede eliminar otro usuario
 */
export function canDeleteUser(userRole: string, targetRole: string): boolean {
  // Super admin puede eliminar todos excepto otros super admins
  if (userRole.toUpperCase() === 'SUPER_ADMIN') {
    return targetRole.toUpperCase() !== 'SUPER_ADMIN';
  }
  
  // Admin puede eliminar coordinadores, médicos y madrinas
  if (userRole.toUpperCase() === 'ADMIN') {
    return ['COORDINADOR', 'MEDICO', 'MADRINA'].includes(targetRole.toUpperCase());
  }
  
  return false;
}

/**
 * Verificar si un usuario puede editar otro usuario
 */
export function canEditUser(userRole: string, targetRole: string): boolean {
  // Super admin puede editar a todos
  if (userRole.toUpperCase() === 'SUPER_ADMIN') return true;
  
  // Admin puede editar todos excepto super admins
  if (userRole.toUpperCase() === 'ADMIN') {
    return targetRole.toUpperCase() !== 'SUPER_ADMIN';
  }
  
  // Coordinador puede editar solo madrinas
  if (userRole.toUpperCase() === 'COORDINADOR') {
    return targetRole.toUpperCase() === 'MADRINA';
  }
  
  return false;
}

/**
 * Middleware para validar creación de usuarios
 */
export const validateUserCreation = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
      });
    }

    const targetRole = req.body.rol;
    if (!targetRole) {
      return res.status(400).json({
        success: false,
        error: 'Rol es requerido',
      });
    }

    // Verificar si puede crear este rol
    if (!canCreateRole(user.rol, targetRole)) {
      return res.status(403).json({
        success: false,
        error: `No tiene permisos para crear usuarios con rol ${targetRole}`,
        details: {
          userRole: user.rol,
          targetRole,
          allowedRoles: ROLE_HIERARCHY[user.rol.toUpperCase()] || [],
        },
      });
    }

    console.log(`✅ Permiso validado: ${user.rol} puede crear ${targetRole}`);
    next();
  } catch (error) {
    console.error('❌ Error en validación de permisos:', error);
    res.status(500).json({
      success: false,
      error: 'Error validando permisos',
    });
  }
};

/**
 * Middleware para validar eliminación de usuarios
 */
export const validateUserDeletion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
      });
    }

    const targetUserId = req.params.id;
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        error: 'ID de usuario es requerido',
      });
    }

    // Obtener el usuario objetivo desde la base de datos
    const prisma = require('../config/database').default;
    const targetUser = await prisma.usuarios.findUnique({
      where: { id: targetUserId },
      select: { rol: true },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    // Verificar si puede eliminar este usuario
    if (!canDeleteUser(user.rol, targetUser.rol)) {
      return res.status(403).json({
        success: false,
        error: `No tiene permisos para eliminar usuarios con rol ${targetUser.rol}`,
      });
    }

    console.log(`✅ Permiso de eliminación validado: ${user.rol} puede eliminar ${targetUser.rol}`);
    next();
  } catch (error) {
    console.error('❌ Error en validación de eliminación:', error);
    res.status(500).json({
      success: false,
      error: 'Error validando permisos de eliminación',
    });
  }
};

/**
 * Middleware para validar edición de usuarios
 */
export const validateUserEdit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
      });
    }

    const targetUserId = req.params.id;
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        error: 'ID de usuario es requerido',
      });
    }

    // Obtener el usuario objetivo desde la base de datos
    const prisma = require('../config/database').default;
    const targetUser = await prisma.usuarios.findUnique({
      where: { id: targetUserId },
      select: { rol: true },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    // Verificar si puede editar este usuario
    if (!canEditUser(user.rol, targetUser.rol)) {
      return res.status(403).json({
        success: false,
        error: `No tiene permisos para editar usuarios con rol ${targetUser.rol}`,
      });
    }

    // Si intenta cambiar el rol, validar que puede crear el nuevo rol
    if (req.body.rol && req.body.rol !== targetUser.rol) {
      if (!canCreateRole(user.rol, req.body.rol)) {
        return res.status(403).json({
          success: false,
          error: `No tiene permisos para asignar el rol ${req.body.rol}`,
        });
      }
    }

    console.log(`✅ Permiso de edición validado: ${user.rol} puede editar ${targetUser.rol}`);
    next();
  } catch (error) {
    console.error('❌ Error en validación de edición:', error);
    res.status(500).json({
      success: false,
      error: 'Error validando permisos de edición',
    });
  }
};

/**
 * Middleware para validar asignación de gestantes
 */
export const validateGestanteAssignment = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
      });
    }

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'COORDINADOR'];
    if (!allowedRoles.includes(user.rol.toUpperCase())) {
      return res.status(403).json({
        success: false,
        error: 'No tiene permisos para asignar gestantes',
        details: {
          userRole: user.rol,
          allowedRoles,
        },
      });
    }

    console.log(`✅ Permiso de asignación validado: ${user.rol} puede asignar gestantes`);
    next();
  } catch (error) {
    console.error('❌ Error en validación de asignación:', error);
    res.status(500).json({
      success: false,
      error: 'Error validando permisos de asignación',
    });
  }
};

/**
 * Middleware para validar creación de IPS
 */
export const validateIPSCreation = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
      });
    }

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN'];
    if (!allowedRoles.includes(user.rol.toUpperCase())) {
      return res.status(403).json({
        success: false,
        error: 'No tiene permisos para crear IPS',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error validando permisos',
    });
  }
};

/**
 * Middleware para validar creación de médicos
 */
export const validateMedicoCreation = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
      });
    }

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN'];
    if (!allowedRoles.includes(user.rol.toUpperCase())) {
      return res.status(403).json({
        success: false,
        error: 'No tiene permisos para crear médicos',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error validando permisos',
    });
  }
};
