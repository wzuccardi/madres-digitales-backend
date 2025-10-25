import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/auth.routes';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Controller Integration Tests', () => {
  let testUserId: string;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('testPassword123', 10);
    
    const testUser = await prisma.usuario.create({
      data: {
        nombre: 'Test',
        apellido: 'User',
        email: 'test.integration@test.com',
        password_hash: hashedPassword,
        rol: 'admin',
        activo: true,
      },
    });

    testUserId = testUser.id;
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await prisma.usuario.delete({
      where: { id: testUserId },
    }).catch(() => {});

    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    it('debe hacer login exitosamente con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.integration@test.com',
          password: 'testPassword123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test.integration@test.com');
      expect(response.body.token).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();

      // Guardar tokens para otros tests
      accessToken = response.body.token;
      refreshToken = response.body.refreshToken;
    });

    it('debe fallar con credenciales inválidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.integration@test.com',
          password: 'wrongPassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('debe fallar con email inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@test.com',
          password: 'testPassword123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('debe validar formato de email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'testPassword123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('debe validar que password no esté vacío', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.integration@test.com',
          password: '',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('debe obtener perfil con token válido', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test.integration@test.com');
    });

    it('debe fallar sin token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('debe fallar con token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('debe renovar tokens con refresh token válido', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: refreshToken,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.token).not.toBe(accessToken); // Debe ser un nuevo token

      // Actualizar tokens
      accessToken = response.body.token;
      refreshToken = response.body.refreshToken;
    });

    it('debe fallar con refresh token inválido', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('debe fallar sin refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('debe hacer logout exitosamente', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logout exitoso');
    });

    it('debe fallar logout sin token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('refresh token debe fallar después de logout', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: refreshToken,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('debe aplicar rate limiting en login después de múltiples intentos', async () => {
      // Hacer 6 intentos de login (el límite es 5)
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test.integration@test.com',
            password: 'wrongPassword',
          });
      }

      // El 7mo intento debe ser bloqueado
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.integration@test.com',
          password: 'testPassword123',
        })
        .expect(429);

      expect(response.body.success).toBe(false);
    }, 30000); // Timeout extendido para este test
  });
});

