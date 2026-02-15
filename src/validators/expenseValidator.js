const { body } = require('express-validator');

exports.createExpenseValidator = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ max: 50 })
    .withMessage('Category must not exceed 50 characters'),
  
  body('account')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Account must not exceed 50 characters'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  
  body('date')
    .isISO8601()
    .withMessage('Invalid date format (use YYYY-MM-DD)'),
];