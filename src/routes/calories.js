const express = require('express');
const { body } = require('express-validator');
const calorieController = require('../controllers/calorieController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

const mealValidation = [
  body('food_name').trim().notEmpty().withMessage('Food name is required'),
  body('meal_type').isIn(['breakfast', 'lunch', 'dinner', 'snack']).withMessage('Invalid meal type'),
  body('calories').isInt({ min: 0 }).withMessage('Calories must be a positive number'),
  body('date').isISO8601().withMessage('Invalid date format'),
];

router.use(authenticate);

router.get('/meals', calorieController.getMeals);
router.get('/meals/summary', calorieController.getDailySummary);
router.get('/meals/:id', calorieController.getMeal);
router.post('/meals', mealValidation, validate, calorieController.createMeal);
router.put('/meals/:id', mealValidation, validate, calorieController.updateMeal);
router.delete('/meals/:id', calorieController.deleteMeal);

router.get('/water', calorieController.getWaterIntake);
router.post('/water', calorieController.updateWaterIntake);

module.exports = router;