import { Request, Response } from 'express';
import { CrearUsuarioDTO, LoginDTO } from '../types/usuario.dto';
import Joi from 'joi';
import { AuthServiceImpl } from '../infrastructure/services/auth.service.impl';
import { UserRepositoryImpl } from '../infrastructure/repositories/user.repository.impl';
import { JwtService } from '../core/security/jwt';
import { PasswordService } from '../core/security/password';

const userRepository = new UserRepositoryImpl();
const jwtService = new JwtService({
  accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || 'default-secret',
  refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || 'default-secret',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
});
const passwordService = new PasswordService();
const authService = new AuthServiceImpl(userRepository, jwtService, passwordService);

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
    const users = await userRepository.findMany();
    res.json(users.map(u => ({
      id: u.id,
      email: u.email,
      nombre: u.name,
      rol: u.role?.toLowerCase() || u.role,
      municipio_id: u.municipalityId,
      telefono: u.phone,
      activo: u.active,
      fecha_creacion: u.createdAt,
      fecha_actualizacion: u.updatedAt,
    })));
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
    const user = req.user;
    
    // Solo super admin puede crear usuarios con rol super_admin
    if (userData.rol === 'super_admin') {
      if (!user || user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Solo el super administrador puede crear usuarios con rol super_admin'
        });
      }
    }
    
    // Solo super admin y admin pueden crear usuarios con rol admin
    if (userData.rol === 'admin') {
      if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          error: 'Solo el super administrador o administrador pueden crear usuarios con rol admin'
        });
      }
    }
    
    // Solo super admin y admin pueden crear usuarios con rol coordinador
    if (userData.rol === 'coordinador') {
      if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          error: 'Solo el super administrador o administrador pueden crear usuarios con rol coordinador'
        });
      }
    }
    
    // Super admin, admin y madrinas pueden crear usuarios con rol madrina
    if (userData.rol === 'madrina') {
      if (!user || (user.role !== 'super_admin' && user.role !== 'admin' && user.role !== 'madrina')) {
        return res.status(403).json({
          success: false,
          error: 'Solo el super administrador, administrador o madrinas pueden crear usuarios con rol madrina'
        });
      }
    }

    const result = await authService.register(userData);
    if (result.isLeft()) {
      return res.status(400).json({ success: false, error: result.value.message });
    }
    const auth = result.value;

    console.log(`✅ Usuario creado: ${auth.user.email} con rol ${auth.user.role}`);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: auth.user.id,
        email: auth.user.email,
        nombre: auth.user.name,
        rol: auth.user.role?.toLowerCase() || auth.user.role,
        municipio_id: auth.user.municipalityId,
      },
      token: auth.accessToken,
      refreshToken: auth.refreshToken,
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

    const result = await authService.register(userData);
    if (result.isLeft()) {
      return res.status(400).json({ success: false, error: result.value.message });
    }
    const auth = result.value;

    console.log(`✅ Usuario público creado: ${auth.user.email} con rol ${auth.user.role}`);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: auth.user.id,
        email: auth.user.email,
        nombre: auth.user.name,
        rol: auth.user.role?.toLowerCase() || auth.user.role,
        municipio_id: auth.user.municipalityId,
      },
      token: auth.accessToken,
      refreshToken: auth.refreshToken,
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
    if (result.isLeft()) {
      return res.status(401).json({ error: result.value.message });
    }
    const auth = result.value;
    res.json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: auth.user.id,
        email: auth.user.email,
        nombre: auth.user.name,
        rol: auth.user.role?.toLowerCase() || auth.user.role,
        municipio_id: auth.user.municipalityId,
      },
      token: auth.accessToken,
      refreshToken: auth.refreshToken,
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

    const result = await authService.refreshToken(refreshToken);
    if (result.isLeft()) {
      return res.status(401).json({ success: false, error: result.value.message });
    }
    const auth = result.value;
    res.json({
      success: true,
      message: 'Token renovado exitosamente',
      token: auth.accessToken,
      refreshToken: auth.refreshToken,
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
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const result = await authService.logout(user.sub);
    if (result.isLeft()) {
      return res.status(400).json({ success: false, error: result.value.message });
    }

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
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Remover información sensible
    const current = await userRepository.findById(user.sub);
    if (!current) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const userProfile = {
      id: current.id,
      email: current.email,
      nombre: current.name,
      rol: current.role?.toLowerCase() || current.role,
      municipio_id: current.municipalityId,
      telefono: current.phone,
      activo: current.active,
      fecha_creacion: current.createdAt,
      fecha_actualizacion: current.updatedAt,
    };

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
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
