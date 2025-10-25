import { BaseError } from './base.error';

export class ConflictError extends BaseError {
  constructor(message: string = 'Conflicto de datos') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

