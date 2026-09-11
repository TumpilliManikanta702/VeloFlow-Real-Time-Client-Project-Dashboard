import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { UserController } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/rbac.middleware.js';
import { validateParams, validateBody } from '../middleware/validate.middleware.js';
import { uuidParamSchema } from '../validators/common.validator.js';
import { updateUserSchema } from '../validators/auth.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', UserController.list);
router.get('/:id', validateParams(uuidParamSchema), UserController.getById);
router.patch('/:id', validateParams(uuidParamSchema), validateBody(updateUserSchema), UserController.update);
router.delete('/:id', authorize(UserRole.ADMIN), validateParams(uuidParamSchema), UserController.delete);

export default router;
