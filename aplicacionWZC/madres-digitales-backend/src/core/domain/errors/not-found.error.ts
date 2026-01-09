import { BaseError } from './base.error';

export class NotFoundError extends BaseError {
  constructor(message: string = 'Recurso no encontrado') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

