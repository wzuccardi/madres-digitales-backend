import { User, CreateUserData, UpdateUserData, UserFilters, UserRole } from '../../../domain/entities/user.entity';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { Database } from '../../../core/database';
import { PasswordService } from '../../../core/security/password';
import { ConflictError, NotFoundError } from '../../../core/errors/app-error';
import { logger } from '../../../core/utils/logger';

export class UserRepositoryImpl implements IUserRepository {
  private db = Database.getInstance();

  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.db.usuarios.findUnique({
        where: { id },
        include: {
          municipios: {
            select: {
              id: true,
              nombre: true,
              departamento: true,
            },
          },
        },
      });

      if (!user) {
        return null;
      }

      return this.mapToDomain(user);
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw new Error('Database error when finding user by ID');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.db.usuarios.findUnique({
        where: { email },
        include: {
          municipios: {
            select: {
              id: true,
              nombre: true,
              departamento: true,
            },
          },
        },
      });

      if (!user) {
        return null;
      }

      return this.mapToDomain(user);
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw new Error('Database error when finding user by email');
    }
  }

  async create(userData: CreateUserData): Promise<User> {
    try {
      // Verificar si el email ya existe
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictError('Email already exists');
      }

      // Hashear la contraseña
      const passwordHash = await PasswordService.hash(userData.password);

      const user = await this.db.usuarios.create({
        data: {
          id: this.generateId(),
          email: userData.email,
          nombre: userData.name,
          password_hash: passwordHash,
          rol: (userData.role ? String(userData.role).toUpperCase() : userData.role) as any,
          municipio_id: userData.municipalityId,
          telefono: userData.phone,
          documento: userData.document,
          tipo_documento: userData.documentType || 'cedula',
          activo: true,
          fecha_creacion: new Date(),
        },
        include: {
          municipios: {
            select: {
              id: true,
              nombre: true,
              departamento: true,
            },
          },
        },
      });

      logger.info(`User created: ${user.email} with role ${user.rol}`);
      return this.mapToDomain(user);
    } catch (error) {
      logger.error('Error creating user:', error);
      if (error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Database error when creating user');
    }
  }

  async update(id: string, userData: UpdateUserData): Promise<User> {
    try {
      // Verificar si el usuario existe
      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new NotFoundError('User', id);
      }

      // Si se actualiza el email, verificar que no exista en otro usuario
      if (userData.email && userData.email !== existingUser.email) {
        const emailExists = await this.findByEmail(userData.email);
        if (emailExists) {
          throw new ConflictError('Email already exists');
        }
      }

      const user = await this.db.usuarios.update({
        where: { id },
        data: {
          ...(userData.name && { nombre: userData.name }),
          ...(userData.municipalityId && { municipio_id: userData.municipalityId }),
          ...(userData.phone && { telefono: userData.phone }),
          ...(userData.active !== undefined && { activo: userData.active }),
          fecha_actualizacion: new Date(),
        },
        include: {
          municipios: {
            select: {
              id: true,
              nombre: true,
              departamento: true,
            },
          },
        },
      });

      logger.info(`User updated: ${user.email}`);
      return this.mapToDomain(user);
    } catch (error) {
      logger.error('Error updating user:', error);
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Database error when updating user');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Verificar si el usuario existe
      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new NotFoundError('User', id);
      }

      await this.db.usuarios.delete({
        where: { id },
      });

      logger.info(`User deleted: ${id}`);
    } catch (error) {
      logger.error('Error deleting user:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Database error when deleting user');
    }
  }

  async findMany(filters?: UserFilters): Promise<User[]> {
    try {
      const where: any = {};

      if (filters?.role) {
        where.rol = filters.role;
      }

      if (filters?.municipalityId) {
        where.municipio_id = filters.municipalityId;
      }

      if (filters?.active !== undefined) {
        where.activo = filters.active;
      }

      if (filters?.search) {
        where.OR = [
          { nombre: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { documento: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const users = await this.db.usuarios.findMany({
        where,
        include: {
          municipios: {
            select: {
              id: true,
              nombre: true,
              departamento: true,
            },
          },
        },
        ...(filters?.page && filters?.limit && {
          skip: (filters.page - 1) * filters.limit,
          take: filters.limit,
        }),
        orderBy: {
          fecha_creacion: 'desc',
        },
      });

      return users.map(user => this.mapToDomain(user));
    } catch (error) {
      logger.error('Error finding users:', error);
      throw new Error('Database error when finding users');
    }
  }

  async count(filters?: UserFilters): Promise<number> {
    try {
      const where: any = {};

      if (filters?.role) {
        where.rol = filters.role;
      }

      if (filters?.municipalityId) {
        where.municipio_id = filters.municipalityId;
      }

      if (filters?.active !== undefined) {
        where.activo = filters.active;
      }

      if (filters?.search) {
        where.OR = [
          { nombre: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { documento: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      return await this.db.usuarios.count({ where });
    } catch (error) {
      logger.error('Error counting users:', error);
      throw new Error('Database error when counting users');
    }
  }

  async updateLastAccess(id: string): Promise<void> {
    try {
      await this.db.usuarios.update({
        where: { id },
        data: {
          ultimo_acceso: new Date(),
          fecha_actualizacion: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error updating last access:', error);
      throw new Error('Database error when updating last access');
    }
  }

  async findByRole(role: string): Promise<User[]> {
    try {
      const users = await this.db.usuarios.findMany({
        where: { rol: role as UserRole },
        include: {
          municipios: {
            select: {
              id: true,
              nombre: true,
              departamento: true,
            },
          },
        },
        orderBy: {
          nombre: 'asc',
        },
      });

      return users.map(user => this.mapToDomain(user));
    } catch (error) {
      logger.error('Error finding users by role:', error);
      throw new Error('Database error when finding users by role');
    }
  }

  async findActiveUsers(): Promise<User[]> {
    try {
      const users = await this.db.usuarios.findMany({
        where: { activo: true },
        include: {
          municipios: {
            select: {
              id: true,
              nombre: true,
              departamento: true,
            },
          },
        },
        orderBy: {
          nombre: 'asc',
        },
      });

      return users.map(user => this.mapToDomain(user));
    } catch (error) {
      logger.error('Error finding active users:', error);
      throw new Error('Database error when finding active users');
    }
  }

  async searchUsers(query: string, filters?: UserFilters): Promise<User[]> {
    return this.findMany({
      ...filters,
      search: query,
    });
  }

  private mapToDomain(prismaUser: any): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.nombre,
      role: prismaUser.rol as UserRole,
      municipalityId: prismaUser.municipio_id,
      phone: prismaUser.telefono,
      document: prismaUser.documento,
      documentType: prismaUser.tipo_documento,
      active: prismaUser.activo,
      lastAccess: prismaUser.ultimo_acceso,
      createdAt: prismaUser.fecha_creacion,
      updatedAt: prismaUser.fecha_actualizacion,
    };
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}