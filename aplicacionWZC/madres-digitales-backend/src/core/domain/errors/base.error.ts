/**
 * Base Error Class
 * Clase base para todos los errores personalizados del sistema
 */
export abstract class BaseError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    
    // Mantiene el stack trace correcto
    Error.captureStackTrace(this, this.constructor);
    
    // Establece el nombre de la clase
    this.name = this.constructor.name;
  }

  /**
   * Convierte el error a un objeto JSON
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

/**
 * Validation Error
 * Error de validación de datos
 */
export class ValidationError extends BaseError {
  public readonly fields?: Record<string, string[]>;

  constructor(message: string, fields?: Record<string, string[]>) {
    super(message, 400);
    this.fields = fields;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      fields: this.fields
    };
  }
}

/**
 * Not Found Error
 * Error cuando un recurso no existe
 */
export class NotFoundError extends BaseError {
  public readonly resource: string;
  public readonly identifier?: string;

  constructor(resource: string, identifier?: string) {
    const message = identifier 
      ? `${resource} con identificador '${identifier}' no encontrado`
      : `${resource} no encontrado`;
    
    super(message, 404);
    this.resource = resource;
    this.identifier = identifier;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      resource: this.resource,
      identifier: this.identifier
    };
  }
}

/**
 * Unauthorized Error
 * Error de autenticación
 */
export class UnauthorizedError extends BaseError {
  constructor(message: string = 'No autorizado') {
    super(message, 401);
  }
}

/**
 * Forbidden Error
 * Error de autorización (permisos)
 */
export class ForbiddenError extends BaseError {
  public readonly requiredRole?: string;

  constructor(message: string = 'Acceso denegado', requiredRole?: string) {
    super(message, 403);
    this.requiredRole = requiredRole;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      requiredRole: this.requiredRole
    };
  }
}

/**
 * Conflict Error
 * Error cuando hay un conflicto (ej: duplicado)
 */
export class ConflictError extends BaseError {
  public readonly conflictingField?: string;

  constructor(message: string, conflictingField?: string) {
    super(message, 409);
    this.conflictingField = conflictingField;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      conflictingField: this.conflictingField
    };
  }
}

/**
 * Internal Server Error
 * Error interno del servidor
 */
export class InternalServerError extends BaseError {
  constructor(message: string = 'Error interno del servidor') {
    super(message, 500, false);
  }
}

/**
 * Bad Request Error
 * Error de solicitud incorrecta
 */
export class BadRequestError extends BaseError {
  constructor(message: string) {
    super(message, 400);
  }
}

/**
 * Database Error
 * Error relacionado con la base de datos
 */
export class DatabaseError extends BaseError {
  public readonly operation?: string;

  constructor(message: string, operation?: string) {
    super(message, 500, false);
    this.operation = operation;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      operation: this.operation
    };
  }
}

