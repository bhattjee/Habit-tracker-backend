const { query } = require('../config/database');

class Workout {
  static async create(userId, data) {
    const {
      type, name, duration_minutes, calories_burned,
      distance_km, exercises, notes, date
    } = data;

    const result = await query(
      `INSERT INTO workouts (
        user_id, type, name, duration_minutes, calories_burned,
        distance_km, exercises, notes, date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [userId, type, name, duration_minutes, calories_burned,
       distance_km, JSON.stringify(exercises), notes, date]
    );

    return result.rows[0];
  }

  static async findByUserId(userId, filters = {}) {
    let queryText = 'SELECT * FROM workouts WHERE user_id = $1';
    const params = [userId];
    let paramCount = 2;

    if (filters.type) {
      queryText += ` AND type = $${paramCount}`;
      params.push(filters.type);
      paramCount++;
    }

    if (filters.start_date && filters.end_date) {
      queryText += ` AND date BETWEEN $${paramCount} AND $${paramCount + 1}`;
      params.push(filters.start_date, filters.end_date);
      paramCount += 2;
    }

    queryText += ' ORDER BY date DESC, created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  static async findById(id, userId) {
    const result = await query(
      'SELECT * FROM workouts WHERE id = $1 AND user_id = $2',
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
        if (key === 'exercises') {
          fields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(data[key]));
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(data[key]);
        }
        paramCount++;
      }
    });

    values.push(id, userId);

    const result = await query(
      `UPDATE workouts SET ${fields.join(', ')} 
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async delete(id, userId) {
    await query(
      'DELETE FROM workouts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
  }

  static async getStats(userId, startDate, endDate) {
    const result = await query(
      `SELECT 
        COUNT(*) as total_workouts,
        COALESCE(SUM(duration_minutes), 0) as total_duration,
        COALESCE(SUM(calories_burned), 0) as total_calories,
        COALESCE(SUM(distance_km), 0) as total_distance
       FROM workouts 
       WHERE user_id = $1 AND date BETWEEN $2 AND $3`,
      [userId, startDate, endDate]
    );
    return result.rows[0];
  }
}

module.exports = Workout;