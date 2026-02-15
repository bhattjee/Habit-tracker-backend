const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', dashboardController.getDashboard);
router.get('/quick-stats', dashboardController.getQuickStats);

module.exports = router;