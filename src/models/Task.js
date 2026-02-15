const { query } = require('../config/database');

class Task {
  static async create(userId, data) {
    const {
      title, description, category, priority, due_date,
      recurring, recurring_days, reminder_enabled, reminder_time, parent_task_id
    } = data;

    const result = await query(
      `INSERT INTO tasks (
        user_id, title, description, category, priority, due_date,
        recurring, recurring_days, reminder_enabled, reminder_time, parent_task_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [userId, title, description, category, priority, due_date,
       recurring, recurring_days, reminder_enabled, reminder_time, parent_task_id]
    );

    return result.rows[0];
  }

  static async findByUserId(userId, filters = {}) {
    let queryText = 'SELECT * FROM tasks WHERE user_id = $1';
    const params = [userId];
    let paramCount = 2;

    if (filters.completed !== undefined) {
      queryText += ` AND completed = $${paramCount}`;
      params.push(filters.completed);
      paramCount++;
    }

    if (filters.category) {
      queryText += ` AND category = $${paramCount}`;
      params.push(filters.category);
      paramCount++;
    }

    if (filters.priority) {
      queryText += ` AND priority = $${paramCount}`;
      params.push(filters.priority);
      paramCount++;
    }

    if (filters.due_date) {
      queryText += ` AND due_date = $${paramCount}`;
      params.push(filters.due_date);
      paramCount++;
    }

    if (filters.search) {
      queryText += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    queryText += ' ORDER BY position ASC, due_date ASC, created_at DESC';

    if (filters.limit) {
      queryText += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
      paramCount++;
    }

    if (filters.offset) {
      queryText += ` OFFSET $${paramCount}`;
      params.push(filters.offset);
    }

    const result = await query(queryText, params);
    return result.rows;
  }

  static async findById(id, userId) {
    const result = await query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
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
      `UPDATE tasks SET ${fields.join(', ')} 
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async toggle(id, userId) {
    const result = await query(
      `UPDATE tasks 
       SET completed = NOT completed,
           completed_at = CASE WHEN NOT completed THEN CURRENT_TIMESTAMP ELSE NULL END
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );
    return result.rows[0];
  }

  static async delete(id, userId) {
    await query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
  }

  static async getStats(userId, startDate, endDate) {
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE completed = true) as completed,
        COUNT(*) FILTER (WHERE completed = false) as pending,
        COUNT(*) FILTER (WHERE completed = true AND completed_at::date = CURRENT_DATE) as completed_today
       FROM tasks 
       WHERE user_id = $1 
       AND created_at BETWEEN $2 AND $3`,
      [userId, startDate, endDate]
    );
    return result.rows[0];
  }
}

module.exports = Task;