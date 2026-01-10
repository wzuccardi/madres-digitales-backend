export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  municipalityId?: string;
  phone?: string;
  document?: string;
  documentType?: string;
  active: boolean;
  lastAccess?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  COORDINATOR = 'coordinator',
  MADRINA = 'madrina',
  MEDICO = 'medico',
  GESTANTE = 'gestante',
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  municipalityId?: string;
  phone?: string;
  document?: string;
  documentType?: string;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  municipalityId?: string;
  active?: boolean;
}

export interface UserFilters {
  role?: UserRole;
  municipalityId?: string;
  active?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  id?: string;
  rol?: string;
  iat?: number;
  exp?: number;
}