import { Request, Response } from 'express';
import { LoginUseCase } from '../../../domain/usecases/auth/login.usecase';
import { AuthServiceImpl } from '../../../infrastructure/services/auth.service.impl';
import { JwtService } from '../../../core/security/jwt';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/user.repository.impl';
import { PasswordService } from '../../../core/security/password';
import { logger } from '../../../core/utils/logger';
import { errorHandler } from '../../../middlewares/error.middleware';
import { LoginCredentials } from '../../../domain/entities/user.entity';

export class AuthController {
  private loginUseCase: LoginUseCase;
  private authService: AuthServiceImpl;

  constructor() {
    // Inyectar dependencias (en un proyecto real se usaría un contenedor de DI)
    const userRepository = new UserRepositoryImpl();
    const jwtService = new JwtService({
      accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || 'default-secret',
      refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || 'default-secret',
      accessTokenExpiry: '15m',
      refreshTokenExpiry: '7d',
    });
    const passwordService = new PasswordService();
    
    this.authService = new AuthServiceImpl(userRepository, jwtService, passwordService);
    this.loginUseCase = new LoginUseCase(userRepository, this.authService);
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: LoginCredentials = req.body;
      
      // Validar entrada
      if (!credentials.email || !credentials.password) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Ejecutar caso de uso
      const result = await this.loginUseCase.execute(credentials);
      
      if (result.isLeft()) {
        // Manejar error
        errorHandler(result.value, req, res);
        return;
      }

      // Respuesta exitosa
      res.status(200).json({
        success: true,
        data: result.value,
        timestamp: new Date().toISOString(),
      });

      logger.info(`User logged in: ${result.value.user.email}`);
    } catch (error) {
      logger.error('Login controller error:', error);
      errorHandler(error, req, res);
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
      
      // Validar entrada
      if (!userData.email || !userData.password || !userData.name) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email, password and name are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Ejecutar registro
      const result = await this.authService.register(userData);
      
      if (result.isLeft()) {
        // Manejar error
        errorHandler(result.value, req, res);
        return;
      }

      // Respuesta exitosa
      res.status(201).json({
        success: true,
        data: result.value,
        timestamp: new Date().toISOString(),
      });

      logger.info(`User registered: ${result.value.user.email}`);
    } catch (error) {
      logger.error('Register controller error:', error);
      errorHandler(error, req, res);
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Refresh token is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Ejecutar refresh
      const result = await this.authService.refreshToken(refreshToken);
      
      if (result.isLeft()) {
        // Manejar error
        errorHandler(result.value, req, res);
        return;
      }

      // Respuesta exitosa
      res.status(200).json({
        success: true,
        data: result.value,
        timestamp: new Date().toISOString(),
      });

      logger.info('Token refreshed successfully');
    } catch (error) {
      logger.error('Refresh token controller error:', error);
      errorHandler(error, req, res);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Ejecutar logout
      const result = await this.authService.logout(userId);
      
      if (result.isLeft()) {
        // Manejar error
        errorHandler(result.value, req, res);
        return;
      }

      // Respuesta exitosa
      res.status(200).json({
        success: true,
        message: 'Logout successful',
        timestamp: new Date().toISOString(),
      });

      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error('Logout controller error:', error);
      errorHandler(error, req, res);
    }
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Obtener usuario actual
      const result = await this.authService.getCurrentUser(userId);
      
      if (result.isLeft()) {
        // Manejar error
        errorHandler(result.value, req, res);
        return;
      }

      // Respuesta exitosa
      res.status(200).json({
        success: true,
        data: result.value,
        timestamp: new Date().toISOString(),
      });

      logger.info(`Current user retrieved: ${result.value.email}`);
    } catch (error) {
      logger.error('Get current user controller error:', error);
      errorHandler(error, req, res);
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user?.sub;
      const { oldPassword, newPassword } = req.body;
      
      if (!userId || !oldPassword || !newPassword) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'User ID, old password and new password are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Ejecutar cambio de contraseña
      const result = await this.authService.changePassword(userId, oldPassword, newPassword);
      
      if (result.isLeft()) {
        // Manejar error
        errorHandler(result.value, req, res);
        return;
      }

      // Respuesta exitosa
      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
        timestamp: new Date().toISOString(),
      });

      logger.info(`Password changed for user: ${userId}`);
    } catch (error) {
      logger.error('Change password controller error:', error);
      errorHandler(error, req, res);
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Ejecutar reseteo de contraseña
      const result = await this.authService.resetPassword(email);
      
      if (result.isLeft()) {
        // Manejar error
        errorHandler(result.value, req, res);
        return;
      }

      // Respuesta exitosa
      res.status(200).json({
        success: true,
        message: 'Password reset email sent',
        timestamp: new Date().toISOString(),
      });

      logger.info(`Password reset requested for email: ${email}`);
    } catch (error) {
      logger.error('Reset password controller error:', error);
      errorHandler(error, req, res);
    }
  }

  async confirmResetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Token and new password are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Ejecutar confirmación de reseteo
      const result = await this.authService.confirmResetPassword(token, newPassword);
      
      if (result.isLeft()) {
        // Manejar error
        errorHandler(result.value, req, res);
        return;
      }

      // Respuesta exitosa
      res.status(200).json({
        success: true,
        message: 'Password reset confirmed',
        timestamp: new Date().toISOString(),
      });

      logger.info('Password reset confirmed');
    } catch (error) {
      logger.error('Confirm reset password controller error:', error);
      errorHandler(error, req, res);
    }
  }
}