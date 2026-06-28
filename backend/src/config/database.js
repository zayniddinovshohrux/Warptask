const { Pool } = require('pg');
const config = require('./environment');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  max: config.db.maxConnections,
  idleTimeoutMillis: config.db.idleTimeout,
  connectionTimeoutMillis: config.db.connectionTimeout
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Database connected successfully');
  }
});

module.exports = pool;