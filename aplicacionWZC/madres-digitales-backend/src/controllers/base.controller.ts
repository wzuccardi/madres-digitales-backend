import { Request, Response } from 'express';

/**
 * Controlador base para todos los controladores del sistema
 * Proporciona métodos comunes y estructura estándar
 */
export abstract class BaseController {
  /**
   * Manejo de errores estándar
   */
  protected handleError(res: Response, error: any, message: string, statusCode: number = 500): void {
    console.error(`❌ Controller Error: ${message}`, error);
    
    const errorResponse = {
      success: false,
      error: message,
      details: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    };

    res.status(statusCode).json(errorResponse);
  }

  /**
   * Respuesta exitosa estándar
   */
  protected success(res: Response, data: any, message: string = 'Operación exitosa', statusCode: number = 200): void {
    const successResponse = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    res.status(statusCode).json(successResponse);
  }

  /**
   * Respuesta de paginación estándar
   */
  protected paginatedResponse(
    res: Response, 
    data: any[], 
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    },
    message: string = 'Datos obtenidos exitosamente'
  ): void {
    const response = {
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  }

  /**
   * Validación de parámetros de entrada
   */
  protected validateRequired(req: Request, fields: string[]): { isValid: boolean; missing: string[] } {
    const missing: string[] = [];
    
    for (const field of fields) {
      if (!req.body || req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }

    return {
      isValid: missing.length === 0,
      missing
    };
  }

  /**
   * Obtener usuario autenticado del request
   */
  protected getAuthenticatedUser(req: Request): any {
    return (req as any).user;
  }

  /**
   * Verificar si el usuario tiene permisos
   */
  protected hasPermission(user: any, permission: string): boolean {
    if (!user) return false;
    
    // Super admin tiene todos los permisos
    if (user.rol === 'super_admin') return true;
    
    // Admin tiene permisos de administración y de contenido
    if (user.rol === 'admin') {
      return permission.startsWith('admin:') ||
             permission.startsWith('content:') ||
             permission.startsWith('user:') ||
             permission.startsWith('role:');
    }
    
    // Otros roles tienen permisos específicos
    const rolePermissions = {
      'madrina': [
        'read:gestantes',
        'create:alertas',
        'read:reportes',
        'create:user'  // Las madrinas pueden crear usuarios
      ],
      'coordinador': [
        'read:gestantes',
        'assign:medicos',
        'read:reportes'
      ],
      'medico': [
        'read:gestantes',
        'create:controls',
        'read:reportes'
      ],
      'gestante': [
        'read:contenido',
        'create:alerts',
        'read:own:profile'
      ]
    };

    return rolePermissions[user.rol]?.includes(permission) || false;
  }

  /**
   * Middleware de permisos
   */
  protected requirePermission(permission: string) {
    return (req: Request, res: Response, next: Function) => {
      const user = this.getAuthenticatedUser(req);
      
      if (!user) {
        return this.handleError(res, null, 'Usuario no autenticado', 401);
      }

      if (!this.hasPermission(user, permission)) {
        return this.handleError(res, null, `Permiso requerido: ${permission}`, 403);
      }

      next();
    };
  }

  /**
   * Extraer parámetros de consulta con valores por defecto
   */
  protected getQueryParams(req: Request, defaults: Record<string, any> = {}): Record<string, any> {
    const params: Record<string, any> = {};
    
    for (const [key, defaultValue] of Object.entries(defaults)) {
      params[key] = req.query[key] !== undefined ? req.query[key] : defaultValue;
    }

    return params;
  }

  /**
   * Extraer parámetros de paginación
   */
  protected getPaginationParams(req: Request): { page: number; limit: number; offset: number } {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }
}