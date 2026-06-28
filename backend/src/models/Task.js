const pool = require('../config/database');

class Task {
  static async create({ userId, title, description, status, priority, dueDate }) {
    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, description, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, title.trim(), description?.trim(), status || 'pending', priority || 'medium', dueDate]
    );
    return result.rows[0];
  }

  static async findByUser(userId, options = {}) {
    const { status, priority, search, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const params = [userId];
    let paramCount = 2;

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (priority) {
      query += ` AND priority = $${paramCount}`;
      params.push(priority);
      paramCount++;
    }

    if (search) {
      query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY due_date ASC NULLS LAST, created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id, userId) {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0];
  }

  static async update(id, userId, data) {
    const { title, description, status, priority, dueDate } = data;
    
    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           due_date = COALESCE($5, due_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [title, description, status, priority, dueDate, id, userId]
    );
    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    return result.rows[0];
  }

  static async sync(userId, tasks) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Delete all existing tasks
      await client.query('DELETE FROM tasks WHERE user_id = $1', [userId]);
      
      // Insert new tasks
      const insertedTasks = [];
      for (const task of tasks) {
        const result = await client.query(
          `INSERT INTO tasks (user_id, title, description, status, priority, due_date)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [userId, task.title, task.description, task.status || 'pending', task.priority || 'medium', task.due_date]
        );
        insertedTasks.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      return insertedTasks;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Task;