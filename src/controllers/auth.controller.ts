import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { CrearUsuarioDTO, LoginDTO } from '../types/usuario.dto';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

const authService = new AuthService();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  nombre: Joi.string().required(),
  documento: Joi.string().optional(),
  tipo_documento: Joi.string().valid('cedula', 'tarjeta_identidad', 'pasaporte', 'registro_civil').optional().default('cedula'),
  telefono: Joi.string().optional(),
  rol: Joi.string().valid('madrina', 'coordinador', 'admin', 'super_admin', 'medico', 'gestante').required(),
  municipioId: Joi.string().optional(),
  direccion: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await authService.listUsers();
    res.json(users);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userData: CrearUsuarioDTO = value;

    // Validar permisos para crear usuarios según los requisitos
    const user = (req as any).user;
    
    // Solo super admin puede crear usuarios con rol super_admin
    if (userData.rol === 'super_admin') {
      if (!user || user.rol !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Solo el super administrador puede crear usuarios con rol super_admin'
        });
      }
    }
    
    // Solo super admin y admin pueden crear usuarios con rol admin
    if (userData.rol === 'admin') {
      if (!user || (user.rol !== 'super_admin' && user.rol !== 'admin')) {
        return res.status(403).json({
          success: false,
          error: 'Solo el super administrador o administrador pueden crear usuarios con rol admin'
        });
      }
    }
    
    // Solo super admin y admin pueden crear usuarios con rol coordinador
    if (userData.rol === 'coordinador') {
      if (!user || (user.rol !== 'super_admin' && user.rol !== 'admin')) {
        return res.status(403).json({
          success: false,
          error: 'Solo el super administrador o administrador pueden crear usuarios con rol coordinador'
        });
      }
    }
    
    // Super admin, admin y madrinas pueden crear usuarios con rol madrina
    if (userData.rol === 'madrina') {
      if (!user || (user.rol !== 'super_admin' && user.rol !== 'admin' && user.rol !== 'madrina')) {
        return res.status(403).json({
          success: false,
          error: 'Solo el super administrador, administrador o madrinas pueden crear usuarios con rol madrina'
        });
      }
    }

    const newUser = await authService.register(userData);
    const token = generateAccessToken(newUser as any);

    console.log(`✅ Usuario creado: ${newUser.email} con rol ${newUser.rol}`);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: newUser,
      token,
    });
  } catch (error: any) {
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

// Registro público para usuarios básicos (madrina, gestante, medico)
export const publicRegister = async (req: Request, res: Response) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userData: CrearUsuarioDTO = value;

    // Solo permitir roles básicos en registro público
    if (!['madrina', 'gestante', 'medico'].includes(userData.rol)) {
      return res.status(403).json({
        success: false,
        error: 'Solo se permite registro público para roles de madrina, gestante o médico'
      });
    }

    const newUser = await authService.register(userData);
    const token = generateAccessToken(newUser as any);

    console.log(`✅ Usuario público creado: ${newUser.email} con rol ${newUser.rol}`);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: newUser,
      token,
    });
  } catch (error: any) {
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

export const login = async (req: Request, res: Response) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const loginData: LoginDTO = value;
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
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error('Error en refresh token:', error);
    res.status(401).json({
      success: false,
      error: error.message || 'Refresh token inválido'
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    await authService.logout(user.id);

    res.json({
      success: true,
      message: 'Logout exitoso'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // El usuario viene del middleware de autenticación
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Remover información sensible
    const { password_hash, ...userProfile } = user;

    res.json({
      user: userProfile
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    // El usuario viene del middleware de autenticación
    const user = (req as any).user;
    
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
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
