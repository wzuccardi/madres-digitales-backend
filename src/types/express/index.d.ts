// Extensión de tipos para Express
import { User } from '../../types/usuario.dto';
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
