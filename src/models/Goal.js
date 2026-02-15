const { query } = require('../config/database');

class Goal {
  static async create(userId, data) {
    const {
      title, description, category, period, target_date,
      progress, status, priority, milestones
    } = data;

    const result = await query(
      `INSERT INTO goals (
        user_id, title, description, category, period, target_date,
        progress, status, priority, milestones
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [userId, title, description, category, period, target_date,
       progress, status, priority, JSON.stringify(milestones)]
    );

    return result.rows[0];
  }

  static async findByUserId(userId, filters = {}) {
    let queryText = 'SELECT * FROM goals WHERE user_id = $1';
    const params = [userId];
    let paramCount = 2;

    if (filters.period) {
      queryText += ` AND period = $${paramCount}`;
      params.push(filters.period);
      paramCount++;
    }

    if (filters.status) {
      queryText += ` AND status = $${paramCount}`;
      params.push(filters.status);
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
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
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
        if (key === 'milestones') {
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
      `UPDATE goals SET ${fields.join(', ')} 
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async delete(id, userId) {
    await query(
      'DELETE FROM goals WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
  }

  static async getStats(userId) {
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'not_started') as not_started
       FROM goals 
       WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  }
}

module.exports = Goal;