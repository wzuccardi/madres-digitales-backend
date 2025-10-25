import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../core/domain/errors/base.error';

/**
 * Middleware de validación usando Zod
 * 
 * @param schema - Schema de Zod para validar
 * @param source - Fuente de datos a validar ('body', 'query', 'params')
 */
export const validate = (
  schema: z.ZodSchema,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar los datos según la fuente
      const data = req[source];
      const validated = schema.parse(data);
      
      // Reemplazar los datos originales con los validados
      req[source] = validated;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Convertir errores de Zod a formato amigable
        const fields: Record<string, string[]> = {};
        
        error.issues.forEach((err) => {
          const path = err.path.join('.');
          if (!fields[path]) {
            fields[path] = [];
          }
          fields[path].push(err.message);
        });
        
        next(new ValidationError('Datos de entrada inválidos', fields));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Middleware para validar múltiples fuentes
 */
export const validateMultiple = (schemas: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: Record<string, string[]> = {};
      
      // Validar body
      if (schemas.body) {
        try {
          req.body = schemas.body.parse(req.body);
        } catch (error) {
          if (error instanceof ZodError) {
            error.issues.forEach((err) => {
              const path = `body.${err.path.join('.')}`;
              if (!errors[path]) {
                errors[path] = [];
              }
              errors[path].push(err.message);
            });
          }
        }
      }
      
      // Validar query
      if (schemas.query) {
        try {
          req.query = schemas.query.parse(req.query) as any;
        } catch (error) {
          if (error instanceof ZodError) {
            error.issues.forEach((err) => {
              const path = `query.${err.path.join('.')}`;
              if (!errors[path]) {
                errors[path] = [];
              }
              errors[path].push(err.message);
            });
          }
        }
      }
      
      // Validar params
      if (schemas.params) {
        try {
          req.params = schemas.params.parse(req.params) as any;
        } catch (error) {
          if (error instanceof ZodError) {
            error.issues.forEach((err) => {
              const path = `params.${err.path.join('.')}`;
              if (!errors[path]) {
                errors[path] = [];
              }
              errors[path].push(err.message);
            });
          }
        }
      }
      
      // Si hay errores, lanzar ValidationError
      if (Object.keys(errors).length > 0) {
        throw new ValidationError('Datos de entrada inválidos', errors);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para sanitizar entrada
 * Elimina espacios en blanco y previene XSS básico
 */
export const sanitize = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // Trim espacios
      let sanitized = value.trim();
      
      // Escapar caracteres HTML básicos
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
      
      return sanitized;
    } else if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    } else if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };
  
  // Sanitizar body, query y params
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }
  
  next();
};

