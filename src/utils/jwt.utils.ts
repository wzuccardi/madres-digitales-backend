import jwt from 'jsonwebtoken';

export function generateAccessToken(user: any) {
  return jwt.sign({ id: user.id, email: user.email, rol: user.rol }, process.env.JWT_SECRET as string, {
    expiresIn: '1d',
  });
}

export function generateRefreshToken(user: any) {
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
  return jwt.sign({ id: user.id, email: user.email, rol: user.rol }, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET as string);
}
