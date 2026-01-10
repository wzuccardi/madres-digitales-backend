import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET || process.env.JWT_REFRESH_SECRET || 'refresh-secret';

export function generateAccessToken(user: any) {
  return jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    ACCESS_SECRET,
    {
      expiresIn: '1d',
      issuer: 'madres-digitales',
      audience: 'madres-digitales-users',
    }
  );
}

export function generateRefreshToken(user: any) {
  return jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    REFRESH_SECRET,
    {
      expiresIn: '7d',
      issuer: 'madres-digitales',
      audience: 'madres-digitales-users',
    }
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET);
}
