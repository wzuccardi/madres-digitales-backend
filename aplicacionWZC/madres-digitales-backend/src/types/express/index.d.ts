// Extensión de tipos para Express
import { JwtPayload } from '../../domain/entities/user.entity';
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
