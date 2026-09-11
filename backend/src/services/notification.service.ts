import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { AccessTokenPayload } from '../utils/tokens.js';
import { emitNotification, emitUnreadCount } from '../socket/eventEmitter.js';

export class NotificationService {
  static async listNotifications(user: AccessTokenPayload, page = 1, limit = 20) {
    const where = { recipientId: user.sub };

    const [total, unreadCount, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { recipientId: user.sub, isRead: false } }),
      prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async markAsRead(notificationId: string, user: AccessTokenPayload) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw AppError.notFound('Notification not found');
    }

    if (notification.recipientId !== user.sub) {
      throw AppError.forbidden('You can only modify your own notifications');
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });

    const unreadCount = await prisma.notification.count({
      where: { recipientId: user.sub, isRead: false },
    });

    // Real-time unread count sync
    emitNotification(user.sub, updated, unreadCount);

    return updated;
  }

  static async markAllAsRead(user: AccessTokenPayload) {
    await prisma.notification.updateMany({
      where: { recipientId: user.sub, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    emitUnreadCount(user.sub, 0);

    return { success: true, unreadCount: 0 };
  }
}
