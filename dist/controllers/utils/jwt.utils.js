"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function generateAccessToken(user) {
    return jsonwebtoken_1.default.sign({ id: user.id, email: user.email, rol: user.rol }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
}
function generateRefreshToken(user) {
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
    return jsonwebtoken_1.default.sign({ id: user.id, email: user.email, rol: user.rol }, JWT_REFRESH_SECRET, {
        expiresIn: '7d',
    });
}
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
}
