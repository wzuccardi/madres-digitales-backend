"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseError = exports.BadRequestError = exports.InternalServerError = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.ValidationError = exports.BaseError = void 0;
/**
 * Base Error Class
 * Clase base para todos los errores personalizados del sistema
 */
class BaseError extends Error {
    constructor(message, statusCode, isOperational = true) {
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
exports.BaseError = BaseError;
/**
 * Validation Error
 * Error de validación de datos
 */
class ValidationError extends BaseError {
    constructor(message, fields) {
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
exports.ValidationError = ValidationError;
/**
 * Not Found Error
 * Error cuando un recurso no existe
 */
class NotFoundError extends BaseError {
    constructor(resource, identifier) {
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
exports.NotFoundError = NotFoundError;
/**
 * Unauthorized Error
 * Error de autenticación
 */
class UnauthorizedError extends BaseError {
    constructor(message = 'No autorizado') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
/**
 * Forbidden Error
 * Error de autorización (permisos)
 */
class ForbiddenError extends BaseError {
    constructor(message = 'Acceso denegado', requiredRole) {
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
exports.ForbiddenError = ForbiddenError;
/**
 * Conflict Error
 * Error cuando hay un conflicto (ej: duplicado)
 */
class ConflictError extends BaseError {
    constructor(message, conflictingField) {
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
exports.ConflictError = ConflictError;
/**
 * Internal Server Error
 * Error interno del servidor
 */
class InternalServerError extends BaseError {
    constructor(message = 'Error interno del servidor') {
        super(message, 500, false);
    }
}
exports.InternalServerError = InternalServerError;
/**
 * Bad Request Error
 * Error de solicitud incorrecta
 */
class BadRequestError extends BaseError {
    constructor(message) {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
/**
 * Database Error
 * Error relacionado con la base de datos
 */
class DatabaseError extends BaseError {
    constructor(message, operation) {
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
exports.DatabaseError = DatabaseError;
