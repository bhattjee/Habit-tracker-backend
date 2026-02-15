const { body } = require('express-validator');

exports.createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category must not exceed 50 characters'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format (use YYYY-MM-DD)'),
  
  body('recurring')
    .optional()
    .isIn(['none', 'daily', 'weekly', 'monthly'])
    .withMessage('Invalid recurring option'),
];