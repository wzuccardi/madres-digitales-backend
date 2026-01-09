import jwt from 'jsonwebtoken';
import { JwtConfig } from '../config';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export class JwtService {
  constructor(private config: JwtConfig) {}

  generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.config.accessTokenSecret, {
      expiresIn: this.config.accessTokenExpiry,
      issuer: 'madres-digitales',
      audience: 'madres-digitales-users',
    } as jwt.SignOptions);
  }

  generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.config.refreshTokenSecret, {
      expiresIn: this.config.refreshTokenExpiry,
      issuer: 'madres-digitales',
      audience: 'madres-digitales-users',
    } as jwt.SignOptions);
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.config.accessTokenSecret, {
        issuer: 'madres-digitales',
        audience: 'madres-digitales-users',
      }) as JwtPayload;
      
      return decoded;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.config.refreshTokenSecret, {
        issuer: 'madres-digitales',
        audience: 'madres-digitales-users',
      }) as JwtPayload;
      
      return decoded;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp ? decoded.exp < currentTime : true;
    } catch (error) {
      return true;
    }
  }

  getTokenExpirationTime(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return null;
      
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }
}