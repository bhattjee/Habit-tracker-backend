const { query } = require('../config/database');

class Expense {
  static async create(userId, data) {
    const { amount, type, category, account, notes, date } = data;

    const result = await query(
      `INSERT INTO expenses (user_id, amount, type, category, account, notes, date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, amount, type, category, account, notes, date]
    );

    return result.rows[0];
  }

  static async findByUserId(userId, filters = {}) {
    let queryText = 'SELECT * FROM expenses WHERE user_id = $1';
    const params = [userId];
    let paramCount = 2;

    if (filters.type) {
      queryText += ` AND type = $${paramCount}`;
      params.push(filters.type);
      paramCount++;
    }

    if (filters.category) {
      queryText += ` AND category = $${paramCount}`;
      params.push(filters.category);
      paramCount++;
    }

    if (filters.account) {
      queryText += ` AND account = $${paramCount}`;
      params.push(filters.account);
      paramCount++;
    }

    if (filters.start_date && filters.end_date) {
      queryText += ` AND date BETWEEN $${paramCount} AND $${paramCount + 1}`;
      params.push(filters.start_date, filters.end_date);
      paramCount += 2;
    }

    queryText += ' ORDER BY date DESC, created_at DESC';

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
      'SELECT * FROM expenses WHERE id = $1 AND user_id = $2',
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
      `UPDATE expenses SET ${fields.join(', ')} 
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async delete(id, userId) {
    await query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
  }

  static async getSummary(userId, startDate, endDate) {
    const result = await query(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as balance
       FROM expenses 
       WHERE user_id = $1 AND date BETWEEN $2 AND $3`,
      [userId, startDate, endDate]
    );
    return result.rows[0];
  }

  static async getCategoryBreakdown(userId, startDate, endDate, type = 'expense') {
    const result = await query(
      `SELECT 
        category,
        SUM(amount) as total,
        COUNT(*) as count
       FROM expenses 
       WHERE user_id = $1 AND type = $2 AND date BETWEEN $3 AND $4
       GROUP BY category
       ORDER BY total DESC`,
      [userId, type, startDate, endDate]
    );
    return result.rows;
  }
}

module.exports = Expense;