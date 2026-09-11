export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_SERVER_ERROR';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(statusCode: number, code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Invalid request', details?: unknown) {
    return new AppError(400, 'BAD_REQUEST', message, details);
  }

  static validation(message = 'Validation error', details?: unknown) {
    return new AppError(400, 'VALIDATION_ERROR', message, details);
  }

  static unauthorized(message = 'Unauthorized', details?: unknown) {
    return new AppError(401, 'UNAUTHORIZED', message, details);
  }

  static tokenExpired(message = 'Token has expired') {
    return new AppError(401, 'TOKEN_EXPIRED', message);
  }

  static tokenInvalid(message = 'Invalid token') {
    return new AppError(401, 'TOKEN_INVALID', message);
  }

  static forbidden(message = 'You do not have permission to perform this action') {
    return new AppError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(404, 'NOT_FOUND', message);
  }

  static conflict(message = 'Resource already exists') {
    return new AppError(409, 'CONFLICT', message);
  }

  static internal(message = 'Internal server error') {
    return new AppError(500, 'INTERNAL_SERVER_ERROR', message);
  }
}
