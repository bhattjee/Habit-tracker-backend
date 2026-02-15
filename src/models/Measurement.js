const { query } = require('../config/database');

class Measurement {
  static async create(userId, data) {
    const {
      weight, chest, waist, hips, arms, thighs,
      body_fat_percentage, date, notes
    } = data;

    const result = await query(
      `INSERT INTO measurements (
        user_id, weight, chest, waist, hips, arms, thighs,
        body_fat_percentage, date, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (user_id, date)
      DO UPDATE SET 
        weight = $2, chest = $3, waist = $4, hips = $5, 
        arms = $6, thighs = $7, body_fat_percentage = $8, notes = $10
      RETURNING *`,
      [userId, weight, chest, waist, hips, arms, thighs,
       body_fat_percentage, date, notes]
    );

    return result.rows[0];
  }

  static async findByUserId(userId, startDate, endDate) {
    let queryText = 'SELECT * FROM measurements WHERE user_id = $1';
    const params = [userId];

    if (startDate && endDate) {
      queryText += ' AND date BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    }

    queryText += ' ORDER BY date DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  static async findById(id, userId) {
    const result = await query(
      'SELECT * FROM measurements WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0];
  }

  static async findByDate(userId, date) {
    const result = await query(
      'SELECT * FROM measurements WHERE user_id = $1 AND date = $2',
      [userId, date]
    );
    return result.rows[0];
  }

  static async getLatest(userId) {
    const result = await query(
      'SELECT * FROM measurements WHERE user_id = $1 ORDER BY date DESC LIMIT 1',
      [userId]
    );
    return result.rows[0];
  }

  static async delete(id, userId) {
    await query(
      'DELETE FROM measurements WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
  }

  static async getProgress(userId, metric, startDate, endDate) {
    const result = await query(
      `SELECT date, ${metric} as value
       FROM measurements
       WHERE user_id = $1 AND date BETWEEN $2 AND $3 AND ${metric} IS NOT NULL
       ORDER BY date ASC`,
      [userId, startDate, endDate]
    );
    return result.rows;
  }
}

module.exports = Measurement;