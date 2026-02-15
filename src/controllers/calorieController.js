const Meal = require('../models/Meal');
const { query } = require('../config/database');
const { getToday } = require('../utils/dateUtils');

exports.getMeals = async (req, res) => {
  const { date, meal_type, start_date, end_date } = req.query;

  const meals = await Meal.findByUserId(req.userId, {
    date: date || getToday(),
    meal_type,
    start_date,
    end_date,
  });

  res.json({
    success: true,
    data: { meals },
  });
};

exports.getMeal = async (req, res) => {
  const meal = await Meal.findById(req.params.id, req.userId);

  if (!meal) {
    return res.status(404).json({
      success: false,
      message: 'Meal not found',
    });
  }

  res.json({
    success: true,
    data: { meal },
  });
};

exports.createMeal = async (req, res) => {
  const meal = await Meal.create(req.userId, req.body);

  res.status(201).json({
    success: true,
    message: 'Meal logged successfully',
    data: { meal },
  });
};

exports.updateMeal = async (req, res) => {
  const meal = await Meal.update(req.params.id, req.userId, req.body);

  if (!meal) {
    return res.status(404).json({
      success: false,
      message: 'Meal not found',
    });
  }

  res.json({
    success: true,
    message: 'Meal updated successfully',
    data: { meal },
  });
};

exports.deleteMeal = async (req, res) => {
  await Meal.delete(req.params.id, req.userId);

  res.json({
    success: true,
    message: 'Meal deleted successfully',
  });
};

exports.getDailySummary = async (req, res) => {
  const { date } = req.query;
  const targetDate = date || getToday();

  const summary = await Meal.getDailySummary(req.userId, targetDate);
  const breakdown = await Meal.getMealTypeBreakdown(req.userId, targetDate);

  // Get user's calorie goal
  const userResult = await query(
    'SELECT calorie_goal FROM users WHERE id = $1',
    [req.userId]
  );
  const calorieGoal = userResult.rows[0]?.calorie_goal || 2000;

  res.json({
    success: true,
    data: {
      date: targetDate,
      summary: {
        ...summary,
        calorie_goal: calorieGoal,
        remaining: calorieGoal - summary.total_calories,
        percentage: Math.round((summary.total_calories / calorieGoal) * 100),
      },
      breakdown,
    },
  });
};

exports.getWaterIntake = async (req, res) => {
  const { date } = req.query;
  const targetDate = date || getToday();

  const result = await query(
    'SELECT amount_ml FROM water_intake WHERE user_id = $1 AND date = $2',
    [req.userId, targetDate]
  );

  res.json({
    success: true,
    data: {
      date: targetDate,
      amount_ml: result.rows[0]?.amount_ml || 0,
    },
  });
};

exports.updateWaterIntake = async (req, res) => {
  const { date, amount_ml } = req.body;
  const targetDate = date || getToday();

  const result = await query(
    `INSERT INTO water_intake (user_id, date, amount_ml)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, date)
     DO UPDATE SET amount_ml = $3
     RETURNING *`,
    [req.userId, targetDate, amount_ml]
  );

  res.json({
    success: true,
    message: 'Water intake updated successfully',
    data: result.rows[0],
  });
};