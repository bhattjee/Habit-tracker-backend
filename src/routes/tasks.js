const express = require('express');
const { body } = require('express-validator');
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').optional().trim(),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('due_date').optional().isISO8601().withMessage('Invalid date format'),
];

router.use(authenticate);

router.get('/', taskController.getTasks);
router.get('/stats', taskController.getTaskStats);
router.get('/:id', taskController.getTask);
router.post('/', taskValidation, validate, taskController.createTask);
router.put('/:id', taskValidation, validate, taskController.updateTask);
router.patch('/:id/toggle', taskController.toggleTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;