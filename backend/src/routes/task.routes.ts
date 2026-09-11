import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { TaskController } from '../controllers/task.controller.js';
import { authenticate, authorize } from '../middleware/rbac.middleware.js';
import { enforceTaskAccess } from '../middleware/ownership.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskFilterQuerySchema,
} from '../validators/task.validator.js';
import { uuidParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(taskFilterQuerySchema), TaskController.list);

router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  validateBody(createTaskSchema),
  TaskController.create
);

router.get('/:id', validateParams(uuidParamSchema), enforceTaskAccess, TaskController.getById);

router.patch(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  validateParams(uuidParamSchema),
  enforceTaskAccess,
  validateBody(updateTaskSchema),
  TaskController.update
);

// Critical endpoint: updating task status (Allowed for assigned Developer, project PM, or Admin)
router.patch(
  '/:id/status',
  validateParams(uuidParamSchema),
  enforceTaskAccess,
  validateBody(updateTaskStatusSchema),
  TaskController.updateStatus
);

export default router;
