require("dotenv").config();
const app = require("./app");
const { pool } = require("./config/database");
const { redis } = require("./config/redis");
const NotificationService = require("./services/notificationService");
const logger = require("./utils/logger");
const { PORT, NODE_ENV } = require("./config/env");
const fs = require("fs");
const path = require("path");

// Run migrations function
const runMigrations = async () => {
  console.log('🔄 Starting database migrations...'); // Use console.log for visibility
  
  try {
    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, "database", "schema.sql");
    
    if (!fs.existsSync(schemaPath)) {
      console.log('⚠️  schema.sql not found, skipping migrations');
      return;
    }
    
    const schema = fs.readFileSync(schemaPath, "utf8");
    await pool.query(schema);
    
    console.log("✅ Schema migrations completed");

    // Run individual migration files
    const migrationsDir = path.join(__dirname, "database", "migrations");
    
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir).sort();
      
      console.log(`📁 Found ${files.length} migration files`);
      
      for (const file of files) {
        if (file.endsWith(".sql")) {
          console.log(`  ▶️  Running: ${file}`);
          const migration = fs.readFileSync(
            path.join(migrationsDir, file),
            "utf8"
          );
          await pool.query(migration);
          console.log(`  ✅ Completed: ${file}`);
        }
      }
    } else {
      console.log('📁 No migrations directory found');
    }

    console.log("✅ All migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error("Stack:", error.stack);
    // Don't crash - allow server to continue
  }
};

const startServer = async () => {
  try {
    console.log('🚀 Starting Habit Tracker API...');
    console.log(`📍 Environment: ${NODE_ENV}`);
    console.log(`📍 Port: ${PORT}`);
    
    // Test database connection
    console.log('🔌 Connecting to database...');
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Database connected at:", result.rows[0].now);
    logger.info("Database connected successfully");

    // Test Redis connection (if enabled)
    if (redis) {
      console.log('🔌 Connecting to Redis...');
      await redis.ping();
      console.log("✅ Redis connected");
      logger.info("Redis connected successfully");
    }

    // Run migrations
    await runMigrations();

    // Initialize notification service
    console.log('🔔 Initializing notification service...');
    NotificationService.initialize();
    logger.info("Notification service initialized");
    
    console.log('✅ All services initialized');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      logger.info(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
      logger.info(`📡 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    console.error("Stack:", error.stack);
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("⏹️  SIGTERM received, shutting down gracefully");
  logger.info("SIGTERM received, shutting down gracefully");
  await pool.end();
  if (redis) await redis.quit();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("⏹️  SIGINT received, shutting down gracefully");
  logger.info("SIGINT received, shutting down gracefully");
  await pool.end();
  if (redis) await redis.quit();
  process.exit(0);
});

startServer();