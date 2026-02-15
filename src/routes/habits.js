const express = require('express');
const { body } = require('express-validator');
const habitController = require('../controllers/habitController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

const habitValidation = [
  body('name').trim().notEmpty().withMessage('Habit name is required'),
  body('frequency').optional().isIn(['daily', 'weekly', 'custom']).withMessage('Invalid frequency'),
];

router.use(authenticate);

router.get('/', habitController.getHabits);
router.get('/today', habitController.getTodayHabits);
router.get('/:id', habitController.getHabit);
router.get('/:id/stats', habitController.getHabitStats);
router.get('/:id/logs', habitController.getHabitLogs);
router.post('/', habitValidation, validate, habitController.createHabit);
router.put('/:id', habitValidation, validate, habitController.updateHabit);
router.post('/:id/log', habitController.logHabit);
router.delete('/:id', habitController.deleteHabit);

module.exports = router;