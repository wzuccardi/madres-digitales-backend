"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegisterData = exports.validateAuthData = exports.validateDateParams = exports.validateIdParams = exports.validateQueryParams = exports.validateContenidoData = exports.validateAlertaData = exports.validateControlData = exports.validateGestanteData = void 0;
exports.createValidationMiddleware = createValidationMiddleware;
exports.createCustomErrorHandler = createCustomErrorHandler;
exports.sanitizeInput = sanitizeInput;
const zod_1 = require("zod");
const logger_1 = require("../config/logger");
/**
 * NUEVO: Middleware principal de validación
 */
function createValidationMiddleware(options) {
    return (req, res, next) => {
        try {
            logger_1.log.debug('DataValidationMiddleware: Iniciando validación', {
                path: req.path,
                method: req.method,
                hasBodySchema: !!options.bodySchema,
                hasQuerySchema: !!options.querySchema,
                hasParamsSchema: !!options.paramsSchema,
                hasHeadersSchema: !!options.headersSchema,
            });
            const validationResults = [];
            // Validar cuerpo de la solicitud
            if (options.bodySchema) {
                const bodyResult = validateData(req.body, options.bodySchema, 'body');
                validationResults.push(bodyResult);
                if (bodyResult.isValid) {
                    req.body = bodyResult.data;
                }
            }
            // Validar parámetros de consulta
            if (options.querySchema) {
                const queryResult = validateData(req.query, options.querySchema, 'query');
                validationResults.push(queryResult);
                if (queryResult.isValid) {
                    req.query = queryResult.data;
                }
            }
            // Validar parámetros de ruta
            if (options.paramsSchema) {
                const paramsResult = validateData(req.params, options.paramsSchema, 'params');
                validationResults.push(paramsResult);
                if (paramsResult.isValid) {
                    req.params = paramsResult.data;
                }
            }
            // Validar headers
            if (options.headersSchema) {
                const headersResult = validateData(req.headers, options.headersSchema, 'headers');
                validationResults.push(headersResult);
                if (headersResult.isValid) {
                    req.headers = headersResult.data;
                }
            }
            // Verificar si todas las validaciones fueron exitosas
            const hasInvalidResults = validationResults.some(result => !result.isValid);
            if (hasInvalidResults) {
                // Combinar todos los errores
                const allErrors = validationResults
                    .filter(result => !result.isValid && result.errors)
                    .flatMap(result => result.errors);
                logger_1.log.warn('DataValidationMiddleware: Validación fallida', {
                    path: req.path,
                    method: req.method,
                    errors: allErrors,
                });
                // Usar manejador de errores personalizado si existe
                if (options.errorHandler) {
                    const zodError = new zod_1.ZodError(allErrors.map(err => ({
                        code: err.code,
                        path: [err.field],
                        message: err.message,
                    })));
                    return options.errorHandler(zodError, req, res);
                }
                // Respuesta de error predeterminada
                return res.status(400).json({
                    success: false,
                    error: 'Datos de entrada inválidos',
                    message: 'La solicitud contiene datos inválidos o incompletos',
                    details: allErrors,
                    timestamp: new Date().toISOString(),
                });
            }
            logger_1.log.debug('DataValidationMiddleware: Validación exitosa', {
                path: req.path,
                method: req.method,
            });
            next();
        }
        catch (error) {
            logger_1.log.error('Error en middleware de validación', error);
            logger_1.log.error('Error details', {
                path: req.path,
                method: req.method,
                error: error.message,
            });
            return res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'Ocurrió un error al procesar la solicitud',
                timestamp: new Date().toISOString(),
            });
        }
    };
}
/**
 * NUEVO: Función para validar datos contra un esquema
 */
function validateData(data, schema, dataType) {
    try {
        // Sanitizar datos si es necesario
        const sanitizedData = data; // En una implementación real, aquí se sanitizarían los datos
        // Validar y transformar datos
        const validatedData = schema.parse(sanitizedData);
        return {
            isValid: true,
            data: validatedData,
        };
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errors = error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code,
            }));
            logger_1.log.debug(`DataValidationMiddleware: Error de validación en ${dataType}`, {
                errors,
            });
            return {
                isValid: false,
                errors,
            };
        }
        // Error inesperado
        return {
            isValid: false,
            errors: [{
                    field: dataType,
                    message: 'Error inesperado durante la validación',
                    code: 'UNEXPECTED_ERROR',
                }],
        };
    }
}
/**
 * NUEVO: Middleware de validación para gestantes
 */
exports.validateGestanteData = createValidationMiddleware({
    bodySchema: zod_1.z.object({
        nombres: zod_1.z.string().min(2, 'Los nombres deben tener al menos 2 caracteres'),
        apellidos: zod_1.z.string().min(2, 'Los apellidos deben tener al menos 2 caracteres'),
        tipoDocumento: zod_1.z.enum(['CC', 'TI', 'CE', 'PAS']),
        numeroDocumento: zod_1.z.string().regex(/^\d+$/, 'El número de documento debe contener solo dígitos')
            .min(5, 'El número de documento debe tener al menos 5 dígitos')
            .max(15, 'El número de documento no puede tener más de 15 dígitos'),
        fechaNacimiento: zod_1.z.string().refine((date) => {
            const parsedDate = new Date(date);
            const now = new Date();
            const age = now.getFullYear() - parsedDate.getFullYear();
            return age >= 10 && age <= 60;
        }, 'La fecha de nacimiento no es válida (edad debe estar entre 10 y 60 años)'),
        email: zod_1.z.string().email('El correo electrónico no es válido'),
        telefono: zod_1.z.string().regex(/^\d+$/, 'El teléfono debe contener solo dígitos')
            .min(7, 'El teléfono debe tener al menos 7 dígitos')
            .max(15, 'El teléfono no puede tener más de 15 dígitos'),
        direccion: zod_1.z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
        ciudad: zod_1.z.string().min(2, 'La ciudad debe tener al menos 2 caracteres'),
        departamento: zod_1.z.string().min(2, 'El departamento debe tener al menos 2 caracteres'),
        eps: zod_1.z.string().min(2, 'El nombre de la EPS debe tener al menos 2 caracteres'),
        sisben: zod_1.z.enum(['A', 'B', 'C', 'D']),
        grupoPoblacional: zod_1.z.enum(['Indígena', 'Gitano', 'Raizal', 'Afrocolombiano', 'Palenquero', 'Otro']).optional(),
        etnia: zod_1.z.string().optional(),
        discapacidad: zod_1.z.boolean().default(false),
        tipoDiscapacidad: zod_1.z.string().optional(),
        rh: zod_1.z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
        contactoEmergencia: zod_1.z.object({
            nombre: zod_1.z.string().min(2, 'El nombre del contacto debe tener al menos 2 caracteres'),
            parentesco: zod_1.z.string().min(2, 'El parentesco debe tener al menos 2 caracteres'),
            telefono: zod_1.z.string().regex(/^\d+$/, 'El teléfono debe contener solo dígitos')
                .min(7, 'El teléfono debe tener al menos 7 dígitos')
                .max(15, 'El teléfono no puede tener más de 15 dígitos'),
        }),
    }),
});
/**
 * NUEVO: Middleware de validación para controles
 */
exports.validateControlData = createValidationMiddleware({
    bodySchema: zod_1.z.object({
        gestanteId: zod_1.z.string().uuid('ID de gestante inválido'),
        fechaControl: zod_1.z.string().refine((date) => {
            const parsedDate = new Date(date);
            return !isNaN(parsedDate.getTime());
        }, 'Fecha de control inválida'),
        peso: zod_1.z.number().min(30, 'El peso debe ser al menos 30 kg')
            .max(200, 'El peso no puede ser mayor a 200 kg'),
        talla: zod_1.z.number().min(100, 'La talla debe ser al menos 100 cm')
            .max(250, 'La talla no puede ser mayor a 250 cm'),
        presionArterialSistolica: zod_1.z.number().min(60, 'La presión arterial sistólica debe ser al menos 60')
            .max(250, 'La presión arterial sistólica no puede ser mayor a 250'),
        presionArterialDiastolica: zod_1.z.number().min(40, 'La presión arterial diastólica debe ser al menos 40')
            .max(150, 'La presión arterial diastólica no puede ser mayor a 150'),
        frecuenciaCardiaca: zod_1.z.number().min(40, 'La frecuencia cardíaca debe ser al menos 40')
            .max(200, 'La frecuencia cardíaca no puede ser mayor a 200'),
        frecuenciaRespiratoria: zod_1.z.number().min(10, 'La frecuencia respiratoria debe ser al menos 10')
            .max(40, 'La frecuencia respiratoria no puede ser mayor a 40'),
        temperatura: zod_1.z.number().min(35, 'La temperatura debe ser al menos 35°C')
            .max(42, 'La temperatura no puede ser mayor a 42°C'),
        glucosa: zod_1.z.number().min(50, 'La glucosa debe ser al menos 50')
            .max(400, 'La glucosa no puede ser mayor a 400')
            .optional(),
        hemoglobina: zod_1.z.number().min(5, 'La hemoglobina debe ser al menos 5')
            .max(20, 'La hemoglobina no puede ser mayor a 20')
            .optional(),
        edadGestacional: zod_1.z.number().min(0, 'La edad gestacional debe ser al menos 0 semanas')
            .max(42, 'La edad gestacional no puede ser mayor a 42 semanas'),
        posicionFetal: zod_1.z.enum(['Cefálica', 'Pélvica', 'Transversa']).optional(),
        movimientosFetales: zod_1.z.number().min(0, 'Los movimientos fetales deben ser al menos 0')
            .max(50, 'Los movimientos fetales no pueden ser mayor a 50')
            .optional(),
        edemas: zod_1.z.boolean().default(false),
        proteinuria: zod_1.z.enum(['Negativa', 'Trazas', '+1', '+2', '+3', '+4']).optional(),
        observaciones: zod_1.z.string().max(1000, 'Las observaciones no pueden tener más de 1000 caracteres')
            .optional(),
        recomendaciones: zod_1.z.string().max(1000, 'Las recomendaciones no pueden tener más de 1000 caracteres')
            .optional(),
        proximoControl: zod_1.z.string().refine((date) => {
            const parsedDate = new Date(date);
            return !isNaN(parsedDate.getTime());
        }, 'Fecha del próximo control inválida').optional(),
    }),
});
/**
 * NUEVO: Middleware de validación para alertas
 */
exports.validateAlertaData = createValidationMiddleware({
    bodySchema: zod_1.z.object({
        gestanteId: zod_1.z.string().uuid('ID de gestante inválido'),
        tipoAlerta: zod_1.z.enum(['Roja', 'Amarilla', 'Azul']),
        descripcion: zod_1.z.string().min(5, 'La descripción debe tener al menos 5 caracteres')
            .max(500, 'La descripción no puede tener más de 500 caracteres'),
        fechaAlerta: zod_1.z.string().refine((date) => {
            const parsedDate = new Date(date);
            return !isNaN(parsedDate.getTime());
        }, 'Fecha de alerta inválida'),
        parametros: zod_1.z.object({
            presionArterialSistolica: zod_1.z.number().optional(),
            presionArterialDiastolica: zod_1.z.number().optional(),
            frecuenciaCardiaca: zod_1.z.number().optional(),
            frecuenciaRespiratoria: zod_1.z.number().optional(),
            temperatura: zod_1.z.number().optional(),
            glucosa: zod_1.z.number().optional(),
            sintomas: zod_1.z.array(zod_1.z.string()).optional(),
        }).optional(),
        estado: zod_1.z.enum(['Activa', 'Atendida', 'Resuelta']).default('Activa'),
        prioridad: zod_1.z.enum(['Baja', 'Media', 'Alta', 'Crítica']).default('Media'),
    }),
});
/**
 * NUEVO: Middleware de validación para contenido educativo
 */
exports.validateContenidoData = createValidationMiddleware({
    bodySchema: zod_1.z.object({
        titulo: zod_1.z.string().min(5, 'El título debe tener al menos 5 caracteres')
            .max(200, 'El título no puede tener más de 200 caracteres'),
        descripcion: zod_1.z.string().min(10, 'La descripción debe tener al menos 10 caracteres')
            .max(2000, 'La descripción no puede tener más de 2000 caracteres'),
        tipoContenido: zod_1.z.enum(['Artículo', 'Video', 'Infografía', 'Podcast', 'Guía']),
        categoria: zod_1.z.string().min(2, 'La categoría debe tener al menos 2 caracteres')
            .max(50, 'La categoría no puede tener más de 50 caracteres'),
        etiquetas: zod_1.z.array(zod_1.z.string()).optional(),
        urlContenido: zod_1.z.string().url('La URL del contenido no es válida').optional(),
        urlImagen: zod_1.z.string().url('La URL de la imagen no es válida').optional(),
        duracion: zod_1.z.number().min(1, 'La duración debe ser al menos 1 minuto')
            .max(500, 'La duración no puede ser mayor a 500 minutos')
            .optional(),
        autor: zod_1.z.string().min(2, 'El autor debe tener al menos 2 caracteres')
            .max(100, 'El autor no puede tener más de 100 caracteres')
            .optional(),
        idioma: zod_1.z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Idioma inválido (formato: es o es-CO)')
            .default('es'),
        edadGestacionalMinima: zod_1.z.number().min(0, 'La edad gestacional mínima debe ser al menos 0')
            .max(42, 'La edad gestacional mínima no puede ser mayor a 42')
            .optional(),
        edadGestacionalMaxima: zod_1.z.number().min(0, 'La edad gestacional máxima debe ser al menos 0')
            .max(42, 'La edad gestacional máxima no puede ser mayor a 42')
            .optional(),
        publicado: zod_1.z.boolean().default(false),
        fechaPublicacion: zod_1.z.string().refine((date) => {
            const parsedDate = new Date(date);
            return !isNaN(parsedDate.getTime());
        }, 'Fecha de publicación inválida').optional(),
    }),
});
/**
 * NUEVO: Middleware de validación para parámetros de consulta
 */
exports.validateQueryParams = createValidationMiddleware({
    querySchema: zod_1.z.object({
        page: zod_1.z.string().regex(/^\d+$/, 'La página debe ser un número entero')
            .transform(Number)
            .refine(n => n > 0, 'La página debe ser mayor a 0')
            .default(1),
        limit: zod_1.z.string().regex(/^\d+$/, 'El límite debe ser un número entero')
            .transform(Number)
            .refine(n => n > 0 && n <= 100, 'El límite debe estar entre 1 y 100')
            .default(10),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
        search: zod_1.z.string().max(100, 'El término de búsqueda no puede tener más de 100 caracteres')
            .optional(),
        filter: zod_1.z.string().optional(),
    }),
});
/**
 * NUEVO: Middleware de validación para parámetros de ID
 */
exports.validateIdParams = createValidationMiddleware({
    paramsSchema: zod_1.z.object({
        id: zod_1.z.string().uuid('ID inválido'),
    }),
});
/**
 * NUEVO: Middleware de validación para parámetros de fecha
 */
exports.validateDateParams = createValidationMiddleware({
    paramsSchema: zod_1.z.object({
        startDate: zod_1.z.string().refine((date) => {
            const parsedDate = new Date(date);
            return !isNaN(parsedDate.getTime());
        }, 'Fecha de inicio inválida'),
        endDate: zod_1.z.string().refine((date) => {
            const parsedDate = new Date(date);
            return !isNaN(parsedDate.getTime());
        }, 'Fecha de fin inválida'),
    }),
});
/**
 * NUEVO: Middleware de validación para autenticación
 */
exports.validateAuthData = createValidationMiddleware({
    bodySchema: zod_1.z.object({
        email: zod_1.z.string().email('El correo electrónico no es válido'),
        password: zod_1.z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial'),
    }),
});
/**
 * NUEVO: Middleware de validación para registro de usuarios
 */
exports.validateRegisterData = createValidationMiddleware({
    bodySchema: zod_1.z.object({
        nombres: zod_1.z.string().min(2, 'Los nombres deben tener al menos 2 caracteres'),
        apellidos: zod_1.z.string().min(2, 'Los apellidos deben tener al menos 2 caracteres'),
        email: zod_1.z.string().email('El correo electrónico no es válido'),
        password: zod_1.z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial'),
        confirmPassword: zod_1.z.string(),
        rol: zod_1.z.enum(['admin', 'madrina', 'profesional_salud', 'paciente']).default('paciente'),
    }).refine((data) => data.password === data.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    }),
});
/**
 * NUEVO: Función para crear un manejador de errores personalizado
 */
function createCustomErrorHandler(format = 'json') {
    return (error, req, res) => {
        const errors = error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
        }));
        if (format === 'text') {
            return res.status(400).send(`Error de validación: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`);
        }
        return res.status(400).json({
            success: false,
            error: 'Datos de entrada inválidos',
            message: 'La solicitud contiene datos inválidos o incompletos',
            details: errors,
            timestamp: new Date().toISOString(),
            path: req.path,
            method: req.method,
        });
    };
}
/**
 * NUEVO: Middleware para sanitizar datos de entrada
 */
function sanitizeInput(req, res, next) {
    try {
        // Sanitizar cuerpo de la solicitud
        if (req.body && typeof req.body === 'object') {
            req.body = sanitizeObject(req.body);
        }
        // Sanitizar parámetros de consulta
        if (req.query && typeof req.query === 'object') {
            req.query = sanitizeObject(req.query);
        }
        next();
    }
    catch (error) {
        logger_1.log.error('Error sanitizando datos de entrada', error);
        return res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: 'Ocurrió un error al procesar la solicitud',
            timestamp: new Date().toISOString(),
        });
    }
}
/**
 * NUEVO: Función para sanitizar un objeto
 */
function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    const sanitized = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (typeof value === 'string') {
                // Eliminar caracteres potencialmente peligrosos
                sanitized[key] = value
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
                    .replace(/javascript:/gi, '')
                    .replace(/on\w+\s*=/gi, '');
            }
            else if (typeof value === 'object') {
                sanitized[key] = sanitizeObject(value);
            }
            else {
                sanitized[key] = value;
            }
        }
    }
    return sanitized;
}
