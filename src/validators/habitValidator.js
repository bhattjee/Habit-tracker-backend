const { body } = require('express-validator');

exports.createHabitValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Habit name is required')
    .isLength({ max: 200 })
    .withMessage('Name must not exceed 200 characters'),
  
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon must not exceed 50 characters'),
  
  body('frequency')
    .optional()
    .isIn(['daily', 'weekly', 'custom'])
    .withMessage('Frequency must be daily, weekly, or custom'),
  
  body('time_of_day')
    .optional()
    .isIn(['morning', 'afternoon', 'evening', 'night', 'anytime'])
    .withMessage('Invalid time of day'),
];