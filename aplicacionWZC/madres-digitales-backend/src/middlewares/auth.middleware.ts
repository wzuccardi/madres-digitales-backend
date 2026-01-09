import { Request, Response, NextFunction } from 'express';
import { tokenService } from '../services/token.service';
import { UnauthorizedError } from '../core/domain/errors/base.error';
import { JwtPayload } from '../domain/entities/user.entity';
import { log } from '../config/logger';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    // 🔍 DEBUG: Analizar flujo de autenticación
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 DEBUG: Middleware authMiddleware ejecutándose...');
      console.log('🔍 DEBUG: URL solicitada:', req.url);
      console.log('🔍 DEBUG: Método:', req.method);
    }
    
    const authHeader = req.headers['authorization'];
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 DEBUG: Header Authorization:', authHeader ? 'PRESENT' : 'ABSENT');
    }
    
    const token = authHeader && authHeader.split(' ')[1];
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 DEBUG: Token extraído:', token ? 'PRESENT' : 'ABSENT');
    }

    if (!token) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔍 DEBUG: No token proporcionado - lanzando UnauthorizedError');
      }
      throw new UnauthorizedError('Token no proporcionado');
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 DEBUG: Verificando token con tokenService...');
    }
    const payload = tokenService.verifyAccessToken(token);
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 DEBUG: Token verificado exitosamente - Payload:', payload);
    }
    
    const roleLower = String((payload as any).rol ?? (payload as any).role ?? '').toLowerCase();
    const mapped: JwtPayload = {
      sub: payload.id,
      email: payload.email,
      role: roleLower,
      id: payload.id,
      rol: roleLower,
      iat: payload.iat,
      exp: payload.exp,
    };
    (req as any).user = mapped;
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 DEBUG: Usuario agregado a request:', payload);
    }

    next();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 DEBUG: Error en autenticación:', (error as any).message);
    }
    if (error instanceof UnauthorizedError) {
      log.security('Authentication failed', {
        error: error.message,
        ip: req.ip,
        url: req.url
      });
      return res.status(401).json({
        success: false,
        error: error.message
      });
    }
    next(error);
  }
}

// Alias para compatibilidad
export const authMiddleware = authenticateToken;
