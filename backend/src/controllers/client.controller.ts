import { Request, Response, NextFunction } from 'express';
import { ClientService } from '../services/client.service.js';

export class ClientController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;

      const result = await ClientService.listClients(page, limit);

      return res.status(200).json({
        success: true,
        data: result.clients,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await ClientService.getClientById(req.params.id);

      return res.status(200).json({
        success: true,
        data: client,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await ClientService.createClient(req.body);

      return res.status(201).json({
        success: true,
        data: client,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await ClientService.updateClient(req.params.id, req.body);

      return res.status(200).json({
        success: true,
        data: client,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ClientService.deleteClient(req.params.id);

      return res.status(200).json({
        success: true,
        message: 'Client deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
