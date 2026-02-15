const Task = require('../models/Task');
const Expense = require('../models/Expense');
const Meal = require('../models/Meal');
const HabitLog = require('../models/HabitLog');
const Workout = require('../models/Workout');
const Goal = require('../models/Goal');
const { query } = require('../config/database');
const { getToday, getStartOfWeek, getEndOfWeek, getStartOfMonth, getEndOfMonth } = require('../utils/dateUtils');

exports.getDashboard = async (req, res) => {
  const today = getToday();
  const startOfWeek = getStartOfWeek();
  const endOfWeek = getEndOfWeek();
  const startOfMonth = getStartOfMonth();
  const endOfMonth = getEndOfMonth();

  // Get all stats in parallel
  const [
    taskStats,
    todayTasks,
    expenseSummary,
    calorieSummary,
    todayHabits,
    workoutStats,
    goalStats,
    userInfo,
  ] = await Promise.all([
    // Task stats
    Task.getStats(req.userId, today, today),
    // Today's upcoming tasks
    Task.findByUserId(req.userId, { completed: false, due_date: today, limit: 5 }),
    // Monthly expense summary
    Expense.getSummary(req.userId, startOfMonth, endOfMonth),
    // Today's calorie summary
    Meal.getDailySummary(req.userId, today),
    // Today's habits
    HabitLog.getTodayProgress(req.userId, today),
    // Weekly workout stats
    Workout.getStats(req.userId, startOfWeek, endOfWeek),
    // Goal stats
    Goal.getStats(req.userId),
    // User info
    query('SELECT calorie_goal FROM users WHERE id = $1', [req.userId]),
  ]);

  // Calculate habit completion for today
  const completedHabits = todayHabits.filter(h => h.completed).length;
  const totalActiveHabits = todayHabits.length;

  // Weekly habit completion heatmap
  const weeklyHabitData = await query(
    `SELECT 
      date,
      COUNT(*) as total_habits,
      COUNT(*) FILTER (WHERE completed = true) as completed_habits
     FROM habit_logs hl
     JOIN habits h ON hl.habit_id = h.id
     WHERE h.user_id = $1 
     AND hl.date BETWEEN $2 AND $3
     GROUP BY date
     ORDER BY date`,
    [req.userId, startOfWeek, endOfWeek]
  );

  // Recent activity (last 10 items across all modules)
  const recentActivity = await query(
    `SELECT 'task' as type, title as description, completed_at as timestamp
     FROM tasks 
     WHERE user_id = $1 AND completed = true AND completed_at >= NOW() - INTERVAL '7 days'
     UNION ALL
     SELECT 'expense' as type, 
            CONCAT(type, ' - ', category, ' - $', amount) as description,
            created_at as timestamp
     FROM expenses 
     WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
     UNION ALL
     SELECT 'workout' as type, 
            CONCAT(type, ' - ', COALESCE(name, ''), ' (', duration_minutes, ' min)') as description,
            created_at as timestamp
     FROM workouts 
     WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
     UNION ALL
     SELECT 'journal' as type, 
            CONCAT('Journal entry - ', mood) as description,
            created_at as timestamp
     FROM journal_entries 
     WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
     ORDER BY timestamp DESC
     LIMIT 10`,
    [req.userId]
  );

  // Streaks - get longest current streaks
  const streaks = await query(
    `SELECT h.id, h.name, h.icon,
            (SELECT COUNT(*) 
             FROM habit_logs hl 
             WHERE hl.habit_id = h.id 
             AND hl.completed = true
             AND hl.date >= CURRENT_DATE - (
               SELECT COUNT(*) FROM generate_series(
                 CURRENT_DATE - INTERVAL '365 days',
                 CURRENT_DATE,
                 '1 day'
               ) d
               WHERE NOT EXISTS (
                 SELECT 1 FROM habit_logs hl2
                 WHERE hl2.habit_id = h.id
                 AND hl2.date = d::date
                 AND hl2.completed = true
               )
               LIMIT 1
             )
            ) as current_streak
     FROM habits h
     WHERE h.user_id = $1 AND h.is_active = true
     ORDER BY current_streak DESC
     LIMIT 3`,
    [req.userId]
  );

  const calorieGoal = userInfo.rows[0]?.calorie_goal || 2000;

  res.json({
    success: true,
    data: {
      overview: {
        tasks: {
          completed_today: taskStats.completed_today,
          total_today: taskStats.total,
          pending: taskStats.pending,
        },
        expenses: {
          monthly_income: parseFloat(expenseSummary.total_income),
          monthly_expense: parseFloat(expenseSummary.total_expense),
          balance: parseFloat(expenseSummary.balance),
        },
        calories: {
          consumed: parseInt(calorieSummary.total_calories),
          goal: calorieGoal,
          remaining: calorieGoal - parseInt(calorieSummary.total_calories),
          percentage: Math.round((parseInt(calorieSummary.total_calories) / calorieGoal) * 100),
        },
        habits: {
          completed_today: completedHabits,
          total_active: totalActiveHabits,
          completion_rate: totalActiveHabits > 0 ? Math.round((completedHabits / totalActiveHabits) * 100) : 0,
        },
        workouts: {
          weekly_count: parseInt(workoutStats.total_workouts),
          total_duration: parseInt(workoutStats.total_duration),
          total_calories: parseInt(workoutStats.total_calories),
        },
        goals: {
          total: parseInt(goalStats.total),
          completed: parseInt(goalStats.completed),
          in_progress: parseInt(goalStats.in_progress),
        },
      },
      today_tasks: todayTasks,
      today_habits: todayHabits,
      weekly_habit_heatmap: weeklyHabitData.rows,
      top_streaks: streaks.rows,
      recent_activity: recentActivity.rows,
    },
  });
};

exports.getQuickStats = async (req, res) => {
  const today = getToday();

  const [taskStats, habitProgress, calorieInfo, todayExpense] = await Promise.all([
    Task.getStats(req.userId, today, today),
    HabitLog.getTodayProgress(req.userId, today),
    Meal.getDailySummary(req.userId, today),
    query(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM expenses 
       WHERE user_id = $1 AND type = 'expense' AND date = $2`,
      [req.userId, today]
    ),
  ]);

  const completedHabits = habitProgress.filter(h => h.completed).length;

  res.json({
    success: true,
    data: {
      tasks_completed: taskStats.completed_today,
      habits_completed: completedHabits,
      total_habits: habitProgress.length,
      calories_consumed: parseInt(calorieInfo.total_calories),
      today_expense: parseFloat(todayExpense.rows[0].total),
    },
  });
};