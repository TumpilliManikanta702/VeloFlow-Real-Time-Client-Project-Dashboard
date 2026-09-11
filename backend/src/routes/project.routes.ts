import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { ProjectController } from '../controllers/project.controller.js';
import { authenticate, authorize } from '../middleware/rbac.middleware.js';
import { enforceProjectOwnership } from '../middleware/ownership.middleware.js';
import { validateBody, validateParams } from '../middleware/validate.middleware.js';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator.js';
import { uuidParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', ProjectController.list);

router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  validateBody(createProjectSchema),
  ProjectController.create
);

router.get('/:id', validateParams(uuidParamSchema), enforceProjectOwnership, ProjectController.getById);

router.patch(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  validateParams(uuidParamSchema),
  enforceProjectOwnership,
  validateBody(updateProjectSchema),
  ProjectController.update
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  validateParams(uuidParamSchema),
  enforceProjectOwnership,
  ProjectController.delete
);

export default router;
