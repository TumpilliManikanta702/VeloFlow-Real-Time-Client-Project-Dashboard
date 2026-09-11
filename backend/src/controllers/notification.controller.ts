import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service.js';
import { AppError } from '../utils/errors.js';

export class NotificationController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized();
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const result = await NotificationService.listNotifications(req.user, page, limit);

      return res.status(200).json({
        success: true,
        data: result.notifications,
        unreadCount: result.unreadCount,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized();
      const notification = await NotificationService.markAsRead(req.params.id, req.user);

      return res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized();
      await NotificationService.markAllAsRead(req.user);

      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }
}
