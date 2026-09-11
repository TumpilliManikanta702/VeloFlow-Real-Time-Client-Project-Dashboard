import { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service.js';
import { AppError } from '../utils/errors.js';

export class ActivityController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized();
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const projectId = req.query.projectId as string | undefined;

      const result = await ActivityService.listActivity(req.user, page, limit, projectId);

      return res.status(200).json({
        success: true,
        data: result.activities,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRecent(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized();
      const activities = await ActivityService.getRecentActivities(req.user);

      return res.status(200).json({
        success: true,
        data: activities,
      });
    } catch (error) {
      next(error);
    }
  }
}
