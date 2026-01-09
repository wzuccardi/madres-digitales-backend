import { IUserRepository, IAuthService } from '../../../domain/repositories/user.repository.interface';
import { LoginCredentials, AuthResponse, User, JwtPayload } from '../../../domain/entities/user.entity';
import { JwtService } from '../../../core/security/jwt';
import { PasswordService } from '../../../core/security/password';
import { UnauthorizedError, NotFoundError, ConflictError } from '../../../core/errors/app-error';
import { logger } from '../../../core/utils/logger';
import { Either, left, right } from '../../../shared/types/either';

export class AuthServiceImpl implements IAuthService {
  constructor(
    private userRepository: IUserRepository,
    private jwtService: JwtService,
    private passwordService: PasswordService
  ) {}

  async login(credentials: LoginCredentials): Promise<Either<Error, AuthResponse>> {
    try {
      // Buscar usuario por email
      const user = await this.userRepository.findByEmail(credentials.email);
      if (!user) {
        return left(new UnauthorizedError('Invalid credentials'));
      }

      // Verificar si el usuario está activo
      if (!user.active) {
        return left(new UnauthorizedError('User account is inactive'));
      }

      // Verificar contraseña
      const isPasswordValid = await this.passwordService.compare(credentials.password, user.passwordHash);
      if (!isPasswordValid) {
        return left(new UnauthorizedError('Invalid credentials'));
      }

      // Generar tokens
      const tokenPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: String(user.role).toLowerCase(),
      };

      const accessToken = this.jwtService.generateAccessToken(tokenPayload);
      const refreshToken = this.jwtService.generateRefreshToken(tokenPayload);

      // Actualizar último acceso
      await this.userRepository.updateLastAccess(user.id);

      const authResponse: AuthResponse = {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
      };

      logger.info(`User logged in: ${user.email}`);
      return right(authResponse);
    } catch (error) {
      logger.error('Error during login:', error);
      return left(error instanceof Error ? error : new Error('Login failed'));
    }
  }

  async register(userData: any): Promise<Either<Error, AuthResponse>> {
    try {
      // Verificar si el email ya existe
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        return left(new ConflictError('Email already exists'));
      }

      // Crear usuario
      const user = await this.userRepository.create(userData);

      // Generar tokens
      const tokenPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: String(user.role).toLowerCase(),
      };

      const accessToken = this.jwtService.generateAccessToken(tokenPayload);
      const refreshToken = this.jwtService.generateRefreshToken(tokenPayload);

      const authResponse: AuthResponse = {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
      };

      logger.info(`User registered: ${user.email}`);
      return right(authResponse);
    } catch (error) {
      logger.error('Error during registration:', error);
      return left(error instanceof Error ? error : new Error('Registration failed'));
    }
  }

  async refreshToken(refreshToken: string): Promise<Either<Error, AuthResponse>> {
    try {
      // Verificar el refresh token
      const tokenPayload = this.jwtService.verifyRefreshToken(refreshToken);
      
      // Buscar usuario
      const user = await this.userRepository.findById(tokenPayload.sub);
      if (!user) {
        return left(new UnauthorizedError('Invalid refresh token'));
      }

      if (!user.active) {
        return left(new UnauthorizedError('User account is inactive'));
      }

      // Generar nuevos tokens
      const newTokenPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: String(user.role).toLowerCase(),
      };

      const newAccessToken = this.jwtService.generateAccessToken(newTokenPayload);
      const newRefreshToken = this.jwtService.generateRefreshToken(newTokenPayload);

      const authResponse: AuthResponse = {
        user: this.sanitizeUser(user),
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };

      logger.info(`Token refreshed for user: ${user.email}`);
      return right(authResponse);
    } catch (error) {
      logger.error('Error during token refresh:', error);
      return left(new UnauthorizedError('Invalid refresh token'));
    }
  }

  async logout(userId: string): Promise<Either<Error, void>> {
    try {
      // Aquí podríamos implementar invalidación de tokens
      // Por ahora solo registramos el logout
      logger.info(`User logged out: ${userId}`);
      return right(undefined);
    } catch (error) {
      logger.error('Error during logout:', error);
      return left(error instanceof Error ? error : new Error('Logout failed'));
    }
  }

  async validateToken(token: string): Promise<Either<Error, User>> {
    try {
      const tokenPayload = this.jwtService.verifyAccessToken(token);
      
      // Buscar usuario
      const user = await this.userRepository.findById(tokenPayload.sub);
      if (!user) {
        return left(new UnauthorizedError('Invalid token'));
      }

      if (!user.active) {
        return left(new UnauthorizedError('User account is inactive'));
      }

      return right(user);
    } catch (error) {
      logger.error('Error during token validation:', error);
      return left(new UnauthorizedError('Invalid token'));
    }
  }

  async getCurrentUser(userId: string): Promise<Either<Error, User>> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return left(new NotFoundError('User', userId));
      }

      return right(user);
    } catch (error) {
      logger.error('Error getting current user:', error);
      return left(error instanceof Error ? error : new Error('Failed to get current user'));
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<Either<Error, void>> {
    try {
      // Buscar usuario
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return left(new NotFoundError('User', userId));
      }

      // Verificar contraseña actual
      const isOldPasswordValid = await this.passwordService.compare(oldPassword, user.passwordHash);
      if (!isOldPasswordValid) {
        return left(new UnauthorizedError('Invalid current password'));
      }

      // Validar nueva contraseña
      const passwordValidation = this.passwordService.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return left(new Error(`Invalid password: ${passwordValidation.errors.join(', ')}`));
      }

      // Hashear nueva contraseña
      const newPasswordHash = await this.passwordService.hash(newPassword);

      // Actualizar contraseña
      await this.userRepository.update(userId, {
        passwordHash: newPasswordHash,
      });

      logger.info(`Password changed for user: ${userId}`);
      return right(undefined);
    } catch (error) {
      logger.error('Error changing password:', error);
      return left(error instanceof Error ? error : new Error('Password change failed'));
    }
  }

  async resetPassword(email: string): Promise<Either<Error, void>> {
    try {
      // Buscar usuario
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        // Por seguridad, no revelamos si el email existe o no
        return right(undefined);
      }

      // Generar token de reseteo
      const resetToken = this.jwtService.generateAccessToken({
        sub: user.id,
        email: user.email,
        role: String(user.role).toLowerCase(),
        purpose: 'password_reset',
      });

      // Aquí enviaríamos email con el token de reseteo
      logger.info(`Password reset requested for email: ${email}`);
      return right(undefined);
    } catch (error) {
      logger.error('Error during password reset:', error);
      return left(error instanceof Error ? error : new Error('Password reset failed'));
    }
  }

  async confirmResetPassword(token: string, newPassword: string): Promise<Either<Error, void>> {
    try {
      // Verificar token
      const tokenPayload = this.jwtService.verifyAccessToken(token);
      
      if (tokenPayload.purpose !== 'password_reset') {
        return left(new UnauthorizedError('Invalid reset token'));
      }

      // Buscar usuario
      const user = await this.userRepository.findById(tokenPayload.sub);
      if (!user) {
        return left(new NotFoundError('User', tokenPayload.sub));
      }

      // Validar nueva contraseña
      const passwordValidation = this.passwordService.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return left(new Error(`Invalid password: ${passwordValidation.errors.join(', ')}`));
      }

      // Hashear nueva contraseña
      const newPasswordHash = await this.passwordService.hash(newPassword);

      // Actualizar contraseña
      await this.userRepository.update(user.id, {
        passwordHash: newPasswordHash,
      });

      logger.info(`Password reset confirmed for user: ${user.id}`);
      return right(undefined);
    } catch (error) {
      logger.error('Error during password reset confirmation:', error);
      return left(error instanceof Error ? error : new Error('Password reset confirmation failed'));
    }
  }

  private sanitizeUser(user: any): User {
    return {
      id: user.id,
      email: user.email,
      name: user.nombre,
      role: String(user.rol).toLowerCase(),
      municipalityId: user.municipio_id,
      phone: user.telefono,
      active: user.activo,
      createdAt: user.fecha_creacion,
      updatedAt: user.fecha_actualizacion,
    };
  }
}