import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate, authorize } from '../middleware/rbac.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { loginSchema, createUserSchema } from '../validators/auth.validator.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.post('/login', validateBody(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.me);

// Admin-only user registration endpoint
router.post('/register', authenticate, authorize(UserRole.ADMIN), validateBody(createUserSchema), AuthController.register);

export default router;
