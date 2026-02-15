const { query } = require('../config/database');

class Habit {
  static async create(userId, data) {
    const {
      name, icon, description, frequency, frequency_days,
      time_of_day, reminder_enabled, reminder_time, category
    } = data;

    const result = await query(
      `INSERT INTO habits (
        user_id, name, icon, description, frequency, frequency_days,
        time_of_day, reminder_enabled, reminder_time, category
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [userId, name, icon, description, frequency, frequency_days,
       time_of_day, reminder_enabled, reminder_time, category]
    );

    return result.rows[0];
  }

  static async findByUserId(userId, filters = {}) {
    let queryText = 'SELECT * FROM habits WHERE user_id = $1';
    const params = [userId];
    let paramCount = 2;

    if (filters.is_active !== undefined) {
      queryText += ` AND is_active = $${paramCount}`;
      params.push(filters.is_active);
      paramCount++;
    }

    if (filters.category) {
      queryText += ` AND category = $${paramCount}`;
      params.push(filters.category);
      paramCount++;
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  static async findById(id, userId) {
    const result = await query(
      'SELECT * FROM habits WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0];
  }

  static async update(id, userId, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(data[key]);
        paramCount++;
      }
    });

    values.push(id, userId);

    const result = await query(
      `UPDATE habits SET ${fields.join(', ')} 
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async delete(id, userId) {
    await query(
      'DELETE FROM habits WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
  }

  // Habit Log methods
  static async logHabit(habitId, date, completed = true, notes = null) {
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

  static async getHabitLogs(habitId, startDate, endDate) {
    const result = await query(
      `SELECT * FROM habit_logs 
       WHERE habit_id = $1 AND date BETWEEN $2 AND $3
       ORDER BY date DESC`,
      [habitId, startDate, endDate]
    );
    return result.rows;
  }

  static async getTodayLogs(userId, date) {
    const result = await query(
      `SELECT h.*, hl.completed, hl.notes
       FROM habits h
       LEFT JOIN habit_logs hl ON h.id = hl.habit_id AND hl.date = $2
       WHERE h.user_id = $1 AND h.is_active = true
       ORDER BY h.created_at DESC`,
      [userId, date]
    );
    return result.rows;
  }

  static async getStreak(habitId) {
    const result = await query(
      `WITH RECURSIVE date_series AS (
        SELECT CURRENT_DATE as date
        UNION ALL
        SELECT date - INTERVAL '1 day'
        FROM date_series
        WHERE date > CURRENT_DATE - INTERVAL '365 days'
      )
      SELECT COUNT(*) as current_streak
      FROM (
        SELECT ds.date
        FROM date_series ds
        LEFT JOIN habit_logs hl ON hl.habit_id = $1 AND hl.date = ds.date AND hl.completed = true
        WHERE ds.date <= CURRENT_DATE
        ORDER BY ds.date DESC
      ) sub
      WHERE date IN (
        SELECT date FROM habit_logs WHERE habit_id = $1 AND completed = true
      )
      AND date = (
        SELECT MAX(date) FROM (
          SELECT date FROM date_series
          WHERE date <= CURRENT_DATE
          ORDER BY date DESC
          LIMIT (
            SELECT COUNT(*) FROM date_series ds2
            WHERE NOT EXISTS (
              SELECT 1 FROM habit_logs hl2
              WHERE hl2.habit_id = $1 AND hl2.date = ds2.date AND hl2.completed = true
            )
            AND ds2.date <= CURRENT_DATE
            LIMIT 1
          )
        ) t
      )`,
      [habitId]
    );
    return result.rows[0]?.current_streak || 0;
  }
}

module.exports = Habit;