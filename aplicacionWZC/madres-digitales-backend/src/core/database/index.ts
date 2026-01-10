import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export class Database {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient({
        log: [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'event' },
          { level: 'info', emit: 'event' },
          { level: 'warn', emit: 'event' },
        ],
      });

      (Database.instance as any).$on('query', (e: any) => {
        logger.debug('Query: ' + e.query);
        logger.debug('Params: ' + e.params);
        logger.debug('Duration: ' + e.duration + 'ms');
      });

      (Database.instance as any).$on('error', (e: any) => {
        logger.error('Database error:', e);
      });

      (Database.instance as any).$on('info', (e: any) => {
        logger.info('Database info:', e.message);
      });

      (Database.instance as any).$on('warn', (e: any) => {
        logger.warn('Database warning:', e.message);
      });
    }

    return Database.instance;
  }

  public static async disconnect(): Promise<void> {
    if (Database.instance) {
      await Database.instance.$disconnect();
      logger.info('Database disconnected');
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      await Database.instance.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  public static async runTransaction<T>(
    callback: (tx: PrismaClient) => Promise<T>
  ): Promise<T> {
    return await Database.instance.$transaction(callback);
  }
}

export default Database;