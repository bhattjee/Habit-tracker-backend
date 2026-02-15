const { query } = require('../config/database');

class HabitLog {
  static async create(habitId, date, completed = true, notes = null) {
    const result = await query(
      `INSERT INTO habit_logs (habit_id, date, completed, notes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (habit_id, date) 
       DO UPDATE SET completed = $3, notes = $4
       RETURNING *`,
      [habitId, date, completed, notes]
    );
    return result.rows[0];
  }

  static async findByHabitId(habitId, startDate, endDate) {
    const result = await query(
      `SELECT * FROM habit_logs 
       WHERE habit_id = $1 AND date BETWEEN $2 AND $3
       ORDER BY date DESC`,
      [habitId, startDate, endDate]
    );
    return result.rows;
  }

  static async findByDate(habitId, date) {
    const result = await query(
      'SELECT * FROM habit_logs WHERE habit_id = $1 AND date = $2',
      [habitId, date]
    );
    return result.rows[0];
  }

  static async delete(habitId, date) {
    await query(
      'DELETE FROM habit_logs WHERE habit_id = $1 AND date = $2',
      [habitId, date]
    );
  }

  static async getCompletionRate(habitId, startDate, endDate) {
    const result = await query(
      `SELECT 
        COUNT(*) as total_days,
        COUNT(*) FILTER (WHERE completed = true) as completed_days,
        ROUND(COUNT(*) FILTER (WHERE completed = true)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as completion_rate
       FROM habit_logs 
       WHERE habit_id = $1 AND date BETWEEN $2 AND $3`,
      [habitId, startDate, endDate]
    );
    return result.rows[0];
  }

  static async getCurrentStreak(habitId) {
    const result = await query(
      `WITH RECURSIVE streak AS (
        SELECT date, completed, 1 as streak_length
        FROM habit_logs
        WHERE habit_id = $1 AND date = CURRENT_DATE AND completed = true
        
        UNION ALL
        
        SELECT hl.date, hl.completed, s.streak_length + 1
        FROM habit_logs hl
        JOIN streak s ON hl.date = s.date - INTERVAL '1 day'
        WHERE hl.habit_id = $1 AND hl.completed = true
      )
      SELECT COALESCE(MAX(streak_length), 0) as current_streak
      FROM streak`,
      [habitId]
    );
    return result.rows[0]?.current_streak || 0;
  }

  static async getLongestStreak(habitId) {
    const result = await query(
      `WITH dates AS (
        SELECT date, completed,
               date - (ROW_NUMBER() OVER (ORDER BY date))::integer AS grp
        FROM habit_logs
        WHERE habit_id = $1 AND completed = true
      )
      SELECT COALESCE(MAX(COUNT(*)), 0) as longest_streak
      FROM dates
      GROUP BY grp`,
      [habitId]
    );
    return result.rows[0]?.longest_streak || 0;
  }

  static async getTodayProgress(userId, date) {
    const result = await query(
      `SELECT h.id, h.name, h.icon, hl.completed, hl.notes
       FROM habits h
       LEFT JOIN habit_logs hl ON h.id = hl.habit_id AND hl.date = $2
       WHERE h.user_id = $1 AND h.is_active = true
       ORDER BY h.created_at DESC`,
      [userId, date]
    );
    return result.rows;
  }
}

module.exports = HabitLog;