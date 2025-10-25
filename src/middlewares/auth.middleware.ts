import { Request, Response, NextFunction } from 'express';
import { tokenService } from '../services/token.service';
import { UnauthorizedError } from '../core/domain/errors/base.error';
import { log } from '../config/logger';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Token no proporcionado');
    }

    const payload = tokenService.verifyAccessToken(token);
    (req as any).user = payload;

    next();
  } catch (error) {
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
