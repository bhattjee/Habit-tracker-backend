const { query } = require('../config/database');

class Meal {
  static async create(userId, data) {
    const {
      food_name, meal_type, calories, protein, carbs, fat,
      serving_size, photo_url, date
    } = data;

    const result = await query(
      `INSERT INTO meals (
        user_id, food_name, meal_type, calories, protein, carbs, fat,
        serving_size, photo_url, date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [userId, food_name, meal_type, calories, protein, carbs, fat,
       serving_size, photo_url, date]
    );

    return result.rows[0];
  }

  static async findByUserId(userId, filters = {}) {
    let queryText = 'SELECT * FROM meals WHERE user_id = $1';
    const params = [userId];
    let paramCount = 2;

    if (filters.date) {
      queryText += ` AND date = $${paramCount}`;
      params.push(filters.date);
      paramCount++;
    }

    if (filters.meal_type) {
      queryText += ` AND meal_type = $${paramCount}`;
      params.push(filters.meal_type);
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
      'SELECT * FROM meals WHERE id = $1 AND user_id = $2',
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
      `UPDATE meals SET ${fields.join(', ')} 
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async delete(id, userId) {
    await query(
      'DELETE FROM meals WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
  }

  static async getDailySummary(userId, date) {
    const result = await query(
      `SELECT 
        COALESCE(SUM(calories), 0) as total_calories,
        COALESCE(SUM(protein), 0) as total_protein,
        COALESCE(SUM(carbs), 0) as total_carbs,
        COALESCE(SUM(fat), 0) as total_fat,
        COUNT(*) as meal_count
       FROM meals 
       WHERE user_id = $1 AND date = $2`,
      [userId, date]
    );
    return result.rows[0];
  }

  static async getMealTypeBreakdown(userId, date) {
    const result = await query(
      `SELECT 
        meal_type,
        SUM(calories) as calories,
        COUNT(*) as count
       FROM meals 
       WHERE user_id = $1 AND date = $2
       GROUP BY meal_type
       ORDER BY 
         CASE meal_type
           WHEN 'breakfast' THEN 1
           WHEN 'lunch' THEN 2
           WHEN 'dinner' THEN 3
           WHEN 'snack' THEN 4
         END`,
      [userId, date]
    );
    return result.rows;
  }
}

module.exports = Meal;