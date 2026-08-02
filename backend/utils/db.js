const { Pool } = require('pg');
const path = require('path');

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'snake_mcq',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  min: parseInt(process.env.DB_POOL_MIN) || 2,
  max: parseInt(process.env.DB_POOL_MAX) || 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Connection error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('✓ Database connected successfully');
  }
});

// Query execution with error handling
async function query(text, params = []) {
  const start = Date.now();
  const queryId = Math.random().toString(36).substring(7).toUpperCase();
  
  try {
    console.log(`\x1b[36m[DB]\x1b[0m Query #${queryId} starting...`);
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    console.log(`\x1b[32m[DB]\x1b[0m Query #${queryId} completed in ${duration}ms (${result.rows.length} rows)`);
    
    // Log slow queries (>1000ms)
    if (duration > 1000) {
      console.warn(`\x1b[33m[SLOW]\x1b[0m Query #${queryId} took ${duration}ms`);
      console.warn(`       SQL: ${text.substring(0, 80)}...`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`\x1b[31m[ERROR]\x1b[0m Query #${queryId} failed after ${duration}ms`);
    console.error(`  ├─ Error: ${error.message}`);
    console.error(`  ├─ Code: ${error.code}`);
    console.error(`  ├─ SQL: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
    console.error(`  └─ Params: ${JSON.stringify(params).substring(0, 100)}`);
    throw error;
  }
}

// Get single row
async function getOne(text, params = []) {
  const result = await query(text, params);
  return result.rows[0] || null;
}

// Get all rows
async function getAll(text, params = []) {
  const result = await query(text, params);
  return result.rows;
}

// Insert and return inserted row
async function insert(text, params = []) {
  const result = await query(text + ' RETURNING *', params);
  return result.rows[0];
}

// Update and return updated row
async function update(text, params = []) {
  const result = await query(text + ' RETURNING *', params);
  return result.rows[0];
}

// Transaction support
async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Close all connections
async function close() {
  await pool.end();
}

module.exports = {
  pool,
  query,
  getOne,
  getAll,
  insert,
  update,
  transaction,
  close
};
