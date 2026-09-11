import { Request, Response, NextFunction } from 'express';
import { TaskService, TaskFilterParams } from '../services/task.service.js';
import { AppError } from '../utils/errors.js';

export class TaskController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized();
      const filters = req.query as unknown as TaskFilterParams;
      const result = await TaskService.listTasks(req.user, filters);

      return res.status(200).json({
        success: true,
        data: result.tasks,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized();
      const task = await TaskService.getTaskById(req.params.id, req.user);

      return res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized();
      const task = await TaskService.createTask(req.body, req.user);

      return res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized();
      const task = await TaskService.updateTask(req.params.id, req.body, req.user);

      return res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized();
      const { status } = req.body;
      const task = await TaskService.updateTaskStatus(req.params.id, status, req.user);

      return res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }
}
