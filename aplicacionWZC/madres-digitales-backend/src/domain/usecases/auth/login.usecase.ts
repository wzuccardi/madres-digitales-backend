import { Either, left, right } from '../../../shared/types/either';
import { IUserRepository } from '../../repositories/user.repository.interface';
import { LoginCredentials, AuthResponse, User } from '../../entities/user.entity';
import { UnauthorizedError, ValidationError } from '../../../core/errors/app-error';
import { PasswordService } from '../../../core/security/password';

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private jwtService: any,
    private passwordService: PasswordService
  ) {}

  async execute(credentials: LoginCredentials): Promise<Either<Error, AuthResponse>> {
    // Validación de entrada
    const validationError = this.validateCredentials(credentials);
    if (validationError) {
      return left(validationError);
    }

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
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.generateAccessToken(tokenPayload);
    const refreshToken = this.jwtService.generateRefreshToken(tokenPayload);

    // Actualizar último acceso
    await this.userRepository.updateLastAccess(user.id);

    const authResponse: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        municipalityId: user.municipalityId,
        phone: user.phone,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken,
    };

    return right(authResponse);
  }

  private validateCredentials(credentials: LoginCredentials): ValidationError | null {
    if (!credentials.email || !credentials.password) {
      return new ValidationError('Email and password are required');
    }

    if (!this.isValidEmail(credentials.email)) {
      return new ValidationError('Invalid email format');
    }

    if (credentials.password.length < 6) {
      return new ValidationError('Password must be at least 6 characters long');
    }

    return null;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}