const express = require('express');
const authRoutes = require('./auth');
const taskRoutes = require('./tasks');
const expenseRoutes = require('./expenses');
const calorieRoutes = require('./calories');
const habitRoutes = require('./habits');
const bodyRoutes = require('./body');
const journalRoutes = require('./journal');
const goalRoutes = require('./goals');
const dashboardRoutes = require('./dashboard');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/expenses', expenseRoutes);
router.use('/calories', calorieRoutes);
router.use('/habits', habitRoutes);
router.use('/body', bodyRoutes);
router.use('/journal', journalRoutes);
router.use('/goals', goalRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;