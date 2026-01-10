export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly isOperational: boolean;

  constructor(message: string, public readonly code?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(message: string, code?: string) {
    super(message, code);
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly isOperational = true;

  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} with id ${id} not found`
      : `${resource} not found`;
    super(message, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly isOperational = true;

  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly isOperational = true;

  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly isOperational = true;

  constructor(message: string, code?: string) {
    super(message, code || 'CONFLICT');
  }
}

export class InternalServerError extends AppError {
  readonly statusCode = 500;
  readonly isOperational = false;

  constructor(message = 'Internal Server Error') {
    super(message, 'INTERNAL_ERROR');
  }
}

export class DatabaseError extends AppError {
  readonly statusCode = 500;
  readonly isOperational = false;

  constructor(message: string, code?: string) {
    super(message, code || 'DATABASE_ERROR');
  }
}

export class NetworkError extends AppError {
  readonly statusCode = 503;
  readonly isOperational = true;

  constructor(message = 'Network Error') {
    super(message, 'NETWORK_ERROR');
  }
}

export class RateLimitError extends AppError {
  readonly statusCode = 429;
  readonly isOperational = true;

  constructor(message = 'Too Many Requests') {
    super(message, 'RATE_LIMIT_EXCEEDED');
  }
}