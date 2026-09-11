import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { REFRESH_COOKIE_NAME, refreshCookieOptions } from '../utils/tokens.js';
import { AppError } from '../utils/errors.js';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.login(email, password);

      // Set Refresh Token as secure HttpOnly cookie
      res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

      return res.status(200).json({
        success: true,
        data: {
          user,
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
      if (!rawRefreshToken) {
        throw AppError.unauthorized('No refresh token provided in cookie');
      }

      const { user, accessToken, refreshToken: newRefreshToken } = await AuthService.refreshTokens(rawRefreshToken);

      // Rotate cookie
      res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, refreshCookieOptions);

      return res.status(200).json({
        success: true,
        data: {
          user,
          accessToken,
        },
      });
    } catch (error) {
      // Clear compromised/invalid cookie on refresh failure
      res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
      const userId = req.user?.sub;

      await AuthService.logout(rawRefreshToken, userId);

      res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw AppError.unauthorized('Not authenticated');
      }

      const user = await AuthService.getMe(req.user.sub);

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      // Only Admin can register new users through API
      const user = await AuthService.createUser(req.body);

      return res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
