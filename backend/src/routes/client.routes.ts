import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { ClientController } from '../controllers/client.controller.js';
import { authenticate, authorize } from '../middleware/rbac.middleware.js';
import { validateBody, validateParams } from '../middleware/validate.middleware.js';
import { createClientSchema, updateClientSchema } from '../validators/client.validator.js';
import { uuidParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER));

router.get('/', ClientController.list);
router.get('/:id', validateParams(uuidParamSchema), ClientController.getById);
router.post('/', validateBody(createClientSchema), ClientController.create);
router.patch('/:id', validateParams(uuidParamSchema), validateBody(updateClientSchema), ClientController.update);
router.delete('/:id', authorize(UserRole.ADMIN), validateParams(uuidParamSchema), ClientController.delete);

export default router;
