import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { AccessTokenPayload } from '../utils/tokens.js';

export class UserService {
  static async listUsers(user: AccessTokenPayload, roleFilter?: UserRole) {
    // Developers can only see other developers for team visibility if needed
    if (user.role === UserRole.DEVELOPER && (!roleFilter || roleFilter !== UserRole.DEVELOPER)) {
      roleFilter = UserRole.DEVELOPER;
    }

    const where = roleFilter ? { role: roleFilter } : {};

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isOnline: true,
        lastSeenAt: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return users;
  }

  static async getUserById(userId: string, currentUser: AccessTokenPayload) {
    // Non-admin can only view their own user profile or public dev info
    if (currentUser.role !== UserRole.ADMIN && currentUser.sub !== userId) {
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true, isOnline: true },
      });
      if (!targetUser) throw AppError.notFound('User not found');
      return targetUser;
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isOnline: true,
        lastSeenAt: true,
        createdAt: true,
      },
    });

    if (!targetUser) throw AppError.notFound('User not found');
    return targetUser;
  }

  static async updateUser(
    userId: string,
    data: { name?: string; email?: string; password?: string; role?: UserRole },
    currentUser: AccessTokenPayload
  ) {
    // Prevent non-admins from changing roles or editing other users
    if (currentUser.role !== UserRole.ADMIN) {
      if (currentUser.sub !== userId) {
        throw AppError.forbidden('You can only update your own profile');
      }
      if (data.role) {
        throw AppError.forbidden('Only administrators can change user roles');
      }
    }

    const updateData: { name?: string; email?: string; passwordHash?: string; role?: UserRole } = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email.toLowerCase();
    if (data.role && currentUser.role === UserRole.ADMIN) updateData.role = data.role;
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isOnline: true,
        lastSeenAt: true,
      },
    });

    return updated;
  }

  static async deleteUser(userId: string) {
    await prisma.user.delete({
      where: { id: userId },
    });
    return { success: true };
  }
}
