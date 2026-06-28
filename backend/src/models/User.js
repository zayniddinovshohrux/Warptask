const pool = require('../config/database');

class User {
  static async create({ email, passwordHash, fullName }) {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name, created_at`,
      [email.toLowerCase().trim(), passwordHash, fullName.trim()]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, email, full_name, created_at, last_login FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async updateLastLogin(id) {
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }
}

module.exports = User;