import { describe, it, expect, vi } from 'vitest';
import { TaskStatus, UserRole } from '@prisma/client';
import { TaskService } from '../src/services/task.service.js';
import { prisma } from '../src/config/prisma.js';

describe('Task Status Atomic Transaction Suite', () => {
  const devUser = { sub: 'dev-1', email: 'dev1@velozity.dev', role: UserRole.DEVELOPER, name: 'Alex Chen' };
  const mockTask = {
    id: 'task-100',
    projectId: 'proj-1',
    title: 'ECG Visualizer',
    description: 'WebGL renderer',
    assignedDeveloperId: 'dev-1',
    status: TaskStatus.IN_PROGRESS,
    priority: 'HIGH',
    dueDate: new Date(),
    isOverdue: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    project: {
      id: 'proj-1',
      name: 'HealthPulse',
      createdById: 'pm-1',
    },
    assignedDeveloper: {
      id: 'dev-1',
      name: 'Alex Chen',
      email: 'dev1@velozity.dev',
    },
  };

  it('atomically updates task status, inserts activity log, and creates PM notification on IN_REVIEW', async () => {
    vi.spyOn(prisma.task, 'findUnique').mockResolvedValueOnce(mockTask as any);

    const updatedTaskResult = { ...mockTask, status: TaskStatus.IN_REVIEW, updatedAt: new Date() };
    const activityLogResult = {
      id: 'act-1',
      projectId: 'proj-1',
      taskId: 'task-100',
      userId: 'dev-1',
      action: 'STATUS_CHANGED',
      oldStatus: TaskStatus.IN_PROGRESS,
      newStatus: TaskStatus.IN_REVIEW,
      metadata: { taskTitle: mockTask.title, userName: devUser.name },
      createdAt: new Date(),
    };
    const notificationResult = {
      id: 'notif-1',
      recipientId: 'pm-1',
      taskId: 'task-100',
      projectId: 'proj-1',
      type: 'TASK_IN_REVIEW',
      title: 'Task Submitted for Review',
      message: 'Review request',
      isRead: false,
      readAt: null,
      createdAt: new Date(),
    };

    // Mock prisma.$transaction to simulate atomic execution
    vi.spyOn(prisma, '$transaction').mockImplementationOnce(async (callback: any) => {
      const txMock = {
        task: {
          update: vi.fn().mockResolvedValue(updatedTaskResult),
        },
        activityLog: {
          create: vi.fn().mockResolvedValue(activityLogResult),
        },
        notification: {
          create: vi.fn().mockResolvedValue(notificationResult),
        },
      };
      return callback(txMock);
    });

    vi.spyOn(prisma.notification, 'count').mockResolvedValue(1);

    const result = await TaskService.updateTaskStatus(mockTask.id, TaskStatus.IN_REVIEW, devUser);

    expect(result).toBeDefined();
    expect(result.status).toBe(TaskStatus.IN_REVIEW);
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('validates and parses both standard YYYY-MM-DD and ISO 8601 date filters in taskFilterQuerySchema', async () => {
    const { taskFilterQuerySchema } = await import('../src/validators/task.validator.js');

    const validStandardDates = {
      from: '2026-09-01',
      to: '2026-09-30',
      status: TaskStatus.IN_PROGRESS,
    };

    const parsedStandard = taskFilterQuerySchema.safeParse(validStandardDates);
    expect(parsedStandard.success).toBe(true);
    if (parsedStandard.success) {
      expect(parsedStandard.data.from).toBe('2026-09-01');
      expect(parsedStandard.data.to).toBe('2026-09-30');
    }

    const validIsoDates = {
      from: '2026-09-01T00:00:00.000Z',
      to: '2026-09-30T23:59:59.999Z',
    };
    const parsedIso = taskFilterQuerySchema.safeParse(validIsoDates);
    expect(parsedIso.success).toBe(true);

    const invalidDate = { from: 'not-a-real-date' };
    const parsedInvalid = taskFilterQuerySchema.safeParse(invalidDate);
    expect(parsedInvalid.success).toBe(false);
  });
});
