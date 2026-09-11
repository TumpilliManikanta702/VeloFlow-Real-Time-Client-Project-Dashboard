import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { UserService } from '../services/user.service.js';
import { AppError } from '../utils/errors.js';

export class UserController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized();
      const roleFilter = req.query.role as UserRole | undefined;
      const users = await UserService.listUsers(req.user, roleFilter);

      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized();
      const user = await UserService.getUserById(req.params.id, req.user);

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized();
      const updated = await UserService.updateUser(req.params.id, req.body, req.user);

      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized();
      await UserService.deleteUser(req.params.id);

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
