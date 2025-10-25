"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const zod_1 = require("zod");
const validation_middleware_1 = require("../validation.middleware");
(0, globals_1.describe)('Validation Middleware', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    beforeEach(() => {
        mockRequest = {
            body: {},
            query: {},
            params: {},
        };
        mockResponse = {
            status: globals_1.jest.fn().mockReturnThis(),
            json: globals_1.jest.fn().mockReturnThis(),
        };
        mockNext = globals_1.jest.fn();
    });
    (0, globals_1.describe)('validate', () => {
        const testSchema = zod_1.z.object({
            name: zod_1.z.string().min(2),
            age: zod_1.z.number().min(0).max(120),
            email: zod_1.z.string().email(),
        });
        (0, globals_1.it)('debe pasar validación con datos válidos', () => {
            mockRequest.body = {
                name: 'John Doe',
                age: 30,
                email: 'john@example.com',
            };
            const middleware = (0, validation_middleware_1.validate)(testSchema);
            middleware(mockRequest, mockResponse, mockNext);
            (0, globals_1.expect)(mockNext).toHaveBeenCalled();
            (0, globals_1.expect)(mockResponse.status).not.toHaveBeenCalled();
        });
        (0, globals_1.it)('debe fallar con datos inválidos', () => {
            mockRequest.body = {
                name: 'J', // Muy corto
                age: 150, // Muy alto
                email: 'invalid-email',
            };
            const middleware = (0, validation_middleware_1.validate)(testSchema);
            middleware(mockRequest, mockResponse, mockNext);
            (0, globals_1.expect)(mockResponse.status).toHaveBeenCalledWith(400);
            (0, globals_1.expect)(mockResponse.json).toHaveBeenCalled();
            (0, globals_1.expect)(mockNext).not.toHaveBeenCalled();
        });
        (0, globals_1.it)('debe fallar con campos faltantes', () => {
            mockRequest.body = {
                name: 'John Doe',
                // Faltan age y email
            };
            const middleware = (0, validation_middleware_1.validate)(testSchema);
            middleware(mockRequest, mockResponse, mockNext);
            (0, globals_1.expect)(mockResponse.status).toHaveBeenCalledWith(400);
            (0, globals_1.expect)(mockNext).not.toHaveBeenCalled();
        });
        (0, globals_1.it)('debe validar query params cuando se especifica', () => {
            mockRequest.query = {
                name: 'John Doe',
                age: '30',
                email: 'john@example.com',
            };
            const middleware = (0, validation_middleware_1.validate)(testSchema, 'query');
            middleware(mockRequest, mockResponse, mockNext);
            (0, globals_1.expect)(mockNext).toHaveBeenCalled();
        });
        (0, globals_1.it)('debe validar params cuando se especifica', () => {
            mockRequest.params = {
                name: 'John Doe',
                age: '30',
                email: 'john@example.com',
            };
            const middleware = (0, validation_middleware_1.validate)(testSchema, 'params');
            middleware(mockRequest, mockResponse, mockNext);
            (0, globals_1.expect)(mockNext).toHaveBeenCalled();
        });
    });
    (0, globals_1.describe)('validateMultiple', () => {
        const bodySchema = zod_1.z.object({
            username: zod_1.z.string().min(3),
        });
        const querySchema = zod_1.z.object({
            page: zod_1.z.string().regex(/^\d+$/),
        });
        (0, globals_1.it)('debe validar múltiples fuentes correctamente', () => {
            mockRequest.body = { username: 'johndoe' };
            mockRequest.query = { page: '1' };
            const middleware = (0, validation_middleware_1.validateMultiple)({
                body: bodySchema,
                query: querySchema,
            });
            middleware(mockRequest, mockResponse, mockNext);
            (0, globals_1.expect)(mockNext).toHaveBeenCalled();
            (0, globals_1.expect)(mockResponse.status).not.toHaveBeenCalled();
        });
        (0, globals_1.it)('debe fallar si body es inválido', () => {
            mockRequest.body = { username: 'ab' }; // Muy corto
            mockRequest.query = { page: '1' };
            const middleware = (0, validation_middleware_1.validateMultiple)({
                body: bodySchema,
                query: querySchema,
            });
            middleware(mockRequest, mockResponse, mockNext);
            (0, globals_1.expect)(mockResponse.status).toHaveBeenCalledWith(400);
            (0, globals_1.expect)(mockNext).not.toHaveBeenCalled();
        });
        (0, globals_1.it)('debe fallar si query es inválido', () => {
            mockRequest.body = { username: 'johndoe' };
            mockRequest.query = { page: 'invalid' }; // No es número
            const middleware = (0, validation_middleware_1.validateMultiple)({
                body: bodySchema,
                query: querySchema,
            });
            middleware(mockRequest, mockResponse, mockNext);
            (0, globals_1.expect)(mockResponse.status).toHaveBeenCalledWith(400);
            (0, globals_1.expect)(mockNext).not.toHaveBeenCalled();
        });
    });
    (0, globals_1.describe)('sanitize', () => {
        (0, globals_1.it)('debe sanitizar strings en body', () => {
            mockRequest.body = {
                name: '<script>alert("xss")</script>John',
                description: 'Normal text',
            };
            const middleware = (0, validation_middleware_1.sanitize)();
            middleware(mockRequest, mockResponse, mockNext);
            (0, globals_1.expect)(mockRequest.body.name).not.toContain('<script>');
            (0, globals_1.expect)(mockRequest.body.description).toBe('Normal text');
            (0, globals_1.expect)(mockNext).toHaveBeenCalled();
        });
        (0, globals_1.it)('debe sanitizar strings en query', () => {
            mockRequest.query = {
                search: '<img src=x onerror=alert(1)>',
            };
            const middleware = (0, validation_middleware_1.sanitize)();
            middleware(mockRequest, mockResponse, mockNext);
            (0, globals_1.expect)(mockRequest.query.search).not.toContain('<img');
            (0, globals_1.expect)(mockNext).toHaveBeenCalled();
        });
        (0, globals_1.it)('debe sanitizar strings en params', () => {
            mockRequest.params = {
                id: '<b>123</b>',
            };
            const middleware = (0, validation_middleware_1.sanitize)();
            middleware(mockRequest, mockResponse, mockNext);
            (0, globals_1.expect)(mockRequest.params.id).not.toContain('<b>');
            (0, globals_1.expect)(mockNext).toHaveBeenCalled();
        });
        (0, globals_1.it)('debe mantener números sin cambios', () => {
            mockRequest.body = {
                age: 30,
                price: 99.99,
            };
            const middleware = (0, validation_middleware_1.sanitize)();
            middleware(mockRequest, mockResponse, mockNext);
            (0, globals_1.expect)(mockRequest.body.age).toBe(30);
            (0, globals_1.expect)(mockRequest.body.price).toBe(99.99);
            (0, globals_1.expect)(mockNext).toHaveBeenCalled();
        });
        (0, globals_1.it)('debe mantener booleanos sin cambios', () => {
            mockRequest.body = {
                active: true,
                verified: false,
            };
            const middleware = (0, validation_middleware_1.sanitize)();
            middleware(mockRequest, mockResponse, mockNext);
            (0, globals_1.expect)(mockRequest.body.active).toBe(true);
            (0, globals_1.expect)(mockRequest.body.verified).toBe(false);
            (0, globals_1.expect)(mockNext).toHaveBeenCalled();
        });
        (0, globals_1.it)('debe sanitizar objetos anidados', () => {
            mockRequest.body = {
                user: {
                    name: '<script>alert("xss")</script>John',
                    profile: {
                        bio: 'Normal <b>text</b>',
                    },
                },
            };
            const middleware = (0, validation_middleware_1.sanitize)();
            middleware(mockRequest, mockResponse, mockNext);
            (0, globals_1.expect)(mockRequest.body.user.name).not.toContain('<script>');
            (0, globals_1.expect)(mockRequest.body.user.profile.bio).not.toContain('<b>');
            (0, globals_1.expect)(mockNext).toHaveBeenCalled();
        });
        (0, globals_1.it)('debe sanitizar arrays', () => {
            mockRequest.body = {
                tags: ['<script>tag1</script>', 'tag2', '<img src=x>tag3'],
            };
            const middleware = (0, validation_middleware_1.sanitize)();
            middleware(mockRequest, mockResponse, mockNext);
            (0, globals_1.expect)(mockRequest.body.tags[0]).not.toContain('<script>');
            (0, globals_1.expect)(mockRequest.body.tags[1]).toBe('tag2');
            (0, globals_1.expect)(mockRequest.body.tags[2]).not.toContain('<img');
            (0, globals_1.expect)(mockNext).toHaveBeenCalled();
        });
    });
});
