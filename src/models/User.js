const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const { BCRYPT_ROUNDS } = require('../config/env');

class User {
  static async create({ name, email, password, height, weight, calorie_goal }) {
    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    
    const result = await query(
      `INSERT INTO users (name, email, password_hash, height, weight, calorie_goal)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, uuid, name, email, height, weight, calorie_goal, created_at`,
      [name, email, password_hash, height, weight, calorie_goal]
    );
    
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT id, uuid, name, email, avatar_url, height, weight, calorie_goal, 
              is_active, email_verified, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async update(id, data) {
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

    values.push(id);
    
    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount}
       RETURNING id, uuid, name, email, avatar_url, height, weight, calorie_goal`,
      values
    );
    
    return result.rows[0];
  }

  static async updateLastLogin(id) {
    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async changePassword(id, newPassword) {
    const password_hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [password_hash, id]
    );
  }

  static async delete(id) {
    await query('DELETE FROM users WHERE id = $1', [id]);
  }
}

module.exports = User;