const pool = require('../config/database');

class RefreshToken {
  static async create({ userId, token, expiresAt }) {
    const result = await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, token, expiresAt]
    );
    return result.rows[0];
  }

  static async findByToken(token) {
    const result = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND revoked = false AND expires_at > NOW()',
      [token]
    );
    return result.rows[0];
  }

  static async revoke(token) {
    const result = await pool.query(
      'UPDATE refresh_tokens SET revoked = true WHERE token = $1 RETURNING *',
      [token]
    );
    return result.rows[0];
  }

  static async revokeAllByUser(userId) {
    await pool.query(
      'UPDATE refresh_tokens SET revoked = true WHERE user_id = $1',
      [userId]
    );
  }
}

module.exports = RefreshToken;