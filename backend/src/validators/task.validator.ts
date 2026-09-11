import { z } from 'zod';
import { TaskPriority, TaskStatus } from '@prisma/client';

export const createTaskSchema = z.object({
  projectId: z.string().uuid('Valid Project ID is required'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  assignedDeveloperId: z.string().uuid('Valid Developer ID is required').optional().nullable(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  dueDate: z.string().datetime('Valid ISO dueDate is required'),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  assignedDeveloperId: z.string().uuid().optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus, {
    errorMap: () => ({ message: 'Status must be TODO, IN_PROGRESS, IN_REVIEW, or DONE' }),
  }),
});

const dateStringSchema = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid date or ISO string required (e.g., YYYY-MM-DD or ISO 8601)',
  })
  .optional();

export const taskFilterQuerySchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  from: dateStringSchema,
  to: dateStringSchema,
  projectId: z.string().uuid().optional(),
  assignedDeveloperId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
