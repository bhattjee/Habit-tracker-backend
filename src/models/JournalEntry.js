const { query } = require('../config/database');

class JournalEntry {
  static async create(userId, data) {
    const { mood, entry_text, gratitude, date } = data;

    const result = await query(
      `INSERT INTO journal_entries (user_id, mood, entry_text, gratitude, date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, mood, entry_text, gratitude, date]
    );

    return result.rows[0];
  }

  static async findByUserId(userId, filters = {}) {
    let queryText = 'SELECT * FROM journal_entries WHERE user_id = $1';
    const params = [userId];
    let paramCount = 2;

    if (filters.mood) {
      queryText += ` AND mood = $${paramCount}`;
      params.push(filters.mood);
      paramCount++;
    }

    if (filters.start_date && filters.end_date) {
      queryText += ` AND date BETWEEN $${paramCount} AND $${paramCount + 1}`;
      params.push(filters.start_date, filters.end_date);
      paramCount += 2;
    }

    queryText += ' ORDER BY date DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  static async findById(id, userId) {
    const result = await query(
      'SELECT * FROM journal_entries WHERE id = $1 AND user_id = $2',
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
      `UPDATE journal_entries SET ${fields.join(', ')} 
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async delete(id, userId) {
    await query(
      'DELETE FROM journal_entries WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
  }

  static async getMoodStats(userId, startDate, endDate) {
    const result = await query(
      `SELECT 
        mood,
        COUNT(*) as count
       FROM journal_entries 
       WHERE user_id = $1 AND date BETWEEN $2 AND $3
       GROUP BY mood
       ORDER BY count DESC`,
      [userId, startDate, endDate]
    );
    return result.rows;
  }
}

module.exports = JournalEntry;