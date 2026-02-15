const { query } = require('../config/database');
const { getStartOfMonth, getEndOfMonth, getStartOfWeek, getEndOfWeek } = require('../utils/dateUtils');

class AnalyticsService {
  /**
   * Get comprehensive user analytics
   */
  static async getUserAnalytics(userId, period = 'month') {
    const { startDate, endDate } = this.getDateRange(period);

    const [
      taskAnalytics,
      expenseAnalytics,
      calorieAnalytics,
      habitAnalytics,
      workoutAnalytics,
    ] = await Promise.all([
      this.getTaskAnalytics(userId, startDate, endDate),
      this.getExpenseAnalytics(userId, startDate, endDate),
      this.getCalorieAnalytics(userId, startDate, endDate),
      this.getHabitAnalytics(userId, startDate, endDate),
      this.getWorkoutAnalytics(userId, startDate, endDate),
    ]);

    return {
      period,
      startDate,
      endDate,
      tasks: taskAnalytics,
      expenses: expenseAnalytics,
      calories: calorieAnalytics,
      habits: habitAnalytics,
      workouts: workoutAnalytics,
    };
  }

  static getDateRange(period) {
    switch (period) {
      case 'week':
        return { startDate: getStartOfWeek(), endDate: getEndOfWeek() };
      case 'month':
        return { startDate: getStartOfMonth(), endDate: getEndOfMonth() };
      case 'year':
        const now = new Date();
        return {
          startDate: `${now.getFullYear()}-01-01`,
          endDate: `${now.getFullYear()}-12-31`,
        };
      default:
        return { startDate: getStartOfMonth(), endDate: getEndOfMonth() };
    }
  }

  static async getTaskAnalytics(userId, startDate, endDate) {
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE completed = true) as completed,
        COUNT(*) FILTER (WHERE completed = false) as pending,
        COUNT(*) FILTER (WHERE priority = 'high') as high_priority,
        AVG(CASE WHEN completed THEN 
          EXTRACT(EPOCH FROM (completed_at - created_at))/3600 
        END) as avg_completion_hours
       FROM tasks
       WHERE user_id = $1 AND created_at::date BETWEEN $2 AND $3`,
      [userId, startDate, endDate]
    );

    const categoryBreakdown = await query(
      `SELECT category, COUNT(*) as count
       FROM tasks
       WHERE user_id = $1 AND created_at::date BETWEEN $2 AND $3
       GROUP BY category`,
      [userId, startDate, endDate]
    );

    return {
      ...result.rows[0],
      categoryBreakdown: categoryBreakdown.rows,
    };
  }

  static async getExpenseAnalytics(userId, startDate, endDate) {
    const summary = await query(
      `SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
        AVG(CASE WHEN type = 'expense' THEN amount END) as avg_expense,
        COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
       FROM expenses
       WHERE user_id = $1 AND date BETWEEN $2 AND $3`,
      [userId, startDate, endDate]
    );

    const categoryBreakdown = await query(
      `SELECT category, SUM(amount) as total, COUNT(*) as count
       FROM expenses
       WHERE user_id = $1 AND type = 'expense' AND date BETWEEN $2 AND $3
       GROUP BY category
       ORDER BY total DESC`,
      [userId, startDate, endDate]
    );

    const dailyTrend = await query(
      `SELECT date, 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
       FROM expenses
       WHERE user_id = $1 AND date BETWEEN $2 AND $3
       GROUP BY date
       ORDER BY date`,
      [userId, startDate, endDate]
    );

    return {
      summary: summary.rows[0],
      categoryBreakdown: categoryBreakdown.rows,
      dailyTrend: dailyTrend.rows,
    };
  }

  static async getCalorieAnalytics(userId, startDate, endDate) {
    const summary = await query(
      `SELECT 
        AVG(daily_calories) as avg_daily_calories,
        MAX(daily_calories) as max_daily_calories,
        MIN(daily_calories) as min_daily_calories,
        AVG(daily_protein) as avg_protein,
        AVG(daily_carbs) as avg_carbs,
        AVG(daily_fat) as avg_fat
       FROM (
         SELECT date,
           SUM(calories) as daily_calories,
           SUM(protein) as daily_protein,
           SUM(carbs) as daily_carbs,
           SUM(fat) as daily_fat
         FROM meals
         WHERE user_id = $1 AND date BETWEEN $2 AND $3
         GROUP BY date
       ) daily_stats`,
      [userId, startDate, endDate]
    );

    const mealTypeBreakdown = await query(
      `SELECT meal_type, 
        AVG(calories) as avg_calories,
        COUNT(*) as meal_count
       FROM meals
       WHERE user_id = $1 AND date BETWEEN $2 AND $3
       GROUP BY meal_type`,
      [userId, startDate, endDate]
    );

    return {
      summary: summary.rows[0],
      mealTypeBreakdown: mealTypeBreakdown.rows,
    };
  }

  static async getHabitAnalytics(userId, startDate, endDate) {
    const summary = await query(
      `SELECT 
        COUNT(DISTINCT h.id) as total_habits,
        COUNT(DISTINCT hl.habit_id) as habits_with_logs,
        COUNT(*) FILTER (WHERE hl.completed = true) as total_completions,
        ROUND(AVG(CASE WHEN hl.completed THEN 100.0 ELSE 0 END), 2) as avg_completion_rate
       FROM habits h
       LEFT JOIN habit_logs hl ON h.id = hl.habit_id AND hl.date BETWEEN $2 AND $3
       WHERE h.user_id = $1`,
      [userId, startDate, endDate]
    );

    const topHabits = await query(
      `SELECT h.name, h.icon,
        COUNT(*) FILTER (WHERE hl.completed = true) as completions,
        COUNT(*) as total_logs,
        ROUND(COUNT(*) FILTER (WHERE hl.completed = true)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as completion_rate
       FROM habits h
       LEFT JOIN habit_logs hl ON h.id = hl.habit_id AND hl.date BETWEEN $2 AND $3
       WHERE h.user_id = $1
       GROUP BY h.id, h.name, h.icon
       ORDER BY completion_rate DESC
       LIMIT 5`,
      [userId, startDate, endDate]
    );

    return {
      summary: summary.rows[0],
      topHabits: topHabits.rows,
    };
  }

  static async getWorkoutAnalytics(userId, startDate, endDate) {
    const summary = await query(
      `SELECT 
        COUNT(*) as total_workouts,
        SUM(duration_minutes) as total_duration,
        AVG(duration_minutes) as avg_duration,
        SUM(calories_burned) as total_calories_burned,
        SUM(distance_km) as total_distance
       FROM workouts
       WHERE user_id = $1 AND date BETWEEN $2 AND $3`,
      [userId, startDate, endDate]
    );

    const typeBreakdown = await query(
      `SELECT type, COUNT(*) as count, SUM(duration_minutes) as total_duration
       FROM workouts
       WHERE user_id = $1 AND date BETWEEN $2 AND $3
       GROUP BY type
       ORDER BY count DESC`,
      [userId, startDate, endDate]
    );

    return {
      summary: summary.rows[0],
      typeBreakdown: typeBreakdown.rows,
    };
  }
}

module.exports = AnalyticsService;