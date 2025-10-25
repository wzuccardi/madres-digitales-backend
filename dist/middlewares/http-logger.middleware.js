"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = void 0;
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = require("../config/logger");
/**
 * Formato personalizado de Morgan para logging HTTP
 */
const format = ':method :url :status :res[content-length] - :response-time ms';
/**
 * Middleware de logging HTTP usando Morgan + Winston
 */
exports.httpLogger = (0, morgan_1.default)(format, {
    stream: logger_1.morganStream,
    // No loguear rutas de health check
    skip: (req) => req.url === '/health' || req.url === '/api/health'
});
exports.default = exports.httpLogger;
