"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeLimiter = exports.refreshLimiter = exports.registerLimiter = exports.loginLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = require("../config/logger");
/**
 * Rate limiter general para todas las rutas
 * 100 requests por 15 minutos
 */
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests por ventana
    message: {
        success: false,
        error: 'Demasiadas solicitudes, por favor intente más tarde'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        logger_1.log.security('Rate limit exceeded', {
            ip: req.ip,
            url: req.url,
            method: req.method
        });
        res.status(429).json({
            success: false,
            error: 'Demasiadas solicitudes, por favor intente más tarde'
        });
    }
});
/**
 * Rate limiter estricto para login
 * 5 intentos por 15 minutos
 */
exports.loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos por ventana
    skipSuccessfulRequests: true, // No contar requests exitosos
    message: {
        success: false,
        error: 'Demasiados intentos de login, por favor intente más tarde'
    },
    handler: (req, res) => {
        logger_1.log.security('Login rate limit exceeded', {
            ip: req.ip,
            email: req.body?.email
        });
        res.status(429).json({
            success: false,
            error: 'Demasiados intentos de login. Por favor intente en 15 minutos.'
        });
    }
});
/**
 * Rate limiter para registro
 * 3 registros por hora
 */
exports.registerLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // 3 registros por hora
    message: {
        success: false,
        error: 'Demasiados registros, por favor intente más tarde'
    },
    handler: (req, res) => {
        logger_1.log.security('Register rate limit exceeded', {
            ip: req.ip,
            email: req.body?.email
        });
        res.status(429).json({
            success: false,
            error: 'Demasiados intentos de registro. Por favor intente en 1 hora.'
        });
    }
});
/**
 * Rate limiter para refresh token
 * 10 refreshes por hora
 */
exports.refreshLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // 10 refreshes por hora
    message: {
        success: false,
        error: 'Demasiadas renovaciones de token, por favor intente más tarde'
    },
    handler: (req, res) => {
        logger_1.log.security('Refresh token rate limit exceeded', {
            ip: req.ip
        });
        res.status(429).json({
            success: false,
            error: 'Demasiadas renovaciones de token. Por favor intente más tarde.'
        });
    }
});
/**
 * Rate limiter para APIs de escritura (POST, PUT, DELETE)
 * 30 requests por 15 minutos
 */
exports.writeLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // 30 requests por ventana
    message: {
        success: false,
        error: 'Demasiadas operaciones de escritura, por favor intente más tarde'
    },
    handler: (req, res) => {
        logger_1.log.security('Write operation rate limit exceeded', {
            ip: req.ip,
            url: req.url,
            method: req.method
        });
        res.status(429).json({
            success: false,
            error: 'Demasiadas operaciones. Por favor intente más tarde.'
        });
    }
});
