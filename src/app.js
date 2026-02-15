// require('express-async-errors'); // Compatibility issue with Express v5 - commenting out for now
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

const app = express();


// ✅ FIX FOR RENDER (VERY IMPORTANT)
app.set('trust proxy', 1);


// ✅ Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));


// ✅ Secure CORS (avoid '*' in production)
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));


// ✅ Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// ✅ Compression middleware
app.use(compression());


// ✅ Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}


// ✅ Rate limiting (now works correctly with proxy)
app.use('/api', apiLimiter);


// ✅ Basic API hardening (extra layer)
app.use('/api', (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});


// ✅ Routes
app.use('/api', routes);


// ✅ Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Habit Tracker API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});


// ✅ Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
