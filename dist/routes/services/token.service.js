"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const logger_1 = require("../config/logger");
const base_error_1 = require("../core/domain/errors/base.error");
const prisma = new client_1.PrismaClient();
class TokenService {
    constructor() {
        this.ACCESS_TOKEN_EXPIRY = '7d';
        this.REFRESH_TOKEN_EXPIRY = '30d';
        // NUEVO: Mapa para controlar refresh tokens concurrentes
        this._refreshTokenLocks = new Map();
        this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
        this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
        if (this.JWT_SECRET === 'your-secret-key' || this.JWT_REFRESH_SECRET === 'your-refresh-secret-key') {
            logger_1.log.warn('⚠️ Using default JWT secrets. Set JWT_SECRET and JWT_REFRESH_SECRET in .env');
        }
    }
    /**
     * Renueva el access token usando un refresh token con control de concurrencia
     */
    async refreshAccessToken(refreshToken) {
        // NUEVO: Extraer userId del token sin verificarlo para el lock
        let userId;
        try {
            const decoded = jsonwebtoken_1.default.decode(refreshToken);
            userId = decoded.id;
        }
        catch (error) {
            logger_1.log.security('Refresh token inválido - decode error', { error: error.message });
            throw new base_error_1.UnauthorizedError('Refresh token inválido');
        }
        // NUEVO: Verificar si ya hay un refresh en progreso para este usuario
        if (this._refreshTokenLocks.has(userId)) {
            logger_1.log.auth('Refresh en progreso para usuario', { userId });
            try {
                return await this._refreshTokenLocks.get(userId);
            }
            catch (error) {
                // Si el refresh en progreso falló, limpiar el lock y reintentar
                this._refreshTokenLocks.delete(userId);
                logger_1.log.warn('Refresh en progreso falló, reintentando', { userId, error: error.message });
            }
        }
        // NUEVO: Crear promise de refresh y almacenarla
        const refreshPromise = this._executeRefreshAccessToken(refreshToken);
        this._refreshTokenLocks.set(userId, refreshPromise);
        try {
            // NUEVO: Ejecutar refresh y retornar resultado
            const result = await refreshPromise;
            return result;
        }
        finally {
            // NUEVO: Liberar lock
            this._refreshTokenLocks.delete(userId);
        }
    }
    /**
     * NUEVO: Método interno para ejecutar el refresh token
     */
    async _executeRefreshAccessToken(refreshToken) {
        const startTime = Date.now();
        try {
            // 1. Verificar el refresh token
            const payload = this.verifyRefreshToken(refreshToken);
            // 2. Validar que el refresh token coincida con el almacenado
            const isValid = await this.validateRefreshToken(payload.id, refreshToken);
            if (!isValid) {
                logger_1.log.security('Refresh token inválido o expirado', { userId: payload.id });
                throw new base_error_1.UnauthorizedError('Refresh token inválido o expirado');
            }
            // 3. Obtener datos actualizados del usuario
            const user = await prisma.usuario.findUnique({
                where: { id: payload.id },
                select: { id: true, email: true, rol: true, activo: true },
            });
            if (!user || !user.activo) {
                logger_1.log.security('Usuario no encontrado o inactivo', { userId: payload.id });
                throw new base_error_1.UnauthorizedError('Usuario no encontrado o inactivo');
            }
            // 4. Generar nuevo par de tokens
            const newPayload = {
                id: user.id,
                email: user.email,
                rol: user.rol,
            };
            const tokens = this.generateTokenPair(newPayload);
            // 5. Guardar el nuevo refresh token
            await this.saveRefreshToken(user.id, tokens.refreshToken);
            const duration = Date.now() - startTime;
            logger_1.log.auth('Access token refreshed', {
                userId: user.id,
                duration: `${duration}ms`,
                email: user.email,
                rol: user.rol
            });
            return tokens;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger_1.log.error('Error en refresh token', {
                error: error.message,
                duration: `${duration}ms`,
                stack: error.stack
            });
            throw error;
        }
    }
    /**
     * Genera un par de tokens (access y refresh)
     */
    generateTokenPair(payload) {
        const accessToken = jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, {
            expiresIn: this.ACCESS_TOKEN_EXPIRY,
            issuer: 'madres-digitales',
            audience: 'madres-digitales-users',
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, this.JWT_REFRESH_SECRET, {
            expiresIn: this.REFRESH_TOKEN_EXPIRY,
            issuer: 'madres-digitales',
            audience: 'madres-digitales-users',
        });
        logger_1.log.debug('Token pair generated', {
            userId: payload.id,
            email: payload.email,
            rol: payload.rol
        });
        return { accessToken, refreshToken };
    }
    /**
     * Verifica un access token
     */
    verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.JWT_SECRET, {
                issuer: 'madres-digitales',
                audience: 'madres-digitales-users',
            });
            logger_1.log.debug('Access token verified', { userId: decoded.id });
            return decoded;
        }
        catch (error) {
            logger_1.log.security('Access token verification failed', {
                error: error.message,
                token: token.substring(0, 20) + '...'
            });
            throw new base_error_1.UnauthorizedError('Token de acceso inválido o expirado');
        }
    }
    /**
     * Verifica un refresh token
     */
    verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.JWT_REFRESH_SECRET, {
                issuer: 'madres-digitales',
                audience: 'madres-digitales-users',
            });
            logger_1.log.debug('Refresh token verified', { userId: decoded.id });
            return decoded;
        }
        catch (error) {
            logger_1.log.security('Refresh token verification failed', {
                error: error.message,
                token: token.substring(0, 20) + '...'
            });
            throw new base_error_1.UnauthorizedError('Refresh token inválido o expirado');
        }
    }
    /**
     * Guarda un refresh token en la base de datos
     */
    async saveRefreshToken(userId, refreshToken) {
        try {
            // Actualizar el refresh token del usuario
            await prisma.usuario.update({
                where: { id: userId },
                data: {
                    refresh_token: refreshToken,
                    ultimo_acceso: new Date(),
                },
            });
            logger_1.log.debug('Refresh token saved', { userId });
        }
        catch (error) {
            logger_1.log.error('Error saving refresh token', { userId, error: error.message });
            throw new Error('Error guardando refresh token');
        }
    }
    /**
     * Valida que el refresh token coincida con el almacenado
     */
    async validateRefreshToken(userId, refreshToken) {
        try {
            const user = await prisma.usuario.findUnique({
                where: { id: userId },
                select: { refresh_token: true },
            });
            if (!user || !user.refresh_token) {
                logger_1.log.warn('No refresh token found for user', { userId });
                return false;
            }
            const isValid = user.refresh_token === refreshToken;
            if (!isValid) {
                logger_1.log.security('Refresh token mismatch', { userId });
            }
            return isValid;
        }
        catch (error) {
            logger_1.log.error('Error validating refresh token', { userId, error: error.message });
            return false;
        }
    }
    /**
     * Limpia todos los locks de refresh tokens (para uso administrativo)
     */
    limpiarLocksRefresh() {
        const cantidadLocks = this._refreshTokenLocks.size;
        this._refreshTokenLocks.clear();
        logger_1.log.info('Locks de refresh token limpiados', { cantidad: cantidadLocks });
    }
    /**
     * Obtiene estadísticas de locks de refresh tokens (para monitoreo)
     */
    obtenerEstadisticasLocks() {
        const usuarios = Array.from(this._refreshTokenLocks.keys());
        return {
            activos: this._refreshTokenLocks.size,
            usuarios,
        };
    }
    /**
     * Revoca todos los refresh tokens de un usuario
     */
    async revokeRefreshTokens(userId) {
        try {
            await prisma.usuario.update({
                where: { id: userId },
                data: {
                    refresh_token: null,
                },
            });
            logger_1.log.info('Refresh tokens revocados', { userId });
        }
        catch (error) {
            logger_1.log.error('Error revoking refresh tokens', { userId, error: error.message });
            throw new Error('Error revocando refresh tokens');
        }
    }
    /**
     * Verifica si un access token está próximo a expirar
     */
    isTokenExpiringSoon(token, thresholdMinutes = 15) {
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            const expirationTime = decoded.exp * 1000; // Convertir a milisegundos
            const currentTime = Date.now();
            const thresholdTime = expirationTime - (thresholdMinutes * 60 * 1000);
            return currentTime >= thresholdTime;
        }
        catch (error) {
            logger_1.log.security('Error checking token expiration', { error: error.message });
            return true; // Si hay error, asumir que está expirando
        }
    }
    /**
     * Obtiene información de un token sin verificar su firma
     */
    getTokenInfo(token) {
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            return {
                id: decoded.id,
                email: decoded.email,
                rol: decoded.rol,
                iat: decoded.iat,
                exp: decoded.exp,
                iss: decoded.iss,
                aud: decoded.aud,
            };
        }
        catch (error) {
            logger_1.log.security('Error decoding token', { error: error.message });
            return null;
        }
    }
}
exports.TokenService = TokenService;
// Singleton del servicio
exports.tokenService = new TokenService();
