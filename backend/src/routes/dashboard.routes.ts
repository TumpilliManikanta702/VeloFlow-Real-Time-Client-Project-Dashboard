import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { authenticate, authorize } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/admin', authorize(UserRole.ADMIN), DashboardController.getAdmin);
router.get('/manager', authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER), DashboardController.getManager);
router.get('/developer', authorize(UserRole.DEVELOPER), DashboardController.getDeveloper);

export default router;
