const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const { getToday, getStartOfMonth, getEndOfMonth } = require('../utils/dateUtils');

exports.getHabits = async (req, res) => {
  const { is_active, category } = req.query;

  const habits = await Habit.findByUserId(req.userId, {
    is_active: is_active === 'true' ? true : is_active === 'false' ? false : undefined,
    category,
  });

  res.json({
    success: true,
    data: { habits },
  });
};

exports.getHabit = async (req, res) => {
  const habit = await Habit.findById(req.params.id, req.userId);

  if (!habit) {
    return res.status(404).json({
      success: false,
      message: 'Habit not found',
    });
  }

  // Get streak information
  const currentStreak = await HabitLog.getCurrentStreak(req.params.id);
  const longestStreak = await HabitLog.getLongestStreak(req.params.id);

  res.json({
    success: true,
    data: {
      habit: {
        ...habit,
        current_streak: currentStreak,
        longest_streak: longestStreak,
      },
    },
  });
};

exports.createHabit = async (req, res) => {
  const habit = await Habit.create(req.userId, req.body);

  res.status(201).json({
    success: true,
    message: 'Habit created successfully',
    data: { habit },
  });
};

exports.updateHabit = async (req, res) => {
  const habit = await Habit.update(req.params.id, req.userId, req.body);

  if (!habit) {
    return res.status(404).json({
      success: false,
      message: 'Habit not found',
    });
  }

  res.json({
    success: true,
    message: 'Habit updated successfully',
    data: { habit },
  });
};

exports.deleteHabit = async (req, res) => {
  await Habit.delete(req.params.id, req.userId);

  res.json({
    success: true,
    message: 'Habit deleted successfully',
  });
};

exports.logHabit = async (req, res) => {
  const { date, completed, notes } = req.body;
  const targetDate = date || getToday();

  // Verify habit belongs to user
  const habit = await Habit.findById(req.params.id, req.userId);
  if (!habit) {
    return res.status(404).json({
      success: false,
      message: 'Habit not found',
    });
  }

  const log = await HabitLog.create(req.params.id, targetDate, completed, notes);

  res.json({
    success: true,
    message: 'Habit logged successfully',
    data: { log },
  });
};

exports.getHabitLogs = async (req, res) => {
  const { start_date, end_date } = req.query;
  const startDate = start_date || getStartOfMonth();
  const endDate = end_date || getEndOfMonth();

  const logs = await HabitLog.findByHabitId(req.params.id, startDate, endDate);

  res.json({
    success: true,
    data: { logs },
  });
};

exports.getTodayHabits = async (req, res) => {
  const { date } = req.query;
  const targetDate = date || getToday();

  const habits = await HabitLog.getTodayProgress(req.userId, targetDate);

  res.json({
    success: true,
    data: {
      date: targetDate,
      habits,
    },
  });
};

exports.getHabitStats = async (req, res) => {
  const { start_date, end_date } = req.query;
  const startDate = start_date || getStartOfMonth();
  const endDate = end_date || getEndOfMonth();

  const completionRate = await HabitLog.getCompletionRate(req.params.id, startDate, endDate);
  const currentStreak = await HabitLog.getCurrentStreak(req.params.id);
  const longestStreak = await HabitLog.getLongestStreak(req.params.id);

  res.json({
    success: true,
    data: {
      ...completionRate,
      current_streak: currentStreak,
      longest_streak: longestStreak,
    },
  });
};