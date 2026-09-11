import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { initializeSocketServer } from './socket/socketServer.js';
import { startOverdueTaskScheduler } from './jobs/overdueTaskCron.js';
import { prisma } from './config/prisma.js';

async function bootstrap() {
  const app = createApp();
  const httpServer = http.createServer(app);

  const io = initializeSocketServer(httpServer);
  const overdueCron = startOverdueTaskScheduler();

  const server = httpServer.listen(env.PORT, () => {
    logger.info(`VeloFlow backend listening on port ${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down server...`);
    overdueCron.stop();
    io.close();
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
