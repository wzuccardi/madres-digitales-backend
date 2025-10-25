import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { log } from '../config/logger';
import { UnauthorizedError } from '../core/domain/errors/base.error';

const prisma = new PrismaClient();

export class TokenService {
  private readonly JWT_SECRET: string;
  private readonly JWT_REFRESH_SECRET: string;
  private readonly ACCESS_TOKEN_EXPIRY = '7d';
  private readonly REFRESH_TOKEN_EXPIRY = '30d';
  
  // NUEVO: Mapa para controlar refresh tokens concurrentes
  private readonly _refreshTokenLocks = new Map<string, Promise<{ accessToken: string; refreshToken: string }>>();

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

    if (this.JWT_SECRET === 'your-secret-key' || this.JWT_REFRESH_SECRET === 'your-refresh-secret-key') {
      log.warn('⚠️ Using default JWT secrets. Set JWT_SECRET and JWT_REFRESH_SECRET in .env');
    }
  }

  /**
   * Renueva el access token usando un refresh token con control de concurrencia
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // NUEVO: Extraer userId del token sin verificarlo para el lock
    let userId: string;
    try {
      const decoded = jwt.decode(refreshToken) as any;
      userId = decoded.id;
    } catch (error) {
      log.security('Refresh token inválido - decode error', { error: error.message });
      throw new UnauthorizedError('Refresh token inválido');
    }

    // NUEVO: Verificar si ya hay un refresh en progreso para este usuario
    if (this._refreshTokenLocks.has(userId)) {
      log.auth('Refresh en progreso para usuario', { userId });
      try {
        return await this._refreshTokenLocks.get(userId)!;
      } catch (error) {
        // Si el refresh en progreso falló, limpiar el lock y reintentar
        this._refreshTokenLocks.delete(userId);
        log.warn('Refresh en progreso falló, reintentando', { userId, error: error.message });
      }
    }

    // NUEVO: Crear promise de refresh y almacenarla
    const refreshPromise = this._executeRefreshAccessToken(refreshToken);
    this._refreshTokenLocks.set(userId, refreshPromise);

    try {
      // NUEVO: Ejecutar refresh y retornar resultado
      const result = await refreshPromise;
      return result;
    } finally {
      // NUEVO: Liberar lock
      this._refreshTokenLocks.delete(userId);
    }
  }

  /**
   * NUEVO: Método interno para ejecutar el refresh token
   */
  private async _executeRefreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const startTime = Date.now();
    
    try {
      // 1. Verificar el refresh token
      const payload = this.verifyRefreshToken(refreshToken);

      // 2. Validar que el refresh token coincida con el almacenado
      const isValid = await this.validateRefreshToken(payload.id, refreshToken);
      if (!isValid) {
        log.security('Refresh token inválido o expirado', { userId: payload.id });
        throw new UnauthorizedError('Refresh token inválido o expirado');
      }

      // 3. Obtener datos actualizados del usuario
      const user = await prisma.usuario.findUnique({
        where: { id: payload.id },
        select: { id: true, email: true, rol: true, activo: true },
      });

      if (!user || !user.activo) {
        log.security('Usuario no encontrado o inactivo', { userId: payload.id });
        throw new UnauthorizedError('Usuario no encontrado o inactivo');
      }

      // 4. Generar nuevo par de tokens
      const newPayload: JWTPayload = {
        id: user.id,
        email: user.email,
        rol: user.rol,
      };

      const tokens = this.generateTokenPair(newPayload);

      // 5. Guardar el nuevo refresh token
      await this.saveRefreshToken(user.id, tokens.refreshToken);

      const duration = Date.now() - startTime;
      log.auth('Access token refreshed', { 
        userId: user.id, 
        duration: `${duration}ms`,
        email: user.email,
        rol: user.rol
      });

      return tokens;
    } catch (error) {
      const duration = Date.now() - startTime;
      log.error('Error en refresh token', { 
        error: error.message,
        duration: `${duration}ms`,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Genera un par de tokens (access y refresh)
   */
  generateTokenPair(payload: JWTPayload): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      issuer: 'madres-digitales',
      audience: 'madres-digitales-users',
    });

    const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
      issuer: 'madres-digitales',
      audience: 'madres-digitales-users',
    });

    log.debug('Token pair generated', { 
      userId: payload.id,
      email: payload.email,
      rol: payload.rol
    });

    return { accessToken, refreshToken };
  }

  /**
   * Verifica un access token
   */
  verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'madres-digitales',
        audience: 'madres-digitales-users',
      }) as JWTPayload;

      log.debug('Access token verified', { userId: decoded.id });
      return decoded;
    } catch (error) {
      log.security('Access token verification failed', { 
        error: error.message,
        token: token.substring(0, 20) + '...'
      });
      throw new UnauthorizedError('Token de acceso inválido o expirado');
    }
  }

  /**
   * Verifica un refresh token
   */
  verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_REFRESH_SECRET, {
        issuer: 'madres-digitales',
        audience: 'madres-digitales-users',
      }) as JWTPayload;

      log.debug('Refresh token verified', { userId: decoded.id });
      return decoded;
    } catch (error) {
      log.security('Refresh token verification failed', { 
        error: error.message,
        token: token.substring(0, 20) + '...'
      });
      throw new UnauthorizedError('Refresh token inválido o expirado');
    }
  }

  /**
   * Guarda un refresh token en la base de datos
   */
  async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      // Actualizar el refresh token del usuario
      await prisma.usuario.update({
        where: { id: userId },
        data: {
          refresh_token: refreshToken,
          ultimo_acceso: new Date(),
        },
      });

      log.debug('Refresh token saved', { userId });
    } catch (error) {
      log.error('Error saving refresh token', { userId, error: error.message });
      throw new Error('Error guardando refresh token');
    }
  }

  /**
   * Valida que el refresh token coincida con el almacenado
   */
  async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    try {
      const user = await prisma.usuario.findUnique({
        where: { id: userId },
        select: { refresh_token: true },
      });

      if (!user || !user.refresh_token) {
        log.warn('No refresh token found for user', { userId });
        return false;
      }

      const isValid = user.refresh_token === refreshToken;
      
      if (!isValid) {
        log.security('Refresh token mismatch', { userId });
      }

      return isValid;
    } catch (error) {
      log.error('Error validating refresh token', { userId, error: error.message });
      return false;
    }
  }

  /**
   * Limpia todos los locks de refresh tokens (para uso administrativo)
   */
  limpiarLocksRefresh(): void {
    const cantidadLocks = this._refreshTokenLocks.size;
    this._refreshTokenLocks.clear();
    log.info('Locks de refresh token limpiados', { cantidad: cantidadLocks });
  }

  /**
   * Obtiene estadísticas de locks de refresh tokens (para monitoreo)
   */
  obtenerEstadisticasLocks(): { activos: number; usuarios: string[] } {
    const usuarios = Array.from(this._refreshTokenLocks.keys());
    return {
      activos: this._refreshTokenLocks.size,
      usuarios,
    };
  }

  /**
   * Revoca todos los refresh tokens de un usuario
   */
  async revokeRefreshTokens(userId: string): Promise<void> {
    try {
      await prisma.usuario.update({
        where: { id: userId },
        data: {
          refresh_token: null,
        },
      });

      log.info('Refresh tokens revocados', { userId });
    } catch (error) {
      log.error('Error revoking refresh tokens', { userId, error: error.message });
      throw new Error('Error revocando refresh tokens');
    }
  }

  /**
   * Verifica si un access token está próximo a expirar
   */
  isTokenExpiringSoon(token: string, thresholdMinutes: number = 15): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      const expirationTime = decoded.exp * 1000; // Convertir a milisegundos
      const currentTime = Date.now();
      const thresholdTime = expirationTime - (thresholdMinutes * 60 * 1000);
      
      return currentTime >= thresholdTime;
    } catch (error) {
      log.security('Error checking token expiration', { error: error.message });
      return true; // Si hay error, asumir que está expirando
    }
  }

  /**
   * Obtiene información de un token sin verificar su firma
   */
  getTokenInfo(token: string): JWTPayload | null {
    try {
      const decoded = jwt.decode(token) as any;
      return {
        id: decoded.id,
        email: decoded.email,
        rol: decoded.rol,
        iat: decoded.iat,
        exp: decoded.exp,
        iss: decoded.iss,
        aud: decoded.aud,
      };
    } catch (error) {
      log.security('Error decoding token', { error: error.message });
      return null;
    }
  }
}

// Interfaz para el payload del token
export interface JWTPayload {
  id: string;
  email: string;
  rol: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

// Singleton del servicio
export const tokenService = new TokenService();
