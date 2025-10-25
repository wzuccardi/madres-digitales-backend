"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const bcrypt_1 = __importDefault(require("bcrypt"));
const token_service_1 = require("./token.service");
const logger_1 = require("../config/logger");
class AuthService {
    async register(data) {
        const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
        const user = await prisma.usuario.create({
            data: {
                email: data.email,
                password_hash: hashedPassword,
                nombre: data.nombre,
                documento: data.documento,
                telefono: data.telefono,
                rol: data.rol,
                municipio_id: data.municipioId,
                // direccion: data.direccion, // Field not in schema
            },
        });
        return user;
    }
    async login(data) {
        logger_1.log.auth('Login attempt', { email: data.email });
        const user = await prisma.usuario.findUnique({
            where: { email: data.email },
        });
        if (!user) {
            logger_1.log.security('Login failed: User not found', { email: data.email });
            return null;
        }
        if (!user.activo) {
            logger_1.log.security('Login failed: User inactive', { email: data.email, userId: user.id });
            return null;
        }
        const valid = await bcrypt_1.default.compare(data.password, user.password_hash);
        if (!valid) {
            logger_1.log.security('Login failed: Invalid password', { email: data.email, userId: user.id });
            return null;
        }
        // Generar tokens
        const tokens = token_service_1.tokenService.generateTokenPair({
            id: user.id,
            email: user.email,
            rol: user.rol,
        });
        // Guardar refresh token
        await token_service_1.tokenService.saveRefreshToken(user.id, tokens.refreshToken);
        logger_1.log.auth('Login successful', { userId: user.id, email: user.email, rol: user.rol });
        return {
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
    async findUserById(id) {
        console.log('🔍 AuthService: Looking for user with ID:', id);
        const user = await prisma.usuario.findUnique({
            where: { id },
        });
        console.log('👤 AuthService: User found:', user ? `Yes (${user.nombre})` : 'No');
        return user;
    }
    async listUsers() {
        const users = await prisma.usuario.findMany({
            select: {
                id: true,
                email: true,
                nombre: true,
                documento: true,
                telefono: true,
                rol: true,
                municipio_id: true,
                // direccion: true, // Field not in schema
                activo: true,
                ultimo_acceso: true,
                created_at: true,
                updated_at: true
            }
        });
        return users;
    }
    async logout(userId) {
        logger_1.log.auth('Logout', { userId });
        await token_service_1.tokenService.revokeRefreshTokens(userId);
        return { success: true };
    }
    async refreshToken(refreshToken) {
        logger_1.log.auth('Refresh token attempt');
        const tokens = await token_service_1.tokenService.refreshAccessToken(refreshToken);
        return tokens;
    }
}
exports.AuthService = AuthService;
