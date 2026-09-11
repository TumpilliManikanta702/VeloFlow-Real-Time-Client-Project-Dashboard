import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { verifyAccessToken } from '../utils/tokens.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../config/logger.js';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Missing or invalid Authorization header'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      logger.warn(`Authorization failure: User ${req.user.sub} (${req.user.role}) attempted accessing route requiring [${roles.join(', ')}]`);
      return next(AppError.forbidden('You do not have permission to access this resource'));
    }

    next();
  };
}
