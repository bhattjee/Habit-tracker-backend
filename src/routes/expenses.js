const express = require('express');
const { body } = require('express-validator');
const expenseController = require('../controllers/expenseController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

const expenseValidation = [
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('date').isISO8601().withMessage('Invalid date format'),
];

router.use(authenticate);

router.get('/', expenseController.getExpenses);
router.get('/summary', expenseController.getSummary);
router.get('/:id', expenseController.getExpense);
router.post('/', expenseValidation, validate, expenseController.createExpense);
router.put('/:id', expenseValidation, validate, expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;