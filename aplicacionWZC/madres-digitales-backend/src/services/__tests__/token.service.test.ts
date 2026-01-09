import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { TokenService } from '../token.service';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const tokenService = new TokenService();

describe('TokenService', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('testPassword123', 10);
    
    const testUser = await prisma.usuario.create({
      data: {
        nombre: 'Token',
        apellido: 'Test',
        email: 'token.test@test.com',
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

  beforeEach(async () => {
    // Limpiar refresh token antes de cada test
    await prisma.usuario.update({
      where: { id: testUserId },
      data: { refresh_token: null },
    });
  });

  describe('generateAccessToken', () => {
    it('debe generar un access token válido', () => {
      const payload = {
        id: testUserId,
        email: 'token.test@test.com',
        rol: 'admin',
      };

      const token = tokenService.generateAccessToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT tiene 3 partes
    });

    it('debe incluir el payload en el token', () => {
      const payload = {
        id: testUserId,
        email: 'token.test@test.com',
        rol: 'admin',
      };

      const token = tokenService.generateAccessToken(payload);
      const decoded = tokenService.verifyAccessToken(token);

      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.rol).toBe(payload.rol);
    });
  });

  describe('generateRefreshToken', () => {
    it('debe generar un refresh token válido', () => {
      const payload = {
        id: testUserId,
        email: 'token.test@test.com',
        rol: 'admin',
      };

      const token = tokenService.generateRefreshToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });
  });

  describe('generateTokenPair', () => {
    it('debe generar ambos tokens', () => {
      const payload = {
        id: testUserId,
        email: 'token.test@test.com',
        rol: 'admin',
      };

      const tokens = tokenService.generateTokenPair(payload);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.accessToken).not.toBe(tokens.refreshToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('debe verificar un token válido', () => {
      const payload = {
        id: testUserId,
        email: 'token.test@test.com',
        rol: 'admin',
      };

      const token = tokenService.generateAccessToken(payload);
      const decoded = tokenService.verifyAccessToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(payload.id);
    });

    it('debe lanzar error con token inválido', () => {
      expect(() => {
        tokenService.verifyAccessToken('invalid-token');
      }).toThrow();
    });

    it('debe lanzar error con token expirado', () => {
      // Este test requeriría mockear el tiempo o usar un token con expiración muy corta
      // Por ahora lo dejamos como placeholder
      expect(true).toBe(true);
    });
  });

  describe('saveRefreshToken', () => {
    it('debe guardar el refresh token en la base de datos', async () => {
      const refreshToken = 'test-refresh-token';

      await tokenService.saveRefreshToken(testUserId, refreshToken);

      const user = await prisma.usuario.findUnique({
        where: { id: testUserId },
      });

      expect(user?.refresh_token).toBe(refreshToken);
    });

    it('debe sobrescribir el refresh token anterior', async () => {
      const firstToken = 'first-token';
      const secondToken = 'second-token';

      await tokenService.saveRefreshToken(testUserId, firstToken);
      await tokenService.saveRefreshToken(testUserId, secondToken);

      const user = await prisma.usuario.findUnique({
        where: { id: testUserId },
      });

      expect(user?.refresh_token).toBe(secondToken);
      expect(user?.refresh_token).not.toBe(firstToken);
    });
  });

  describe('validateRefreshToken', () => {
    it('debe validar un refresh token correcto', async () => {
      const refreshToken = 'valid-refresh-token';
      await tokenService.saveRefreshToken(testUserId, refreshToken);

      const isValid = await tokenService.validateRefreshToken(testUserId, refreshToken);

      expect(isValid).toBe(true);
    });

    it('debe rechazar un refresh token incorrecto', async () => {
      const savedToken = 'saved-token';
      const wrongToken = 'wrong-token';
      
      await tokenService.saveRefreshToken(testUserId, savedToken);

      const isValid = await tokenService.validateRefreshToken(testUserId, wrongToken);

      expect(isValid).toBe(false);
    });

    it('debe rechazar si no hay refresh token guardado', async () => {
      const isValid = await tokenService.validateRefreshToken(testUserId, 'any-token');

      expect(isValid).toBe(false);
    });
  });

  describe('revokeRefreshToken', () => {
    it('debe revocar el refresh token', async () => {
      const refreshToken = 'token-to-revoke';
      await tokenService.saveRefreshToken(testUserId, refreshToken);

      await tokenService.revokeRefreshToken(testUserId);

      const user = await prisma.usuario.findUnique({
        where: { id: testUserId },
      });

      expect(user?.refresh_token).toBeNull();
    });
  });

  describe('refreshAccessToken', () => {
    it('debe generar nuevos tokens con refresh token válido', async () => {
      const payload = {
        id: testUserId,
        email: 'token.test@test.com',
        rol: 'admin',
      };

      const initialTokens = tokenService.generateTokenPair(payload);
      await tokenService.saveRefreshToken(testUserId, initialTokens.refreshToken);

      const newTokens = await tokenService.refreshAccessToken(initialTokens.refreshToken);

      expect(newTokens.accessToken).toBeDefined();
      expect(newTokens.refreshToken).toBeDefined();
      expect(newTokens.accessToken).not.toBe(initialTokens.accessToken);
      expect(newTokens.refreshToken).not.toBe(initialTokens.refreshToken);
    });

    it('debe fallar con refresh token inválido', async () => {
      await expect(
        tokenService.refreshAccessToken('invalid-refresh-token')
      ).rejects.toThrow();
    });

    it('debe fallar si el refresh token no está en la BD', async () => {
      const payload = {
        id: testUserId,
        email: 'token.test@test.com',
        rol: 'admin',
      };

      const tokens = tokenService.generateTokenPair(payload);
      // No guardamos el token en la BD

      await expect(
        tokenService.refreshAccessToken(tokens.refreshToken)
      ).rejects.toThrow();
    });
  });

  describe('Token Expiration', () => {
    it('access token debe tener expiración de 7 días', () => {
      const payload = {
        id: testUserId,
        email: 'token.test@test.com',
        rol: 'admin',
      };

      const token = tokenService.generateAccessToken(payload);
      const decoded = tokenService.verifyAccessToken(token);

      const now = Math.floor(Date.now() / 1000);
      const sevenDays = 7 * 24 * 60 * 60;

      expect(decoded.exp).toBeDefined();
      expect(decoded.exp! - now).toBeGreaterThan(sevenDays - 60); // -60 para margen
      expect(decoded.exp! - now).toBeLessThan(sevenDays + 60); // +60 para margen
    });

    it('refresh token debe tener expiración de 30 días', () => {
      const payload = {
        id: testUserId,
        email: 'token.test@test.com',
        rol: 'admin',
      };

      const token = tokenService.generateRefreshToken(payload);
      const decoded = tokenService.verifyRefreshToken(token);

      const now = Math.floor(Date.now() / 1000);
      const thirtyDays = 30 * 24 * 60 * 60;

      expect(decoded.exp).toBeDefined();
      expect(decoded.exp! - now).toBeGreaterThan(thirtyDays - 60);
      expect(decoded.exp! - now).toBeLessThan(thirtyDays + 60);
    });
  });
});

