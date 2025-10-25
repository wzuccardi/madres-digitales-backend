"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rate_limit_middleware_1 = require("../middlewares/rate-limit.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/auth/ping:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: pong
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/ping', (req, res) => {
    res.json({ message: 'pong', timestamp: new Date().toISOString() });
});
// Endpoint temporal para verificar usuarios
router.get('/check-users', async (req, res) => {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const users = await prisma.usuario.findMany({
            select: {
                id: true,
                email: true,
                nombre: true,
                rol: true,
                created_at: true
            }
        });
        res.json({ count: users.length, users });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});
// Endpoint de prueba para verificar que el registro funciona
router.post('/test-register', async (req, res) => {
    console.log('🧪 TEST REGISTER - Headers:', req.headers);
    console.log('🧪 TEST REGISTER - Body:', req.body);
    res.json({
        success: true,
        message: 'Test register endpoint works',
        receivedData: req.body
    });
});
// Endpoint temporal para probar login con GET
router.get('/test-login', async (req, res) => {
    try {
        const { email = 'admin@demo.com', password = 'admin123' } = req.query;
        console.log('🧪 Test login attempt:', { email, password });
        const { PrismaClient } = require('@prisma/client');
        const bcrypt = require('bcrypt');
        const prisma = new PrismaClient();
        const user = await prisma.usuario.findUnique({
            where: { email: email },
        });
        if (!user) {
            return res.json({ success: false, message: 'User not found', email });
        }
        const valid = await bcrypt.compare(password, user.password_hash);
        res.json({
            success: valid,
            message: valid ? 'Login successful' : 'Invalid password',
            user: valid ? { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol } : null
        });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});
// Endpoint de prueba para simular Flutter
router.post('/flutter-test', (req, res) => {
    console.log('🧪 Flutter test endpoint hit:', req.body);
    res.json({ message: 'Flutter test successful', body: req.body });
});
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Demasiados intentos de login
 */
router.post('/login', rate_limit_middleware_1.loginLimiter, auth_controller_1.login);
/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar access token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Token renovado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Refresh token inválido o expirado
 */
router.post('/refresh', rate_limit_middleware_1.refreshLimiter, auth_controller_1.refreshToken);
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout exitoso
 *       401:
 *         description: No autenticado
 */
router.post('/logout', auth_middleware_1.authMiddleware, auth_controller_1.logout);
/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: No autenticado
 */
router.get('/profile', auth_middleware_1.authMiddleware, auth_controller_1.getProfile);
router.get('/users', auth_controller_1.listUsers);
router.post('/register', rate_limit_middleware_1.registerLimiter, auth_controller_1.publicRegister); // Endpoint público para registro de usuarios básicos
router.post('/register-admin', auth_middleware_1.authMiddleware, rate_limit_middleware_1.registerLimiter, auth_controller_1.register); // Endpoint para administrar usuarios con roles especiales
router.put('/profile', auth_middleware_1.authMiddleware, auth_controller_1.updateProfile);
exports.default = router;
