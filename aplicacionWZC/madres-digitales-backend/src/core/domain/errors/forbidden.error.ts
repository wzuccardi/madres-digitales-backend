import { BaseError } from './base.error';

export class ForbiddenError extends BaseError {
  constructor(message: string = 'Acceso prohibido') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

