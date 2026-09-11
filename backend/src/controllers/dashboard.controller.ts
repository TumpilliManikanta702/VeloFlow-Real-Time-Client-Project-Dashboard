import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service.js';
import { AppError } from '../utils/errors.js';

export class DashboardController {
  static async getAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getAdminDashboard();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getManager(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized();
      const data = await DashboardService.getManagerDashboard(req.user);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getDeveloper(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized();
      const data = await DashboardService.getDeveloperDashboard(req.user);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
