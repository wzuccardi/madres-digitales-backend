export interface AppConfig {
  port: number;
  nodeEnv: string;
  database: DatabaseConfig;
  jwt: JwtConfig;
  cors: CorsConfig;
  rateLimit: RateLimitConfig;
  upload: UploadConfig;
}

export interface DatabaseConfig {
  url: string;
  ssl: boolean;
  poolSize: number;
}

export interface JwtConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}

export interface CorsConfig {
  origins: string[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

export interface UploadConfig {
  maxSize: number;
  allowedTypes: string[];
  destination: string;
}

const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/madresdigitales',
    ssl: process.env.NODE_ENV === 'production',
    poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '10', 10),
  },
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || 'your-access-secret-key',
    refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || 'your-refresh-secret-key',
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',
  },
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3008', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 peticiones por ventana
    message: 'Too many requests from this IP, please try again later.',
  },
  upload: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'],
    destination: process.env.UPLOAD_DESTINATION || './uploads',
  },
};

export default config;