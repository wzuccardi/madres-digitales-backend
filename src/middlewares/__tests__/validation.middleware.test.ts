import { describe, it, expect, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate, validateMultiple, sanitize } from '../validation.middleware';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('validate', () => {
    const testSchema = z.object({
      name: z.string().min(2),
      age: z.number().min(0).max(120),
      email: z.string().email(),
    });

    it('debe pasar validación con datos válidos', () => {
      mockRequest.body = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
      };

      const middleware = validate(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('debe fallar con datos inválidos', () => {
      mockRequest.body = {
        name: 'J', // Muy corto
        age: 150, // Muy alto
        email: 'invalid-email',
      };

      const middleware = validate(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debe fallar con campos faltantes', () => {
      mockRequest.body = {
        name: 'John Doe',
        // Faltan age y email
      };

      const middleware = validate(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debe validar query params cuando se especifica', () => {
      mockRequest.query = {
        name: 'John Doe',
        age: '30',
        email: 'john@example.com',
      };

      const middleware = validate(testSchema, 'query');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('debe validar params cuando se especifica', () => {
      mockRequest.params = {
        name: 'John Doe',
        age: '30',
        email: 'john@example.com',
      };

      const middleware = validate(testSchema, 'params');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateMultiple', () => {
    const bodySchema = z.object({
      username: z.string().min(3),
    });

    const querySchema = z.object({
      page: z.string().regex(/^\d+$/),
    });

    it('debe validar múltiples fuentes correctamente', () => {
      mockRequest.body = { username: 'johndoe' };
      mockRequest.query = { page: '1' };

      const middleware = validateMultiple({
        body: bodySchema,
        query: querySchema,
      });

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('debe fallar si body es inválido', () => {
      mockRequest.body = { username: 'ab' }; // Muy corto
      mockRequest.query = { page: '1' };

      const middleware = validateMultiple({
        body: bodySchema,
        query: querySchema,
      });

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debe fallar si query es inválido', () => {
      mockRequest.body = { username: 'johndoe' };
      mockRequest.query = { page: 'invalid' }; // No es número

      const middleware = validateMultiple({
        body: bodySchema,
        query: querySchema,
      });

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('sanitize', () => {
    it('debe sanitizar strings en body', () => {
      mockRequest.body = {
        name: '<script>alert("xss")</script>John',
        description: 'Normal text',
      };

      const middleware = sanitize();
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.name).not.toContain('<script>');
      expect(mockRequest.body.description).toBe('Normal text');
      expect(mockNext).toHaveBeenCalled();
    });

    it('debe sanitizar strings en query', () => {
      mockRequest.query = {
        search: '<img src=x onerror=alert(1)>',
      };

      const middleware = sanitize();
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.query.search).not.toContain('<img');
      expect(mockNext).toHaveBeenCalled();
    });

    it('debe sanitizar strings en params', () => {
      mockRequest.params = {
        id: '<b>123</b>',
      };

      const middleware = sanitize();
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.params.id).not.toContain('<b>');
      expect(mockNext).toHaveBeenCalled();
    });

    it('debe mantener números sin cambios', () => {
      mockRequest.body = {
        age: 30,
        price: 99.99,
      };

      const middleware = sanitize();
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.age).toBe(30);
      expect(mockRequest.body.price).toBe(99.99);
      expect(mockNext).toHaveBeenCalled();
    });

    it('debe mantener booleanos sin cambios', () => {
      mockRequest.body = {
        active: true,
        verified: false,
      };

      const middleware = sanitize();
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.active).toBe(true);
      expect(mockRequest.body.verified).toBe(false);
      expect(mockNext).toHaveBeenCalled();
    });

    it('debe sanitizar objetos anidados', () => {
      mockRequest.body = {
        user: {
          name: '<script>alert("xss")</script>John',
          profile: {
            bio: 'Normal <b>text</b>',
          },
        },
      };

      const middleware = sanitize();
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.user.name).not.toContain('<script>');
      expect(mockRequest.body.user.profile.bio).not.toContain('<b>');
      expect(mockNext).toHaveBeenCalled();
    });

    it('debe sanitizar arrays', () => {
      mockRequest.body = {
        tags: ['<script>tag1</script>', 'tag2', '<img src=x>tag3'],
      };

      const middleware = sanitize();
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.tags[0]).not.toContain('<script>');
      expect(mockRequest.body.tags[1]).toBe('tag2');
      expect(mockRequest.body.tags[2]).not.toContain('<img');
      expect(mockNext).toHaveBeenCalled();
    });
  });
});

