"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.logout = exports.refreshToken = exports.login = exports.publicRegister = exports.register = exports.listUsers = void 0;
const auth_service_1 = require("../services/auth.service");
const jwt_utils_1 = require("../utils/jwt.utils");
const joi_1 = __importDefault(require("joi"));
const authService = new auth_service_1.AuthService();
const registerSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
    nombre: joi_1.default.string().required(),
    documento: joi_1.default.string().optional(),
    tipo_documento: joi_1.default.string().valid('cedula', 'tarjeta_identidad', 'pasaporte', 'registro_civil').optional().default('cedula'),
    telefono: joi_1.default.string().optional(),
    rol: joi_1.default.string().valid('madrina', 'coordinador', 'admin', 'super_admin', 'medico', 'gestante').required(),
    municipioId: joi_1.default.string().optional(),
    direccion: joi_1.default.string().optional(),
});
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
});
const listUsers = async (req, res) => {
    try {
        const users = await authService.listUsers();
        res.json(users);
    }
    catch (error) {
        console.error('Error al listar usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.listUsers = listUsers;
const register = async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const userData = value;
        // Validar permisos para crear super_admin, admin o coordinador
        const user = req.user;
        if (userData.rol === 'super_admin' || userData.rol === 'admin' || userData.rol === 'coordinador') {
            // Solo super_admin puede crear estos roles
            if (!user || user.rol !== 'super_admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Solo el super administrador puede crear usuarios con rol super_admin, admin o coordinador'
                });
            }
        }
        const newUser = await authService.register(userData);
        const token = (0, jwt_utils_1.generateAccessToken)(newUser);
        console.log(`✅ Usuario creado: ${newUser.email} con rol ${newUser.rol}`);
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            user: newUser,
            token,
        });
    }
    catch (error) {
        console.error('❌ Error en registro:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({
                success: false,
                error: 'El email ya está registrado'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.register = register;
// Registro público para usuarios básicos (madrina, gestante, medico)
const publicRegister = async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const userData = value;
        // Solo permitir roles básicos en registro público
        if (!['madrina', 'gestante', 'medico'].includes(userData.rol)) {
            return res.status(403).json({
                success: false,
                error: 'Solo se permite registro público para roles de madrina, gestante o médico'
            });
        }
        const newUser = await authService.register(userData);
        const token = (0, jwt_utils_1.generateAccessToken)(newUser);
        console.log(`✅ Usuario público creado: ${newUser.email} con rol ${newUser.rol}`);
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            user: newUser,
            token,
        });
    }
    catch (error) {
        console.error('❌ Error en registro público:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({
                success: false,
                error: 'El email ya está registrado'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.publicRegister = publicRegister;
const login = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const loginData = value;
        const result = await authService.login(loginData);
        if (!result) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        res.json({
            success: true,
            message: 'Login exitoso',
            user: {
                id: result.user.id,
                email: result.user.email,
                nombre: result.user.nombre,
                rol: result.user.rol,
                municipio_id: result.user.municipio_id,
            },
            token: result.accessToken,
            refreshToken: result.refreshToken,
        });
    }
    catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.login = login;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token requerido'
            });
        }
        const tokens = await authService.refreshToken(refreshToken);
        res.json({
            success: true,
            message: 'Token renovado exitosamente',
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });
    }
    catch (error) {
        console.error('Error en refresh token:', error);
        res.status(401).json({
            success: false,
            error: error.message || 'Refresh token inválido'
        });
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        await authService.logout(user.id);
        res.json({
            success: true,
            message: 'Logout exitoso'
        });
    }
    catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.logout = logout;
const getProfile = async (req, res) => {
    try {
        // El usuario viene del middleware de autenticación
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        // Remover información sensible
        const { password_hash, ...userProfile } = user;
        res.json({
            user: userProfile
        });
    }
    catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        // El usuario viene del middleware de autenticación
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const { latitud, longitud, ...otherData } = req.body;
        // Actualizar la ubicación del usuario si se proporciona
        if (latitud !== undefined && longitud !== undefined) {
            // Aquí podrías actualizar la ubicación en la base de datos
            // Por ahora solo devolvemos una respuesta exitosa
            console.log(`Ubicación actualizada para usuario ${user.id}: lat=${latitud}, lng=${longitud}`);
        }
        res.json({
            message: 'Perfil actualizado exitosamente',
            user: {
                ...user,
                latitud,
                longitud
            }
        });
    }
    catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.updateProfile = updateProfile;
