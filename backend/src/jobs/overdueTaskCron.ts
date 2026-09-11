import cron from 'node-cron';
import { TaskStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { logger } from '../config/logger.js';

/**
 * Periodic background job that idempotently marks overdue unfinished tasks.
 * Uses node-cron in-process to avoid unnecessary external queue infrastructure.
 */
export async function checkAndMarkOverdueTasks(): Promise<number> {
  const now = new Date();
  try {
    const result = await prisma.task.updateMany({
      where: {
        status: { not: TaskStatus.DONE },
        dueDate: { lt: now },
        isOverdue: false,
      },
      data: {
        isOverdue: true,
      },
    });

    if (result.count > 0) {
      logger.info(`[Overdue Cron] Marked ${result.count} tasks as overdue.`);
    }

    return result.count;
  } catch (error) {
    logger.error(`[Overdue Cron] Error checking overdue tasks: ${(error as Error).message}`);
    return 0;
  }
}

export function startOverdueTaskScheduler() {
  logger.info('Initializing independent Overdue Task background scheduler (every 15 minutes)...');

  // Run once on startup to catch any tasks that expired while server was offline
  checkAndMarkOverdueTasks().catch((err) => {
    logger.error(`Initial overdue check error: ${err.message}`);
  });

  // Schedule to run every 15 minutes: "*/15 * * * *"
  const task = cron.schedule('*/15 * * * *', async () => {
    logger.debug('[Overdue Cron] Running scheduled overdue check...');
    await checkAndMarkOverdueTasks();
  });

  return task;
}
