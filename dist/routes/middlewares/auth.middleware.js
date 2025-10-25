"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
exports.authenticateToken = authenticateToken;
const token_service_1 = require("../services/token.service");
const base_error_1 = require("../core/domain/errors/base.error");
const logger_1 = require("../config/logger");
function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            throw new base_error_1.UnauthorizedError('Token no proporcionado');
        }
        const payload = token_service_1.tokenService.verifyAccessToken(token);
        req.user = payload;
        next();
    }
    catch (error) {
        if (error instanceof base_error_1.UnauthorizedError) {
            logger_1.log.security('Authentication failed', {
                error: error.message,
                ip: req.ip,
                url: req.url
            });
            return res.status(401).json({
                success: false,
                error: error.message
            });
        }
        next(error);
    }
}
// Alias para compatibilidad
exports.authMiddleware = authenticateToken;
