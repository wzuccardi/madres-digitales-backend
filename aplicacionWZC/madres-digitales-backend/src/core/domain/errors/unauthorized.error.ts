import { BaseError } from './base.error';

export class UnauthorizedError extends BaseError {
  constructor(message: string = 'No autorizado') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

