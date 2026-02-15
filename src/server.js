require("dotenv").config();
const app = require("./app");
const { pool } = require("./config/database");
const { redis } = require("./config/redis");
const NotificationService = require("./services/notificationService");
const logger = require("./utils/logger");
const { PORT, NODE_ENV } = require("./config/env");

const startServer = async () => {
  try {
    // Test database connection
    await pool.query("SELECT NOW()");
    logger.info("Database connected successfully");

    // Test Redis connection (if enabled)
    if (redis) {
      await redis.ping();
      logger.info("Redis connected successfully");
    }

    // Initialize notification service
    NotificationService.initialize();

    // Run migrations on startup
    const runMigrations = async () => {
      try {
        logger.info("Running database migrations...");

        const fs = require("fs");
        const path = require("path");
        const { pool } = require("./config/database");

        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, "database", "schema.sql");
        const schema = fs.readFileSync(schemaPath, "utf8");
        await pool.query(schema);

        logger.info("✅ Schema migrations completed successfully");

        // Run individual migration files if they exist
        const migrationsDir = path.join(__dirname, "database", "migrations");
        if (fs.existsSync(migrationsDir)) {
          const files = fs.readdirSync(migrationsDir).sort();

          for (const file of files) {
            if (file.endsWith(".sql")) {
              logger.info(`Running migration: ${file}`);
              const migration = fs.readFileSync(
                path.join(migrationsDir, file),
                "utf8"
              );
              await pool.query(migration);
            }
          }
        }

        logger.info("✅ All migrations completed successfully");
      } catch (error) {
        logger.error("Migration failed:", error);
        // Don't exit - allow server to start anyway
      }
    };

    // ✅ ADD THIS LINE (MAIN FIX)
    await runMigrations();

    // Start server
    const port = PORT || 3000;

    app.listen(PORT, () => {
      logger.info(
        `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
      );
      logger.info(`📡 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  await pool.end();
  if (redis) await redis.quit();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully");
  await pool.end();
  if (redis) await redis.quit();
  process.exit(0);
});

startServer();
