import { User, CreateUserData, UpdateUserData, UserFilters, LoginCredentials, AuthResponse } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: CreateUserData): Promise<User>;
  update(id: string, userData: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
  findMany(filters?: UserFilters): Promise<User[]>;
  count(filters?: UserFilters): Promise<number>;
  updateLastAccess(id: string): Promise<void>;
  findByRole(role: string): Promise<User[]>;
  findActiveUsers(): Promise<User[]>;
  searchUsers(query: string, filters?: UserFilters): Promise<User[]>;
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(userData: CreateUserData): Promise<AuthResponse>;
  refreshToken(refreshToken: string): Promise<AuthResponse>;
  logout(userId: string): Promise<void>;
  validateToken(token: string): Promise<User | null>;
  getCurrentUser(userId: string): Promise<User | null>;
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
  resetPassword(email: string): Promise<void>;
  confirmResetPassword(token: string, newPassword: string): Promise<void>;
}

export interface IPermissionService {
  getUserPermissions(userId: string): Promise<string[]>;
  hasPermission(userId: string, permission: string): Promise<boolean>;
  canAccessResource(userId: string, resource: string, action: string): Promise<boolean>;
  getUserRole(userId: string): Promise<string>;
  assignRole(userId: string, role: string): Promise<void>;
  revokeRole(userId: string): Promise<void>;
}