require('dotenv').config();
const app = require('./app');
const { pool } = require('./config/database');
const { redis } = require('./config/redis');
const NotificationService = require('./services/notificationService');
const logger = require('./utils/logger');
const { PORT, NODE_ENV } = require('./config/env');

const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    logger.info('Database connected successfully');

    // Test Redis connection (if enabled)
    if (redis) {
      await redis.ping();
      logger.info('Redis connected successfully');
    }

    // Initialize notification service
    NotificationService.initialize();

    // Start server
    const port = PORT || 3000;
    app.listen(port, () => {
      logger.info(`🚀 Server running on port ${port} in ${NODE_ENV} mode`);
      logger.info(`📡 API available at http://localhost:${port}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await pool.end();
  if (redis) await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await pool.end();
  if (redis) await redis.quit();
  process.exit(0);
});

startServer();