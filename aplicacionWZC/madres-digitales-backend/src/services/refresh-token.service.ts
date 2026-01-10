import { PrismaClient } from '@prisma/client';
import { TokenService } from './token.service';
import { log } from '../config/logger';
import crypto from 'crypto';

export interface RefreshTokenInfo {
  id: string;
  token: string;
  usuario_id: string;
  device_id?: string;
  expires_at: Date;
  revoked: boolean;
  revoked_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export class RefreshTokenService {
  private prisma: PrismaClient;
  private tokenService: TokenService;

  constructor() {
    this.prisma = new PrismaClient();
    this.tokenService = new TokenService();
  }

  /**
   * Crear un nuevo refresh token
   */
  async createRefreshToken(
    userId: string,
    deviceId?: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<string> {
    try {
      log.info('RefreshTokenService: Creando refresh token', {
        userId,
        deviceId,
        userAgent,
        ipAddress,
      });

      // Generar refresh token seguro
      const refreshToken = this.generateSecureToken();
      
      // Calcular fecha de expiración (30 días)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Guardar en base de datos
      await this.prisma.refreshToken.create({
        data: {
          usuario_id: userId,
          token: refreshToken,
          expires_at: expiresAt,
          device_id: deviceId,
          revoked: false,
        },
      });

      log.info('RefreshTokenService: Refresh token creado exitosamente', {
        userId,
        deviceId,
      });

      return refreshToken;
    } catch (error) {
      log.error('Error creando refresh token', error);
      throw error;
    }
  }

  /**
   * Validar y refrescar access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> {
    try {
      log.info('RefreshTokenService: Validando refresh token');

      // Buscar el refresh token en la base de datos
      const tokenInfo = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!tokenInfo) {
        log.warn('RefreshTokenService: Refresh token no encontrado');
        return null;
      }

      // Verificar si el token está revocado
      if (tokenInfo.revoked) {
        log.warn('RefreshTokenService: Refresh token revocado', {
          usuario_id: tokenInfo.usuario_id,
        });
        return null;
      }

      // Verificar si el token ha expirado
      if (new Date() > tokenInfo.expires_at) {
        log.warn('RefreshTokenService: Refresh token expirado', {
          usuario_id: tokenInfo.usuario_id,
          expires_at: tokenInfo.expires_at.toISOString(),
        });
        return null;
      }

      // Obtener información del usuario
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: tokenInfo.usuario_id },
      });

      if (!usuario || !usuario.activo) {
        log.warn('RefreshTokenService: Usuario no encontrado o inactivo', {
          usuario_id: tokenInfo.usuario_id,
        });
        return null;
      }

      // Generar nuevo access token
      const accessToken = this.tokenService.generateTokenPair({
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      }).accessToken;

      // Generar nuevo refresh token
      const newRefreshToken = await this.createRefreshToken(
        usuario.id,
        tokenInfo.device_id || undefined
      );

      // Revocar el refresh token anterior
      await this.revokeRefreshToken(refreshToken);

      log.info('RefreshTokenService: Access token refrescado exitosamente', {
        userId: usuario.id,
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      log.error('Error refrescando access token', error);
      return null;
    }
  }

  /**
   * Revocar un refresh token específico
   */
  async revokeRefreshToken(refreshToken: string): Promise<boolean> {
    try {
      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!tokenRecord) {
        log.warn('RefreshTokenService: Token no encontrado para revocar');
        return false;
      }

      await this.prisma.refreshToken.update({
        where: { token: refreshToken },
        data: {
          revoked: true,
          revoked_at: new Date(),
        },
      });

      log.info('RefreshTokenService: Refresh token revocado', {
        usuario_id: tokenRecord.usuario_id,
      });

      return true;
    } catch (error) {
      log.error('Error revocando refresh token', error);
      return false;
    }
  }

  /**
   * Revocar todos los refresh tokens de un usuario
   */
  async revokeRefreshTokens(userId: string): Promise<void> {
    try {
      log.info('RefreshTokenService: Revocando todos los refresh tokens del usuario', {
        userId,
      });

      await this.prisma.refreshToken.updateMany({
        where: { 
          usuario_id: userId,
          revoked: false,
        },
        data: { 
          revoked: true,
          revoked_at: new Date(),
        },
      });

      log.info('RefreshTokenService: Todos los refresh tokens revocados', {
        userId,
      });
    } catch (error) {
      log.error('Error revocando todos los refresh tokens del usuario', error);
      throw error;
    }
  }

  /**
   * Limpiar tokens expirados
   */
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const result = await this.prisma.refreshToken.deleteMany({
        where: {
          OR: [
            { expires_at: { lt: new Date() } },
            { revoked: true },
          ],
        },
      });

      log.info('RefreshTokenService: Tokens expirados limpiados', {
        deletedCount: result.count,
      });
    } catch (error) {
      log.error('Error limpiando tokens expirados', error);
    }
  }

  /**
   * Obtener refresh tokens activos de un usuario
   */
  async getActiveRefreshTokens(userId: string): Promise<RefreshTokenInfo[]> {
    try {
      log.info('RefreshTokenService: Obteniendo refresh tokens activos', {
        userId,
      });

      const tokens = await this.prisma.refreshToken.findMany({
        where: {
          usuario_id: userId,
          revoked: false,
          expires_at: { gt: new Date() },
        },
        orderBy: { created_at: 'desc' },
      });

      return tokens.map(token => ({
        id: token.id,
        token: token.token,
        usuario_id: token.usuario_id,
        device_id: token.device_id || undefined,
        expires_at: token.expires_at,
        revoked: token.revoked,
        revoked_at: token.revoked_at || undefined,
        created_at: token.created_at,
        updated_at: token.updated_at,
      }));
    } catch (error) {
      log.error('Error obteniendo refresh tokens activos del usuario', error);
      return [];
    }
  }

  /**
   * Validar si un refresh token existe y es válido
   */
  async validateRefreshToken(refreshToken: string): Promise<RefreshTokenInfo | null> {
    try {
      const tokenInfo = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!tokenInfo || tokenInfo.revoked || new Date() > tokenInfo.expires_at) {
        return null;
      }

      return {
        id: tokenInfo.id,
        token: tokenInfo.token,
        usuario_id: tokenInfo.usuario_id,
        device_id: tokenInfo.device_id || undefined,
        expires_at: tokenInfo.expires_at,
        revoked: tokenInfo.revoked,
        revoked_at: tokenInfo.revoked_at || undefined,
        created_at: tokenInfo.created_at,
        updated_at: tokenInfo.updated_at,
      };
    } catch (error) {
      log.error('Error validando refresh token', error);
      return null;
    }
  }

  /**
   * Generar token seguro
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }
}