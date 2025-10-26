import { Request, Response, NextFunction } from 'express';
import { tokenService } from '../services/token.service';
import { UnauthorizedError } from '../core/domain/errors/base.error';
import { log } from '../config/logger';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    // 🔍 DEBUG: Analizar flujo de autenticación
    console.log('🔍 DEBUG: Middleware authMiddleware ejecutándose...');
    console.log('🔍 DEBUG: URL solicitada:', req.url);
    console.log('🔍 DEBUG: Método:', req.method);
    
    const authHeader = req.headers['authorization'];
    console.log('🔍 DEBUG: Header Authorization:', authHeader ? 'PRESENT' : 'ABSENT');
    
    const token = authHeader && authHeader.split(' ')[1];
    console.log('🔍 DEBUG: Token extraído:', token ? 'PRESENT' : 'ABSENT');

    if (!token) {
      console.log('🔍 DEBUG: No token proporcionado - lanzando UnauthorizedError');
      throw new UnauthorizedError('Token no proporcionado');
    }

    console.log('🔍 DEBUG: Verificando token con tokenService...');
    const payload = tokenService.verifyAccessToken(token);
    console.log('🔍 DEBUG: Token verificado exitosamente - Payload:', payload);
    
    (req as any).user = payload;
    console.log('🔍 DEBUG: Usuario agregado a request:', payload);

    next();
  } catch (error) {
    console.log('🔍 DEBUG: Error en autenticación:', error.message);
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
