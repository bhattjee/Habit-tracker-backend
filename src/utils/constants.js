module.exports = {
  TASK_PRIORITIES: ['low', 'medium', 'high'],
  TASK_CATEGORIES: ['Work', 'Personal', 'Health', 'Finance', 'Other'],
  
  EXPENSE_TYPES: ['income', 'expense'],
  EXPENSE_CATEGORIES: [
    'Baby', 'Beauty', 'Bills', 'Food', 'Shopping',
    'Social', 'Tax', 'Car', 'Rent', 'Health',
    'Education', 'Entertainment', 'Travel', 'Other'
  ],
  
  MEAL_TYPES: ['breakfast', 'lunch', 'dinner', 'snack'],
  
  HABIT_FREQUENCIES: ['daily', 'weekly', 'custom'],
  HABIT_TIMES: ['morning', 'afternoon', 'evening', 'night'],
  
  WORKOUT_TYPES: ['Gym', 'Running', 'Cycling', 'Swimming', 'Yoga', 'Sports', 'Other'],
  
  GOAL_PERIODS: ['weekly', 'monthly', 'yearly', 'lifetime'],
  GOAL_STATUSES: ['not_started', 'in_progress', 'completed', 'on_hold'],
  
  MOODS: ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'],
  
  SUCCESS_MESSAGES: {
    CREATED: 'Created successfully',
    UPDATED: 'Updated successfully',
    DELETED: 'Deleted successfully',
  },
  
  ERROR_MESSAGES: {
    NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    VALIDATION_ERROR: 'Validation failed',
    SERVER_ERROR: 'Internal server error',
  },
};