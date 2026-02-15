const express = require('express');
const { body } = require('express-validator');
const goalController = require('../controllers/goalController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

const goalValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('period').isIn(['weekly', 'monthly', 'yearly', 'lifetime']).withMessage('Invalid period'),
];

router.use(authenticate);

router.get('/', goalController.getGoals);
router.get('/stats', goalController.getStats);
router.get('/:id', goalController.getGoal);
router.post('/', goalValidation, validate, goalController.createGoal);
router.put('/:id', goalValidation, validate, goalController.updateGoal);
router.patch('/:id/progress', goalController.updateProgress);
router.delete('/:id', goalController.deleteGoal);

module.exports = router;