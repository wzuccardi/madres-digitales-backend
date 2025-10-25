import { PrismaClient } from '@prisma/client';
import prisma from '../config/database';

/**
 * Servicio base para todos los servicios del sistema
 * Proporciona métodos comunes y estructura estándar
 */
export abstract class BaseService {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Manejo de errores estándar
   */
  protected handleError(error: any, context: string = 'Service'): never {
    console.error(`❌ ${context} Error:`, error);
    throw new Error(`${context}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }

  /**
   * Validación de existencia de registro
   */
  protected async exists(model: string, id: string): Promise<boolean> {
    try {
      const record = await (this.prisma as any)[model].findUnique({
        where: { id }
      });
      return !!record;
    } catch (error) {
      this.handleError(error, `Error checking ${model} existence`);
    }
  }

  /**
   * Paginación estándar
   */
  protected async paginate(
    model: any,
    options: {
      page?: number;
      limit?: number;
      orderBy?: any;
      where?: any;
      include?: any;
    } = {}
  ): Promise<{
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        (this.prisma as any)[model].findMany({
          where: options.where,
          include: options.include,
          orderBy: options.orderBy,
          skip,
          take: limit
        }),
        (this.prisma as any)[model].count({
          where: options.where
        })
      ]);

      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      };
    } catch (error) {
      this.handleError(error, `Error paginating ${model}`);
    }
  }

  /**
   * Construir cláusula WHERE dinámica
   */
  protected buildWhereClause(filters: Record<string, any>): any {
    const where: any = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && value.includes('%')) {
          where[key] = {
            contains: value.replace(/%/g, '')
          };
        } else if (Array.isArray(value)) {
          where[key] = {
            in: value
          };
        } else if (typeof value === 'object' && value.min && value.max) {
          where[key] = {
            gte: value.min,
            lte: value.max
          };
        } else {
          where[key] = value;
        }
      }
    }

    return where;
  }

  /**
   * Ejecutar transacción de base de datos
   */
  protected async transaction<T>(
    callback: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    try {
      return await this.prisma.$transaction(callback);
    } catch (error) {
      this.handleError(error, 'Transaction execution failed');
    }
  }

  /**
   * Registro de auditoría
   */
  protected async audit(
    userId: string,
    action: string,
    entity: string,
    entityId: string,
    details?: any
  ): Promise<void> {
    try {
      await (this.prisma as any).log.create({
        data: {
          tipo: 'AUDITORIA',
          mensaje: `${action} - ${entity}`,
          datos: {
            userId,
            entityId,
            details,
            timestamp: new Date()
          },
          nivel: 'INFO',
          usuario_id: userId
        }
      });
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  }

  /**
   * Formatear fecha para consultas
   */
  protected formatDateRange(startDate?: Date, endDate?: Date): { start?: Date; end?: Date } {
    const result: { start?: Date; end?: Date } = {};

    if (startDate) {
      result.start = new Date(startDate);
    }

    if (endDate) {
      result.end = new Date(endDate);
    }

    return result;
  }

  /**
   * Validar UUID
   */
  protected isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Sanitizar entrada de texto
   */
  protected sanitizeText(text: string): string {
    return text
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  }
}