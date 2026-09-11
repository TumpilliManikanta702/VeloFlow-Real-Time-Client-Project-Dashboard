import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/rbac.middleware.js';
import { validateParams } from '../middleware/validate.middleware.js';
import { uuidParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', NotificationController.list);
router.patch('/read-all', NotificationController.markAllRead);
router.patch('/:id/read', validateParams(uuidParamSchema), NotificationController.markRead);

export default router;
