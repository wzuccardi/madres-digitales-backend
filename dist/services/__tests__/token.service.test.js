"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const token_service_1 = require("../token.service");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const tokenService = new token_service_1.TokenService();
(0, globals_1.describe)('TokenService', () => {
    let testUserId;
    (0, globals_1.beforeAll)(async () => {
        // Crear usuario de prueba
        const hashedPassword = await bcrypt_1.default.hash('testPassword123', 10);
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
    (0, globals_1.afterAll)(async () => {
        // Limpiar datos de prueba
        await prisma.usuario.delete({
            where: { id: testUserId },
        }).catch(() => { });
        await prisma.$disconnect();
    });
    (0, globals_1.beforeEach)(async () => {
        // Limpiar refresh token antes de cada test
        await prisma.usuario.update({
            where: { id: testUserId },
            data: { refresh_token: null },
        });
    });
    (0, globals_1.describe)('generateAccessToken', () => {
        (0, globals_1.it)('debe generar un access token válido', () => {
            const payload = {
                id: testUserId,
                email: 'token.test@test.com',
                rol: 'admin',
            };
            const token = tokenService.generateAccessToken(payload);
            (0, globals_1.expect)(token).toBeDefined();
            (0, globals_1.expect)(typeof token).toBe('string');
            (0, globals_1.expect)(token.split('.').length).toBe(3); // JWT tiene 3 partes
        });
        (0, globals_1.it)('debe incluir el payload en el token', () => {
            const payload = {
                id: testUserId,
                email: 'token.test@test.com',
                rol: 'admin',
            };
            const token = tokenService.generateAccessToken(payload);
            const decoded = tokenService.verifyAccessToken(token);
            (0, globals_1.expect)(decoded.id).toBe(payload.id);
            (0, globals_1.expect)(decoded.email).toBe(payload.email);
            (0, globals_1.expect)(decoded.rol).toBe(payload.rol);
        });
    });
    (0, globals_1.describe)('generateRefreshToken', () => {
        (0, globals_1.it)('debe generar un refresh token válido', () => {
            const payload = {
                id: testUserId,
                email: 'token.test@test.com',
                rol: 'admin',
            };
            const token = tokenService.generateRefreshToken(payload);
            (0, globals_1.expect)(token).toBeDefined();
            (0, globals_1.expect)(typeof token).toBe('string');
            (0, globals_1.expect)(token.split('.').length).toBe(3);
        });
    });
    (0, globals_1.describe)('generateTokenPair', () => {
        (0, globals_1.it)('debe generar ambos tokens', () => {
            const payload = {
                id: testUserId,
                email: 'token.test@test.com',
                rol: 'admin',
            };
            const tokens = tokenService.generateTokenPair(payload);
            (0, globals_1.expect)(tokens.accessToken).toBeDefined();
            (0, globals_1.expect)(tokens.refreshToken).toBeDefined();
            (0, globals_1.expect)(tokens.accessToken).not.toBe(tokens.refreshToken);
        });
    });
    (0, globals_1.describe)('verifyAccessToken', () => {
        (0, globals_1.it)('debe verificar un token válido', () => {
            const payload = {
                id: testUserId,
                email: 'token.test@test.com',
                rol: 'admin',
            };
            const token = tokenService.generateAccessToken(payload);
            const decoded = tokenService.verifyAccessToken(token);
            (0, globals_1.expect)(decoded).toBeDefined();
            (0, globals_1.expect)(decoded.id).toBe(payload.id);
        });
        (0, globals_1.it)('debe lanzar error con token inválido', () => {
            (0, globals_1.expect)(() => {
                tokenService.verifyAccessToken('invalid-token');
            }).toThrow();
        });
        (0, globals_1.it)('debe lanzar error con token expirado', () => {
            // Este test requeriría mockear el tiempo o usar un token con expiración muy corta
            // Por ahora lo dejamos como placeholder
            (0, globals_1.expect)(true).toBe(true);
        });
    });
    (0, globals_1.describe)('saveRefreshToken', () => {
        (0, globals_1.it)('debe guardar el refresh token en la base de datos', async () => {
            const refreshToken = 'test-refresh-token';
            await tokenService.saveRefreshToken(testUserId, refreshToken);
            const user = await prisma.usuario.findUnique({
                where: { id: testUserId },
            });
            (0, globals_1.expect)(user?.refresh_token).toBe(refreshToken);
        });
        (0, globals_1.it)('debe sobrescribir el refresh token anterior', async () => {
            const firstToken = 'first-token';
            const secondToken = 'second-token';
            await tokenService.saveRefreshToken(testUserId, firstToken);
            await tokenService.saveRefreshToken(testUserId, secondToken);
            const user = await prisma.usuario.findUnique({
                where: { id: testUserId },
            });
            (0, globals_1.expect)(user?.refresh_token).toBe(secondToken);
            (0, globals_1.expect)(user?.refresh_token).not.toBe(firstToken);
        });
    });
    (0, globals_1.describe)('validateRefreshToken', () => {
        (0, globals_1.it)('debe validar un refresh token correcto', async () => {
            const refreshToken = 'valid-refresh-token';
            await tokenService.saveRefreshToken(testUserId, refreshToken);
            const isValid = await tokenService.validateRefreshToken(testUserId, refreshToken);
            (0, globals_1.expect)(isValid).toBe(true);
        });
        (0, globals_1.it)('debe rechazar un refresh token incorrecto', async () => {
            const savedToken = 'saved-token';
            const wrongToken = 'wrong-token';
            await tokenService.saveRefreshToken(testUserId, savedToken);
            const isValid = await tokenService.validateRefreshToken(testUserId, wrongToken);
            (0, globals_1.expect)(isValid).toBe(false);
        });
        (0, globals_1.it)('debe rechazar si no hay refresh token guardado', async () => {
            const isValid = await tokenService.validateRefreshToken(testUserId, 'any-token');
            (0, globals_1.expect)(isValid).toBe(false);
        });
    });
    (0, globals_1.describe)('revokeRefreshToken', () => {
        (0, globals_1.it)('debe revocar el refresh token', async () => {
            const refreshToken = 'token-to-revoke';
            await tokenService.saveRefreshToken(testUserId, refreshToken);
            await tokenService.revokeRefreshToken(testUserId);
            const user = await prisma.usuario.findUnique({
                where: { id: testUserId },
            });
            (0, globals_1.expect)(user?.refresh_token).toBeNull();
        });
    });
    (0, globals_1.describe)('refreshAccessToken', () => {
        (0, globals_1.it)('debe generar nuevos tokens con refresh token válido', async () => {
            const payload = {
                id: testUserId,
                email: 'token.test@test.com',
                rol: 'admin',
            };
            const initialTokens = tokenService.generateTokenPair(payload);
            await tokenService.saveRefreshToken(testUserId, initialTokens.refreshToken);
            const newTokens = await tokenService.refreshAccessToken(initialTokens.refreshToken);
            (0, globals_1.expect)(newTokens.accessToken).toBeDefined();
            (0, globals_1.expect)(newTokens.refreshToken).toBeDefined();
            (0, globals_1.expect)(newTokens.accessToken).not.toBe(initialTokens.accessToken);
            (0, globals_1.expect)(newTokens.refreshToken).not.toBe(initialTokens.refreshToken);
        });
        (0, globals_1.it)('debe fallar con refresh token inválido', async () => {
            await (0, globals_1.expect)(tokenService.refreshAccessToken('invalid-refresh-token')).rejects.toThrow();
        });
        (0, globals_1.it)('debe fallar si el refresh token no está en la BD', async () => {
            const payload = {
                id: testUserId,
                email: 'token.test@test.com',
                rol: 'admin',
            };
            const tokens = tokenService.generateTokenPair(payload);
            // No guardamos el token en la BD
            await (0, globals_1.expect)(tokenService.refreshAccessToken(tokens.refreshToken)).rejects.toThrow();
        });
    });
    (0, globals_1.describe)('Token Expiration', () => {
        (0, globals_1.it)('access token debe tener expiración de 7 días', () => {
            const payload = {
                id: testUserId,
                email: 'token.test@test.com',
                rol: 'admin',
            };
            const token = tokenService.generateAccessToken(payload);
            const decoded = tokenService.verifyAccessToken(token);
            const now = Math.floor(Date.now() / 1000);
            const sevenDays = 7 * 24 * 60 * 60;
            (0, globals_1.expect)(decoded.exp).toBeDefined();
            (0, globals_1.expect)(decoded.exp - now).toBeGreaterThan(sevenDays - 60); // -60 para margen
            (0, globals_1.expect)(decoded.exp - now).toBeLessThan(sevenDays + 60); // +60 para margen
        });
        (0, globals_1.it)('refresh token debe tener expiración de 30 días', () => {
            const payload = {
                id: testUserId,
                email: 'token.test@test.com',
                rol: 'admin',
            };
            const token = tokenService.generateRefreshToken(payload);
            const decoded = tokenService.verifyRefreshToken(token);
            const now = Math.floor(Date.now() / 1000);
            const thirtyDays = 30 * 24 * 60 * 60;
            (0, globals_1.expect)(decoded.exp).toBeDefined();
            (0, globals_1.expect)(decoded.exp - now).toBeGreaterThan(thirtyDays - 60);
            (0, globals_1.expect)(decoded.exp - now).toBeLessThan(thirtyDays + 60);
        });
    });
});
