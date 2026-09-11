import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service.js';
import { AppError } from '../utils/errors.js';

export class ProjectController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized();
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const result = await ProjectService.listProjects(req.user, page, limit);

      return res.status(200).json({
        success: true,
        data: result.projects,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized();
      const project = await ProjectService.getProjectById(req.params.id, req.user);

      return res.status(200).json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized();
      const project = await ProjectService.createProject(req.body, req.user);

      return res.status(201).json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized();
      const project = await ProjectService.updateProject(req.params.id, req.body, req.user);

      return res.status(200).json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized();
      await ProjectService.deleteProject(req.params.id, req.user);

      return res.status(200).json({
        success: true,
        message: 'Project deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
