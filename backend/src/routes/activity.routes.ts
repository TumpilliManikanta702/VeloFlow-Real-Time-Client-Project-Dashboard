import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller.js';
import { authenticate } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', ActivityController.list);
router.get('/recent', ActivityController.getRecent);

export default router;
