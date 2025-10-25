"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("../../routes/auth.routes"));
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/auth', auth_routes_1.default);
(0, globals_1.describe)('Auth Controller Integration Tests', () => {
    let testUserId;
    let accessToken;
    let refreshToken;
    (0, globals_1.beforeAll)(async () => {
        // Crear usuario de prueba
        const hashedPassword = await bcrypt_1.default.hash('testPassword123', 10);
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
    (0, globals_1.afterAll)(async () => {
        // Limpiar datos de prueba
        await prisma.usuario.delete({
            where: { id: testUserId },
        }).catch(() => { });
        await prisma.$disconnect();
    });
    (0, globals_1.describe)('POST /api/auth/login', () => {
        (0, globals_1.it)('debe hacer login exitosamente con credenciales válidas', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: 'test.integration@test.com',
                password: 'testPassword123',
            })
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.user).toBeDefined();
            (0, globals_1.expect)(response.body.user.email).toBe('test.integration@test.com');
            (0, globals_1.expect)(response.body.token).toBeDefined();
            (0, globals_1.expect)(response.body.refreshToken).toBeDefined();
            // Guardar tokens para otros tests
            accessToken = response.body.token;
            refreshToken = response.body.refreshToken;
        });
        (0, globals_1.it)('debe fallar con credenciales inválidas', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: 'test.integration@test.com',
                password: 'wrongPassword',
            })
                .expect(401);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
        (0, globals_1.it)('debe fallar con email inexistente', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: 'noexiste@test.com',
                password: 'testPassword123',
            })
                .expect(401);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
        (0, globals_1.it)('debe validar formato de email', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: 'invalid-email',
                password: 'testPassword123',
            })
                .expect(400);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
        (0, globals_1.it)('debe validar que password no esté vacío', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: 'test.integration@test.com',
                password: '',
            })
                .expect(400);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
    });
    (0, globals_1.describe)('GET /api/auth/profile', () => {
        (0, globals_1.it)('debe obtener perfil con token válido', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.user).toBeDefined();
            (0, globals_1.expect)(response.body.user.email).toBe('test.integration@test.com');
        });
        (0, globals_1.it)('debe fallar sin token', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/auth/profile')
                .expect(401);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
        (0, globals_1.it)('debe fallar con token inválido', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
    });
    (0, globals_1.describe)('POST /api/auth/refresh', () => {
        (0, globals_1.it)('debe renovar tokens con refresh token válido', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/refresh')
                .send({
                refreshToken: refreshToken,
            })
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.token).toBeDefined();
            (0, globals_1.expect)(response.body.refreshToken).toBeDefined();
            (0, globals_1.expect)(response.body.token).not.toBe(accessToken); // Debe ser un nuevo token
            // Actualizar tokens
            accessToken = response.body.token;
            refreshToken = response.body.refreshToken;
        });
        (0, globals_1.it)('debe fallar con refresh token inválido', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/refresh')
                .send({
                refreshToken: 'invalid-refresh-token',
            })
                .expect(401);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
        (0, globals_1.it)('debe fallar sin refresh token', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/refresh')
                .send({})
                .expect(400);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
    });
    (0, globals_1.describe)('POST /api/auth/logout', () => {
        (0, globals_1.it)('debe hacer logout exitosamente', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.message).toContain('Logout exitoso');
        });
        (0, globals_1.it)('debe fallar logout sin token', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/logout')
                .expect(401);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
        (0, globals_1.it)('refresh token debe fallar después de logout', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/refresh')
                .send({
                refreshToken: refreshToken,
            })
                .expect(401);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
    });
    (0, globals_1.describe)('Rate Limiting', () => {
        (0, globals_1.it)('debe aplicar rate limiting en login después de múltiples intentos', async () => {
            // Hacer 6 intentos de login (el límite es 5)
            for (let i = 0; i < 6; i++) {
                await (0, supertest_1.default)(app)
                    .post('/api/auth/login')
                    .send({
                    email: 'test.integration@test.com',
                    password: 'wrongPassword',
                });
            }
            // El 7mo intento debe ser bloqueado
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: 'test.integration@test.com',
                password: 'testPassword123',
            })
                .expect(429);
            (0, globals_1.expect)(response.body.success).toBe(false);
        }, 30000); // Timeout extendido para este test
    });
});
