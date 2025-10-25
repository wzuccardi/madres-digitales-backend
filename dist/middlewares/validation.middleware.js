"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitize = exports.validateMultiple = exports.validate = void 0;
const zod_1 = require("zod");
const base_error_1 = require("../core/domain/errors/base.error");
/**
 * Middleware de validación usando Zod
 *
 * @param schema - Schema de Zod para validar
 * @param source - Fuente de datos a validar ('body', 'query', 'params')
 */
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            // Validar los datos según la fuente
            const data = req[source];
            const validated = schema.parse(data);
            // Reemplazar los datos originales con los validados
            req[source] = validated;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                // Convertir errores de Zod a formato amigable
                const fields = {};
                error.issues.forEach((err) => {
                    const path = err.path.join('.');
                    if (!fields[path]) {
                        fields[path] = [];
                    }
                    fields[path].push(err.message);
                });
                next(new base_error_1.ValidationError('Datos de entrada inválidos', fields));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validate = validate;
/**
 * Middleware para validar múltiples fuentes
 */
const validateMultiple = (schemas) => {
    return (req, res, next) => {
        try {
            const errors = {};
            // Validar body
            if (schemas.body) {
                try {
                    req.body = schemas.body.parse(req.body);
                }
                catch (error) {
                    if (error instanceof zod_1.ZodError) {
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
                    req.query = schemas.query.parse(req.query);
                }
                catch (error) {
                    if (error instanceof zod_1.ZodError) {
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
                    req.params = schemas.params.parse(req.params);
                }
                catch (error) {
                    if (error instanceof zod_1.ZodError) {
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
                throw new base_error_1.ValidationError('Datos de entrada inválidos', errors);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validateMultiple = validateMultiple;
/**
 * Middleware para sanitizar entrada
 * Elimina espacios en blanco y previene XSS básico
 */
const sanitize = (req, res, next) => {
    const sanitizeValue = (value) => {
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
        }
        else if (Array.isArray(value)) {
            return value.map(sanitizeValue);
        }
        else if (typeof value === 'object' && value !== null) {
            const sanitized = {};
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
exports.sanitize = sanitize;
